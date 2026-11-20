import assert from 'node:assert/strict';
import test from 'node:test';
import backendTargets from '../firebase-target.json';
import {
  createFirebaseAdminServices,
  resolveFirebaseProjectId,
} from '../src/firebaseAdmin';

const emulatorEnvironment = {
  GCLOUD_PROJECT: backendTargets.emulatorProjectId,
  FUNCTIONS_EMULATOR: 'true',
};

test('requires an explicit, allowlisted Firebase project ID', () => {
  assert.throws(() => resolveFirebaseProjectId({}), /project ID is not configured/);
  assert.throws(
    () => resolveFirebaseProjectId({ GCLOUD_PROJECT: 'unrelated-project' }),
    /project mismatch/,
  );
  assert.equal(resolveFirebaseProjectId(emulatorEnvironment), backendTargets.emulatorProjectId);
  assert.equal(
    resolveFirebaseProjectId({ GCLOUD_PROJECT: backendTargets.productionProjectId }),
    backendTargets.productionProjectId,
  );
});

test('initializes Admin SDK against the configured named Firestore database', () => {
  const services = createFirebaseAdminServices(backendTargets.productionProjectId);

  assert.equal(services.app.options.projectId, backendTargets.productionProjectId);
  assert.equal(services.firestore.databaseId, backendTargets.firestoreDatabaseId);
  assert.equal(services.auth.app.name, services.app.name);
});

test('refuses implicit or unconfigured Admin SDK project selection', () => {
  assert.throws(() => createFirebaseAdminServices(''), /not an explicitly configured target/);
  assert.throws(() => createFirebaseAdminServices('wrong-project'), /not an explicitly configured target/);
});
