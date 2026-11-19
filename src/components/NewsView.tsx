import { ArrowRight, ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NEWS_DATA, OFFICIAL_SITE_URL } from '../data/klp48Data';
import { Lang, TRANSLATIONS } from '../i18n/translations';

interface NewsViewProps {
  lang: Lang;
}

export function NewsView({ lang }: NewsViewProps) {
  const t = TRANSLATIONS[lang];
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    NEWS_DATA.forEach((n) => set.add(n.kategori));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredNews = useMemo(() => {
    return category === 'all'
      ? NEWS_DATA
      : NEWS_DATA.filter((n) => n.kategori === category);
  }, [category]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#131f10] sm:text-4xl dark:text-[#ecf4e8]">
          {t.n_berita}
        </h1>
        <p className="mt-1.5 text-sm text-[#52634c] sm:text-base dark:text-[#98ad90]">
          {t.b_sub}
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce6d7] pb-5 dark:border-[#24371f]">
        <div
          className="inline-flex rounded-lg border border-[#dce6d7] bg-white p-1 dark:border-[#24371f] dark:bg-[#142111]"
          role="group"
          aria-label="Filter news by category"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`min-h-[34px] whitespace-nowrap rounded-md px-3.5 text-xs font-semibold transition-colors ${
                category === cat
                  ? 'bg-[#278500] text-white dark:bg-[#6fd43a] dark:text-[#0a1407]'
                  : 'text-[#52634c] hover:text-[#131f10] dark:text-[#98ad90] dark:hover:text-[#ecf4e8]'
              }`}
            >
              {cat === 'all' ? t.t_all : cat}
            </button>
          ))}
        </div>

        <a
          href={`${OFFICIAL_SITE_URL}/news`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#278500] hover:underline dark:text-[#6fd43a]"
        >
          <span>{t.b_more}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <div className="divide-y divide-[#dce6d7] rounded-2xl border border-[#dce6d7] bg-white dark:divide-[#24371f] dark:border-[#24371f] dark:bg-[#142111]">
        {filteredNews.map((item) => (
          <a
            key={item.pautan}
            href={item.pautan}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start justify-between gap-4 p-5 transition-colors hover:bg-[#f6faf4] dark:hover:bg-[#1a2b15]"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium text-[#52634c] dark:text-[#98ad90]">
                <span className="font-semibold text-[#278500] dark:text-[#6fd43a]">
                  {item.kategori}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">{item.tarikh}</span>
              </div>
              <h2 className="mt-1.5 text-base font-semibold text-[#131f10] transition-colors group-hover:text-[#278500] dark:text-[#ecf4e8] dark:group-hover:text-[#6fd43a]">
                {item.tajuk}
              </h2>
            </div>
            <ExternalLink
              className="mt-1 h-4 w-4 shrink-0 text-[#52634c] transition-colors group-hover:text-[#278500] dark:text-[#98ad90] dark:group-hover:text-[#6fd43a]"
              aria-hidden="true"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
