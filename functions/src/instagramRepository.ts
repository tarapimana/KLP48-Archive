import { createHash } from 'node:crypto';
import { CANONICAL_ACTIVE_MEMBER_IDS } from '../../src/data/klp48Data';
import { FieldValue, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminServices } from './firebaseAdmin';
import { isSocialMemberId } from './socialTrackingValidation';
import type { InstagramAccountType } from './instagramApi';

const OAUTH_STATE_COLLECTION = 'social_oauth_states';
const PENDING_CONNECTION_COLLECTION = 'social_oauth_pending';
const ACCOUNT_COLLECTION = 'social_accounts';
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
export const PENDING_CONNECTION_TTL_MS = 15 * 60 * 1000;

export interface InstagramOAuthState {
  initiatedBy: string;
  intendedMemberId: (typeof CANONICAL_ACTIVE_MEMBER_IDS)[number];
  redirectUri: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export interface PendingInstagramConnection {
  connectionId: string;
  initiatedBy: string;
  intendedMemberId: (typeof CANONICAL_ACTIVE_MEMBER_IDS)[number];
  providerAccountId: string;
  username: string;
  accountType: InstagramAccountType;
  grantedScopes: string[];
  accessToken: string;
  accessTokenIssuedAt: Timestamp;
  accessTokenExpiresAt: Timestamp;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export interface InstagramAccountRecord {
  memberId: string;
  platform: 'instagram';
  username: string;
  providerAccountId: string;
  authorizationStatus: 'authorized' | 'expired' | 'revoked' | 'disconnected' | 'error';
  authorizationVersion?: number;
  accountType: InstagramAccountType;
  grantedScopes: string[];
  accessToken?: string;
  accessTokenIssuedAt?: Timestamp;
  accessTokenExpiresAt?: Timestamp;
  authorizedAt?: Timestamp;
  updatedAt: Timestamp;
  disconnectedAt?: Timestamp;
}

export class InstagramRepositoryError extends Error {
  constructor(public readonly reason: 'invalid_state' | 'expired_state' | 'pending_expired' | 'mapping_conflict' | 'member_mismatch' | 'account_not_found') {
    super(reason);
    this.name = 'InstagramRepositoryError';
  }
}

export function isCanonicalActiveMemberId(value: unknown): value is (typeof CANONICAL_ACTIVE_MEMBER_IDS)[number] {
  return isSocialMemberId(value);
}

export function isValidConnectionId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function hashOAuthState(state: string): string {
  return createHash('sha256').update(state).digest('hex');
}

function getDb(): Firestore {
  return getFirebaseAdminServices().firestore;
}

function readAuthorizationVersion(value: unknown): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export async function createOAuthState(
  state: string,
  initiatedBy: string,
  intendedMemberId: (typeof CANONICAL_ACTIVE_MEMBER_IDS)[number],
  redirectUri: string,
  nowMs = Date.now(),
  database: Firestore = getDb(),
): Promise<void> {
  if (!isCanonicalActiveMemberId(intendedMemberId)) {
    throw new InstagramRepositoryError('invalid_state');
  }

  const db = database;
  const now = Timestamp.fromMillis(nowMs);
  await db.collection(OAUTH_STATE_COLLECTION).doc(hashOAuthState(state)).create({
    initiatedBy,
    intendedMemberId,
    redirectUri,
    createdAt: now,
    expiresAt: Timestamp.fromMillis(nowMs + OAUTH_STATE_TTL_MS),
  } satisfies InstagramOAuthState);
}

export async function consumeOAuthState(
  state: string,
  expectedRedirectUri: string,
  nowMs = Date.now(),
  database: Firestore = getDb(),
): Promise<{ initiatedBy: string; intendedMemberId: (typeof CANONICAL_ACTIVE_MEMBER_IDS)[number] } | null> {
  const db = database;
  const stateRef = db.collection(OAUTH_STATE_COLLECTION).doc(hashOAuthState(state));

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(stateRef);
    if (!snapshot.exists) return null;

    const stored = snapshot.data() as Partial<InstagramOAuthState> | undefined;
    transaction.delete(stateRef);

    if (
      !stored ||
      typeof stored.initiatedBy !== 'string' ||
      !isCanonicalActiveMemberId(stored.intendedMemberId) ||
      !(stored.expiresAt instanceof Timestamp) ||
      stored.expiresAt.toMillis() <= nowMs ||
      stored.redirectUri !== expectedRedirectUri
    ) {
      return null;
    }

    return { initiatedBy: stored.initiatedBy, intendedMemberId: stored.intendedMemberId };
  });
}

export async function pruneExpiredInstagramOAuthRecords(nowMs = Date.now()): Promise<void> {
  const db = getDb();
  const expiresAt = Timestamp.fromMillis(nowMs);

  for (const collectionName of [OAUTH_STATE_COLLECTION, PENDING_CONNECTION_COLLECTION]) {
    const expired = await db.collection(collectionName)
      .where('expiresAt', '<=', expiresAt)
      .limit(100)
      .get();
    if (expired.empty) continue;

    const batch = db.batch();
    for (const document of expired.docs) batch.delete(document.ref);
    await batch.commit();
  }
}

export async function savePendingInstagramConnection(
  connection: PendingInstagramConnection,
  database: Firestore = getDb(),
): Promise<void> {
  await database
    .collection(PENDING_CONNECTION_COLLECTION)
    .doc(connection.connectionId)
    .create(connection);
}

function readPendingConnection(
  connectionId: string,
  value: FirebaseFirestore.DocumentData | undefined,
): PendingInstagramConnection | null {
  if (
    !value ||
    value.connectionId !== connectionId ||
    typeof value.initiatedBy !== 'string' ||
    !isCanonicalActiveMemberId(value.intendedMemberId) ||
    typeof value.providerAccountId !== 'string' ||
    typeof value.username !== 'string' ||
    !['business', 'creator'].includes(value.accountType) ||
    !Array.isArray(value.grantedScopes) ||
    !value.grantedScopes.every((scope: unknown) => typeof scope === 'string') ||
    typeof value.accessToken !== 'string' ||
    !(value.accessTokenIssuedAt instanceof Timestamp) ||
    !(value.accessTokenExpiresAt instanceof Timestamp) ||
    !(value.createdAt instanceof Timestamp) ||
    !(value.expiresAt instanceof Timestamp)
  ) {
    return null;
  }

  return value as PendingInstagramConnection;
}

export async function getPendingInstagramConnection(
  connectionId: string,
  nowMs = Date.now(),
): Promise<PendingInstagramConnection | null> {
  const ref = getDb().collection(PENDING_CONNECTION_COLLECTION).doc(connectionId);
  const snapshot = await ref.get();
  const pending = readPendingConnection(connectionId, snapshot.data());
  if (!pending) return null;

  if (pending.expiresAt.toMillis() <= nowMs || pending.accessTokenExpiresAt.toMillis() <= nowMs) {
    await ref.delete();
    return null;
  }

  return pending;
}

export async function confirmPendingInstagramConnection(
  connectionId: string,
  memberId: (typeof CANONICAL_ACTIVE_MEMBER_IDS)[number],
  confirmedBy: string,
  nowMs = Date.now(),
  db: Firestore = getDb(),
): Promise<InstagramAccountRecord> {
  const pendingRef = db.collection(PENDING_CONNECTION_COLLECTION).doc(connectionId);
  const accountRef = db.collection(ACCOUNT_COLLECTION).doc(`${memberId}_instagram`);

  const result = await db.runTransaction(async (transaction) => {
    const pendingSnapshot = await transaction.get(pendingRef);
    const pending = readPendingConnection(connectionId, pendingSnapshot.data());
    if (!pending || pending.initiatedBy !== confirmedBy) {
      throw new InstagramRepositoryError('invalid_state');
    }
    if (pending.intendedMemberId !== memberId) {
      throw new InstagramRepositoryError('member_mismatch');
    }

    if (pending.expiresAt.toMillis() <= nowMs || pending.accessTokenExpiresAt.toMillis() <= nowMs) {
      transaction.delete(pendingRef);
      return { failure: 'pending_expired' as const };
    }

    const duplicateAccountSnapshot = await transaction.get(
      db.collection(ACCOUNT_COLLECTION)
        .where('platform', '==', 'instagram')
        .where('providerAccountId', '==', pending.providerAccountId)
        .limit(1),
    );
    const accountSnapshot = await transaction.get(accountRef);

    if (duplicateAccountSnapshot.docs.some((document) => document.ref.path !== accountRef.path)) {
      throw new InstagramRepositoryError('mapping_conflict');
    }

    const currentVersion = readAuthorizationVersion(accountSnapshot.data()?.authorizationVersion);
    const authorizationVersion = currentVersion + 1;
    const now = Timestamp.fromMillis(nowMs);
    const account: InstagramAccountRecord = {
      memberId,
      platform: 'instagram',
      username: pending.username,
      providerAccountId: pending.providerAccountId,
      authorizationStatus: 'authorized',
      authorizationVersion,
      accountType: pending.accountType,
      grantedScopes: pending.grantedScopes,
      accessToken: pending.accessToken,
      accessTokenIssuedAt: pending.accessTokenIssuedAt,
      accessTokenExpiresAt: pending.accessTokenExpiresAt,
      authorizedAt: now,
      updatedAt: now,
    };

    transaction.set(accountRef, {
      ...account,
      connectedBy: confirmedBy,
    });
    transaction.delete(pendingRef);
    return { account };
  });

  if (!('account' in result) || !result.account) {
    throw new InstagramRepositoryError('pending_expired');
  }
  return result.account;
}

export async function findInstagramMemberMapping(providerAccountId: string): Promise<string | null> {
  const result = await getDb().collection(ACCOUNT_COLLECTION)
    .where('platform', '==', 'instagram')
    .where('providerAccountId', '==', providerAccountId)
    .limit(1)
    .get();
  const memberId = result.docs[0]?.get('memberId');
  return isSocialMemberId(memberId) ? memberId : null;
}

export async function getInstagramAccount(
  memberId: (typeof CANONICAL_ACTIVE_MEMBER_IDS)[number],
  database: Firestore = getDb(),
): Promise<InstagramAccountRecord | null> {
  const snapshot = await database.collection(ACCOUNT_COLLECTION).doc(`${memberId}_instagram`).get();
  if (!snapshot.exists) return null;
  return snapshot.data() as InstagramAccountRecord;
}

export async function updateInstagramTokenIfCurrent(
  memberId: (typeof CANONICAL_ACTIVE_MEMBER_IDS)[number],
  expectedVersion: number,
  expectedAccessToken: string,
  accessToken: string,
  expiresAtMs: number,
  nowMs = Date.now(),
  database: Firestore = getDb(),
): Promise<boolean> {
  const accountRef = database.collection(ACCOUNT_COLLECTION).doc(`${memberId}_instagram`);
  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(accountRef);
    const account = snapshot.data();
    if (
      !snapshot.exists ||
      account?.authorizationStatus !== 'authorized' ||
      readAuthorizationVersion(account.authorizationVersion) !== expectedVersion ||
      account.accessToken !== expectedAccessToken
    ) {
      return false;
    }

    transaction.update(accountRef, {
      accessToken,
      accessTokenIssuedAt: Timestamp.fromMillis(nowMs),
      accessTokenExpiresAt: Timestamp.fromMillis(expiresAtMs),
      authorizationVersion: expectedVersion + 1,
      updatedAt: Timestamp.fromMillis(nowMs),
    });
    return true;
  });
}

export async function markInstagramAuthorizationStatus(
  memberId: (typeof CANONICAL_ACTIVE_MEMBER_IDS)[number],
  status: 'expired' | 'revoked' | 'error',
  expectedVersion: number,
  expectedAccessToken: string,
  nowMs = Date.now(),
  database: Firestore = getDb(),
): Promise<boolean> {
  const accountRef = database.collection(ACCOUNT_COLLECTION).doc(`${memberId}_instagram`);
  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(accountRef);
    const account = snapshot.data();
    if (
      !snapshot.exists ||
      account?.authorizationStatus !== 'authorized' ||
      readAuthorizationVersion(account.authorizationVersion) !== expectedVersion ||
      account.accessToken !== expectedAccessToken
    ) {
      return false;
    }

    transaction.update(accountRef, {
      accessToken: FieldValue.delete(),
      accessTokenIssuedAt: FieldValue.delete(),
      accessTokenExpiresAt: FieldValue.delete(),
      authorizationStatus: status,
      authorizationVersion: expectedVersion + 1,
      updatedAt: Timestamp.fromMillis(nowMs),
    });
    return true;
  });
}

export async function disconnectInstagramAccount(
  memberId: (typeof CANONICAL_ACTIVE_MEMBER_IDS)[number],
  nowMs = Date.now(),
  database: Firestore = getDb(),
): Promise<boolean> {
  const accountRef = database.collection(ACCOUNT_COLLECTION).doc(`${memberId}_instagram`);
  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(accountRef);
    if (!snapshot.exists) return false;

    const authorizationVersion = readAuthorizationVersion(snapshot.get('authorizationVersion'));
    transaction.update(accountRef, {
      accessToken: FieldValue.delete(),
      accessTokenIssuedAt: FieldValue.delete(),
      accessTokenExpiresAt: FieldValue.delete(),
      authorizationStatus: 'disconnected',
      authorizationVersion: authorizationVersion + 1,
      disconnectedAt: Timestamp.fromMillis(nowMs),
      updatedAt: Timestamp.fromMillis(nowMs),
    });
    return true;
  });
}
