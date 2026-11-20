import { getFirebaseAdminServices } from './firebaseAdmin';

export const AUTHORIZED_ADMIN_EMAIL = 'it.aiman2009@gmail.com';

export interface VerifiedIdTokenClaims {
  uid: string;
  email?: string;
  email_verified?: boolean;
}

export interface AdminPrincipal {
  uid: string;
  email: string;
}

export class AdminAuthorizationError extends Error {
  constructor(
    public readonly statusCode: 401 | 403,
    message: string,
  ) {
    super(message);
    this.name = 'AdminAuthorizationError';
  }
}

export type IdTokenVerifier = (idToken: string) => Promise<VerifiedIdTokenClaims>;

function extractBearerToken(authorizationHeader: string | undefined): string {
  const match = authorizationHeader?.trim().match(/^Bearer\s+([^\s]+)$/i);
  if (!match) {
    throw new AdminAuthorizationError(401, 'Authentication required.');
  }
  return match[1];
}

async function verifyWithFirebaseAdmin(idToken: string): Promise<VerifiedIdTokenClaims> {
  return getFirebaseAdminServices().auth.verifyIdToken(idToken, true);
}

export async function requireVerifiedAdmin(
  authorizationHeader: string | undefined,
  verifyIdToken: IdTokenVerifier = verifyWithFirebaseAdmin,
): Promise<AdminPrincipal> {
  const idToken = extractBearerToken(authorizationHeader);

  let claims: VerifiedIdTokenClaims;
  try {
    claims = await verifyIdToken(idToken);
  } catch {
    throw new AdminAuthorizationError(401, 'Invalid or expired authentication token.');
  }

  if (typeof claims.uid !== 'string' || claims.uid.length === 0) {
    throw new AdminAuthorizationError(401, 'Invalid or expired authentication token.');
  }

  if (claims.email !== AUTHORIZED_ADMIN_EMAIL || claims.email_verified !== true) {
    throw new AdminAuthorizationError(403, 'Administrator access required.');
  }

  return { uid: claims.uid, email: claims.email };
}
