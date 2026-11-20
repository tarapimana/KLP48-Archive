import { onRequest } from 'firebase-functions/v2/https';
import backendTargets from '../firebase-target.json';
import type { CredentialBrokerClient } from './credentialBrokerContract';
import {
  parseCredentialBrokerRequest,
  parseCredentialBrokerResult,
} from './credentialBrokerContract';

const SERVICE_ACCOUNT_EMAIL = /^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/;

export function createCredentialBrokerEndpoint(
  broker: CredentialBrokerClient,
  runtimeServiceAccount: string,
) {
  if (
    !SERVICE_ACCOUNT_EMAIL.test(runtimeServiceAccount) ||
    runtimeServiceAccount === backendTargets.productionRuntimeServiceAccount
  ) {
    throw new Error('Credential broker requires a dedicated runtime service account.');
  }

  return onRequest(
    {
      region: backendTargets.productionRegion,
      serviceAccount: runtimeServiceAccount,
      invoker: 'private',
      maxInstances: 10,
    },
    async (request, response) => {
      response.set('Cache-Control', 'no-store');
      response.set('X-Content-Type-Options', 'nosniff');

      if (request.method !== 'POST') {
        response.set('Allow', 'POST');
        response.status(405).json({ error: 'method_not_allowed' });
        return;
      }

      let brokerRequest;
      try {
        brokerRequest = parseCredentialBrokerRequest(request.body);
      } catch {
        response.status(400).json({ error: 'invalid_request' });
        return;
      }

      try {
        const result = await broker.collect(brokerRequest);
        response.status(200).json(parseCredentialBrokerResult(result, brokerRequest));
      } catch {
        response.status(500).json({ error: 'request_failed' });
      }
    },
  );
}
