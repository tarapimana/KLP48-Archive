import { ArrowUpRight, LogOut, Menu, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLiveStatus } from '../context/LiveStatusContext';
import { RouteKey } from '../data/klp48Data';
import { Lang, TRANSLATIONS } from '../i18n/translations';

interface HeaderProps {
  route: RouteKey;
  onNavigate: (route: RouteKey) => void;
  lang: Lang;
  onToggleLang: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const PRIMARY_NAV: RouteKey[] = ['jadwal', 'member', 'berita', 'bday', 'video'];

function LiveBars() {
  return (
    <span aria-hidden="true" className="inline-flex h-3 items-end gap-[2px]">
      <span className="h-[4px] w-[2px] rounded-full bg-current" />
      <span className="h-[8px] w-[2px] rounded-full bg-current" />
      <span className="h-[6px] w-[2px] rounded-full bg-current" />
      <span className="h-[10px] w-[2px] rounded-full bg-current" />
    </span>
  );
}

export function Header({
  route,
  onNavigate,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = TRANSLATIONS[lang];
  const { user, isAdmin, openAuthModal, signOut } = useAuth();
  const { liveCount } = useLiveStatus();

  const handleNav = (key: RouteKey) => {
    onNavigate(key);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#dce6d7] bg-[#f6faf4]/85 backdrop-blur-md dark:border-[#24371f] dark:bg-[#0d160b]/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleNav('home');
          }}
          className="font-logo shrink-0 whitespace-nowrap text-xl font-light tracking-[0.02em] text-[#131f10] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#278500] dark:text-[#ecf4e8] dark:focus-visible:outline-[#6fd43a]"
        >
          Arkib <span className="text-[#278500] dark:text-[#6fd43a]">KLP48</span>
        </a>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
          {PRIMARY_NAV.map((key) => {
            const active = route === key;
            return (
              <a
                key={key}
                href={`#${key}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(key);
                }}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 whitespace-nowrap border-b-2 py-1 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#278500] dark:focus-visible:outline-[#6fd43a] ${
                  active
                    ? 'border-[#278500] font-semibold text-[#278500] dark:border-[#6fd43a] dark:text-[#6fd43a]'
                    : 'border-transparent text-[#52634c] hover:text-[#131f10] dark:text-[#98ad90] dark:hover:text-[#ecf4e8]'
                }`}
              >
                {t[`n_${key}`]}
              </a>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href="https://dumapp.com/en/klp48/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Oshi Sorter (opens in a new tab)"
            className="inline-flex h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-[#278500] px-2.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(39,133,0,0.24)] transition-colors hover:bg-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:bg-[#6fd43a] dark:text-[#0a1407] dark:hover:bg-[#82df52] dark:focus-visible:outline-[#6fd43a] md:h-8"
          >
            <span>Oshi Sorter</span>
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>

          {/* Live Navigation Button */}
          <button
            type="button"
            onClick={() => handleNav('live')}
            aria-label={`${t.n_live}: ${liveCount}`}
            className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#278500] px-3 py-1.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(39,133,0,0.24)] transition-colors hover:bg-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:bg-[#6fd43a] dark:text-[#0a1407] dark:hover:bg-[#82df52] dark:focus-visible:outline-[#6fd43a] md:inline-flex"
          >
            <LiveBars />
            <span className="tabular-nums">{liveCount}</span>
            <span>{t.n_live}</span>
          </button>

          {/* Desktop Administrator Status / Login Button */}
          {isAdmin ? (
            <div className="hidden shrink-0 items-center gap-1.5 md:inline-flex">
              <button
                type="button"
                onClick={openAuthModal}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#278500]/40 bg-[#e3f2da]/70 px-2.5 py-2 text-xs font-semibold text-[#1e6800] transition-colors hover:bg-[#e3f2da] dark:border-[#6fd43a]/40 dark:bg-[#1d3314]/70 dark:text-[#8be05a] dark:hover:bg-[#1d3314]"
                title="it.aiman2009@gmail.com (Verified Admin)"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#278500] dark:text-[#6fd43a]" />
                <span>{t.admin_btn}</span>
              </button>
              <button
                type="button"
                onClick={signOut}
                title={t.admin_logout}
                className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-[#dce6d7] bg-white text-[#52634c] transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-[#24371f] dark:bg-[#142111] dark:text-[#98ad90] dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-300"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : user ? (
            <div className="hidden shrink-0 items-center gap-1.5 md:inline-flex">
              <button
                type="button"
                onClick={openAuthModal}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                title={user.email || 'Unauthorized'}
              >
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>{t.admin_access_denied_badge}</span>
              </button>
              <button
                type="button"
                onClick={signOut}
                title={t.admin_logout}
                className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-amber-300 bg-white text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-[#142111] dark:text-amber-300"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#dce6d7] bg-white text-[#131f10] transition-colors hover:bg-[#edf5e9] md:hidden dark:border-[#24371f] dark:bg-[#142111] dark:text-[#ecf4e8] dark:hover:bg-[#1c2d17]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#dce6d7] bg-[#f6faf4] px-4 py-4 md:hidden dark:border-[#24371f] dark:bg-[#0d160b]">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {(['home', ...PRIMARY_NAV, 'live'] as RouteKey[]).map((key) => {
              const active = route === key;
              return (
                <a
                  key={key}
                  href={`#${key}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(key);
                  }}
                  aria-current={active ? 'page' : undefined}
                  aria-label={key === 'live' ? `${t.n_live}: ${liveCount}` : undefined}
                  className={`flex min-h-[44px] items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#e3f2da] font-semibold text-[#278500] dark:bg-[#1d3314] dark:text-[#6fd43a]'
                      : 'text-[#52634c] hover:bg-white dark:text-[#98ad90] dark:hover:bg-[#142111]'
                  }`}
                >
                  <span>{t[`n_${key}`]}</span>
                  {key === 'live' && (
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#278500] px-2.5 py-1 text-[11px] font-bold leading-none text-white dark:bg-[#6fd43a] dark:text-[#0a1407]"
                    >
                      <LiveBars />
                      <span className="tabular-nums">{liveCount}</span>
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Mobile Admin Controls */}
          <div className="mt-4 border-t border-[#dce6d7] pt-3 dark:border-[#24371f]">
            {isAdmin ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-[#278500]/40 bg-[#e3f2da]/70 p-3 dark:border-[#6fd43a]/40 dark:bg-[#1d3314]/70">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1e6800] dark:text-[#8be05a]">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin ({user?.email})</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-red-700 shadow-xs hover:bg-red-50 dark:bg-[#142111] dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  <LogOut className="h-3 w-3" />
                  <span>{t.admin_logout}</span>
                </button>
              </div>
            ) : user ? (
              <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>{t.admin_access_denied_badge}</span>
                </div>
                <div className="text-[11px] text-amber-800 dark:text-amber-300 font-mono-num">
                  {user.email}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      openAuthModal();
                      setMobileOpen(false);
                    }}
                    className="flex-1 rounded-lg border border-amber-300 bg-white py-1.5 text-xs font-semibold text-amber-800 dark:border-amber-700 dark:bg-[#142111] dark:text-amber-300"
                  >
                    Info
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                    className="flex-1 rounded-lg bg-amber-600 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                  >
                    {t.admin_logout}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#dce6d7] pt-3 dark:border-[#24371f]">
            <button
              type="button"
              onClick={onToggleLang}
              className="min-h-[40px] flex-1 rounded-lg border border-[#dce6d7] bg-white px-3 text-xs font-semibold text-[#131f10] dark:border-[#24371f] dark:bg-[#142111] dark:text-[#ecf4e8]"
            >
              {lang === 'ms' ? 'BM · Switch to EN' : 'EN · Tukar ke BM'}
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              className="min-h-[40px] flex-1 rounded-lg border border-[#dce6d7] bg-white px-3 text-xs font-semibold text-[#131f10] dark:border-[#24371f] dark:bg-[#142111] dark:text-[#ecf4e8]"
            >
              {theme === 'dark' ? t.theme_light : t.theme_dark}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
