import { ArrowUpRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NEWS_ARTICLES } from '../data/newsArticleContent';
import {
  getLocalizedNewsBody,
  getLocalizedNewsCategory,
  getLocalizedNewsTitle,
} from '../data/newsArticleTranslations';
import { NewsItem } from '../data/klp48Data';
import { Lang, TRANSLATIONS } from '../i18n/translations';

interface NewsModalProps {
  item: NewsItem | null;
  lang: Lang;
  onClose: () => void;
}

function getArticleId(item: NewsItem) {
  const match = item.pautan.match(/\/detail\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

type NewsBodyBlock =
  | { type: 'heading' | 'subtitle' | 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'divider' };

function getNewsBodyBlocks(body: string): NewsBodyBlock[] {
  const normalizedBody = body
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/([A-Za-z])(?=\d+[.)][ \t]+[A-Z])/g, '$1\n')
    .replace(/\s*(?:🗓️|🎙️)\s*/g, '\n');
  const lines = normalizedBody.split('\n').map((line) => line.trim()).filter(Boolean);
  const blocks: NewsBodyBlock[] = [];

  for (const line of lines) {
    if (/^[⸻—–_-]{3,}$/.test(line)) {
      blocks.push({ type: 'divider' });
      continue;
    }

    const listItem = line.match(/^(?:[-•*]\s+|\d+[.)]\s+)(.+)$/);
    if (listItem) {
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock?.type === 'list') {
        lastBlock.items.push(listItem[1]);
      } else {
        blocks.push({ type: 'list', items: [listItem[1]] });
      }
      continue;
    }

    const isHeading =
      /^(?:[A-Z][A-Z0-9\s’'&:–—-]{2,}|[【\[].*[】\]]|◼︎\s+.+)$/u.test(line) ||
      /^announcement$/i.test(line);

    if (isHeading) {
      blocks.push({ type: 'heading', text: line.replace(/^◼︎\s*/, '') });
    } else if (blocks[blocks.length - 1]?.type === 'heading' && line.length <= 120) {
      blocks.push({ type: 'subtitle', text: line });
    } else {
      blocks.push({ type: 'paragraph', text: line });
    }
  }

  return blocks;
}

export function NewsModal({ item, lang, onClose }: NewsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const [articleLang, setArticleLang] = useState<Lang>(lang);

  useEffect(() => {
    if (!item) return;
    setArticleLang(lang);

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [item, onClose, lang]);

  if (!item) return null;

  const articleId = getArticleId(item);
  const article = articleId ? NEWS_ARTICLES[articleId] : undefined;
  const articleTitle = getLocalizedNewsTitle(item.pautan, item.tajuk, articleLang);
  const categoryLabel = getLocalizedNewsCategory(item.kategori, articleLang);
  const articleBody = articleId && article
    ? getLocalizedNewsBody(articleId, article.body, articleLang)
    : '';
  const bodyBlocks = getNewsBodyBlocks(articleBody);
  const additionalLinks = (article?.links ?? []).filter(
    (link) => link.url && !article?.body.includes(link.url) && !article?.body.includes(link.text)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-article-title"
      onClick={onClose}
    >
      <article
        ref={dialogRef}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#294323] bg-[#142111] text-[#ecf4e8] shadow-2xl shadow-black/50"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#294323] px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <div className="font-mono-num text-xs font-medium text-[#98ad90]">
              <span className="font-semibold text-[#7ddb47]">{categoryLabel}</span>
              <span aria-hidden="true"> · </span>
              <time dateTime={item.tarikh.replaceAll('.', '-')}>{item.tarikh}</time>
            </div>
            <h2
              id="news-article-title"
              className="mt-1.5 font-display text-xl font-bold leading-snug sm:text-2xl"
            >
              {articleTitle}
            </h2>
            <p className="mt-1 text-xs text-[#98ad90]">{TRANSLATIONS[articleLang].b_official_article}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <div
                className="inline-flex rounded-lg border border-[#294323] p-0.5"
                role="group"
                aria-label={TRANSLATIONS[articleLang].b_choose_language}
              >
                {(['ms', 'en'] as const).map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => setArticleLang(language)}
                    aria-pressed={articleLang === language}
                    className={`min-h-8 rounded-md px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ddb47] ${
                      articleLang === language
                        ? 'bg-[#7ddb47] text-[#0a1407]'
                        : 'text-[#98ad90] hover:text-[#ecf4e8]'
                    }`}
                  >
                    {language === 'ms' ? 'BM' : 'English'}
                  </button>
                ))}
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label={TRANSLATIONS[articleLang].close}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#294323] text-[#98ad90] transition-colors hover:border-[#7ddb47] hover:text-[#ecf4e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ddb47]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <span className="text-[10px] text-[#98ad90]">
              {TRANSLATIONS[articleLang].b_community_translation}
            </span>
          </div>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {bodyBlocks.length > 0 && (
            <div className="mx-auto flex max-w-2xl flex-col gap-4 text-sm leading-7 text-[#d4dfcf] sm:text-base">
              {bodyBlocks.map((block, index) => {
                if (block.type === 'divider') {
                  return <hr key={`divider-${index}`} className="border-[#294323]" />;
                }

                if (block.type === 'list') {
                  return (
                    <ul key={`list-${index}`} className="flex list-disc flex-col gap-2 pl-5 marker:text-[#7ddb47]">
                      {block.items.map((text, itemIndex) => (
                        <li key={`${itemIndex}-${text.slice(0, 24)}`}>{text}</li>
                      ))}
                    </ul>
                  );
                }

                if (block.type === 'heading') {
                  return (
                    <h3
                      key={`heading-${index}`}
                      className="pt-2 text-sm font-bold uppercase tracking-[0.1em] text-[#7ddb47] first:pt-0"
                    >
                      {block.text}
                    </h3>
                  );
                }

                if (block.type === 'subtitle') {
                  return (
                    <p key={`subtitle-${index}`} className="text-base font-semibold leading-7 text-[#f2f7ee]">
                      {block.text}
                    </p>
                  );
                }

                return (
                  <p key={`paragraph-${index}`} className="text-pretty">
                    {block.text}
                  </p>
                );
              })}
            </div>
          )}

          {(article?.images.length ?? 0) > 0 && (
            <div className={`space-y-4 ${bodyBlocks.length > 0 ? 'mt-6' : ''}`}>
              {article?.images.map((image, index) => (
                <img
                  key={`${image.url}-${index}`}
                  src={image.url}
                  alt={image.alt || `${item.tajuk} article image ${index + 1}`}
                  loading="lazy"
                  className="mx-auto max-h-[70vh] w-auto max-w-full rounded-xl border border-[#294323] object-contain"
                />
              ))}
            </div>
          )}

          {bodyBlocks.length === 0 && (article?.images.length ?? 0) === 0 && (
            <p className="text-sm leading-7 text-[#98ad90]">
              {TRANSLATIONS[articleLang].b_no_article_text}
            </p>
          )}

          {additionalLinks.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-[#294323] pt-4">
              {additionalLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target={link.url.startsWith('http') ? '_blank' : undefined}
                  rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#294323] px-3 py-2 text-sm font-semibold text-[#7ddb47] transition-colors hover:border-[#7ddb47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ddb47]"
                >
                  <span>{link.text || link.url}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
