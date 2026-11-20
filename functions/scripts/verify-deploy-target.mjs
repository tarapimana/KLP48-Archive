import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const targetConfigPath = resolve(scriptDirectory, '../firebase-target.json');
const targetConfig = JSON.parse(await readFile(targetConfigPath, 'utf8'));
const selectedProjectId = process.env.GCLOUD_PROJECT;
const projectId = targetConfig.productionProjectId;
const region = targetConfig.productionRegion;
const runtimeServiceAccount = targetConfig.productionRuntimeServiceAccount;
const identifierPattern = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/;
const regionPattern = /^[a-z]+-[a-z0-9]+[0-9]$/;

if (typeof projectId !== 'string' || !identifierPattern.test(projectId)) {
  throw new Error('Configured production Firebase project ID is invalid.');
}

const serviceAccountPattern = new RegExp(
  `^[a-z][a-z0-9-]{4,28}[a-z0-9]@${projectId}\\.iam\\.gserviceaccount\\.com$`,
);

if (typeof region !== 'string' || !regionPattern.test(region)) {
  throw new Error('Configured production Functions region is missing or invalid.');
}

if (typeof runtimeServiceAccount !== 'string' || !serviceAccountPattern.test(runtimeServiceAccount)) {
  throw new Error('Configured runtime service account must be a named service account in the production project.');
}

if (!selectedProjectId) {
  throw new Error('Firebase deploy target is missing. Pass an explicit --project value.');
}

if (selectedProjectId !== projectId) {
  throw new Error(`Refusing Functions deployment to ${selectedProjectId}; expected ${projectId}.`);
}

if (process.env.FUNCTIONS_EMULATOR === 'true') {
  throw new Error('Refusing to run the deployment hook inside the Functions emulator.');
}

console.log(
  `Firebase Functions deploy target verified: project=${projectId}, region=${region}, runtimeServiceAccount=${runtimeServiceAccount}`,
);
