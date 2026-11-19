import {
  browserLocalPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

/**
 * Hardcoded canonical authorized administrator email address.
 * Matches exact verification requirement in firestore.rules:
 * request.auth.token.email == 'it.aiman2009@gmail.com' && request.auth.token.email_verified == true
 */
export const AUTHORIZED_ADMIN_EMAIL = 'it.aiman2009@gmail.com';

/**
 * Validates whether the given Firebase user satisfies all administrator requirements:
 * 1. User must be signed in
 * 2. User email must match AUTHORIZED_ADMIN_EMAIL (case-insensitive)
 * 3. User email must be verified (emailVerified === true)
 */
export function isAuthorizedAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  const isEmailMatch =
    user.email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
  const isEmailVerified = user.emailVerified === true;
  return isEmailMatch && isEmailVerified;
}

/**
 * Configures Firebase Auth browser local persistence.
 * Guarantees that authenticated admin sessions persist across page refreshes and browser tabs.
 */
export async function ensureAuthPersistence(): Promise<void> {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (err) {
    console.warn('Firebase Auth browserLocalPersistence notice:', err);
  }
}

/**
 * Initiates Google Sign-In via popup for administrator authentication.
 * Prompts user to select an account to prevent auto-selecting unintended Google accounts.
 */
export async function signInWithGoogleAdmin(): Promise<{
  user: User;
  isAdmin: boolean;
}> {
  await ensureAuthPersistence();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const isAdmin = isAuthorizedAdmin(user);

  return { user, isAdmin };
}

/**
 * Signs out the currently authenticated user from Firebase Auth.
 */
export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribes to Firebase Auth state changes.
 * Returns an unsubscribe function.
 */
export function subscribeToAuthState(
  callback: (user: User | null) => void
): () => void {
  // Ensure persistence is configured in the background
  ensureAuthPersistence().catch(() => {});
  return onAuthStateChanged(auth, callback);
}
