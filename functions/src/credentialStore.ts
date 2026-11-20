import { getApps, initializeApp } from 'firebase-admin/app';
import { Timestamp, getFirestore, type Firestore } from 'firebase-admin/firestore';
import backendTargets from '../firebase-target.json';
import { isSocialMemberId } from './socialTrackingValidation';
import {
  parseSocialCredentialRecord,
  type SocialCredentialRecord,
} from './socialCredentialValidation';

const CREDENTIAL_STORE_APP_NAME = 'klp48-social-credentials';
const CREDENTIALS_COLLECTION = 'social_credentials';
const REFRESH_LEASES_COLLECTION = 'social_credential_refresh_leases';
const MIN_REFRESH_LEASE_MS = 5_000;
const MAX_REFRESH_LEASE_MS = 5 * 60_000;

export interface CredentialStoreScope {
  projectId: string;
  databaseId: string;
}

export interface SocialCredentialStore {
  get(memberId: SocialCredentialRecord['memberId'], platform: SocialCredentialRecord['platform']): Promise<SocialCredentialRecord | null>;
  save(record: SocialCredentialRecord): Promise<void>;
  acquireRefreshLease(
    memberId: SocialCredentialRecord['memberId'],
    platform: SocialCredentialRecord['platform'],
    providerAccountId: string,
    expectedVersion: number,
    leaseId: string,
    nowMs: number,
    leaseDurationMs: number,
  ): Promise<boolean>;
  releaseRefreshLease(
    memberId: SocialCredentialRecord['memberId'],
    platform: SocialCredentialRecord['platform'],
    leaseId: string,
  ): Promise<boolean>;
  updateTokensIfVersion(
    record: SocialCredentialRecord,
    expectedVersion: number,
    leaseId: string,
    nowMs: number,
  ): Promise<boolean>;
  deleteIfVersion(
    memberId: SocialCredentialRecord['memberId'],
    platform: SocialCredentialRecord['platform'],
    expectedVersion: number,
  ): Promise<boolean>;
}

export function validateCredentialStoreScope(scope: CredentialStoreScope): CredentialStoreScope {
  if (
    typeof scope.projectId !== 'string' ||
    !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(scope.projectId) ||
    scope.projectId === backendTargets.productionProjectId ||
    scope.projectId === backendTargets.emulatorProjectId ||
    typeof scope.databaseId !== 'string' ||
    !/^[a-z][a-z0-9-]{0,62}$/.test(scope.databaseId)
  ) {
    throw new Error('Social credentials require an explicitly isolated Firebase project and database.');
  }
  return { projectId: scope.projectId, databaseId: scope.databaseId };
}

export function createFirestoreCredentialStore(scope: CredentialStoreScope): FirestoreSocialCredentialStore {
  const isolatedScope = validateCredentialStoreScope(scope);
  const existingApp = getApps().find((app) => app.name === CREDENTIAL_STORE_APP_NAME);
  const app = existingApp ?? initializeApp({ projectId: isolatedScope.projectId }, CREDENTIAL_STORE_APP_NAME);

  if (app.options.projectId !== isolatedScope.projectId) {
    throw new Error('Credential store Admin app is bound to a different Firebase project.');
  }

  const firestore = getFirestore(app, isolatedScope.databaseId);
  if (firestore.databaseId !== isolatedScope.databaseId) {
    throw new Error('Credential store did not select its configured Firestore database.');
  }

  return new FirestoreSocialCredentialStore(firestore, isolatedScope);
}

export class FirestoreSocialCredentialStore implements SocialCredentialStore {
  constructor(
    private readonly firestore: Firestore,
    private readonly scope: CredentialStoreScope,
  ) {
    validateCredentialStoreScope(scope);
    if (firestore.databaseId !== scope.databaseId) {
      throw new Error('Credential store Firestore client does not match its configured database.');
    }
  }

  async get(
    memberId: SocialCredentialRecord['memberId'],
    platform: SocialCredentialRecord['platform'],
  ): Promise<SocialCredentialRecord | null> {
    if (!isSocialMemberId(memberId)) return null;
    const snapshot = await this.document(memberId, platform).get();
    if (!snapshot.exists) return null;

    const record = parseSocialCredentialRecord(snapshot.data());
    if (record.memberId !== memberId || record.platform !== platform) {
      throw new TypeError('Invalid social credential data');
    }
    return record;
  }

  async save(value: SocialCredentialRecord): Promise<void> {
    const record = parseSocialCredentialRecord(value);
    await this.document(record.memberId, record.platform).create(record);
  }

  async acquireRefreshLease(
    memberId: SocialCredentialRecord['memberId'],
    platform: SocialCredentialRecord['platform'],
    providerAccountId: string,
    expectedVersion: number,
    leaseId: string,
    nowMs: number,
    leaseDurationMs: number,
  ): Promise<boolean> {
    if (
      !isSocialMemberId(memberId) ||
      typeof providerAccountId !== 'string' || providerAccountId.length === 0 ||
      !Number.isSafeInteger(expectedVersion) || expectedVersion < 0 ||
      typeof leaseId !== 'string' || !/^[A-Za-z0-9_-]{16,128}$/.test(leaseId) ||
      !Number.isSafeInteger(nowMs) ||
      !Number.isSafeInteger(leaseDurationMs) ||
      leaseDurationMs < MIN_REFRESH_LEASE_MS || leaseDurationMs > MAX_REFRESH_LEASE_MS
    ) return false;

    const credentialRef = this.document(memberId, platform);
    const leaseRef = this.refreshLeaseDocument(memberId, platform);
    return this.firestore.runTransaction(async (transaction) => {
      const credentialSnapshot = await transaction.get(credentialRef);
      const leaseSnapshot = await transaction.get(leaseRef);
      if (!credentialSnapshot.exists) return false;

      let credential: SocialCredentialRecord;
      try {
        credential = parseSocialCredentialRecord(credentialSnapshot.data());
      } catch {
        return false;
      }
      if (
        credential.memberId !== memberId ||
        credential.platform !== platform ||
        credential.providerAccountId !== providerAccountId ||
        credential.authorizationVersion !== expectedVersion
      ) return false;

      if (leaseSnapshot.exists) {
        const lease = leaseSnapshot.data() as Record<string, unknown> | undefined;
        if (
          !lease ||
          typeof lease.ownerId !== 'string' ||
          lease.authorizationVersion !== expectedVersion ||
          lease.providerAccountId !== providerAccountId ||
          !(lease.expiresAt instanceof Timestamp)
        ) return false;
        if (lease.expiresAt.toMillis() > nowMs && lease.ownerId !== leaseId) return false;
      }

      transaction.set(leaseRef, {
        ownerId: leaseId,
        authorizationVersion: expectedVersion,
        providerAccountId,
        expiresAt: Timestamp.fromMillis(nowMs + leaseDurationMs),
      });
      return true;
    });
  }

  async releaseRefreshLease(
    memberId: SocialCredentialRecord['memberId'],
    platform: SocialCredentialRecord['platform'],
    leaseId: string,
  ): Promise<boolean> {
    if (!isSocialMemberId(memberId) || !/^[A-Za-z0-9_-]{16,128}$/.test(leaseId)) return false;
    const leaseRef = this.refreshLeaseDocument(memberId, platform);
    return this.firestore.runTransaction(async (transaction) => {
      const leaseSnapshot = await transaction.get(leaseRef);
      if (!leaseSnapshot.exists || leaseSnapshot.get('ownerId') !== leaseId) return false;
      transaction.delete(leaseRef);
      return true;
    });
  }

  async updateTokensIfVersion(
    value: SocialCredentialRecord,
    expectedVersion: number,
    leaseId: string,
    nowMs: number,
  ): Promise<boolean> {
    let record: SocialCredentialRecord;
    try {
      record = parseSocialCredentialRecord(value);
    } catch {
      return false;
    }
    if (
      !Number.isSafeInteger(expectedVersion) || expectedVersion < 0 ||
      expectedVersion === Number.MAX_SAFE_INTEGER ||
      record.authorizationVersion !== expectedVersion + 1 ||
      !/^[A-Za-z0-9_-]{16,128}$/.test(leaseId) ||
      !Number.isSafeInteger(nowMs)
    ) return false;

    const credentialRef = this.document(record.memberId, record.platform);
    const leaseRef = this.refreshLeaseDocument(record.memberId, record.platform);
    return this.firestore.runTransaction(async (transaction) => {
      const credentialSnapshot = await transaction.get(credentialRef);
      const leaseSnapshot = await transaction.get(leaseRef);
      if (!credentialSnapshot.exists || !leaseSnapshot.exists) return false;

      let current: SocialCredentialRecord;
      try {
        current = parseSocialCredentialRecord(credentialSnapshot.data());
      } catch {
        return false;
      }
      const lease = leaseSnapshot.data() as Record<string, unknown> | undefined;
      if (
        current.memberId !== record.memberId ||
        current.platform !== record.platform ||
        current.providerAccountId !== record.providerAccountId ||
        current.grantedScopes.length !== record.grantedScopes.length ||
        current.grantedScopes.some((scope) => !record.grantedScopes.includes(scope)) ||
        current.authorizationVersion !== expectedVersion ||
        !lease ||
        lease.ownerId !== leaseId ||
        lease.providerAccountId !== current.providerAccountId ||
        lease.authorizationVersion !== expectedVersion ||
        !(lease.expiresAt instanceof Timestamp) ||
        lease.expiresAt.toMillis() <= nowMs
      ) return false;

      transaction.set(credentialRef, record);
      transaction.delete(leaseRef);
      return true;
    });
  }

  async deleteIfVersion(
    memberId: SocialCredentialRecord['memberId'],
    platform: SocialCredentialRecord['platform'],
    expectedVersion: number,
  ): Promise<boolean> {
    if (
      !isSocialMemberId(memberId) ||
      !Number.isSafeInteger(expectedVersion) ||
      expectedVersion < 0
    ) return false;

    const reference = this.document(memberId, platform);
    const leaseReference = this.refreshLeaseDocument(memberId, platform);
    return this.firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      const leaseSnapshot = await transaction.get(leaseReference);
      if (!snapshot.exists) return false;

      const record = parseSocialCredentialRecord(snapshot.data());
      if (
        record.memberId !== memberId ||
        record.platform !== platform ||
        record.authorizationVersion !== expectedVersion
      ) return false;

      transaction.delete(reference);
      if (leaseSnapshot.exists) transaction.delete(leaseReference);
      return true;
    });
  }

  private refreshLeaseDocument(
    memberId: SocialCredentialRecord['memberId'],
    platform: SocialCredentialRecord['platform'],
  ) {
    return this.firestore.collection(REFRESH_LEASES_COLLECTION).doc(`${memberId}_${platform}`);
  }

  private document(
    memberId: SocialCredentialRecord['memberId'],
    platform: SocialCredentialRecord['platform'],
  ) {
    return this.firestore.collection(CREDENTIALS_COLLECTION).doc(`${memberId}_${platform}`);
  }
}
