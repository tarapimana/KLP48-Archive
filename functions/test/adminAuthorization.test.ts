import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AdminAuthorizationError,
  AUTHORIZED_ADMIN_EMAIL,
  requireVerifiedAdmin,
  type VerifiedIdTokenClaims,
} from '../src/adminAuthorization';

const validClaims: VerifiedIdTokenClaims = {
  uid: 'verified-admin-uid',
  email: AUTHORIZED_ADMIN_EMAIL,
  email_verified: true,
};

async function expectAuthorizationError(
  request: Promise<unknown>,
  statusCode: 401 | 403,
): Promise<void> {
  await assert.rejects(request, (error: unknown) => {
    assert.ok(error instanceof AdminAuthorizationError);
    assert.equal(error.statusCode, statusCode);
    return true;
  });
}

test('rejects missing and malformed bearer tokens before verification', async () => {
  let verifierCalled = false;
  const verifier = async () => {
    verifierCalled = true;
    return validClaims;
  };

  await expectAuthorizationError(requireVerifiedAdmin(undefined, verifier), 401);
  await expectAuthorizationError(requireVerifiedAdmin('Basic abc', verifier), 401);
  await expectAuthorizationError(requireVerifiedAdmin('Bearer token with-spaces', verifier), 401);
  assert.equal(verifierCalled, false);
});

test('maps Firebase token verification failures to 401', async () => {
  await expectAuthorizationError(
    requireVerifiedAdmin('Bearer invalid-token', async () => {
      throw new Error('private verifier detail');
    }),
    401,
  );
});

test('accepts only the existing verified administrator identity', async () => {
  const principal = await requireVerifiedAdmin('Bearer valid-token', async () => validClaims);
  assert.deepEqual(principal, {
    uid: validClaims.uid,
    email: AUTHORIZED_ADMIN_EMAIL,
  });

  await expectAuthorizationError(
    requireVerifiedAdmin('Bearer ordinary-user', async () => ({
      uid: 'ordinary-user',
      email: 'user@example.com',
      email_verified: true,
    })),
    403,
  );

  await expectAuthorizationError(
    requireVerifiedAdmin('Bearer unverified-admin', async () => ({
      ...validClaims,
      email_verified: false,
    })),
    403,
  );
});
