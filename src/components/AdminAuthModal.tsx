import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  LogIn,
  LogOut,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lang, TRANSLATIONS } from '../i18n/translations';
import { AUTHORIZED_ADMIN_EMAIL } from '../services/authService';

interface AdminAuthModalProps {
  lang: Lang;
}

export function AdminAuthModal({ lang }: AdminAuthModalProps) {
  const t = TRANSLATIONS[lang];
  const {
    user,
    isAdmin,
    loading: authLoading,
    unauthorizedEmail,
    isEmailVerified,
    error,
    isAuthModalOpen,
    closeAuthModal,
    signIn,
    signOut,
  } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSignIn = async () => {
    setSubmitting(true);
    try {
      await signIn();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    try {
      await signOut();
    } finally {
      setSubmitting(false);
    }
  };

  const isUnauthorized = Boolean(user && !isAdmin);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-auth-title"
      onClick={closeAuthModal}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-[#dce6d7] bg-white shadow-2xl transition-all dark:border-[#24371f] dark:bg-[#142111]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#dce6d7] px-5 py-4 dark:border-[#24371f]">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isAdmin
                  ? 'bg-[#e3f2da] text-[#278500] dark:bg-[#1d3314] dark:text-[#6fd43a]'
                  : isUnauthorized
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-[#edf5e9] text-[#278500] dark:bg-[#1c2d17] dark:text-[#6fd43a]'
              }`}
            >
              {isAdmin ? (
                <ShieldCheck className="h-5 w-5" />
              ) : isUnauthorized ? (
                <ShieldAlert className="h-5 w-5" />
              ) : (
                <Shield className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3
                id="admin-auth-title"
                className="text-base font-bold text-[#131f10] dark:text-[#ecf4e8]"
              >
                {t.admin_title}
              </h3>
              <p className="text-xs text-[#52634c] dark:text-[#98ad90]">
                {t.admin_subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#52634c] hover:bg-[#edf5e9] hover:text-[#131f10] dark:text-[#98ad90] dark:hover:bg-[#1c2d17] dark:hover:text-[#ecf4e8]"
            aria-label={t.admin_close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* General Error notice */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STATE 1: ACCESS DENIED (User signed in with unauthorized Google account) */}
          {isUnauthorized && (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-200">
                  <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>{t.admin_access_denied_badge}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                  {t.admin_access_denied_desc.replace(
                    '%e',
                    unauthorizedEmail || user?.email || 'unknown'
                  )}
                </p>

                {user && (
                  <div className="mt-3 rounded-lg border border-amber-200/80 bg-white/70 p-2.5 text-[11px] space-y-1 font-mono-num dark:border-amber-900/60 dark:bg-[#142111]/70">
                    <div className="text-gray-600 dark:text-gray-300">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">Account: </span>
                      {user.email}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">Email Verified: </span>
                      <span className={user.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {user.emailVerified ? 'true' : 'false'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span>{t.admin_switch_account}</span>
              </button>
            </div>
          )}

          {/* STATE 2: AUTHORIZED ADMIN (it.aiman2009@gmail.com verified) */}
          {isAdmin && user && (
            <div className="space-y-3">
              <div className="rounded-xl border border-green-200 bg-[#e3f2da]/70 p-4 dark:border-green-800/60 dark:bg-[#1d3314]/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#1e6800] dark:text-[#8be05a]">
                    <CheckCircle2 className="h-4 w-4 text-[#278500] dark:text-[#6fd43a]" />
                    <span>{t.admin_verified_badge}</span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#278500]/15 px-2 py-0.5 text-[10px] font-bold text-[#1e6800] dark:bg-[#6fd43a]/20 dark:text-[#8be05a]">
                    Verified
                  </span>
                </div>

                <div className="mt-3 rounded-lg border border-green-200/80 bg-white/70 p-2.5 text-xs space-y-1 font-mono-num dark:border-green-900/60 dark:bg-[#142111]/70">
                  <div className="font-medium text-[#131f10] dark:text-[#ecf4e8]">
                    {user.displayName || 'Administrator'}
                  </div>
                  <div className="text-[11px] text-[#52634c] dark:text-[#98ad90]">
                    {user.email}
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[#52634c] dark:text-[#98ad90]">
                  {t.admin_verified_desc}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span>{t.admin_logout}</span>
              </button>
            </div>
          )}

          {/* STATE 3: NOT SIGNED IN */}
          {!user && (
            <div className="space-y-4">
              <p className="text-xs leading-relaxed text-[#52634c] dark:text-[#98ad90]">
                {t.admin_desc}
              </p>

              <div className="rounded-xl border border-[#dce6d7] bg-[#f6faf4] p-3 text-xs space-y-1.5 dark:border-[#24371f] dark:bg-[#0d160b]">
                <div className="text-[11px] font-semibold text-[#52634c] dark:text-[#98ad90]">
                  {t.admin_authorized_email_label}:
                </div>
                <div className="font-mono text-xs font-bold text-[#278500] dark:text-[#6fd43a]">
                  {AUTHORIZED_ADMIN_EMAIL}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignIn}
                disabled={submitting || authLoading}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#278500] px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] disabled:opacity-50 dark:bg-[#6fd43a] dark:text-[#0a1407] dark:hover:bg-[#82df52] dark:focus-visible:outline-[#6fd43a]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t.admin_signing_in}</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{t.admin_signin_google}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Public access safe assurance notice */}
          <div className="pt-2 border-t border-[#dce6d7] text-center dark:border-[#24371f]">
            <p className="text-[11px] text-[#52634c] dark:text-[#98ad90]">
              {t.admin_public_access_safe}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
