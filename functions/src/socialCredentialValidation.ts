import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
import { isSocialMemberId } from './socialTrackingValidation';
import type { SocialMemberId } from '../../src/types/socialTracking';

interface SharedCredentialFields {
  memberId: SocialMemberId;
  providerAccountId: string;
  accessToken: string;
  accessTokenExpiresAt: AdminTimestamp;
  grantedScopes: string[];
  authorizationVersion: number;
  updatedAt: AdminTimestamp;
}

export interface InstagramSocialCredentialRecord extends SharedCredentialFields {
  platform: 'instagram';
  accessTokenIssuedAt: AdminTimestamp;
}

export interface TikTokSocialCredentialRecord extends SharedCredentialFields {
  platform: 'tiktok';
  refreshToken: string;
  refreshTokenExpiresAt: AdminTimestamp;
}

export type SocialCredentialRecord = InstagramSocialCredentialRecord | TikTokSocialCredentialRecord;

const MAX_PROVIDER_ACCOUNT_ID_LENGTH = 256;
const MAX_TOKEN_LENGTH = 16_384;
const MAX_SCOPE_COUNT = 32;
const MAX_SCOPE_LENGTH = 128;
const MIN_FIRESTORE_TIMESTAMP_SECONDS = -62_135_596_800;
const MAX_FIRESTORE_TIMESTAMP_SECONDS = 253_402_300_799;
const MAX_FIRESTORE_TIMESTAMP_NANOSECONDS = 999_999_999;

const INSTAGRAM_CREDENTIAL_FIELDS = [
  'memberId',
  'platform',
  'providerAccountId',
  'accessToken',
  'accessTokenIssuedAt',
  'accessTokenExpiresAt',
  'grantedScopes',
  'authorizationVersion',
  'updatedAt',
] as const;
const TIKTOK_CREDENTIAL_FIELDS = [
  'memberId',
  'platform',
  'providerAccountId',
  'accessToken',
  'accessTokenExpiresAt',
  'refreshToken',
  'refreshTokenExpiresAt',
  'grantedScopes',
  'authorizationVersion',
  'updatedAt',
] as const;

function invalidCredentialRecord(): never {
  throw new TypeError('Invalid social credential data');
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactCredentialRecord(
  value: unknown,
  allowedFields: readonly string[],
): Record<string, unknown> {
  if (!isPlainRecord(value)) return invalidCredentialRecord();
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key !== 'string' || !allowedFields.includes(key))) {
    return invalidCredentialRecord();
  }
  if (allowedFields.some((field) => !Object.hasOwn(value, field))) {
    return invalidCredentialRecord();
  }
  return value;
}

function isFirestoreTimestamp(value: unknown): value is AdminTimestamp {
  return (
    value instanceof AdminTimestamp &&
    Number.isInteger(value.seconds) &&
    value.seconds >= MIN_FIRESTORE_TIMESTAMP_SECONDS &&
    value.seconds <= MAX_FIRESTORE_TIMESTAMP_SECONDS &&
    Number.isInteger(value.nanoseconds) &&
    value.nanoseconds >= 0 &&
    value.nanoseconds <= MAX_FIRESTORE_TIMESTAMP_NANOSECONDS
  );
}

function isOpaqueToken(value: unknown): value is string {
  return typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_TOKEN_LENGTH &&
    value.trim() === value &&
    !/\s/.test(value);
}

function isProviderAccountId(value: unknown): value is string {
  return typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_PROVIDER_ACCOUNT_ID_LENGTH &&
    value.trim() === value &&
    !/\s/.test(value);
}

function parseGrantedScopes(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_SCOPE_COUNT) return null;
  if (!value.every((scope) =>
    typeof scope === 'string' &&
    scope.length <= MAX_SCOPE_LENGTH &&
    /^[a-z][a-z0-9_.]*$/.test(scope),
  )) return null;
  if (new Set(value).size !== value.length) return null;
  return [...value];
}

function isAuthorizationVersion(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function sharedCredentialFields(record: Record<string, unknown>): SharedCredentialFields {
  return {
    memberId: record.memberId as SocialMemberId,
    providerAccountId: record.providerAccountId as string,
    accessToken: record.accessToken as string,
    accessTokenExpiresAt: record.accessTokenExpiresAt as AdminTimestamp,
    grantedScopes: [...record.grantedScopes as string[]],
    authorizationVersion: record.authorizationVersion as number,
    updatedAt: record.updatedAt as AdminTimestamp,
  };
}

function hasValidSharedFields(record: Record<string, unknown>): boolean {
  return (
    isSocialMemberId(record.memberId) &&
    isProviderAccountId(record.providerAccountId) &&
    isOpaqueToken(record.accessToken) &&
    isFirestoreTimestamp(record.accessTokenExpiresAt) &&
    parseGrantedScopes(record.grantedScopes) !== null &&
    isAuthorizationVersion(record.authorizationVersion) &&
    isFirestoreTimestamp(record.updatedAt)
  );
}

export function parseSocialCredentialRecord(value: unknown): SocialCredentialRecord {
  if (!isPlainRecord(value)) return invalidCredentialRecord();

  if (value.platform === 'instagram') {
    const record = exactCredentialRecord(value, INSTAGRAM_CREDENTIAL_FIELDS);
    if (
      !hasValidSharedFields(record) ||
      !isFirestoreTimestamp(record.accessTokenIssuedAt)
    ) return invalidCredentialRecord();

    return {
      ...sharedCredentialFields(record),
      platform: 'instagram',
      accessTokenIssuedAt: record.accessTokenIssuedAt,
    };
  }

  if (value.platform === 'tiktok') {
    const record = exactCredentialRecord(value, TIKTOK_CREDENTIAL_FIELDS);
    if (
      !hasValidSharedFields(record) ||
      !isOpaqueToken(record.refreshToken) ||
      !isFirestoreTimestamp(record.refreshTokenExpiresAt)
    ) return invalidCredentialRecord();

    return {
      ...sharedCredentialFields(record),
      platform: 'tiktok',
      refreshToken: record.refreshToken,
      refreshTokenExpiresAt: record.refreshTokenExpiresAt,
    };
  }

  return invalidCredentialRecord();
}
