import { ExternalLink } from 'lucide-react';
import { OFFICIAL_SITE_URL, RouteKey } from '../data/klp48Data';
import { Lang, TRANSLATIONS } from '../i18n/translations';

interface FooterProps {
  lang: Lang;
  onNavigate: (route: RouteKey) => void;
}

export function Footer({ lang, onNavigate }: FooterProps) {
  const t = TRANSLATIONS[lang];

  return (
    <footer className="mt-20 border-t border-[#dce6d7] py-10 dark:border-[#24371f]">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
        <div className="space-y-1">
          <p className="font-logo text-base font-light tracking-[0.02em] text-[#131f10] dark:text-[#ecf4e8]">
            Arkib <span className="text-[#278500] dark:text-[#6fd43a]">KLP48</span>
          </p>
          <p className="max-w-lg text-sm text-[#52634c] dark:text-[#98ad90]">{t.footer}</p>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm">
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
          <a
            href={OFFICIAL_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-[#278500] hover:underline dark:text-[#6fd43a]"
          >
            <span>{t.footer_official}</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
