import { OFFICIAL_SITE_URL, RouteKey } from '../data/klp48Data';
import { Lang, TRANSLATIONS } from '../i18n/translations';

interface FooterProps {
  lang: Lang;
  onNavigate: (route: RouteKey) => void;
}

export function Footer({ lang, onNavigate }: FooterProps) {
  const t = TRANSLATIONS[lang];

  return (
    <footer className="mt-8 border-t border-[#dce6d7] bg-[#f6faf4] py-6 dark:border-[#24371f] dark:bg-[#0d160b]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-5 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6">
        <div className="space-y-1 text-center lg:text-left">
          <p className="font-logo text-base font-light tracking-[0.02em] text-[#131f10] dark:text-[#ecf4e8]">
            Arkib <span className="text-[#278500] dark:text-[#6fd43a]">KLP48</span>
          </p>
          <p className="mx-auto max-w-lg text-xs text-[#52634c] sm:text-sm dark:text-[#98ad90] lg:mx-0">{t.footer}</p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs sm:gap-x-4 sm:text-sm">
          {(['jadwal', 'member', 'berita', 'bday', 'video', 'live'] as RouteKey[]).map((key) => (
            <a
              key={key}
              href={`#${key}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(key);
              }}
              className="whitespace-nowrap text-[#52634c] transition-colors hover:text-[#278500] dark:text-[#98ad90] dark:hover:text-[#6fd43a]"
            >
              {t[`n_${key}`]}
            </a>
          ))}
        </nav>

        <a
          href={OFFICIAL_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t.footer_official} (opens in a new tab)`}
          className="inline-flex h-9 items-center justify-center justify-self-center whitespace-nowrap rounded-md bg-[#278500] px-4 text-sm font-bold text-white transition-colors hover:bg-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:bg-[#6fd43a] dark:text-[#0a1407] dark:hover:bg-[#82df52] dark:focus-visible:outline-[#6fd43a] lg:justify-self-end"
        >
          {t.footer_official}
        </a>
      </div>
    </footer>
  );
}
