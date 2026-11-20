import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

const projectId = 'klp48-social-security-tests';
const adminUid = 'verified-archive-admin';
const capturedAt = Timestamp.fromMillis(Date.UTC(2026, 0, 1));
let testEnvironment: RulesTestEnvironment;

const safeObservation = {
  memberId: 'yi_shyan',
  platform: 'instagram',
  followers: 1200,
  following: 140,
  mediaCount: 24,
  capturedAt,
  collectionStatus: 'success',
};

function trackingConfig(trackedMemberIds: string[] = ['yi_shyan']) {
  return {
    enabled: true,
    trackedMemberIds,
    timezone: 'Asia/Kuala_Lumpur',
    updatedAt: capturedAt,
    updatedBy: adminUid,
  };
}

function trackingLog() {
  return {
    runId: 'test-run-1',
    startedAt: capturedAt,
    finishedAt: capturedAt,
    trigger: 'manual',
    status: 'success',
    accountsAttempted: 1,
    accountsSucceeded: 1,
    accountsFailed: 0,
    errorCode: 'PROVIDER_ERROR',
  };
}

async function seedDocument(path: string, value: unknown): Promise<void> {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), path), value);
  });
}

before(async () => {
  const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: { rules, host: '127.0.0.1', port: 8080 },
  });
  await testEnvironment.clearFirestore();
});

after(async () => {
  await testEnvironment?.cleanup();
});

test('public reads are allowed for the safe statistics projections', async () => {
  await seedDocument('social_snapshots/public-history', safeObservation);
  await seedDocument('social_current/public-current', safeObservation);

  const publicDb = testEnvironment.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(publicDb, 'social_snapshots/public-history')));
  await assertSucceeds(getDocs(collection(publicDb, 'social_snapshots')));
  await assertSucceeds(getDoc(doc(publicDb, 'social_current/public-current')));
});

test('browser clients cannot create, update, or delete social statistics', async () => {
  await seedDocument('social_snapshots/existing', safeObservation);
  await seedDocument('social_current/existing', safeObservation);

  const clientDb = testEnvironment.authenticatedContext('ordinary-user').firestore();
  for (const collectionName of ['social_snapshots', 'social_current']) {
    await assertFails(setDoc(doc(clientDb, collectionName, 'client-created'), safeObservation));
    await assertFails(updateDoc(doc(clientDb, collectionName, 'existing'), { followers: 1 }));
    await assertFails(deleteDoc(doc(clientDb, collectionName, 'existing')));
  }
});

test('social_accounts are inaccessible even to a verified administrator browser client', async () => {
  await seedDocument('social_accounts/private-account', { accessToken: 'server-only-secret' });

  const ordinaryDb = testEnvironment.authenticatedContext('ordinary-user').firestore();
  const adminDb = testEnvironment.authenticatedContext(adminUid, {
    email: 'it.aiman2009@gmail.com',
    email_verified: true,
  }).firestore();

  await assertFails(getDoc(doc(ordinaryDb, 'social_accounts/private-account')));
  await assertFails(setDoc(doc(ordinaryDb, 'social_accounts/client-write'), { accessToken: 'x' }));
  await assertFails(getDoc(doc(adminDb, 'social_accounts/private-account')));
  await assertFails(setDoc(doc(adminDb, 'social_accounts/admin-client-write'), { accessToken: 'x' }));
});

test('tracking config is verified-admin-only and rejects duplicate or inactive member IDs', async () => {
  const anonymousDb = testEnvironment.unauthenticatedContext().firestore();
  const ordinaryDb = testEnvironment.authenticatedContext('ordinary-user', {
    email: 'user@example.com',
    email_verified: true,
  }).firestore();
  const unverifiedAdminDb = testEnvironment.authenticatedContext('unverified-admin', {
    email: 'it.aiman2009@gmail.com',
    email_verified: false,
  }).firestore();
  const adminDb = testEnvironment.authenticatedContext(adminUid, {
    email: 'it.aiman2009@gmail.com',
    email_verified: true,
  }).firestore();
  const configPath = 'social_tracking_config/global';

  await assertFails(getDoc(doc(anonymousDb, configPath)));
  await assertFails(getDoc(doc(ordinaryDb, configPath)));
  await assertFails(setDoc(doc(ordinaryDb, configPath), trackingConfig()));
  await assertFails(setDoc(doc(unverifiedAdminDb, configPath), trackingConfig()));
  await assertSucceeds(setDoc(doc(adminDb, configPath), trackingConfig(['yi_shyan', 'devi'])));
  await assertFails(setDoc(doc(adminDb, 'social_tracking_config/duplicate'), trackingConfig(['yi_shyan', 'yi_shyan'])));
  await assertFails(setDoc(doc(adminDb, 'social_tracking_config/inactive'), trackingConfig(['cindy'])));
  await assertFails(setDoc(doc(adminDb, 'social_tracking_config/extra-field'), {
    ...trackingConfig(),
    secret: 'unexpected',
  }));
});

test('tracking logs are admin-readable and client-write-denied', async () => {
  await seedDocument('social_tracking_logs/run-1', trackingLog());

  const anonymousDb = testEnvironment.unauthenticatedContext().firestore();
  const ordinaryDb = testEnvironment.authenticatedContext('ordinary-user', {
    email: 'user@example.com',
    email_verified: true,
  }).firestore();
  const adminDb = testEnvironment.authenticatedContext(adminUid, {
    email: 'it.aiman2009@gmail.com',
    email_verified: true,
  }).firestore();

  await assertFails(getDoc(doc(anonymousDb, 'social_tracking_logs/run-1')));
  await assertFails(getDoc(doc(ordinaryDb, 'social_tracking_logs/run-1')));
  await assertSucceeds(getDoc(doc(adminDb, 'social_tracking_logs/run-1')));
  await assertFails(setDoc(doc(adminDb, 'social_tracking_logs/client-write'), trackingLog()));
  await assertFails(updateDoc(doc(adminDb, 'social_tracking_logs/run-1'), { status: 'failed' }));
  await assertFails(deleteDoc(doc(adminDb, 'social_tracking_logs/run-1')));
});
