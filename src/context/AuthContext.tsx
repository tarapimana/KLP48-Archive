import { User } from 'firebase/auth';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  AUTHORIZED_ADMIN_EMAIL,
  isAuthorizedAdmin,
  signInWithGoogleAdmin,
  signOutAdmin,
  subscribeToAuthState,
} from '../services/authService';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  unauthorizedEmail: string | null;
  isEmailVerified: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        if (!isAuthorizedAdmin(currentUser)) {
          setUnauthorizedEmail(currentUser.email || 'Unknown account');
        } else {
          setUnauthorizedEmail(null);
        }
      } else {
        setUnauthorizedEmail(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = useCallback(() => {
    setError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signIn = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      const { user: signedInUser, isAdmin } = await signInWithGoogleAdmin();
      setUser(signedInUser);

      if (!isAdmin) {
        setUnauthorizedEmail(signedInUser.email || 'Unknown account');
        setIsAuthModalOpen(true);
        return false;
      }

      setUnauthorizedEmail(null);
      return true;
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      if (fbErr.code === 'auth/popup-closed-by-user') {
        setError('Log masuk dibatalkan. Sila cuba lagi apabila bersedia.');
      } else if (fbErr.code === 'auth/cancelled-popup-request') {
        // Ignored, user clicked again
      } else if (fbErr.code === 'auth/popup-blocked') {
        setError('Tetingkap timbul (popup) disekat oleh pelayar. Sila benarkan popup untuk laman ini.');
      } else {
        setError(fbErr.message || 'Ralat semasa log masuk dengan Google.');
      }
      return false;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await signOutAdmin();
      setUser(null);
      setUnauthorizedEmail(null);
      setError(null);
    } catch (err: unknown) {
      const fbErr = err as { message?: string };
      setError(fbErr.message || 'Ralat semasa log keluar.');
    }
  }, []);

  const isAdmin = isAuthorizedAdmin(user);
  const isEmailVerified = user?.emailVerified === true;

  const value: AuthContextValue = {
    user,
    isAdmin,
    loading,
    unauthorizedEmail,
    isEmailVerified,
    error,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    signIn,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
