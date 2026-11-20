import assert from 'node:assert/strict';
import test from 'node:test';
import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
import {
  SOCIAL_TRACKING_ERROR_CODES,
} from '../src/types/socialTracking';
import {
  parseSocialObservation,
  parseSocialTrackingAccountOutcome,
  parseSocialTrackingConfig,
  parseSocialTrackingLease,
  parseSocialTrackingLog,
  parseSocialTrackingRun,
} from './socialTrackingValidation';

const capturedAt = AdminTimestamp.fromMillis(Date.UTC(2026, 0, 1));

function validObservation() {
  return {
    memberId: 'yi_shyan',
    platform: 'instagram',
    followers: 1200,
    following: 140,
    mediaCount: 24,
    capturedAt,
    collectionStatus: 'success',
  };
}

function validTikTokObservation() {
  const { mediaCount: _mediaCount, ...sharedMetrics } = validObservation();
  return {
    ...sharedMetrics,
    platform: 'tiktok',
    totalLikes: 3400,
    videoCount: 18,
  };
}

function validConfig(trackedMemberIds: string[] = ['yi_shyan']) {
  return {
    enabled: true,
    trackedMemberIds,
    timezone: 'Asia/Kuala_Lumpur',
    updatedAt: capturedAt,
    updatedBy: 'verified-admin-uid',
  };
}

function validLog(errorCode?: string) {
  return {
    runId: 'run-2026-01-01',
    startedAt: capturedAt,
    finishedAt: capturedAt,
    trigger: 'manual',
    status: 'success',
    accountsAttempted: 1,
    accountsSucceeded: 1,
    accountsFailed: 0,
    ...(errorCode ? { errorCode } : {}),
  };
}

test('accepts only Instagram metrics and returns the documented projection fields', () => {
  const result = parseSocialObservation(validObservation());
  assert.deepEqual(Object.keys(result).sort(), [
    'capturedAt',
    'collectionStatus',
    'followers',
    'following',
    'mediaCount',
    'memberId',
    'platform',
  ]);
  assert.equal(result.platform, 'instagram');
  assert.equal(result.memberId, 'yi_shyan');
});

test('accepts only TikTok metrics and returns the documented projection fields', () => {
  const result = parseSocialObservation(validTikTokObservation());
  assert.deepEqual(Object.keys(result).sort(), [
    'capturedAt',
    'collectionStatus',
    'followers',
    'following',
    'memberId',
    'platform',
    'totalLikes',
    'videoCount',
  ]);
  assert.equal(result.platform, 'tiktok');
});

test('rejects metrics belonging to the other platform and preserves zero and missing values', () => {
  assert.throws(() => parseSocialObservation({ ...validObservation(), totalLikes: 0 }));
  assert.throws(() => parseSocialObservation({ ...validObservation(), videoCount: 0 }));
  assert.throws(() => parseSocialObservation({ ...validTikTokObservation(), mediaCount: 0 }));

  const instagramWithZeroes = parseSocialObservation({ ...validObservation(), following: 0, mediaCount: 0 });
  assert.equal(instagramWithZeroes.following, 0);
  assert.equal('mediaCount' in instagramWithZeroes ? instagramWithZeroes.mediaCount : undefined, 0);
  const tiktokWithZeroes = parseSocialObservation({ ...validTikTokObservation(), following: 0, totalLikes: 0, videoCount: 0 });
  assert.equal(tiktokWithZeroes.following, 0);
  assert.equal('totalLikes' in tiktokWithZeroes ? tiktokWithZeroes.totalLikes : undefined, 0);
  assert.equal('videoCount' in tiktokWithZeroes ? tiktokWithZeroes.videoCount : undefined, 0);

  const { following: _instagramFollowing, mediaCount: _instagramMediaCount, ...instagramWithoutOptional } = validObservation();
  const instagramMissing = parseSocialObservation(instagramWithoutOptional);
  assert.equal(Object.hasOwn(instagramMissing, 'following'), false);
  assert.equal(Object.hasOwn(instagramMissing, 'mediaCount'), false);
  const { following: _tiktokFollowing, totalLikes: _tiktokLikes, videoCount: _tiktokVideos, ...tiktokWithoutOptional } = validTikTokObservation();
  const tiktokMissing = parseSocialObservation(tiktokWithoutOptional);
  assert.equal(Object.hasOwn(tiktokMissing, 'following'), false);
  assert.equal(Object.hasOwn(tiktokMissing, 'totalLikes'), false);
  assert.equal(Object.hasOwn(tiktokMissing, 'videoCount'), false);
});

test('rejects unexpected fields and OAuth/provider payload injection', () => {
  for (const secretField of ['accessToken', 'refreshToken', 'authorizationCode', 'providerAccountId', 'rawResponse', 'collectionSource']) {
    assert.throws(() => parseSocialObservation({ ...validObservation(), [secretField]: 'sensitive-value' }));
  }
  assert.throws(() => parseSocialObservation({ ...validObservation(), unexpected: true }));
});

function forgedAdminTimestamp(seconds: unknown, nanoseconds: unknown): AdminTimestamp {
  const timestamp = Object.create(AdminTimestamp.prototype) as AdminTimestamp;
  Object.defineProperties(timestamp, {
    seconds: { value: seconds },
    nanoseconds: { value: nanoseconds },
  });
  return timestamp;
}

test('accepts genuine Firebase Admin Firestore Timestamps', () => {
  assert.equal(parseSocialObservation({ ...validObservation(), capturedAt }).capturedAt, capturedAt);
});

test('rejects plain objects, Dates, strings, malformed and out-of-range timestamps', () => {
  const fakeTimestamp = {
    seconds: 1,
    nanoseconds: 0,
    toDate: () => new Date(Date.UTC(2026, 0, 1)),
  };
  const invalidTimestamps = [
    fakeTimestamp,
    new Date(Date.UTC(2026, 0, 1)),
    '2026-01-01T00:00:00.000Z',
    forgedAdminTimestamp('1', 0),
    forgedAdminTimestamp(1, -1),
    forgedAdminTimestamp(1, 1_000_000_000),
    forgedAdminTimestamp(-62_135_596_801, 0),
    forgedAdminTimestamp(253_402_300_800, 0),
  ];

  for (const capturedAt of invalidTimestamps) {
    assert.throws(() => parseSocialObservation({ ...validObservation(), capturedAt }));
  }
});

test('rejects negative and non-integer statistics', () => {
  assert.throws(() => parseSocialObservation({ ...validObservation(), followers: -1 }));
  assert.throws(() => parseSocialObservation({ ...validObservation(), following: 1.5 }));
  assert.throws(() => parseSocialObservation({ ...validTikTokObservation(), totalLikes: Number.MAX_SAFE_INTEGER + 1 }));
  assert.throws(() => parseSocialObservation({ ...validObservation(), mediaCount: -1 }));
});

test('rejects non-canonical members and invalid platforms or collection statuses', () => {
  for (const memberId of ['cindy', 'cocoa', 'not_a_member']) {
    assert.throws(() => parseSocialObservation({ ...validObservation(), memberId }));
  }
  assert.throws(() => parseSocialObservation({ ...validObservation(), platform: 'youtube' }));
  assert.throws(() => parseSocialObservation({ ...validObservation(), collectionStatus: 'error' }));
});

test('accepts a subset of active members but rejects duplicates and inactive IDs', () => {
  assert.deepEqual(parseSocialTrackingConfig(validConfig(['yi_shyan', 'devi'])).trackedMemberIds, ['yi_shyan', 'devi']);
  assert.throws(() => parseSocialTrackingConfig(validConfig(['yi_shyan', 'yi_shyan'])));
  assert.throws(() => parseSocialTrackingConfig(validConfig(['cindy'])));
  assert.throws(() => parseSocialTrackingConfig({ ...validConfig(), secret: 'nope' }));
});

test('keeps the existing log parser as the run parser alias', () => {
  assert.equal(parseSocialTrackingRun, parseSocialTrackingLog);
  assert.equal(parseSocialTrackingRun(validLog()).runId, 'run-2026-01-01');
});

test('validates per-account outcomes and rejects unsafe fields or time ranges', () => {
  const outcome = {
    runId: 'run-2026-01-01',
    memberId: 'yi_shyan',
    platform: 'instagram',
    status: 'partial',
    attempts: 2,
    startedAt: capturedAt,
    finishedAt: capturedAt,
    errorCode: 'RATE_LIMITED',
  };
  assert.deepEqual(parseSocialTrackingAccountOutcome(outcome), outcome);
  assert.throws(() => parseSocialTrackingAccountOutcome({ ...outcome, providerResponse: { token: 'secret' } }));
  assert.throws(() => parseSocialTrackingAccountOutcome({ ...outcome, status: 'running' }));
  assert.throws(() => parseSocialTrackingAccountOutcome({ ...outcome, attempts: -1 }));
  assert.throws(() => parseSocialTrackingAccountOutcome({ ...outcome, finishedAt: AdminTimestamp.fromMillis(Date.UTC(2025, 0, 1)) }));
  assert.throws(() => parseSocialTrackingAccountOutcome({ ...outcome, errorCode: 'token-value' }));
});

test('validates collection leases and rejects unknown lease fields', () => {
  const lease = {
    ownerRunId: 'run-2026-01-01',
    leaseExpiresAt: AdminTimestamp.fromMillis(Date.UTC(2026, 0, 1, 0, 10)),
    updatedAt: capturedAt,
  };
  assert.deepEqual(parseSocialTrackingLease(lease), lease);
  assert.throws(() => parseSocialTrackingLease({ ...lease, accessToken: 'secret' }));
  assert.throws(() => parseSocialTrackingLease({ ...lease, ownerRunId: '' }));
  assert.throws(() => parseSocialTrackingLease({ ...lease, leaseExpiresAt: 'later' }));
});

test('accepts only predefined tracking log error codes', () => {
  for (const errorCode of SOCIAL_TRACKING_ERROR_CODES) {
    assert.equal(parseSocialTrackingLog(validLog(errorCode)).errorCode, errorCode);
  }
  assert.throws(() => parseSocialTrackingLog(validLog('TOKEN: actual-secret-value')));
  assert.throws(() => parseSocialTrackingLog({ ...validLog(), providerResponseBody: 'sensitive response' }));
});
