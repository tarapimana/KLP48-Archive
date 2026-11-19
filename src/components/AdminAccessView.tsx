import { ArrowLeft, Shield, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Lang, TRANSLATIONS } from '../i18n/translations';

interface AdminAccessViewProps {
  lang: Lang;
}

export function AdminAccessView({ lang }: AdminAccessViewProps) {
  const t = TRANSLATIONS[lang];
  const { user, isAdmin, openAuthModal } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6faf4] px-4 py-10 text-[#131f10] dark:bg-[#0a1407] dark:text-[#ecf4e8]">
      <section className="w-full max-w-md rounded-3xl border border-[#dce6d7] bg-white p-6 shadow-[0_24px_80px_rgba(10,20,7,0.12)] dark:border-[#24371f] dark:bg-[#0e180b] dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8">
        <a
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#52634c] transition-colors hover:text-[#278500] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#278500] dark:text-[#98ad90] dark:hover:text-[#6fd43a] dark:focus-visible:outline-[#6fd43a]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Arkib KLP48</span>
        </a>

        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3f2da] text-[#278500] dark:bg-[#1d3314] dark:text-[#6fd43a]">
          {isAdmin ? (
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Shield className="h-6 w-6" aria-hidden="true" />
          )}
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#278500] dark:text-[#6fd43a]">
          {lang === 'en' ? 'Administrator access' : 'Akses pentadbir'}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">{t.admin_title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#52634c] dark:text-[#98ad90]">
          {t.admin_subtitle}
        </p>

        {isAdmin && user && (
          <p className="mt-5 rounded-xl border border-[#278500]/30 bg-[#e3f2da]/60 px-3 py-2 text-sm text-[#1e6800] dark:border-[#6fd43a]/30 dark:bg-[#1d3314]/60 dark:text-[#8be05a]">
            {user.email}
          </p>
        )}

        <button
          type="button"
          onClick={openAuthModal}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#278500] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:bg-[#6fd43a] dark:text-[#0a1407] dark:hover:bg-[#82df52] dark:focus-visible:outline-[#6fd43a]"
        >
          {isAdmin ? t.admin_btn : t.admin_login}
        </button>
      </section>
    </main>
  );
}
