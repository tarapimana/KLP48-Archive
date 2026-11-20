import { ChevronLeft, ChevronRight, ExternalLink, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { VideoItem, VIDEOS } from '../data/klp48Data';
import {
  Lang,
  MONTHS_SHORT_EN,
  MONTHS_SHORT_MS,
  TRANSLATIONS,
} from '../i18n/translations';
import { TikTokThumbnail } from './TikTokThumbnail';
import { YouTubeThumbnail } from './YouTubeThumbnail';

interface VideosViewProps {
  lang: Lang;
  onPlayVideo: (video: VideoItem) => void;
}

type VideoPlatformFilter = 'all' | 'youtube' | 'tiktok';

const VIDEOS_PER_PAGE = 18;

export function VideosView({ lang, onPlayVideo }: VideosViewProps) {
  const t = TRANSLATIONS[lang];
  const [platform, setPlatform] = useState<VideoPlatformFilter>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [platform, query]);

  const counts = useMemo(() => {
    const yt = VIDEOS.filter((v) => v.platform === 'youtube').length;
    const tt = VIDEOS.filter((v) => v.platform === 'tiktok').length;
    return { all: VIDEOS.length, youtube: yt, tiktok: tt };
  }, []);

  const monthsShort = lang === 'en' ? MONTHS_SHORT_EN : MONTHS_SHORT_MS;

  const filteredVideos = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = VIDEOS.filter((v) => {
      const matchPlatform = platform === 'all' || v.platform === platform;
      const matchQuery = !q || v.title.toLowerCase().includes(q);
      return matchPlatform && matchQuery;
    });
    if (platform === 'tiktok') {
      return [...list].sort((a, b) => {
        const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return tb - ta;
      });
    }
    return list;
  }, [platform, query]);

  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageOffset = (safePage - 1) * VIDEOS_PER_PAGE;
  const visibleVideos = filteredVideos.slice(
    pageOffset,
    pageOffset + VIDEOS_PER_PAGE
  );

  const formatShortDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getDate()} ${monthsShort[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#131f10] sm:text-4xl dark:text-[#ecf4e8]">
            {t.n_video}
          </h1>
          <p className="mt-1.5 text-sm text-[#52634c] sm:text-base dark:text-[#98ad90]">
            {t.v_sub}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://www.youtube.com/@KLP48/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#dce6d7] bg-white px-3.5 text-xs font-semibold text-[#278500] transition-colors hover:border-[#278500] dark:border-[#24371f] dark:bg-[#142111] dark:text-[#6fd43a] dark:hover:border-[#6fd43a]"
          >
            <span>{t.v_yt_channel}</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <a
            href="https://www.tiktok.com/@klp48_official?lang=en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#dce6d7] bg-white px-3.5 text-xs font-semibold text-[#278500] transition-colors hover:border-[#278500] dark:border-[#24371f] dark:bg-[#142111] dark:text-[#6fd43a] dark:hover:border-[#6fd43a]"
          >
            <span>{t.v_tt_channel}</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce6d7] pb-5 dark:border-[#24371f]">
        <div
          className="inline-flex rounded-lg border border-[#dce6d7] bg-white p-1 dark:border-[#24371f] dark:bg-[#142111]"
          role="group"
          aria-label="Filter videos by platform"
        >
          {(
            [
              { key: 'all', label: `${t.t_all} (${counts.all})` },
              { key: 'youtube', label: `YouTube (${counts.youtube})` },
              { key: 'tiktok', label: `TikTok (${counts.tiktok})` },
            ] as Array<{ key: VideoPlatformFilter; label: string }>
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setPlatform(tab.key)}
              className={`font-mono-num min-h-[34px] whitespace-nowrap rounded-md px-3.5 text-xs font-semibold transition-colors ${
                platform === tab.key
                  ? 'bg-[#278500] text-white dark:bg-[#6fd43a] dark:text-[#0a1407]'
                  : 'text-[#52634c] hover:text-[#131f10] dark:text-[#98ad90] dark:hover:text-[#ecf4e8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#52634c] dark:text-[#98ad90]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.v_search_ph}
            aria-label={t.v_search_ph}
            className="min-h-[40px] w-full rounded-lg border border-[#dce6d7] bg-white py-2 pr-3 pl-10 text-sm text-[#131f10] placeholder:text-[#52634c] focus:border-[#278500] focus:outline-none dark:border-[#24371f] dark:bg-[#142111] dark:text-[#ecf4e8] dark:placeholder:text-[#98ad90] dark:focus:border-[#6fd43a]"
          />
        </div>
      </div>

      {visibleVideos.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleVideos.map((vid, idx) => {
              const shortTitle =
                vid.title.length > 110 ? `${vid.title.slice(0, 107)}…` : vid.title;
              const isYouTube = vid.platform === 'youtube';
              const absoluteIdx = pageOffset + idx + 1;

              return (
                <article
                  key={vid.url}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#dce6d7] bg-white dark:border-[#24371f] dark:bg-[#142111]"
                >
                  {isYouTube ? (
                    <button
                      type="button"
                      onClick={() => onPlayVideo(vid)}
                      className="group relative block w-full text-left"
                      aria-label={`${t.v_preview}: ${shortTitle}`}
                    >
                      <YouTubeThumbnail
                        youtubeId={vid.youtubeId}
                        title={shortTitle}
                        indexLabel={String(absoluteIdx).padStart(2, '0')}
                      />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onPlayVideo(vid)}
                      className="group relative block w-full text-left"
                      aria-label={`${t.v_preview}: ${shortTitle}`}
                    >
                      <TikTokThumbnail
                        thumbnail={vid.thumbnail}
                        title={shortTitle}
                        indexLabel={String(absoluteIdx).padStart(2, '0')}
                      />
                    </button>
                  )}

                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#278500] dark:text-[#6fd43a]">
                        {isYouTube ? 'YouTube' : 'TikTok'}
                      </span>
                      {vid.publishedAt && (
                        <span className="font-mono-num text-[11px] font-medium text-[#52634c] dark:text-[#98ad90]">
                          {formatShortDate(vid.publishedAt)}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-1 text-sm font-semibold leading-snug text-[#131f10] dark:text-[#ecf4e8]">
                      {shortTitle}
                    </h2>
                  </div>

                  <div className="mt-4 flex items-center justify-end border-t border-[#dce6d7] pt-3 text-xs dark:border-[#24371f]">
                    <a
                      href={vid.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${isYouTube ? t.v_open_yt : t.v_open_tt} (opens in a new tab)`}
                      className="inline-flex items-center gap-1 font-semibold text-[#278500] hover:underline dark:text-[#6fd43a]"
                    >
                      <span>{isYouTube ? t.v_open_yt : t.v_open_tt}</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between rounded-xl border border-[#dce6d7] bg-white/90 px-4 py-3 backdrop-blur-md dark:border-[#24371f] dark:bg-[#142111]/90">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#dce6d7] bg-white px-3.5 text-xs font-semibold text-[#131f10] transition-colors hover:border-[#278500] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#24371f] dark:bg-[#1a2b15] dark:text-[#ecf4e8] dark:hover:border-[#6fd43a]"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.prev_page}</span>
              </button>

              <span className="font-mono-num text-xs font-semibold text-[#52634c] dark:text-[#98ad90]">
                {safePage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#dce6d7] bg-white px-3.5 text-xs font-semibold text-[#131f10] transition-colors hover:border-[#278500] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#24371f] dark:bg-[#1a2b15] dark:text-[#ecf4e8] dark:hover:border-[#6fd43a]"
              >
                <span>{t.next_page}</span>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-[#dce6d7] bg-white p-8 text-center text-sm text-[#52634c] dark:border-[#24371f] dark:bg-[#142111] dark:text-[#98ad90]">
          {t.nomatch}
        </div>
      )}
    </div>
  );
}
