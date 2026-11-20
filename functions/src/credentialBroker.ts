import { Timestamp } from 'firebase-admin/firestore';
import type { SocialPlatform } from '../../src/types/socialTracking';
import { parseCredentialBrokerRequest, type CredentialBrokerClient } from './credentialBrokerContract';
import type { SocialCredentialStore } from './credentialStore';
import type { SocialCredentialRecord } from './socialCredentialValidation';
import { parseSocialObservation } from './socialTrackingValidation';

export interface CredentialAuthorizationState {
  authorizationStatus: 'authorized' | 'expired' | 'revoked' | 'disconnected' | 'error';
  authorizationVersion: number;
}

export interface CredentialAuthorizationReader {
  getState(memberId: string, platform: SocialPlatform): Promise<CredentialAuthorizationState | null>;
}

export interface ProviderCollectionInput {
  memberId: SocialCredentialRecord['memberId'];
  platform: SocialCredentialRecord['platform'];
  providerAccountId: string;
  accessToken: string;
  grantedScopes: string[];
  authorizationVersion: number;
  refreshToken?: string;
  refreshTokenExpiresAt?: Timestamp;
}

export interface ProviderObservationCollector {
  collect(input: ProviderCollectionInput): Promise<unknown>;
}

export interface CredentialBrokerDependencies {
  credentialStore: SocialCredentialStore;
  authorizationReader: CredentialAuthorizationReader;
  providerCollector: ProviderObservationCollector;
  now?: () => number;
}

export function createCredentialBroker(
  dependencies: CredentialBrokerDependencies,
): CredentialBrokerClient {
  const now = dependencies.now ?? Date.now;

  return {
    async collect(input) {
      const request = parseCredentialBrokerRequest(input);
      let authorization: CredentialAuthorizationState | null;
      let credential: SocialCredentialRecord | null;

      try {
        authorization = await dependencies.authorizationReader.getState(request.memberId, request.platform);
      } catch {
        return { status: 'failed', errorCode: 'credential_unavailable' };
      }

      if (!authorization || authorization.authorizationStatus !== 'authorized') {
        return { status: 'skipped', reason: 'not_authorized' };
      }
      if (authorization.authorizationVersion !== request.authorizationVersion) {
        return { status: 'skipped', reason: 'authorization_changed' };
      }

      try {
        credential = await dependencies.credentialStore.get(request.memberId, request.platform);
      } catch {
        return { status: 'failed', errorCode: 'credential_unavailable' };
      }

      if (!credential || credential.authorizationVersion !== request.authorizationVersion) {
        return { status: 'skipped', reason: 'authorization_changed' };
      }
      if (credential.accessTokenExpiresAt.toMillis() <= now()) {
        return { status: 'failed', errorCode: 'credential_unavailable' };
      }

      let providerResult: unknown;
      try {
        providerResult = await dependencies.providerCollector.collect({
          memberId: credential.memberId,
          platform: credential.platform,
          providerAccountId: credential.providerAccountId,
          accessToken: credential.accessToken,
          grantedScopes: [...credential.grantedScopes],
          authorizationVersion: credential.authorizationVersion,
          ...(credential.platform === 'tiktok'
            ? {
                refreshToken: credential.refreshToken,
                refreshTokenExpiresAt: credential.refreshTokenExpiresAt,
              }
            : {}),
        });
      } catch {
        return { status: 'failed', errorCode: 'provider_error' };
      }

      let observation;
      try {
        observation = parseSocialObservation(providerResult);
        if (observation.memberId !== request.memberId || observation.platform !== request.platform) {
          return { status: 'failed', errorCode: 'invalid_provider_response' };
        }
      } catch {
        return { status: 'failed', errorCode: 'invalid_provider_response' };
      }

      let currentAuthorization: CredentialAuthorizationState | null;
      try {
        currentAuthorization = await dependencies.authorizationReader.getState(
          request.memberId,
          request.platform,
        );
      } catch {
        return { status: 'failed', errorCode: 'credential_unavailable' };
      }
      if (!currentAuthorization || currentAuthorization.authorizationStatus !== 'authorized') {
        return { status: 'skipped', reason: 'not_authorized' };
      }
      if (currentAuthorization.authorizationVersion !== request.authorizationVersion) {
        return { status: 'skipped', reason: 'authorization_changed' };
      }

      const { capturedAt, ...observationFields } = observation;
      return {
        status: 'collected',
        observation: { ...observationFields, capturedAtMs: capturedAt.toMillis() },
      };
    },
  };
}
