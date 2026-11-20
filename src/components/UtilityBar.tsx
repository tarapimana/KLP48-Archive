import { Moon, Sun } from 'lucide-react';
import { Lang, TRANSLATIONS } from '../i18n/translations';

interface UtilityBarProps {
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function UtilityBar({
  lang,
  onChangeLang,
  theme,
  onToggleTheme,
}: UtilityBarProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce6d7] py-3 text-xs dark:border-[#24371f]">
      <span className="font-medium tracking-wide text-[#52634c] dark:text-[#98ad90]">
        {t.edition_label}
      </span>

      <div className="flex items-center gap-3">
        <div
          className="inline-flex items-center rounded-lg border border-[#dce6d7] bg-white p-0.5 dark:border-[#24371f] dark:bg-[#142111]"
          role="group"
          aria-label="Language switcher"
        >
          <button
            type="button"
            onClick={() => onChangeLang('ms')}
            className={`min-h-[30px] whitespace-nowrap rounded-md px-2.5 text-xs font-semibold transition-colors ${
              lang === 'ms'
                ? 'bg-[#278500] text-white dark:bg-[#6fd43a] dark:text-[#0a1407]'
                : 'text-[#52634c] hover:text-[#131f10] dark:text-[#98ad90] dark:hover:text-[#ecf4e8]'
            }`}
          >
            BM
          </button>
          <button
            type="button"
            onClick={() => onChangeLang('en')}
            className={`min-h-[30px] whitespace-nowrap rounded-md px-2.5 text-xs font-semibold transition-colors ${
              lang === 'en'
                ? 'bg-[#278500] text-white dark:bg-[#6fd43a] dark:text-[#0a1407]'
                : 'text-[#52634c] hover:text-[#131f10] dark:text-[#98ad90] dark:hover:text-[#ecf4e8]'
            }`}
          >
            EN
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? t.theme_light : t.theme_dark}
          className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-[#dce6d7] bg-white text-[#131f10] transition-colors hover:border-[#278500] dark:border-[#24371f] dark:bg-[#142111] dark:text-[#ecf4e8] dark:hover:border-[#6fd43a]"
        >
          {theme === 'dark' ? (
            <Sun className="h-3.5 w-3.5 text-[#6fd43a]" aria-hidden="true" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-[#278500]" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
