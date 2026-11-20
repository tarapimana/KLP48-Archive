import { CANONICAL_ACTIVE_MEMBER_IDS } from '../src/data/klp48Data';
import {
  SOCIAL_TRACKING_ERROR_CODES,
} from '../src/types/socialTracking';
import type {
  SocialCollectionStatus,
  SocialCurrent,
  SocialMemberId,
  SocialObservation,
  SocialPlatform,
  SocialSnapshot,
  SocialTrackingAccountOutcome,
  SocialTrackingAccountOutcomeStatus,
  SocialTrackingConfig,
  SocialTrackingErrorCode,
  SocialTrackingLease,
  SocialTrackingLog,
  SocialTrackingRunStatus,
  SocialTrackingTrigger,
} from '../src/types/socialTracking';
import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';

type ServerSocialObservation = Omit<SocialObservation, 'capturedAt'> & { capturedAt: AdminTimestamp };
type ServerSocialSnapshot = Omit<SocialSnapshot, 'capturedAt'> & { capturedAt: AdminTimestamp };
type ServerSocialCurrent = Omit<SocialCurrent, 'capturedAt'> & { capturedAt: AdminTimestamp };
type ServerSocialTrackingConfig = Omit<SocialTrackingConfig, 'updatedAt'> & { updatedAt: AdminTimestamp };
type ServerSocialTrackingLog = Omit<SocialTrackingLog, 'startedAt' | 'finishedAt'> & {
  startedAt: AdminTimestamp;
  finishedAt?: AdminTimestamp;
};
type ServerSocialTrackingAccountOutcome = Omit<SocialTrackingAccountOutcome, 'startedAt' | 'finishedAt'> & {
  startedAt: AdminTimestamp;
  finishedAt: AdminTimestamp;
};
type ServerSocialTrackingLease = Omit<SocialTrackingLease, 'leaseExpiresAt' | 'updatedAt'> & {
  leaseExpiresAt: AdminTimestamp;
  updatedAt: AdminTimestamp;
};

const ACTIVE_MEMBER_IDS = new Set<string>(CANONICAL_ACTIVE_MEMBER_IDS);
const TRACKING_ERROR_CODES = new Set<string>(SOCIAL_TRACKING_ERROR_CODES);
const MIN_FIRESTORE_TIMESTAMP_SECONDS = -62_135_596_800;
const MAX_FIRESTORE_TIMESTAMP_SECONDS = 253_402_300_799;
const MAX_FIRESTORE_TIMESTAMP_NANOSECONDS = 999_999_999;
const SOCIAL_OBSERVATION_FIELDS = [
  'memberId',
  'platform',
  'followers',
  'following',
  'totalLikes',
  'videoCount',
  'mediaCount',
  'capturedAt',
  'collectionStatus',
] as const;
const SOCIAL_OBSERVATION_REQUIRED_FIELDS = [
  'memberId',
  'platform',
  'followers',
  'capturedAt',
  'collectionStatus',
] as const;
const SOCIAL_TRACKING_CONFIG_FIELDS = [
  'enabled',
  'trackedMemberIds',
  'timezone',
  'updatedAt',
  'updatedBy',
] as const;
const SOCIAL_TRACKING_LOG_FIELDS = [
  'runId',
  'startedAt',
  'finishedAt',
  'trigger',
  'status',
  'accountsAttempted',
  'accountsSucceeded',
  'accountsFailed',
  'errorCode',
] as const;
const SOCIAL_TRACKING_LOG_REQUIRED_FIELDS = [
  'runId',
  'startedAt',
  'trigger',
  'status',
  'accountsAttempted',
  'accountsSucceeded',
  'accountsFailed',
] as const;
const SOCIAL_TRACKING_ACCOUNT_OUTCOME_FIELDS = [
  'runId',
  'memberId',
  'platform',
  'status',
  'attempts',
  'startedAt',
  'finishedAt',
  'errorCode',
] as const;
const SOCIAL_TRACKING_ACCOUNT_OUTCOME_REQUIRED_FIELDS = SOCIAL_TRACKING_ACCOUNT_OUTCOME_FIELDS.filter(
  (field) => field !== 'errorCode',
);
const SOCIAL_TRACKING_LEASE_FIELDS = ['ownerRunId', 'leaseExpiresAt', 'updatedAt'] as const;

function invalidData(): never {
  throw new TypeError('Invalid social tracking data');
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function exactRecord(
  value: unknown,
  allowedFields: readonly string[],
  requiredFields: readonly string[],
): Record<string, unknown> {
  if (!isPlainRecord(value)) return invalidData();

  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key !== 'string' || !allowedFields.includes(key))) {
    return invalidData();
  }
  if (requiredFields.some((key) => !Object.hasOwn(value, key))) {
    return invalidData();
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

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

export function isSocialMemberId(value: unknown): value is SocialMemberId {
  return typeof value === 'string' && ACTIVE_MEMBER_IDS.has(value);
}

function isSocialPlatform(value: unknown): value is SocialPlatform {
  return value === 'instagram' || value === 'tiktok';
}

function isCollectionStatus(value: unknown): value is SocialCollectionStatus {
  return value === 'success' || value === 'partial';
}

function isTrackingTrigger(value: unknown): value is SocialTrackingTrigger {
  return value === 'scheduled' || value === 'manual';
}

function isTrackingRunStatus(value: unknown): value is SocialTrackingRunStatus {
  return value === 'running' || value === 'success' || value === 'partial' || value === 'failed';
}

function isTrackingAccountOutcomeStatus(value: unknown): value is SocialTrackingAccountOutcomeStatus {
  return value === 'success' || value === 'partial' || value === 'failed' || value === 'skipped';
}

function isTrackingErrorCode(value: unknown): value is SocialTrackingErrorCode {
  return typeof value === 'string' && TRACKING_ERROR_CODES.has(value);
}

function addOptionalStatistic(
  record: Record<string, unknown>,
  output: Partial<Pick<SocialObservation, 'following' | 'totalLikes' | 'videoCount' | 'mediaCount'>>,
  field: 'following' | 'totalLikes' | 'videoCount' | 'mediaCount',
): void {
  if (!Object.hasOwn(record, field)) return;
  if (!isNonNegativeInteger(record[field])) return invalidData();
  output[field] = record[field];
}

export function parseSocialObservation(value: unknown): ServerSocialObservation {
  const record = exactRecord(
    value,
    SOCIAL_OBSERVATION_FIELDS,
    SOCIAL_OBSERVATION_REQUIRED_FIELDS,
  );

  if (
    !isSocialMemberId(record.memberId) ||
    !isSocialPlatform(record.platform) ||
    !isNonNegativeInteger(record.followers) ||
    !isFirestoreTimestamp(record.capturedAt) ||
    !isCollectionStatus(record.collectionStatus)
  ) {
    return invalidData();
  }

  const optionalStatistics: Partial<Pick<SocialObservation, 'following' | 'totalLikes' | 'videoCount' | 'mediaCount'>> = {};
  addOptionalStatistic(record, optionalStatistics, 'following');
  addOptionalStatistic(record, optionalStatistics, 'totalLikes');
  addOptionalStatistic(record, optionalStatistics, 'videoCount');
  addOptionalStatistic(record, optionalStatistics, 'mediaCount');

  return {
    memberId: record.memberId,
    platform: record.platform,
    followers: record.followers,
    ...(Object.hasOwn(record, 'following') ? { following: optionalStatistics.following } : {}),
    ...(Object.hasOwn(record, 'totalLikes') ? { totalLikes: optionalStatistics.totalLikes } : {}),
    ...(Object.hasOwn(record, 'videoCount') ? { videoCount: optionalStatistics.videoCount } : {}),
    ...(Object.hasOwn(record, 'mediaCount') ? { mediaCount: optionalStatistics.mediaCount } : {}),
    capturedAt: record.capturedAt,
    collectionStatus: record.collectionStatus,
  };
}

export function parseSocialObservationTransport(value: unknown): ServerSocialObservation {
  const record = exactRecord(
    value,
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
  const capturedAtMs = record.capturedAtMs;
  if (
    !Number.isSafeInteger(capturedAtMs) ||
    (capturedAtMs as number) < MIN_FIRESTORE_TIMESTAMP_SECONDS * 1000 ||
    (capturedAtMs as number) > MAX_FIRESTORE_TIMESTAMP_SECONDS * 1000 + 999
  ) {
    return invalidData();
  }

  try {
    const { capturedAtMs: _capturedAtMs, ...observation } = record;
    return parseSocialObservation({
      ...observation,
      capturedAt: AdminTimestamp.fromMillis(capturedAtMs as number),
    });
  } catch {
    return invalidData();
  }
}

export function parseSocialSnapshot(value: unknown): ServerSocialSnapshot {
  return parseSocialObservation(value);
}

export function parseSocialCurrent(value: unknown): ServerSocialCurrent {
  return parseSocialObservation(value);
}

export function parseSocialTrackingConfig(value: unknown): ServerSocialTrackingConfig {
  const record = exactRecord(value, SOCIAL_TRACKING_CONFIG_FIELDS, SOCIAL_TRACKING_CONFIG_FIELDS);
  const memberIds = record.trackedMemberIds;

  if (
    typeof record.enabled !== 'boolean' ||
    !Array.isArray(memberIds) ||
    memberIds.length > CANONICAL_ACTIVE_MEMBER_IDS.length ||
    memberIds.some((memberId) => !isSocialMemberId(memberId)) ||
    new Set(memberIds).size !== memberIds.length ||
    typeof record.timezone !== 'string' ||
    record.timezone.length > 64 ||
    !isFirestoreTimestamp(record.updatedAt) ||
    typeof record.updatedBy !== 'string' ||
    record.updatedBy.length === 0 ||
    record.updatedBy.length > 128
  ) {
    return invalidData();
  }

  return {
    enabled: record.enabled,
    trackedMemberIds: [...memberIds] as SocialMemberId[],
    timezone: record.timezone,
    updatedAt: record.updatedAt,
    updatedBy: record.updatedBy,
  };
}

export function parseSocialTrackingLog(value: unknown): ServerSocialTrackingLog {
  const record = exactRecord(
    value,
    SOCIAL_TRACKING_LOG_FIELDS,
    SOCIAL_TRACKING_LOG_REQUIRED_FIELDS,
  );

  if (
    typeof record.runId !== 'string' ||
    record.runId.length === 0 ||
    record.runId.length > 128 ||
    !isFirestoreTimestamp(record.startedAt) ||
    !isTrackingTrigger(record.trigger) ||
    !isTrackingRunStatus(record.status) ||
    !isNonNegativeInteger(record.accountsAttempted) ||
    !isNonNegativeInteger(record.accountsSucceeded) ||
    !isNonNegativeInteger(record.accountsFailed) ||
    (Object.hasOwn(record, 'finishedAt') && !isFirestoreTimestamp(record.finishedAt)) ||
    (Object.hasOwn(record, 'errorCode') && !isTrackingErrorCode(record.errorCode))
  ) {
    return invalidData();
  }

  return {
    runId: record.runId,
    startedAt: record.startedAt,
    ...(Object.hasOwn(record, 'finishedAt') ? { finishedAt: record.finishedAt as AdminTimestamp } : {}),
    trigger: record.trigger,
    status: record.status,
    accountsAttempted: record.accountsAttempted,
    accountsSucceeded: record.accountsSucceeded,
    accountsFailed: record.accountsFailed,
    ...(Object.hasOwn(record, 'errorCode') ? { errorCode: record.errorCode as SocialTrackingErrorCode } : {}),
  };
}

export const parseSocialTrackingRun = parseSocialTrackingLog;

export function parseSocialTrackingAccountOutcome(value: unknown): ServerSocialTrackingAccountOutcome {
  const record = exactRecord(
    value,
    SOCIAL_TRACKING_ACCOUNT_OUTCOME_FIELDS,
    SOCIAL_TRACKING_ACCOUNT_OUTCOME_REQUIRED_FIELDS,
  );

  if (
    typeof record.runId !== 'string' ||
    record.runId.length === 0 ||
    record.runId.length > 128 ||
    !isSocialMemberId(record.memberId) ||
    !isSocialPlatform(record.platform) ||
    !isTrackingAccountOutcomeStatus(record.status) ||
    !isNonNegativeInteger(record.attempts) ||
    !isFirestoreTimestamp(record.startedAt) ||
    !isFirestoreTimestamp(record.finishedAt) ||
    record.finishedAt.toMillis() < record.startedAt.toMillis() ||
    (Object.hasOwn(record, 'errorCode') && !isTrackingErrorCode(record.errorCode))
  ) {
    return invalidData();
  }

  return {
    runId: record.runId,
    memberId: record.memberId,
    platform: record.platform,
    status: record.status,
    attempts: record.attempts,
    startedAt: record.startedAt,
    finishedAt: record.finishedAt,
    ...(Object.hasOwn(record, 'errorCode') ? { errorCode: record.errorCode as SocialTrackingErrorCode } : {}),
  };
}

export function parseSocialTrackingLease(value: unknown): ServerSocialTrackingLease {
  const record = exactRecord(value, SOCIAL_TRACKING_LEASE_FIELDS, SOCIAL_TRACKING_LEASE_FIELDS);

  if (
    typeof record.ownerRunId !== 'string' ||
    record.ownerRunId.length === 0 ||
    record.ownerRunId.length > 128 ||
    !isFirestoreTimestamp(record.leaseExpiresAt) ||
    !isFirestoreTimestamp(record.updatedAt)
  ) {
    return invalidData();
  }

  return {
    ownerRunId: record.ownerRunId,
    leaseExpiresAt: record.leaseExpiresAt,
    updatedAt: record.updatedAt,
  };
}
