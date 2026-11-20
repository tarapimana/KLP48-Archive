export const INSTAGRAM_BASIC_SCOPE = 'instagram_business_basic';
const SHORT_LIVED_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const GRAPH_API_BASE = 'https://graph.instagram.com/v27.0';
const LONG_LIVED_TOKEN_URL = 'https://graph.instagram.com/access_token';
const REFRESH_TOKEN_URL = 'https://graph.instagram.com/refresh_access_token';
const MAX_TOKEN_LIFETIME_SECONDS = 61 * 24 * 60 * 60;
const REQUEST_TIMEOUT_MS = 12_000;

export type InstagramAccountType = 'business' | 'creator';
export type InstagramOAuthFailure =
  | 'provider_error'
  | 'provider_unavailable'
  | 'invalid_response'
  | 'insufficient_scopes'
  | 'unsupported_account'
  | 'account_identity_mismatch'
  | 'invalid_token';

export class InstagramApiError extends Error {
  constructor(
    public readonly failure: InstagramOAuthFailure,
    public readonly providerCode?: number,
  ) {
    super(failure);
    this.name = 'InstagramApiError';
  }
}

export interface InstagramAuthorizationResult {
  providerAccountId: string;
  username: string;
  accountType: InstagramAccountType;
  grantedScopes: string[];
  accessToken: string;
  expiresAtMs: number;
}

export interface RefreshedInstagramToken {
  accessToken: string;
  expiresAtMs: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readProviderErrorCode(value: Record<string, unknown>): number | undefined {
  if (isRecord(value.error) && typeof value.error.code === 'number') return value.error.code;
  if (typeof value.error_type === 'string') {
    if (typeof value.code === 'number') return value.code;
    if (typeof value.error_code === 'number') return value.error_code;
  }
  return undefined;
}

function responseRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new InstagramApiError('invalid_response');
  if (isRecord(value.error) || typeof value.error_type === 'string') {
    const code = readProviderErrorCode(value);
    throw new InstagramApiError(code === 190 ? 'invalid_token' : 'provider_error', code);
  }

  const firstData = Array.isArray(value.data) ? value.data[0] : undefined;
  if (firstData !== undefined) {
    if (!isRecord(firstData)) throw new InstagramApiError('invalid_response');
    return firstData;
  }
  return value;
}

function readRequiredString(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== 'string' || value.length === 0 || value.length > 8192) {
    throw new InstagramApiError('invalid_response');
  }
  return value;
}

function readExpirySeconds(record: Record<string, unknown>): number {
  const value = record.expires_in;
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value <= 0 ||
    value > MAX_TOKEN_LIFETIME_SECONDS
  ) {
    throw new InstagramApiError('invalid_response');
  }
  return value;
}

function readGrantedScopes(value: unknown): string[] {
  const values = typeof value === 'string'
    ? value.split(',')
    : Array.isArray(value) && value.every((scope) => typeof scope === 'string')
      ? value
      : [];
  return [...new Set(values.map((scope) => scope.trim()).filter(Boolean))].slice(0, 32);
}

async function requestJson(
  url: URL,
  init: RequestInit,
  fetcher: typeof fetch,
): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await fetcher(url, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      redirect: 'error',
    });
  } catch {
    throw new InstagramApiError('provider_unavailable');
  }

  let body: unknown;
  try {
    const responseText = await response.text();
    if (responseText.length > 64_000) throw new InstagramApiError('invalid_response');
    body = JSON.parse(responseText) as unknown;
  } catch (error) {
    if (error instanceof InstagramApiError) throw error;
    throw new InstagramApiError('invalid_response');
  }

  const record = responseRecord(body);
  if (!response.ok) {
    const code = isRecord(body) && isRecord(body.error) && typeof body.error.code === 'number'
      ? body.error.code
      : undefined;
    throw new InstagramApiError(code === 190 ? 'invalid_token' : 'provider_error', code);
  }
  return record;
}

function parseInstagramAccountType(value: unknown): InstagramAccountType {
  if (value === 'Business') return 'business';
  if (value === 'Media_Creator') return 'creator';
  throw new InstagramApiError('unsupported_account');
}

export async function exchangeAuthorizationCode(
  code: string,
  config: { appId: string; redirectUri: string },
  appSecret: string,
  fetcher: typeof fetch = fetch,
  now = Date.now(),
): Promise<InstagramAuthorizationResult> {
  const form = new FormData();
  form.set('client_id', config.appId);
  form.set('client_secret', appSecret);
  form.set('grant_type', 'authorization_code');
  form.set('redirect_uri', config.redirectUri);
  form.set('code', code);

  const shortLivedResponse = await requestJson(
    new URL(SHORT_LIVED_TOKEN_URL),
    { method: 'POST', body: form },
    fetcher,
  );
  const shortLivedToken = readRequiredString(shortLivedResponse, 'access_token');
  const providerAccountId = readRequiredString(shortLivedResponse, 'user_id');
  const grantedScopes = readGrantedScopes(shortLivedResponse.permissions);
  if (!grantedScopes.includes(INSTAGRAM_BASIC_SCOPE)) {
    throw new InstagramApiError('insufficient_scopes');
  }

  const longLivedUrl = new URL(LONG_LIVED_TOKEN_URL);
  longLivedUrl.searchParams.set('grant_type', 'ig_exchange_token');
  longLivedUrl.searchParams.set('client_secret', appSecret);
  longLivedUrl.searchParams.set('access_token', shortLivedToken);
  const longLivedResponse = await requestJson(longLivedUrl, { method: 'GET' }, fetcher);
  const accessToken = readRequiredString(longLivedResponse, 'access_token');
  const expiresAtMs = now + readExpirySeconds(longLivedResponse) * 1000;

  const profileUrl = new URL(`${GRAPH_API_BASE}/me`);
  profileUrl.searchParams.set('fields', 'user_id,username,account_type');
  const profileResponse = await requestJson(
    profileUrl,
    { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } },
    fetcher,
  );
  const profileAccountId = readRequiredString(profileResponse, 'user_id');
  const username = readRequiredString(profileResponse, 'username');
  if (
    profileAccountId !== providerAccountId ||
    !/^[A-Za-z0-9._]{1,30}$/.test(username)
  ) {
    throw new InstagramApiError('account_identity_mismatch');
  }

  return {
    providerAccountId,
    username,
    accountType: parseInstagramAccountType(profileResponse.account_type),
    grantedScopes,
    accessToken,
    expiresAtMs,
  };
}

export async function refreshLongLivedAccessToken(
  accessToken: string,
  fetcher: typeof fetch = fetch,
  now = Date.now(),
): Promise<RefreshedInstagramToken> {
  const refreshUrl = new URL(REFRESH_TOKEN_URL);
  refreshUrl.searchParams.set('grant_type', 'ig_refresh_token');
  refreshUrl.searchParams.set('access_token', accessToken);

  const response = await requestJson(refreshUrl, { method: 'GET' }, fetcher);
  return {
    accessToken: readRequiredString(response, 'access_token'),
    expiresAtMs: now + readExpirySeconds(response) * 1000,
  };
}
