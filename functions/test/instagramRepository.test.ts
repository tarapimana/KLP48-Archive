import assert from 'node:assert/strict';
import test from 'node:test';
import { Timestamp, type Firestore } from 'firebase-admin/firestore';
import {
  confirmPendingInstagramConnection,
  createOAuthState,
  consumeOAuthState,
  disconnectInstagramAccount,
  getInstagramAccount,
  InstagramRepositoryError,
  isCanonicalActiveMemberId,
  savePendingInstagramConnection,
  updateInstagramTokenIfCurrent,
  markInstagramAuthorizationStatus,
  type PendingInstagramConnection,
} from '../src/instagramRepository';

const memberId = 'yi_shyan' as const;
const otherMemberId = 'alice' as const;
const pendingId = '3d73f7f7-1904-4e7a-8f41-183fdf1df773';
const adminId = 'admin-test';
const redirectUri = 'https://example.test/instagramOAuthCallback';
const tokenIssuedAt = Timestamp.fromMillis(1_800_000_000_000);
const tokenExpiresAt = Timestamp.fromMillis(1_900_000_000_000);

class FakeDocumentReference {
  readonly path: string;

  constructor(
    private readonly database: FakeFirestore,
    readonly collectionName: string,
    readonly id: string,
  ) {
    this.path = `${collectionName}/${id}`;
  }

  async get(): Promise<FakeDocumentSnapshot> {
    return new FakeDocumentSnapshot(this, this.database.read(this.path));
  }

  async create(value: Record<string, unknown>): Promise<void> {
    if (this.database.read(this.path)) throw new Error('already exists');
    this.database.write(this.path, value);
  }
}

class FakeDocumentSnapshot {
  constructor(
    readonly ref: FakeDocumentReference,
    private readonly value: Record<string, unknown> | undefined,
  ) {}

  get exists(): boolean {
    return this.value !== undefined;
  }

  data(): Record<string, unknown> | undefined {
    return this.value;
  }

  get(field: string): unknown {
    return this.value?.[field];
  }
}

class FakeQuerySnapshot {
  constructor(readonly docs: FakeDocumentSnapshot[]) {}

  get empty(): boolean {
    return this.docs.length === 0;
  }
}

class FakeQuery {
  constructor(
    private readonly database: FakeFirestore,
    private readonly collectionName: string,
    private readonly filters: Array<[string, unknown]> = [],
    private readonly maxDocuments = Number.POSITIVE_INFINITY,
  ) {}

  where(field: string, _operator: string, value: unknown): FakeQuery {
    return new FakeQuery(this.database, this.collectionName, [...this.filters, [field, value]], this.maxDocuments);
  }

  limit(maxDocuments: number): FakeQuery {
    return new FakeQuery(this.database, this.collectionName, this.filters, maxDocuments);
  }

  async get(): Promise<FakeQuerySnapshot> {
    const docs = this.database.entries(this.collectionName)
      .filter(([, value]) => this.filters.every(([field, expected]) => value[field] === expected))
      .slice(0, this.maxDocuments)
      .map(([path, value]) => {
        const id = path.slice(this.collectionName.length + 1);
        return new FakeDocumentSnapshot(new FakeDocumentReference(this.database, this.collectionName, id), value);
      });
    return new FakeQuerySnapshot(docs);
  }
}

class FakeCollection extends FakeQuery {
  constructor(private readonly collectionDatabase: FakeFirestore, readonly name: string) {
    super(collectionDatabase, name);
  }

  doc(id: string): FakeDocumentReference {
    return new FakeDocumentReference(this.collectionDatabase, this.name, id);
  }
}

class FakeTransaction {
  private readonly writes: Array<{
    operation: 'set' | 'update' | 'delete';
    ref: FakeDocumentReference;
    value?: Record<string, unknown>;
  }> = [];

  async get(target: FakeDocumentReference | FakeQuery): Promise<FakeDocumentSnapshot | FakeQuerySnapshot> {
    return target instanceof FakeQuery ? target.get() : target.get();
  }

  set(ref: FakeDocumentReference, value: Record<string, unknown>): void {
    this.writes.push({ operation: 'set', ref, value });
  }

  update(ref: FakeDocumentReference, value: Record<string, unknown>): void {
    this.writes.push({ operation: 'update', ref, value });
  }

  delete(ref: FakeDocumentReference): void {
    this.writes.push({ operation: 'delete', ref });
  }

  commit(database: FakeFirestore): void {
    for (const write of this.writes) {
      if (write.operation === 'delete') {
        database.remove(write.ref.path);
      } else if (write.operation === 'set') {
        database.write(write.ref.path, write.value ?? {});
      } else {
        const current = database.read(write.ref.path);
        if (!current) throw new Error('cannot update missing document');
        const next = { ...current };
        for (const [key, value] of Object.entries(write.value ?? {})) {
          if (isDeleteTransform(value)) delete next[key];
          else next[key] = value;
        }
        database.write(write.ref.path, next);
      }
    }
  }
}

class FakeFirestore {
  private readonly documents = new Map<string, Record<string, unknown>>();
  private transactionTail: Promise<void> = Promise.resolve();

  collection(name: string): FakeCollection {
    return new FakeCollection(this, name);
  }

  async runTransaction<T>(callback: (transaction: FakeTransaction) => Promise<T>): Promise<T> {
    const previous = this.transactionTail;
    let release: () => void = () => undefined;
    this.transactionTail = new Promise<void>((resolve) => { release = resolve; });
    await previous;

    try {
      const transaction = new FakeTransaction();
      const result = await callback(transaction);
      transaction.commit(this);
      return result;
    } finally {
      release();
    }
  }

  read(path: string): Record<string, unknown> | undefined {
    return this.documents.get(path);
  }

  write(path: string, value: Record<string, unknown>): void {
    this.documents.set(path, { ...value });
  }

  remove(path: string): void {
    this.documents.delete(path);
  }

  entries(collectionName: string): Array<[string, Record<string, unknown>]> {
    return [...this.documents.entries()].filter(([path]) => path.startsWith(`${collectionName}/`));
  }
}

function isDeleteTransform(value: unknown): boolean {
  return typeof value === 'object' && value !== null && value.constructor.name === 'DeleteTransform';
}

function createDatabase(): FakeFirestore {
  return new FakeFirestore();
}

function accountDocument(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    memberId,
    platform: 'instagram',
    username: 'klp48_official',
    providerAccountId: '17841400000000000',
    authorizationStatus: 'authorized',
    authorizationVersion: 4,
    accountType: 'business',
    grantedScopes: ['instagram_business_basic'],
    accessToken: 'current-token',
    accessTokenIssuedAt: tokenIssuedAt,
    accessTokenExpiresAt: tokenExpiresAt,
    updatedAt: tokenIssuedAt,
    ...overrides,
  };
}

function pendingConnection(overrides: Partial<PendingInstagramConnection> = {}): PendingInstagramConnection {
  return {
    connectionId: pendingId,
    initiatedBy: adminId,
    intendedMemberId: memberId,
    providerAccountId: '17841400000000000',
    username: 'klp48_official',
    accountType: 'business',
    grantedScopes: ['instagram_business_basic'],
    accessToken: 'pending-token',
    accessTokenIssuedAt: tokenIssuedAt,
    accessTokenExpiresAt: tokenExpiresAt,
    createdAt: tokenIssuedAt,
    expiresAt: tokenExpiresAt,
    ...overrides,
  };
}

function asFirestore(database: FakeFirestore): Firestore {
  return database as unknown as Firestore;
}

test('disconnect during an in-flight provider refresh invalidates its eventual result', async () => {
  const database = createDatabase();
  const firestore = asFirestore(database);
  database.write(`social_accounts/${memberId}_instagram`, accountDocument());
  database.write('social_snapshots/historical', { memberId, followers: 1200 });
  const captured = await getInstagramAccount(memberId, firestore);
  assert.ok(captured?.accessToken);

  let finishProviderRequest: () => void = () => undefined;
  const providerRequest = new Promise<void>((resolve) => { finishProviderRequest = resolve; });
  const eventualCommit = providerRequest.then(() => updateInstagramTokenIfCurrent(
    memberId,
    captured.authorizationVersion ?? 0,
    captured.accessToken!,
    'stale-provider-token',
    1_950_000_000_000,
    1_850_000_000_000,
    firestore,
  ));

  await disconnectInstagramAccount(memberId, 1_850_000_000_001, firestore);
  finishProviderRequest();

  assert.equal(await eventualCommit, false);
  const disconnected = database.read(`social_accounts/${memberId}_instagram`);
  assert.equal(disconnected?.authorizationStatus, 'disconnected');
  assert.equal(disconnected?.accessToken, undefined);
  assert.equal(disconnected?.authorizationVersion, 5);
  assert.deepEqual(database.read('social_snapshots/historical'), { memberId, followers: 1200 });
});

test('two refresh attempts using the same version cannot overwrite one another', async () => {
  const database = createDatabase();
  const firestore = asFirestore(database);
  database.write(`social_accounts/${memberId}_instagram`, accountDocument());

  const results = await Promise.all([
    updateInstagramTokenIfCurrent(memberId, 4, 'current-token', 'refresh-a', 2_000_000_000_000, 1_850_000_000_000, firestore),
    updateInstagramTokenIfCurrent(memberId, 4, 'current-token', 'refresh-b', 2_010_000_000_000, 1_850_000_000_000, firestore),
  ]);

  assert.deepEqual(results.sort(), [false, true]);
  const stored = database.read(`social_accounts/${memberId}_instagram`);
  assert.ok(['refresh-a', 'refresh-b'].includes(String(stored?.accessToken)));
  assert.equal(stored?.authorizationVersion, 5);
});

test('a refresh failure cannot replace a newer successful authorization', async () => {
  const database = createDatabase();
  const firestore = asFirestore(database);
  database.write(`social_accounts/${memberId}_instagram`, accountDocument());

  assert.equal(await updateInstagramTokenIfCurrent(
    memberId,
    4,
    'current-token',
    'new-successful-token',
    2_000_000_000_000,
    1_850_000_000_000,
    firestore,
  ), true);
  assert.equal(await markInstagramAuthorizationStatus(
    memberId,
    'revoked',
    4,
    'current-token',
    1_850_000_000_001,
    firestore,
  ), false);

  const stored = database.read(`social_accounts/${memberId}_instagram`);
  assert.equal(stored?.authorizationStatus, 'authorized');
  assert.equal(stored?.accessToken, 'new-successful-token');
  assert.equal(stored?.authorizationVersion, 5);
});

test('disconnect followed by a stale refresh result leaves the account disconnected', async () => {
  const database = createDatabase();
  const firestore = asFirestore(database);
  database.write(`social_accounts/${memberId}_instagram`, accountDocument());

  assert.equal(await disconnectInstagramAccount(memberId, 1_850_000_000_000, firestore), true);
  assert.equal(await updateInstagramTokenIfCurrent(
    memberId,
    4,
    'current-token',
    'late-token',
    2_000_000_000_000,
    1_850_000_000_001,
    firestore,
  ), false);

  const stored = database.read(`social_accounts/${memberId}_instagram`);
  assert.equal(stored?.authorizationStatus, 'disconnected');
  assert.equal(stored?.accessToken, undefined);
  assert.equal(stored?.authorizationVersion, 5);
});

test('a refresh commits only when the expected authorized version still matches', async () => {
  const database = createDatabase();
  const firestore = asFirestore(database);
  database.write(`social_accounts/${memberId}_instagram`, accountDocument());

  assert.equal(await updateInstagramTokenIfCurrent(
    memberId,
    4,
    'current-token',
    'refreshed-token',
    2_000_000_000_000,
    1_850_000_000_000,
    firestore,
  ), true);
  const stored = database.read(`social_accounts/${memberId}_instagram`);
  assert.equal(stored?.accessToken, 'refreshed-token');
  assert.equal(stored?.authorizationStatus, 'authorized');
  assert.equal(stored?.authorizationVersion, 5);
});

test('OAuth intent state accepts only active members and carries the member through one-time consumption', async () => {
  const database = createDatabase();
  const firestore = asFirestore(database);
  const nowMs = 1_850_000_000_000;

  assert.equal(isCanonicalActiveMemberId('cocoa'), false);
  await assert.rejects(
    createOAuthState('inactive-member-state', adminId, 'cocoa' as typeof memberId, redirectUri, nowMs, firestore),
    (error: unknown) => error instanceof InstagramRepositoryError && error.reason === 'invalid_state',
  );

  const state = 'this-is-a-long-random-state-value-for-unit-tests';
  await createOAuthState(state, adminId, memberId, redirectUri, nowMs, firestore);
  assert.deepEqual(await consumeOAuthState(state, redirectUri, nowMs + 1, firestore), {
    initiatedBy: adminId,
    intendedMemberId: memberId,
  });
  assert.equal(await consumeOAuthState(state, redirectUri, nowMs + 2, firestore), null);
});

test('confirmation rejects a different member from the OAuth intent', async () => {
  const database = createDatabase();
  const firestore = asFirestore(database);
  await savePendingInstagramConnection(pendingConnection(), firestore);

  await assert.rejects(
    confirmPendingInstagramConnection(pendingId, otherMemberId, adminId, 1_850_000_000_000, firestore),
    (error: unknown) => error instanceof InstagramRepositoryError && error.reason === 'member_mismatch',
  );
  assert.equal(database.read(`social_accounts/${otherMemberId}_instagram`), undefined);
});

test('expired pending connection cannot be confirmed', async () => {
  const database = createDatabase();
  const firestore = asFirestore(database);
  await savePendingInstagramConnection(pendingConnection({
    expiresAt: Timestamp.fromMillis(1_849_999_999_999),
  }), firestore);

  await assert.rejects(
    confirmPendingInstagramConnection(pendingId, memberId, adminId, 1_850_000_000_000, firestore),
    (error: unknown) => error instanceof InstagramRepositoryError && error.reason === 'pending_expired',
  );
  assert.equal(database.read(`social_accounts/${memberId}_instagram`), undefined);
});

test('valid confirmation connects only the intended member and starts a new authorization version', async () => {
  const database = createDatabase();
  const firestore = asFirestore(database);
  await savePendingInstagramConnection(pendingConnection(), firestore);

  const account = await confirmPendingInstagramConnection(pendingId, memberId, adminId, 1_850_000_000_000, firestore);

  assert.equal(account.memberId, memberId);
  assert.equal(account.accessToken, 'pending-token');
  assert.equal(account.authorizationStatus, 'authorized');
  assert.equal(account.authorizationVersion, 1);
  assert.equal(database.read(`social_oauth_pending/${pendingId}`), undefined);
  assert.equal(database.read(`social_accounts/${memberId}_instagram`)?.authorizationVersion, 1);
});

test('an Instagram provider account cannot be confirmed for a second member', async () => {
  const database = createDatabase();
  const firestore = asFirestore(database);
  database.write(`social_accounts/${otherMemberId}_instagram`, {
    memberId: otherMemberId,
    platform: 'instagram',
    providerAccountId: '17841400000000000',
  });
  await savePendingInstagramConnection(pendingConnection(), firestore);

  await assert.rejects(
    confirmPendingInstagramConnection(pendingId, memberId, adminId, 1_850_000_000_000, firestore),
    (error: unknown) => error instanceof InstagramRepositoryError && error.reason === 'mapping_conflict',
  );
  assert.equal(database.read(`social_accounts/${memberId}_instagram`), undefined);
});
