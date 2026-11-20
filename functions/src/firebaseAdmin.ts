import { getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import backendTargets from '../firebase-target.json';

export const ADMIN_APP_NAME = 'klp48-social-tracking';

export interface FirebaseAdminServices {
  app: App;
  auth: Auth;
  firestore: Firestore;
}

export function resolveFirebaseProjectId(
  environment: NodeJS.ProcessEnv = process.env,
): string {
  const projectId = environment.GCLOUD_PROJECT ?? environment.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    throw new Error('Firebase project ID is not configured; refusing implicit project selection.');
  }

  const isEmulator =
    environment.FUNCTIONS_EMULATOR === 'true' || Boolean(environment.FIRESTORE_EMULATOR_HOST);
  const expectedProjectId = isEmulator
    ? backendTargets.emulatorProjectId
    : backendTargets.productionProjectId;

  if (projectId !== expectedProjectId) {
    throw new Error(`Firebase project mismatch: expected ${expectedProjectId}.`);
  }

  return projectId;
}

export function createFirebaseAdminServices(projectId: string): FirebaseAdminServices {
  if (projectId !== backendTargets.productionProjectId && projectId !== backendTargets.emulatorProjectId) {
    throw new Error('Firebase project is not an explicitly configured target.');
  }

  const existingApp = getApps().find((app) => app.name === ADMIN_APP_NAME);
  const app = existingApp ?? initializeApp({ projectId }, ADMIN_APP_NAME);

  if (app.options.projectId !== projectId) {
    throw new Error('Existing Firebase Admin app is bound to a different project.');
  }

  const auth = getAuth(app);
  const firestore = getFirestore(app, backendTargets.firestoreDatabaseId);

  if (firestore.databaseId !== backendTargets.firestoreDatabaseId) {
    throw new Error('Firebase Admin did not select the configured named Firestore database.');
  }

  return { app, auth, firestore };
}

let cachedServices: FirebaseAdminServices | undefined;

export function getFirebaseAdminServices(): FirebaseAdminServices {
  if (!cachedServices) {
    cachedServices = createFirebaseAdminServices(resolveFirebaseProjectId());
  }
  return cachedServices;
}
