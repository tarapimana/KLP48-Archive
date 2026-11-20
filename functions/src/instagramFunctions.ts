import { randomBytes, randomUUID } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { onRequest, type Request, type Response } from 'firebase-functions/v2/https';
import { AdminAuthorizationError, requireVerifiedAdmin } from './adminAuthorization';
import { COMMON_FUNCTION_OPTIONS } from './functionOptions';
import { exchangeAuthorizationCode, InstagramApiError, INSTAGRAM_BASIC_SCOPE, refreshLongLivedAccessToken } from './instagramApi';
import {
  buildAdminReturnUrl,
  buildInstagramAuthorizationUrl,
  callbackRequestMatches,
  getInstagramRuntimeConfig,
  InstagramConfigurationError,
} from './instagramConfig';
import { META_APP_SECRET } from './providerSecrets';
import { exactRecord } from './socialTrackingValidation';
import {
  confirmPendingInstagramConnection,
  consumeOAuthState,
  createOAuthState,
  disconnectInstagramAccount,
  getInstagramAccount,
  getPendingInstagramConnection,
  InstagramRepositoryError,
  isCanonicalActiveMemberId,
  isValidConnectionId,
  markInstagramAuthorizationStatus,
  PENDING_CONNECTION_TTL_MS,
  pruneExpiredInstagramOAuthRecords,
  savePendingInstagramConnection,
  updateInstagramTokenIfCurrent,
} from './instagramRepository';

function setSafeHeaders(response: Response): void {
  response.set('Cache-Control', 'no-store');
  response.set('Pragma', 'no-cache');
  response.set('Referrer-Policy', 'no-referrer');
  response.set('X-Content-Type-Options', 'nosniff');
}

function sendError(response: Response, status: number, code: string): void {
  response.status(status).json({ error: code });
}

function prepareAdminRequest(
  request: Request,
  response: Response,
  allowedMethods: string,
): boolean {
  setSafeHeaders(response);
  const config = getInstagramRuntimeConfig();
  const allowedOrigin = new URL(config.adminReturnUrl).origin;
  const origin = request.get('origin');

  if (origin && origin !== allowedOrigin) {
    sendError(response, 403, 'origin_not_allowed');
    return true;
  }

  if (origin) {
    response.set('Access-Control-Allow-Origin', allowedOrigin);
    response.set('Vary', 'Origin');
    response.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    response.set('Access-Control-Allow-Methods', allowedMethods);
  }

  if (request.method === 'OPTIONS') {
    if (!origin) {
      sendError(response, 403, 'origin_not_allowed');
    } else {
      response.status(204).send('');
    }
    return true;
  }

  return false;
}

async function authenticateAdmin(request: Request, response: Response) {
  try {
    return await requireVerifiedAdmin(request.get('authorization'));
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      if (error.statusCode === 401) response.set('WWW-Authenticate', 'Bearer');
      sendError(response, error.statusCode, error.statusCode === 401 ? 'authentication_required' : 'administrator_required');
      return null;
    }
    sendError(response, 500, 'request_failed');
    return null;
  }
}

function parseBody(
  request: Request,
  allowedKeys: string[],
  requiredKeys: string[] = allowedKeys,
): Record<string, unknown> | null {
  try {
    return exactRecord(request.body, allowedKeys, requiredKeys);
  } catch {
    return null;
  }
}

function singleQueryString(request: Request, name: string): string | undefined {
  const value = request.query[name];
  return typeof value === 'string' ? value : undefined;
}

function requireMethod(request: Request, response: Response, method: string): boolean {
  if (request.method === method) return true;
  response.set('Allow', method);
  sendError(response, 405, 'method_not_allowed');
  return false;
}

function callbackStatusFor(error: unknown): string {
  if (!(error instanceof InstagramApiError)) return 'provider_error';
  if (error.providerCode === 10) return 'insufficient_scopes';
  switch (error.failure) {
    case 'insufficient_scopes':
      return 'insufficient_scopes';
    case 'unsupported_account':
      return 'unsupported_account';
    case 'invalid_token':
      return 'authorization_expired';
    default:
      return 'authorization_failed';
  }
}

async function startInstagramOAuth(request: Request, response: Response): Promise<void> {
  let config;
  try {
    config = getInstagramRuntimeConfig();
  } catch (error) {
    setSafeHeaders(response);
    sendError(response, 503, error instanceof InstagramConfigurationError ? 'instagram_not_configured' : 'request_failed');
    return;
  }

  if (prepareAdminRequest(request, response, 'POST, OPTIONS')) return;
  if (!requireMethod(request, response, 'POST')) return;

  const principal = await authenticateAdmin(request, response);
  if (!principal) return;

  const body = parseBody(request, ['memberId']);
  if (!body || !isCanonicalActiveMemberId(body.memberId)) {
    sendError(response, 400, 'invalid_request');
    return;
  }

  try {
    await pruneExpiredInstagramOAuthRecords();
    const state = randomBytes(32).toString('base64url');
    await createOAuthState(state, principal.uid, body.memberId, config.redirectUri);
    response.status(200).json({
      authorizationUrl: buildInstagramAuthorizationUrl(config, state),
      expiresInSeconds: 600,
    });
  } catch {
    sendError(response, 500, 'request_failed');
  }
}

export const instagramOAuthStart = onRequest(
  { ...COMMON_FUNCTION_OPTIONS, invoker: 'public', maxInstances: 10 },
  startInstagramOAuth,
);

export const instagramReconnect = onRequest(
  { ...COMMON_FUNCTION_OPTIONS, invoker: 'public', maxInstances: 10 },
  startInstagramOAuth,
);

export const instagramOAuthCallback = onRequest(
  { ...COMMON_FUNCTION_OPTIONS, invoker: 'public', maxInstances: 10, secrets: [META_APP_SECRET] },
  async (request, response) => {
    setSafeHeaders(response);
    if (request.method !== 'GET') {
      response.set('Allow', 'GET');
      sendError(response, 405, 'method_not_allowed');
      return;
    }

    let config;
    try {
      config = getInstagramRuntimeConfig();
    } catch {
      sendError(response, 503, 'instagram_not_configured');
      return;
    }

    if (!callbackRequestMatches(request, config)) {
      sendError(response, 400, 'invalid_callback');
      return;
    }

    const state = singleQueryString(request, 'state');
    if (!state || !/^[A-Za-z0-9_-]{43}$/.test(state)) {
      sendError(response, 400, 'invalid_state');
      return;
    }

    let stateRecord: Awaited<ReturnType<typeof consumeOAuthState>>;
    try {
      stateRecord = await consumeOAuthState(state, config.redirectUri);
    } catch {
      sendError(response, 500, 'request_failed');
      return;
    }

    if (!stateRecord) {
      response.redirect(302, buildAdminReturnUrl(config, 'invalid_state'));
      return;
    }

    const providerError = singleQueryString(request, 'error');
    if (providerError) {
      response.redirect(302, buildAdminReturnUrl(config, providerError === 'access_denied' ? 'denied' : 'authorization_failed'));
      return;
    }

    const code = singleQueryString(request, 'code');
    if (!code || code.length > 4096 || /\s/.test(code)) {
      response.redirect(302, buildAdminReturnUrl(config, 'authorization_failed'));
      return;
    }

    try {
      const appSecret = META_APP_SECRET.value();
      if (!appSecret) throw new InstagramConfigurationError();

      const account = await exchangeAuthorizationCode(
        code,
        { appId: config.appId, redirectUri: config.redirectUri },
        appSecret,
      );
      const nowMs = Date.now();
      const connectionId = randomUUID();
      const pendingExpiresAtMs = Math.min(nowMs + PENDING_CONNECTION_TTL_MS, account.expiresAtMs);

      await savePendingInstagramConnection({
        connectionId,
        initiatedBy: stateRecord.initiatedBy,
        intendedMemberId: stateRecord.intendedMemberId,
        providerAccountId: account.providerAccountId,
        username: account.username,
        accountType: account.accountType,
        grantedScopes: account.grantedScopes,
        accessToken: account.accessToken,
        accessTokenIssuedAt: Timestamp.fromMillis(nowMs),
        accessTokenExpiresAt: Timestamp.fromMillis(account.expiresAtMs),
        createdAt: Timestamp.fromMillis(nowMs),
        expiresAt: Timestamp.fromMillis(pendingExpiresAtMs),
      });

      response.redirect(302, buildAdminReturnUrl(config, 'confirmation_required', connectionId));
    } catch (error) {
      response.redirect(302, buildAdminReturnUrl(config, callbackStatusFor(error)));
    }
  },
);

export const instagramPendingConnection = onRequest(
  { ...COMMON_FUNCTION_OPTIONS, invoker: 'public', maxInstances: 10 },
  async (request, response) => {
    let config;
    try {
      config = getInstagramRuntimeConfig();
    } catch {
      setSafeHeaders(response);
      sendError(response, 503, 'instagram_not_configured');
      return;
    }

    if (prepareAdminRequest(request, response, 'GET, OPTIONS')) return;
    if (!requireMethod(request, response, 'GET')) return;

    const principal = await authenticateAdmin(request, response);
    if (!principal) return;

    const connectionId = singleQueryString(request, 'connectionId');
    if (!isValidConnectionId(connectionId)) {
      sendError(response, 400, 'invalid_request');
      return;
    }

    try {
      const pending = await getPendingInstagramConnection(connectionId);
      if (!pending || pending.initiatedBy !== principal.uid) {
        sendError(response, 404, 'connection_not_found');
        return;
      }

      response.status(200).json({
        connectionId,
        username: pending.username,
        accountType: pending.accountType,
        grantedScopes: pending.grantedScopes,
        suggestedMemberId: pending.intendedMemberId,
        expiresAt: pending.expiresAt.toDate().toISOString(),
      });
    } catch {
      sendError(response, 500, 'request_failed');
    }
  },
);

export const instagramConfirmConnection = onRequest(
  { ...COMMON_FUNCTION_OPTIONS, invoker: 'public', maxInstances: 10 },
  async (request, response) => {
    let config;
    try {
      config = getInstagramRuntimeConfig();
    } catch {
      setSafeHeaders(response);
      sendError(response, 503, 'instagram_not_configured');
      return;
    }

    if (prepareAdminRequest(request, response, 'POST, OPTIONS')) return;
    if (!requireMethod(request, response, 'POST')) return;

    const principal = await authenticateAdmin(request, response);
    if (!principal) return;

    const body = parseBody(request, ['connectionId', 'memberId']);
    if (!body || !isValidConnectionId(body.connectionId) || !isCanonicalActiveMemberId(body.memberId)) {
      sendError(response, 400, 'invalid_request');
      return;
    }

    try {
      const account = await confirmPendingInstagramConnection(
        body.connectionId,
        body.memberId,
        principal.uid,
      );
      response.status(200).json({
        status: 'connected',
        account: {
          memberId: account.memberId,
          platform: account.platform,
          username: account.username,
          accountType: account.accountType,
          grantedScopes: account.grantedScopes,
          authorizationStatus: account.authorizationStatus,
          accessTokenExpiresAt: account.accessTokenExpiresAt?.toDate().toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof InstagramRepositoryError) {
        if (error.reason === 'mapping_conflict') {
          sendError(response, 409, 'account_already_mapped');
          return;
        }
        if (error.reason === 'pending_expired') {
          sendError(response, 410, 'connection_expired');
          return;
        }
        if (error.reason === 'member_mismatch') {
          sendError(response, 409, 'member_mismatch');
          return;
        }
        sendError(response, 404, 'connection_not_found');
        return;
      }
      sendError(response, 500, 'request_failed');
    }
  },
);

export const instagramDisconnect = onRequest(
  { ...COMMON_FUNCTION_OPTIONS, invoker: 'public', maxInstances: 10 },
  async (request, response) => {
    let config;
    try {
      config = getInstagramRuntimeConfig();
    } catch {
      setSafeHeaders(response);
      sendError(response, 503, 'instagram_not_configured');
      return;
    }

    if (prepareAdminRequest(request, response, 'POST, OPTIONS')) return;
    if (!requireMethod(request, response, 'POST')) return;

    const principal = await authenticateAdmin(request, response);
    if (!principal) return;

    const body = parseBody(request, ['memberId']);
    if (!body || !isCanonicalActiveMemberId(body.memberId)) {
      sendError(response, 400, 'invalid_request');
      return;
    }

    try {
      const disconnected = await disconnectInstagramAccount(body.memberId);
      if (!disconnected) {
        sendError(response, 404, 'account_not_found');
        return;
      }
      response.status(200).json({ status: 'disconnected', memberId: body.memberId, platform: 'instagram' });
    } catch {
      sendError(response, 500, 'request_failed');
    }
  },
);

export const instagramRefresh = onRequest(
  { ...COMMON_FUNCTION_OPTIONS, invoker: 'public', maxInstances: 10 },
  async (request, response) => {
    let config;
    try {
      config = getInstagramRuntimeConfig();
    } catch {
      setSafeHeaders(response);
      sendError(response, 503, 'instagram_not_configured');
      return;
    }

    if (prepareAdminRequest(request, response, 'POST, OPTIONS')) return;
    if (!requireMethod(request, response, 'POST')) return;

    const principal = await authenticateAdmin(request, response);
    if (!principal) return;

    const body = parseBody(request, ['memberId']);
    if (!body || !isCanonicalActiveMemberId(body.memberId)) {
      sendError(response, 400, 'invalid_request');
      return;
    }

    let refreshContext: {
      authorizationVersion: number;
      accessToken: string;
      expiresAtMs?: number;
    } | null = null;

    try {
      const account = await getInstagramAccount(body.memberId);
      if (!account) {
        sendError(response, 404, 'account_not_found');
        return;
      }
      if (account.authorizationStatus !== 'authorized' || !account.accessToken) {
        sendError(response, 409, 'reauthorization_required');
        return;
      }

      const authorizationVersion = account.authorizationVersion ?? 0;
      const accessToken = account.accessToken;
      const nowMs = Date.now();
      const expiresAtMs = account.accessTokenExpiresAt?.toMillis();
      refreshContext = { authorizationVersion, accessToken, expiresAtMs };

      if (!account.grantedScopes.includes(INSTAGRAM_BASIC_SCOPE)) {
        const marked = await markInstagramAuthorizationStatus(
          body.memberId,
          'error',
          authorizationVersion,
          accessToken,
          nowMs,
        );
        sendError(response, 409, marked ? 'insufficient_scopes' : 'authorization_changed');
        return;
      }

      if (expiresAtMs !== undefined && expiresAtMs <= nowMs) {
        const marked = await markInstagramAuthorizationStatus(
          body.memberId,
          'expired',
          authorizationVersion,
          accessToken,
          nowMs,
        );
        sendError(response, 409, marked ? 'authorization_expired' : 'authorization_changed');
        return;
      }

      const issuedAtMs = account.accessTokenIssuedAt?.toMillis();
      if (issuedAtMs === undefined || nowMs - issuedAtMs < 24 * 60 * 60 * 1000) {
        sendError(response, 409, 'refresh_not_yet_available');
        return;
      }

      const refreshed = await refreshLongLivedAccessToken(accessToken, fetch, nowMs);
      const saved = await updateInstagramTokenIfCurrent(
        body.memberId,
        authorizationVersion,
        accessToken,
        refreshed.accessToken,
        refreshed.expiresAtMs,
        nowMs,
      );
      if (!saved) {
        sendError(response, 409, 'authorization_changed');
        return;
      }

      response.status(200).json({
        status: 'authorized',
        memberId: body.memberId,
        platform: 'instagram',
        accessTokenExpiresAt: new Date(refreshed.expiresAtMs).toISOString(),
      });
    } catch (error) {
      if (refreshContext && error instanceof InstagramApiError && error.failure === 'invalid_token') {
        const status = refreshContext.expiresAtMs !== undefined && refreshContext.expiresAtMs <= Date.now()
          ? 'expired'
          : 'revoked';
        const marked = await markInstagramAuthorizationStatus(
          body.memberId,
          status,
          refreshContext.authorizationVersion,
          refreshContext.accessToken,
        );
        sendError(response, 409, marked
          ? (status === 'expired' ? 'authorization_expired' : 'authorization_revoked')
          : 'authorization_changed');
        return;
      }
      if (refreshContext && error instanceof InstagramApiError && error.providerCode === 10) {
        const marked = await markInstagramAuthorizationStatus(
          body.memberId,
          'error',
          refreshContext.authorizationVersion,
          refreshContext.accessToken,
        );
        sendError(response, 409, marked ? 'insufficient_scopes' : 'authorization_changed');
        return;
      }
      if (error instanceof InstagramApiError && error.failure === 'provider_unavailable') {
        sendError(response, 502, 'provider_unavailable');
        return;
      }
      sendError(response, 502, 'provider_error');
    }
  },
);
