import assert from 'node:assert/strict';
import test from 'node:test';
import { writePublicObservationIfAuthorized } from '../src/socialObservationRepository';
import { parseSocialObservationTransport } from '../src/socialTrackingValidation';

class MemoryProjectionFirestore {
  readonly documents = new Map<string, unknown>();
  private generatedId = 0;

  collection(name: string) {
    return {
      doc: (requestedId?: string) => {
        const path = `${name}/${requestedId ?? `generated-${++this.generatedId}`}`;
        return {
          path,
          get: async () => {
            const value = this.documents.get(path);
            return {
              exists: value !== undefined,
              data: () => value,
            };
          },
          set: async (value: unknown) => { this.documents.set(path, value); },
          create: async (value: unknown) => {
            if (this.documents.has(path)) throw new Error('already exists');
            this.documents.set(path, value);
          },
        };
      },
    };
  }

  async runTransaction<T>(operation: (transaction: {
    get(reference: { get(): Promise<{ exists: boolean; data(): unknown }> }): Promise<{ exists: boolean; data(): unknown }>;
    set(reference: { path: string }, value: unknown): void;
    create(reference: { path: string }, value: unknown): void;
  }) => Promise<T>): Promise<T> {
    return operation({
      get: (reference) => reference.get(),
      set: (reference, value) => { this.documents.set(reference.path, value); },
      create: (reference, value) => {
        if (this.documents.has(reference.path)) throw new Error('already exists');
        this.documents.set(reference.path, value);
      },
    });
  }
}

const authorization = {
  memberId: 'devi',
  platform: 'instagram' as const,
  providerAccountId: 'instagram-account-123',
  authorizationVersion: 7,
};

function observation(capturedAtMs = Date.UTC(2026, 10, 20, 12)) {
  return parseSocialObservationTransport({
    memberId: 'devi',
    platform: 'instagram',
    followers: 1200,
    following: 0,
    mediaCount: 24,
    capturedAtMs,
    collectionStatus: 'success',
  });
}

async function seedAuthorization(firestore: MemoryProjectionFirestore, value: unknown) {
  await firestore.collection('social_accounts').doc('devi_instagram').set(value);
}

test('writes public projections only for the same authorized provider account and version', async () => {
  const firestore = new MemoryProjectionFirestore();
  await seedAuthorization(firestore, { ...authorization, authorizationStatus: 'authorized' });

  const written = await writePublicObservationIfAuthorized(
    firestore as never,
    authorization,
    observation(),
  );
  assert.equal(written, true);

  const current = firestore.documents.get('social_current/devi_instagram') as Record<string, unknown>;
  const snapshots = [...firestore.documents.entries()]
    .filter(([path]) => path.startsWith('social_snapshots/'));
  assert.equal(snapshots.length, 1);
  assert.equal(current.memberId, 'devi');
  assert.equal(current.platform, 'instagram');
  assert.equal(Object.hasOwn(current, 'providerAccountId'), false);
  assert.equal(Object.hasOwn(current, 'accessToken'), false);
});

test('rejects writes after disconnect, provider-account replacement, or version change', async () => {
  for (const changedAuthorization of [
    { ...authorization, authorizationStatus: 'disconnected' },
    { ...authorization, authorizationStatus: 'authorized', providerAccountId: 'replacement-account' },
    { ...authorization, authorizationStatus: 'authorized', authorizationVersion: 8 },
  ]) {
    const firestore = new MemoryProjectionFirestore();
    await seedAuthorization(firestore, changedAuthorization);
    assert.equal(
      await writePublicObservationIfAuthorized(firestore as never, authorization, observation()),
      false,
    );
    assert.equal(firestore.documents.has('social_current/devi_instagram'), false);
    assert.equal([...firestore.documents.keys()].some((path) => path.startsWith('social_snapshots/')), false);
  }
});

test('does not replace a newer current observation with a stale collection result', async () => {
  const firestore = new MemoryProjectionFirestore();
  await seedAuthorization(firestore, { ...authorization, authorizationStatus: 'authorized' });
  await firestore.collection('social_current').doc('devi_instagram').set({
    ...observation(Date.UTC(2026, 10, 20, 13)),
  });

  const written = await writePublicObservationIfAuthorized(
    firestore as never,
    authorization,
    observation(Date.UTC(2026, 10, 20, 12)),
  );
  assert.equal(written, false);
  assert.equal(firestore.documents.has('social_snapshots/generated-1'), false);
});
