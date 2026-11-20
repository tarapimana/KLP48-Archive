import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import backendTargets from '../firebase-target.json';
import {
  health,
  instagramConfirmConnection,
  instagramDisconnect,
  instagramOAuthCallback,
  instagramOAuthStart,
  instagramPendingConnection,
  instagramReconnect,
  instagramRefresh,
} from '../src';

interface EndpointMetadata {
  region?: string | string[];
  serviceAccountEmail?: string | string[];
  httpsTrigger?: { invoker?: string | string[] };
}

interface FirebaseHttpFunction {
  __endpoint?: EndpointMetadata;
}

const endpointFunctions = {
  health,
  instagramConfirmConnection,
  instagramDisconnect,
  instagramOAuthCallback,
  instagramOAuthStart,
  instagramPendingConnection,
  instagramReconnect,
  instagramRefresh,
};

const deployGuardPath = fileURLToPath(new URL('../scripts/verify-deploy-target.mjs', import.meta.url));

function runDeployGuard(projectId: string | undefined, emulator = false) {
  return spawnSync(process.execPath, [deployGuardPath], {
    encoding: 'utf8',
    env: {
      PATH: process.env.PATH,
      GCLOUD_PROJECT: projectId,
      FUNCTIONS_EMULATOR: emulator ? 'true' : 'false',
    },
  });
}

test('every exported HTTP function uses the configured production region and runtime identity', () => {
  for (const [name, httpFunction] of Object.entries(endpointFunctions)) {
    const endpoint = (httpFunction as unknown as FirebaseHttpFunction).__endpoint;
    assert.ok(endpoint, `${name} should expose Firebase endpoint metadata`);
    const regions = Array.isArray(endpoint.region) ? endpoint.region : [endpoint.region];
    const serviceAccounts = Array.isArray(endpoint.serviceAccountEmail)
      ? endpoint.serviceAccountEmail
      : [endpoint.serviceAccountEmail];
    assert.ok(regions.includes(backendTargets.productionRegion), `${name} region`);
    assert.ok(
      serviceAccounts.includes(backendTargets.productionRuntimeServiceAccount),
      `${name} runtime service account`,
    );
  }
});

test('the OAuth callback remains publicly invokable', () => {
  const endpoint = (instagramOAuthCallback as unknown as FirebaseHttpFunction).__endpoint;
  const invokers = Array.isArray(endpoint?.httpsTrigger?.invoker)
    ? endpoint.httpsTrigger.invoker
    : [endpoint?.httpsTrigger?.invoker];
  assert.ok(invokers.includes('public'));
});

test('deployment guard accepts only the configured production project and validates target settings', () => {
  const result = runDeployGuard(backendTargets.productionProjectId);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, new RegExp(`project=${backendTargets.productionProjectId}`));
  assert.match(result.stdout, new RegExp(`region=${backendTargets.productionRegion}`));
  assert.match(result.stdout, new RegExp(`runtimeServiceAccount=${backendTargets.productionRuntimeServiceAccount}`));

  const wrongProject = runDeployGuard('unrelated-project');
  assert.notEqual(wrongProject.status, 0);
  assert.match(wrongProject.stderr, /Refusing Functions deployment/);

  const missingProject = runDeployGuard(undefined);
  assert.notEqual(missingProject.status, 0);
  assert.match(missingProject.stderr, /deploy target is missing/);

  const emulator = runDeployGuard(backendTargets.productionProjectId, true);
  assert.notEqual(emulator.status, 0);
  assert.match(emulator.stderr, /Functions emulator/);
});

test('Functions application source does not emit application logs', async () => {
  const sourceDirectory = fileURLToPath(new URL('../src/', import.meta.url));
  const sourceFiles = await readdir(sourceDirectory, { recursive: true });
  const logCall = /\b(?:console|logger|functions\.logger)\.(?:log|info|warn|error|debug)\s*\(/;

  for (const sourceFile of sourceFiles.filter((name) => name.endsWith('.ts'))) {
    const source = await readFile(fileURLToPath(new URL(`../src/${sourceFile}`, import.meta.url)), 'utf8');
    assert.doesNotMatch(source, logCall, `${sourceFile} must not log request or credential-bearing data`);
  }
});
