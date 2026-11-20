import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAdminReturnUrl,
  buildInstagramAuthorizationUrl,
  callbackRequestMatches,
  validateInstagramRuntimeConfig,
} from '../src/instagramConfig';
import {
  exchangeAuthorizationCode,
  InstagramApiError,
  INSTAGRAM_BASIC_SCOPE,
  refreshLongLivedAccessToken,
} from '../src/instagramApi';
import {
  hashOAuthState,
  isCanonicalActiveMemberId,
  isValidConnectionId,
} from '../src/instagramRepository';

const runtimeConfig = validateInstagramRuntimeConfig({
  appId: '1234567890',
  redirectUri: 'https://us-central1-example.cloudfunctions.net/instagramOAuthCallback',
  adminReturnUrl: 'https://klp48.example/admin',
});

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockFetch(responses: unknown[]) {
  const requests: Array<{ url: URL; init?: RequestInit }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = input instanceof Request ? new URL(input.url) : new URL(input.toString());
    requests.push({ url, init });
    const next = responses.shift();
    if (next instanceof Response) return next;
    return jsonResponse(next);
  };
  return { fetcher, requests };
}

test('OAuth configuration rejects insecure, mismatched, or user-controlled URLs', () => {
  assert.throws(() => validateInstagramRuntimeConfig({
    appId: '1234567890',
    redirectUri: 'http://instagramOAuthCallback.example/instagramOAuthCallback',
    adminReturnUrl: 'https://klp48.example/admin',
  }));
  assert.throws(() => validateInstagramRuntimeConfig({
    appId: '1234567890',
    redirectUri: 'https://example.com/not-the-callback',
    adminReturnUrl: 'https://klp48.example/admin',
  }));
  assert.throws(() => validateInstagramRuntimeConfig({
    appId: '1234567890',
    redirectUri: 'https://example.com/instagramOAuthCallback?next=https://evil.example',
    adminReturnUrl: 'https://klp48.example/admin',
  }));
  assert.throws(() => validateInstagramRuntimeConfig({
    appId: '1234567890',
    redirectUri: 'https://example.com/instagramOAuthCallback',
    adminReturnUrl: 'https://user:pass@evil.example/admin',
  }));
});

test('callback accepts only the configured HTTPS host and protocol', () => {
  const request = (protocol: string, host: string) => ({
    protocol,
    get: (name: string) => name === 'host' ? host : undefined,
  });
  assert.equal(callbackRequestMatches(request('https', 'us-central1-example.cloudfunctions.net'), runtimeConfig), true);
  assert.equal(callbackRequestMatches(request('https', 'attacker.example'), runtimeConfig), false);
  assert.equal(callbackRequestMatches(request('http', 'us-central1-example.cloudfunctions.net'), runtimeConfig), false);
});

test('Instagram authorization URL requests only the basic scope and uses server state', () => {
  const url = new URL(buildInstagramAuthorizationUrl(runtimeConfig, 'state-value-for-test-12345678901234567890'));
  assert.equal(url.origin, 'https://www.instagram.com');
  assert.equal(url.pathname, '/oauth/authorize');
  assert.equal(url.searchParams.get('client_id'), runtimeConfig.appId);
  assert.equal(url.searchParams.get('redirect_uri'), runtimeConfig.redirectUri);
  assert.equal(url.searchParams.get('response_type'), 'code');
  assert.equal(url.searchParams.get('scope'), INSTAGRAM_BASIC_SCOPE);
  assert.equal(url.searchParams.get('enable_fb_login'), 'false');
  assert.equal(url.searchParams.get('access_token'), null);
  assert.equal(url.searchParams.get('code'), null);
});

test('admin callback redirect is fixed and contains only an opaque confirmation ID', () => {
  const redirect = new URL(buildAdminReturnUrl(runtimeConfig, 'confirmation_required', '3d73f7f7-1904-4e7a-8f41-183fdf1df773'));
  assert.equal(redirect.origin, 'https://klp48.example');
  assert.equal(redirect.pathname, '/admin');
  assert.equal(redirect.searchParams.get('instagram'), 'confirmation_required');
  assert.equal(redirect.searchParams.get('connectionId'), '3d73f7f7-1904-4e7a-8f41-183fdf1df773');
  for (const name of ['code', 'state', 'access_token', 'token', 'client_secret']) {
    assert.equal(redirect.searchParams.has(name), false);
  }
});

test('OAuth state is hashed before storage and identifiers are canonical', () => {
  const state = 'this-is-a-long-random-state-value-for-unit-tests';
  const hashedState = hashOAuthState(state);
  assert.match(hashedState, /^[a-f0-9]{64}$/);
  assert.notEqual(hashedState, state);
  assert.equal(isCanonicalActiveMemberId('yi_shyan'), true);
  assert.equal(isCanonicalActiveMemberId('cocoa'), false);
  assert.equal(isCanonicalActiveMemberId('not_a_member'), false);
  assert.equal(isValidConnectionId('3d73f7f7-1904-4e7a-8f41-183fdf1df773'), true);
  assert.equal(isValidConnectionId('../../social_accounts'), false);
});

test('authorization code is exchanged server-side and account identity and scope are verified', async () => {
  const { fetcher, requests } = mockFetch([
    {
      data: [{
        access_token: 'short-lived-secret',
        user_id: '17841400000000000',
        permissions: 'instagram_business_basic',
      }],
    },
    { access_token: 'long-lived-secret', expires_in: 5_183_944 },
    { user_id: '17841400000000000', username: 'klp48_official', account_type: 'Business' },
  ]);

  const result = await exchangeAuthorizationCode(
    'authorization-code-value',
    { appId: runtimeConfig.appId, redirectUri: runtimeConfig.redirectUri },
    'meta-app-secret',
    fetcher,
    1_800_000_000_000,
  );

  assert.equal(result.username, 'klp48_official');
  assert.equal(result.providerAccountId, '17841400000000000');
  assert.equal(result.accountType, 'business');
  assert.deepEqual(result.grantedScopes, [INSTAGRAM_BASIC_SCOPE]);
  assert.equal(result.accessToken, 'long-lived-secret');
  assert.equal(result.expiresAtMs, 1_800_000_000_000 + 5_183_944_000);
  assert.equal(requests.length, 3);
  assert.equal(requests[0].url.origin + requests[0].url.pathname, 'https://api.instagram.com/oauth/access_token');
  assert.equal(requests[0].init?.method, 'POST');
  assert.ok(requests[0].init?.body instanceof FormData);
  assert.equal((requests[0].init?.body as FormData).get('code'), 'authorization-code-value');
  assert.equal(requests[1].url.searchParams.get('client_secret'), 'meta-app-secret');
  assert.equal(requests[2].url.searchParams.get('access_token'), null);
  assert.equal(requests[2].url.searchParams.get('fields'), 'user_id,username,account_type');
  assert.equal(new Headers(requests[2].init?.headers).get('Authorization'), 'Bearer long-lived-secret');
});

test('missing basic permission stops before token exchange or profile lookup', async () => {
  const { fetcher, requests } = mockFetch([
    { access_token: 'short-lived-secret', user_id: '123', permissions: 'instagram_business_manage_comments' },
  ]);

  await assert.rejects(
    exchangeAuthorizationCode(
      'authorization-code-value',
      { appId: runtimeConfig.appId, redirectUri: runtimeConfig.redirectUri },
      'meta-app-secret',
      fetcher,
    ),
    (error: unknown) => error instanceof InstagramApiError && error.failure === 'insufficient_scopes',
  );
  assert.equal(requests.length, 1);
});

test('personal accounts and identity mismatches are rejected', async () => {
  const personalAccount = mockFetch([
    { access_token: 'short', user_id: '123', permissions: INSTAGRAM_BASIC_SCOPE },
    { access_token: 'long', expires_in: 5_183_944 },
    { user_id: '123', username: 'ordinary_user', account_type: 'Personal' },
  ]);
  await assert.rejects(
    exchangeAuthorizationCode('code', { appId: runtimeConfig.appId, redirectUri: runtimeConfig.redirectUri }, 'secret', personalAccount.fetcher),
    (error: unknown) => error instanceof InstagramApiError && error.failure === 'unsupported_account',
  );

  const identityMismatch = mockFetch([
    { access_token: 'short', user_id: '123', permissions: INSTAGRAM_BASIC_SCOPE },
    { access_token: 'long', expires_in: 5_183_944 },
    { user_id: '456', username: 'klp48_official', account_type: 'Business' },
  ]);
  await assert.rejects(
    exchangeAuthorizationCode('code', { appId: runtimeConfig.appId, redirectUri: runtimeConfig.redirectUri }, 'secret', identityMismatch.fetcher),
    (error: unknown) => error instanceof InstagramApiError && error.failure === 'account_identity_mismatch',
  );
});

test('long-lived token refresh remains server-side and parses expiry', async () => {
  const { fetcher, requests } = mockFetch([{ access_token: 'refreshed-secret', expires_in: 5_183_944 }]);
  const result = await refreshLongLivedAccessToken('stored-long-lived-secret', fetcher, 1_800_000_000_000);
  assert.equal(result.accessToken, 'refreshed-secret');
  assert.equal(result.expiresAtMs, 1_800_000_000_000 + 5_183_944_000);
  assert.equal(requests[0].url.origin + requests[0].url.pathname, 'https://graph.instagram.com/refresh_access_token');
  assert.equal(requests[0].url.searchParams.get('grant_type'), 'ig_refresh_token');
  assert.equal(requests[0].url.searchParams.get('access_token'), 'stored-long-lived-secret');
});

test('provider error details never appear in sanitized application errors', async () => {
  const secretProviderMessage = 'invalid access_token=stored-long-lived-secret client_secret=meta-secret';
  const { fetcher } = mockFetch([jsonResponse({
    error_type: 'OAuthException',
    error_message: secretProviderMessage,
  }, 400)]);

  await assert.rejects(
    refreshLongLivedAccessToken('stored-long-lived-secret', fetcher),
    (error: unknown) => {
      assert.ok(error instanceof InstagramApiError);
      assert.equal(error.message.includes('stored-long-lived-secret'), false);
      assert.equal(error.message.includes('meta-secret'), false);
      assert.equal(error.message.includes(secretProviderMessage), false);
      return true;
    },
  );
});
