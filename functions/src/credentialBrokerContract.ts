import type {
  SocialMemberId,
  SocialObservation,
  SocialPlatform,
} from '../../src/types/socialTracking';
import {
  exactRecord,
  isSocialMemberId,
  parseSocialObservationTransport,
} from './socialTrackingValidation';

export interface CredentialBrokerRequest {
  memberId: SocialMemberId;
  platform: SocialPlatform;
  authorizationVersion: number;
}

type CredentialBrokerObservationFields<T> = T extends SocialObservation
  ? Omit<T, 'capturedAt'> & { capturedAtMs: number }
  : never;

export type CredentialBrokerObservation = CredentialBrokerObservationFields<SocialObservation>;

export type CredentialBrokerResult =
  | { status: 'collected'; observation: CredentialBrokerObservation }
  | { status: 'skipped'; reason: 'not_authorized' | 'authorization_changed' }
  | {
      status: 'failed';
      errorCode: 'credential_unavailable' | 'provider_error' | 'invalid_provider_response';
    };

export interface CredentialBrokerClient {
  collect(request: CredentialBrokerRequest): Promise<CredentialBrokerResult>;
}

const REQUEST_FIELDS = ['memberId', 'platform', 'authorizationVersion'] as const;
const COLLECTED_FIELDS = ['status', 'observation'] as const;
const SKIPPED_FIELDS = ['status', 'reason'] as const;
const FAILED_FIELDS = ['status', 'errorCode'] as const;

export function parseCredentialBrokerRequest(value: unknown): CredentialBrokerRequest {
  const record = exactRecord(value, REQUEST_FIELDS, REQUEST_FIELDS);
  if (
    !isSocialMemberId(record.memberId) ||
    (record.platform !== 'instagram' && record.platform !== 'tiktok') ||
    !Number.isSafeInteger(record.authorizationVersion) ||
    (record.authorizationVersion as number) < 0
  ) {
    throw new TypeError('Invalid credential broker request');
  }

  return {
    memberId: record.memberId,
    platform: record.platform,
    authorizationVersion: record.authorizationVersion as number,
  };
}

export function parseCredentialBrokerResult(
  value: unknown,
  request: CredentialBrokerRequest,
): CredentialBrokerResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError('Invalid credential broker result');
  }

  const status = (value as Record<string, unknown>).status;
  if (status === 'collected') {
    const record = exactRecord(value, COLLECTED_FIELDS, COLLECTED_FIELDS);
    const observationRecord = exactRecord(
      record.observation,
      [
        'memberId',
        'platform',
        'followers',
        'following',
        'totalLikes',
        'videoCount',
        'mediaCount',
        'capturedAtMs',
        'collectionStatus',
      ],
      ['memberId', 'platform', 'followers', 'capturedAtMs', 'collectionStatus'],
    );
    if (!Number.isSafeInteger(observationRecord.capturedAtMs)) {
      throw new TypeError('Invalid credential broker result');
    }

    let parsedObservation;
    try {
      parsedObservation = parseSocialObservationTransport(observationRecord);
    } catch {
      throw new TypeError('Invalid credential broker result');
    }

    if (
      parsedObservation.memberId !== request.memberId ||
      parsedObservation.platform !== request.platform
    ) {
      throw new TypeError('Invalid credential broker result');
    }

    const { capturedAt, ...observationFields } = parsedObservation;
    return {
      status,
      observation: { ...observationFields, capturedAtMs: capturedAt.toMillis() },
    };
  }

  if (status === 'skipped') {
    const record = exactRecord(value, SKIPPED_FIELDS, SKIPPED_FIELDS);
    if (record.reason !== 'not_authorized' && record.reason !== 'authorization_changed') {
      throw new TypeError('Invalid credential broker result');
    }
    return { status, reason: record.reason };
  }

  if (status === 'failed') {
    const record = exactRecord(value, FAILED_FIELDS, FAILED_FIELDS);
    if (
      record.errorCode !== 'credential_unavailable' &&
      record.errorCode !== 'provider_error' &&
      record.errorCode !== 'invalid_provider_response'
    ) {
      throw new TypeError('Invalid credential broker result');
    }
    return { status, errorCode: record.errorCode };
  }

  throw new TypeError('Invalid credential broker result');
}
