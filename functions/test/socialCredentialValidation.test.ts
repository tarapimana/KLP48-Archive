import assert from 'node:assert/strict';
import test from 'node:test';
import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
import { parseSocialCredentialRecord } from '../src/socialCredentialValidation';

const now = AdminTimestamp.fromMillis(Date.UTC(2026, 0, 1));
const later = AdminTimestamp.fromMillis(Date.UTC(2026, 0, 2));

function validInstagramCredential() {
  return {
    memberId: 'yi_shyan',
    platform: 'instagram',
    providerAccountId: 'instagram-user-123',
    accessToken: 'instagram-access-token',
    accessTokenIssuedAt: now,
    accessTokenExpiresAt: later,
    grantedScopes: ['instagram_business_basic'],
    authorizationVersion: 1,
    updatedAt: now,
  };
}

function validTikTokCredential() {
  return {
    memberId: 'devi',
    platform: 'tiktok',
    providerAccountId: 'tiktok-open-id-456',
    accessToken: 'tiktok-access-token',
    accessTokenExpiresAt: later,
    refreshToken: 'tiktok-refresh-token',
    refreshTokenExpiresAt: AdminTimestamp.fromMillis(Date.UTC(2026, 6, 1)),
    grantedScopes: ['user.info.basic', 'user.info.profile', 'user.info.stats'],
    authorizationVersion: 2,
    updatedAt: now,
  };
}

test('parses the exact Instagram credential shape without adding fields', () => {
  const credential = validInstagramCredential();
  const result = parseSocialCredentialRecord(credential);
  assert.deepEqual(result, credential);
  assert.equal(result.platform, 'instagram');
});

test('parses TikTok access and rotating refresh credentials', () => {
  const credential = validTikTokCredential();
  const result = parseSocialCredentialRecord(credential);
  assert.deepEqual(result, credential);
  assert.equal(result.platform, 'tiktok');
});

test('rejects unknown fields and platform-inappropriate credential fields', () => {
  assert.throws(() => parseSocialCredentialRecord({ ...validInstagramCredential(), refreshToken: 'unexpected' }));
  assert.throws(() => parseSocialCredentialRecord({ ...validTikTokCredential(), accessTokenIssuedAt: now }));
  assert.throws(() => parseSocialCredentialRecord({ ...validInstagramCredential(), providerResponse: { access_token: 'secret' } }));
});

test('rejects invalid member, platform, token, and provider account identifiers', () => {
  assert.throws(() => parseSocialCredentialRecord({ ...validInstagramCredential(), memberId: 'inactive-member' }));
  assert.throws(() => parseSocialCredentialRecord({ ...validInstagramCredential(), platform: 'youtube' }));
  assert.throws(() => parseSocialCredentialRecord({ ...validInstagramCredential(), accessToken: '' }));
  assert.throws(() => parseSocialCredentialRecord({ ...validInstagramCredential(), accessToken: 'token with whitespace' }));
  assert.throws(() => parseSocialCredentialRecord({ ...validInstagramCredential(), providerAccountId: ' account ' }));
});

test('rejects malformed or duplicate scopes and invalid authorization versions', () => {
  assert.throws(() => parseSocialCredentialRecord({ ...validInstagramCredential(), grantedScopes: [] }));
  assert.throws(() => parseSocialCredentialRecord({ ...validInstagramCredential(), grantedScopes: ['scope', 'scope'] }));
  assert.throws(() => parseSocialCredentialRecord({ ...validInstagramCredential(), grantedScopes: ['Not a scope'] }));
  assert.throws(() => parseSocialCredentialRecord({ ...validInstagramCredential(), authorizationVersion: -1 }));
  assert.throws(() => parseSocialCredentialRecord({ ...validInstagramCredential(), authorizationVersion: Number.MAX_SAFE_INTEGER + 1 }));
});

test('rejects missing rotating tokens and malformed expiry timestamps', () => {
  const { refreshToken: _refreshToken, ...missingRefreshToken } = validTikTokCredential();
  assert.throws(() => parseSocialCredentialRecord(missingRefreshToken));
  assert.throws(() => parseSocialCredentialRecord({ ...validTikTokCredential(), refreshTokenExpiresAt: new Date() }));
  assert.throws(() => parseSocialCredentialRecord({ ...validInstagramCredential(), accessTokenExpiresAt: { seconds: 1, nanoseconds: 0 } }));
});

test('uses a generic validation error that does not reveal supplied tokens', () => {
  const token = 'sensitive-token-value';
  assert.throws(
    () => parseSocialCredentialRecord({ ...validInstagramCredential(), accessToken: token, extra: token }),
    (error: unknown) => {
      assert.ok(error instanceof TypeError);
      assert.equal(error.message, 'Invalid social credential data');
      assert.equal(error.message.includes(token), false);
      return true;
    },
  );
});
