import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, type Firestore } from 'firebase-admin/firestore';
import backendTargets from '../firebase-target.json';
import { isSocialMemberId } from './socialTrackingValidation';
import {
  parseSocialCredentialRecord,
  type SocialCredentialRecord,
} from './socialCredentialValidation';

const CREDENTIAL_STORE_APP_NAME = 'klp48-social-credentials';
const CREDENTIALS_COLLECTION = 'social_credentials';

export interface CredentialStoreScope {
  projectId: string;
  databaseId: string;
}

export interface SocialCredentialStore {
  get(memberId: SocialCredentialRecord['memberId'], platform: SocialCredentialRecord['platform']): Promise<SocialCredentialRecord | null>;
  save(record: SocialCredentialRecord): Promise<void>;
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
    await this.document(record.memberId, record.platform).set(record);
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
    return this.firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists) return false;

      const record = parseSocialCredentialRecord(snapshot.data());
      if (
        record.memberId !== memberId ||
        record.platform !== platform ||
        record.authorizationVersion !== expectedVersion
      ) return false;

      transaction.delete(reference);
      return true;
    });
  }

  private document(
    memberId: SocialCredentialRecord['memberId'],
    platform: SocialCredentialRecord['platform'],
  ) {
    return this.firestore.collection(CREDENTIALS_COLLECTION).doc(`${memberId}_${platform}`);
  }
}
