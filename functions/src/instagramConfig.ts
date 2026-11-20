import { defineString } from 'firebase-functions/params';

export const META_INSTAGRAM_APP_ID = defineString('META_INSTAGRAM_APP_ID', { default: '' });
export const META_INSTAGRAM_REDIRECT_URI = defineString('META_INSTAGRAM_REDIRECT_URI', { default: '' });
export const SOCIAL_TRACKING_ADMIN_URL = defineString('SOCIAL_TRACKING_ADMIN_URL', { default: '' });

export interface InstagramRuntimeConfig {
  appId: string;
  redirectUri: string;
  adminReturnUrl: string;
}

export class InstagramConfigurationError extends Error {
  constructor() {
    super('Instagram OAuth configuration is incomplete or invalid.');
    this.name = 'InstagramConfigurationError';
  }
}

function isLocalEmulatorUrl(url: URL): boolean {
  return (
    url.protocol === 'http:' &&
    ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  );
}

function validateAbsoluteUrl(value: string, allowLocalHttp: boolean): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new InstagramConfigurationError();
  }

  const allowedProtocol = url.protocol === 'https:' || (allowLocalHttp && isLocalEmulatorUrl(url));
  if (
    !allowedProtocol ||
    url.username !== '' ||
    url.password !== '' ||
    url.search !== '' ||
    url.hash !== ''
  ) {
    throw new InstagramConfigurationError();
  }

  return url;
}

export function validateInstagramRuntimeConfig(
  value: InstagramRuntimeConfig,
  isEmulator = false,
): InstagramRuntimeConfig {
  if (!/^\d{5,30}$/.test(value.appId)) {
    throw new InstagramConfigurationError();
  }

  const callbackUrl = validateAbsoluteUrl(value.redirectUri, isEmulator);
  if (callbackUrl.pathname.split('/').filter(Boolean).at(-1) !== 'instagramOAuthCallback') {
    throw new InstagramConfigurationError();
  }

  const adminReturnUrl = validateAbsoluteUrl(value.adminReturnUrl, isEmulator);

  return {
    appId: value.appId,
    redirectUri: callbackUrl.toString(),
    adminReturnUrl: adminReturnUrl.toString(),
  };
}

export function getInstagramRuntimeConfig(): InstagramRuntimeConfig {
  return validateInstagramRuntimeConfig(
    {
      appId: META_INSTAGRAM_APP_ID.value().trim(),
      redirectUri: META_INSTAGRAM_REDIRECT_URI.value().trim(),
      adminReturnUrl: SOCIAL_TRACKING_ADMIN_URL.value().trim(),
    },
    process.env.FUNCTIONS_EMULATOR === 'true',
  );
}

export function buildInstagramAuthorizationUrl(
  config: InstagramRuntimeConfig,
  state: string,
): string {
  const authorizationUrl = new URL('https://www.instagram.com/oauth/authorize');
  authorizationUrl.searchParams.set('client_id', config.appId);
  authorizationUrl.searchParams.set('redirect_uri', config.redirectUri);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', 'instagram_business_basic');
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('enable_fb_login', 'false');
  authorizationUrl.searchParams.set('force_reauth', 'true');
  return authorizationUrl.toString();
}

export function callbackRequestMatches(
  request: { protocol: string; get: (name: string) => string | undefined },
  config: InstagramRuntimeConfig,
): boolean {
  const expected = new URL(config.redirectUri);
  const forwardedProtocol = request.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const actualProtocol = forwardedProtocol ?? request.protocol;
  const actualHost = request.get('host');

  return (
    typeof actualHost === 'string' &&
    actualHost.toLowerCase() === expected.host.toLowerCase() &&
    `${actualProtocol.replace(/:$/, '')}:` === expected.protocol
  );
}

export function buildAdminReturnUrl(
  config: InstagramRuntimeConfig,
  status: string,
  connectionId?: string,
): string {
  const destination = new URL(config.adminReturnUrl);
  destination.searchParams.set('instagram', status);
  if (connectionId) {
    destination.searchParams.set('connectionId', connectionId);
  }
  return destination.toString();
}
