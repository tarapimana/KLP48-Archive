import { OFFICIAL_SITE_URL, RouteKey } from '../data/klp48Data';
import { Lang, TRANSLATIONS } from '../i18n/translations';

interface FooterProps {
  lang: Lang;
  onNavigate: (route: RouteKey) => void;
}

export function Footer({ lang, onNavigate }: FooterProps) {
  const t = TRANSLATIONS[lang];

  return (
    <footer className="mt-8 border-t border-[#dce6d7] py-8 dark:border-[#24371f]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 sm:px-6">
        <div className="space-y-1 text-center">
          <p className="font-logo text-base font-light tracking-[0.02em] text-[#131f10] dark:text-[#ecf4e8]">
            Arkib <span className="text-[#278500] dark:text-[#6fd43a]">KLP48</span>
          </p>
          <p className="max-w-lg text-sm text-[#52634c] dark:text-[#98ad90]">{t.footer}</p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm">
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
          className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-[#278500] px-4 text-sm font-bold text-white transition-colors hover:bg-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:bg-[#6fd43a] dark:text-[#0a1407] dark:hover:bg-[#82df52] dark:focus-visible:outline-[#6fd43a]"
        >
          {t.footer_official}
        </a>
      </div>
    </footer>
  );
}
