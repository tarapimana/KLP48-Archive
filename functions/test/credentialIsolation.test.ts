import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Timestamp } from 'firebase-admin/firestore';
import test from 'node:test';
import backendTargets from '../firebase-target.json';
import { createCredentialBroker } from '../src/credentialBroker';
import { createCredentialBrokerEndpoint } from '../src/credentialBrokerEndpoint';
import { parseSocialObservationTransport } from '../src/socialTrackingValidation';
import {
  parseCredentialBrokerRequest,
  parseCredentialBrokerResult,
  type CredentialBrokerRequest,
} from '../src/credentialBrokerContract';
import {
  createFirestoreCredentialStore,
  FirestoreSocialCredentialStore,
  validateCredentialStoreScope,
  type SocialCredentialStore,
} from '../src/credentialStore';
import type { SocialCredentialRecord } from '../src/socialCredentialValidation';

const nowMs = Date.UTC(2026, 10, 20, 12);
const request: CredentialBrokerRequest = {
  memberId: 'devi',
  platform: 'instagram',
  authorizationVersion: 7,
};

function instagramCredential(): SocialCredentialRecord {
  return {
    memberId: 'devi',
    platform: 'instagram',
    providerAccountId: 'instagram-account-123',
    accessToken: 'secret-instagram-access-token',
    accessTokenIssuedAt: Timestamp.fromMillis(nowMs - 60_000),
    accessTokenExpiresAt: Timestamp.fromMillis(nowMs + 60_000),
    grantedScopes: ['instagram_basic'],
    authorizationVersion: 7,
    updatedAt: Timestamp.fromMillis(nowMs - 60_000),
  };
}

class MemoryFirestore {
  readonly documents = new Map<string, unknown>();

  constructor(readonly databaseId: string) {}

  collection(name: string) {
    return {
      doc: (id: string) => {
        const path = `${name}/${id}`;
        return {
          path,
          get: async () => {
            const value = this.documents.get(path);
            return { exists: value !== undefined, data: () => value };
          },
          set: async (value: unknown) => {
            this.documents.set(path, value);
          },
        };
      },
    };
  }

  async runTransaction<T>(operation: (transaction: {
    get(reference: { get(): Promise<{ exists: boolean; data(): unknown }> }): Promise<{ exists: boolean; data(): unknown }>;
    delete(reference: { path: string }): void;
  }) => Promise<T>): Promise<T> {
    return operation({
      get: (reference) => reference.get(),
      delete: (reference) => { this.documents.delete(reference.path); },
    });
  }
}

class FixtureCredentialStore implements SocialCredentialStore {
  constructor(private readonly record: SocialCredentialRecord | null) {}

  async get(): Promise<SocialCredentialRecord | null> {
    return this.record;
  }

  async save(): Promise<void> {}

  async deleteIfVersion(): Promise<boolean> {
    return false;
  }
}

function validProviderObservation() {
  return parseSocialObservationTransport({
    memberId: 'devi',
    platform: 'instagram',
    followers: 1200,
    mediaCount: 24,
    capturedAtMs: nowMs,
    collectionStatus: 'success',
  });
}

function validBrokerObservation() {
  return {
    memberId: 'devi',
    platform: 'instagram',
    followers: 1200,
    mediaCount: 24,
    capturedAtMs: nowMs,
    collectionStatus: 'success',
  };
}

function createDependencies(overrides: Partial<Parameters<typeof createCredentialBroker>[0]> = {}) {
  const credential = instagramCredential();
  let providerCalls = 0;
  let providerInput: unknown;
  const dependencies: Parameters<typeof createCredentialBroker>[0] = {
    credentialStore: new FixtureCredentialStore(credential),
    authorizationReader: {
      async getState() {
        return { authorizationStatus: 'authorized', authorizationVersion: 7 };
      },
    },
    providerCollector: {
      async collect(input) {
        providerCalls += 1;
        providerInput = input;
        return validProviderObservation();
      },
    },
    now: () => nowMs,
    ...overrides,
  };
  return {
    dependencies,
    providerCalls: () => providerCalls,
    providerInput: () => providerInput,
  };
}

test('credential migration and credential types remain outside production and frontend exports', async () => {
  const functionsIndex = await readFile(new URL('../src/index.ts', import.meta.url), 'utf8');
  const frontendSocialTypes = await readFile(
    new URL('../../src/types/socialTracking.ts', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(functionsIndex, /credentialBroker|credentialStore|social_credentials/);
  assert.doesNotMatch(frontendSocialTypes, /SocialCredentialRecord|accessToken\s*:/);
});

test('requires a dedicated credentials project and explicit database', () => {
  assert.deepEqual(
    validateCredentialStoreScope({
      projectId: 'demo-klp48-vault',
      databaseId: 'social-credentials',
    }),
    { projectId: 'demo-klp48-vault', databaseId: 'social-credentials' },
  );
  assert.throws(
    () => validateCredentialStoreScope({
      projectId: backendTargets.productionProjectId,
      databaseId: 'social-credentials',
    }),
    /isolated Firebase project/,
  );
  assert.throws(
    () => validateCredentialStoreScope({
      projectId: backendTargets.emulatorProjectId,
      databaseId: 'social-credentials',
    }),
    /isolated Firebase project/,
  );
  assert.throws(
    () => validateCredentialStoreScope({ projectId: 'demo-klp48-vault', databaseId: '' }),
    /isolated Firebase project/,
  );
});

test('broker endpoint is private and uses a dedicated runtime identity', () => {
  const broker = { async collect() { return { status: 'skipped' as const, reason: 'not_authorized' as const }; } };
  const serviceAccount = 'social-credential-broker@klp48-credentials.iam.gserviceaccount.com';
  const endpoint = createCredentialBrokerEndpoint(broker, serviceAccount) as unknown as {
    __endpoint?: {
      serviceAccountEmail?: string | string[];
      httpsTrigger?: { invoker?: string | string[] };
    };
  };
  const invokers = Array.isArray(endpoint.__endpoint?.httpsTrigger?.invoker)
    ? endpoint.__endpoint.httpsTrigger.invoker
    : [endpoint.__endpoint?.httpsTrigger?.invoker];
  const serviceAccounts = Array.isArray(endpoint.__endpoint?.serviceAccountEmail)
    ? endpoint.__endpoint.serviceAccountEmail
    : [endpoint.__endpoint?.serviceAccountEmail];

  assert.ok(invokers.includes('private'));
  assert.ok(serviceAccounts.includes(serviceAccount));
  assert.throws(
    () => createCredentialBrokerEndpoint(broker, backendTargets.productionRuntimeServiceAccount),
    /dedicated runtime service account/,
  );
});

test('Firestore store validates private records and deletes only the expected authorization version', async () => {
  const firestore = new MemoryFirestore('social-credentials');
  const store = new FirestoreSocialCredentialStore(firestore as never, {
    projectId: 'demo-klp48-vault',
    databaseId: 'social-credentials',
  });
  const credential = instagramCredential();

  await store.save(credential);
  assert.deepEqual(await store.get(credential.memberId, credential.platform), credential);
  assert.equal(await store.deleteIfVersion(credential.memberId, credential.platform, 6), false);
  assert.equal(await store.deleteIfVersion(credential.memberId, credential.platform, 7), true);
  assert.equal(await store.get(credential.memberId, credential.platform), null);
  assert.throws(
    () => new FirestoreSocialCredentialStore(firestore as never, {
      projectId: 'demo-klp48-vault',
      databaseId: 'wrong-database',
    }),
    /does not match its configured database/,
  );
});

test('credential broker rejects extra request fields, including caller-supplied tokens', () => {
  assert.deepEqual(parseCredentialBrokerRequest(request), request);
  assert.throws(
    () => parseCredentialBrokerRequest({ ...request, accessToken: 'attacker-controlled-token' }),
    /Invalid social tracking data/,
  );
  assert.throws(() => parseCredentialBrokerRequest({ ...request, platform: 'youtube' }));
  assert.throws(() => parseCredentialBrokerRequest({ ...request, authorizationVersion: -1 }));
});

test('broker returns only validated observations while tokens remain inside its provider boundary', async () => {
  const fixture = createDependencies();
  const broker = createCredentialBroker(fixture.dependencies);
  const result = await broker.collect(request);

  assert.equal(result.status, 'collected');
  assert.equal(fixture.providerCalls(), 1);
  assert.equal((fixture.providerInput() as { accessToken: string }).accessToken, 'secret-instagram-access-token');
  assert.deepEqual(result, { status: 'collected', observation: validBrokerObservation() });
  assert.doesNotMatch(JSON.stringify(result), /secret-instagram-access-token/);
  assert.deepEqual(parseCredentialBrokerResult(result, request), result);
});

test('authorization status and version checks prevent stale or disconnected credential reads', async () => {
  let storeReads = 0;
  const fixture = createDependencies({
    authorizationReader: {
      async getState() {
        return { authorizationStatus: 'disconnected', authorizationVersion: 8 };
      },
    },
    credentialStore: {
      async get() {
        storeReads += 1;
        return instagramCredential();
      },
      async save() {},
      async deleteIfVersion() { return false; },
    },
  });
  const broker = createCredentialBroker(fixture.dependencies);
  assert.deepEqual(await broker.collect(request), { status: 'skipped', reason: 'not_authorized' });
  assert.equal(storeReads, 0);
  assert.equal(fixture.providerCalls(), 0);

  const changed = createDependencies({
    authorizationReader: {
      async getState() {
        return { authorizationStatus: 'authorized', authorizationVersion: 8 };
      },
    },
  });
  assert.deepEqual(
    await createCredentialBroker(changed.dependencies).collect(request),
    { status: 'skipped', reason: 'authorization_changed' },
  );
  assert.equal(changed.providerCalls(), 0);
});

test('broker discards observations when authorization changes during provider collection', async () => {
  let authorizationReads = 0;
  const fixture = createDependencies({
    authorizationReader: {
      async getState() {
        authorizationReads += 1;
        return {
          authorizationStatus: 'authorized',
          authorizationVersion: authorizationReads === 1 ? 7 : 8,
        };
      },
    },
  });
  const result = await createCredentialBroker(fixture.dependencies).collect(request);

  assert.deepEqual(result, { status: 'skipped', reason: 'authorization_changed' });
  assert.equal(fixture.providerCalls(), 1);
  assert.equal(authorizationReads, 2);
});

test('provider errors and malformed provider observations return sanitized codes only', async () => {
  const providerFailure = createDependencies({
    providerCollector: {
      async collect() {
        throw new Error('provider returned secret-instagram-access-token');
      },
    },
  });
  const failure = await createCredentialBroker(providerFailure.dependencies).collect(request);
  assert.deepEqual(failure, { status: 'failed', errorCode: 'provider_error' });
  assert.doesNotMatch(JSON.stringify(failure), /secret-instagram-access-token/);

  const malformed = createDependencies({
    providerCollector: {
      async collect() {
        return { ...validProviderObservation(), accessToken: 'secret-instagram-access-token' };
      },
    },
  });
  const invalid = await createCredentialBroker(malformed.dependencies).collect(request);
  assert.deepEqual(invalid, { status: 'failed', errorCode: 'invalid_provider_response' });
  assert.doesNotMatch(JSON.stringify(invalid), /secret-instagram-access-token/);
});

test('broker result parser rejects secrets and observations for a different account', () => {
  assert.throws(() => parseCredentialBrokerResult({
    status: 'collected',
    observation: validBrokerObservation(),
    accessToken: 'secret-instagram-access-token',
  }, request));
  assert.throws(() => parseCredentialBrokerResult({
    status: 'collected',
    observation: { ...validBrokerObservation(), memberId: 'tara' },
  }, request));
  assert.throws(() => parseCredentialBrokerResult({
    status: 'failed',
    errorCode: 'provider_error',
    providerError: 'secret-instagram-access-token',
  }, request));
});

test('Firestore credential adapter uses a separate emulator project when the emulator is enabled', {
  skip: !process.env.FIRESTORE_EMULATOR_HOST,
}, async () => {
  const projectId = 'demo-klp48-vault';
  const databaseId = 'social-credentials';
  const store = createFirestoreCredentialStore({ projectId, databaseId });
  const credential = instagramCredential();

  await store.save(credential);
  assert.deepEqual(await store.get(credential.memberId, credential.platform), credential);
  assert.equal(await store.deleteIfVersion(credential.memberId, credential.platform, 6), false);
  assert.equal(await store.deleteIfVersion(credential.memberId, credential.platform, 7), true);
  assert.equal(await store.get(credential.memberId, credential.platform), null);
});
