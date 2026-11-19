import { ExternalLink, X } from 'lucide-react';
import { useEffect } from 'react';
import { VideoItem } from '../data/klp48Data';
import { Lang, MONTHS_SHORT_EN, MONTHS_SHORT_MS, TRANSLATIONS } from '../i18n/translations';

interface VideoModalProps {
  video: VideoItem | null;
  lang: Lang;
  onClose: () => void;
}

export function VideoModal({ video, lang, onClose }: VideoModalProps) {
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!video) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [video, onClose]);

  if (!video || (!video.youtubeId && !video.youtubePlaylistId && !video.tiktokId)) return null;

  const isTikTok = video.platform === 'tiktok' && Boolean(video.tiktokId);

  const monthsShort = lang === 'en' ? MONTHS_SHORT_EN : MONTHS_SHORT_MS;
  const publishedLabel = (() => {
    if (!video.publishedAt) return '';
    const d = new Date(video.publishedAt);
    if (Number.isNaN(d.getTime())) return '';
    return ` · ${d.getDate()} ${monthsShort[d.getMonth()]} ${d.getFullYear()}`;
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      onClick={onClose}
    >
      <div
        className={`w-full overflow-hidden rounded-2xl border border-[#dce6d7] bg-white shadow-2xl dark:border-[#24371f] dark:bg-[#142111] ${
          isTikTok ? 'max-w-md' : 'max-w-4xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#dce6d7] px-5 py-4 dark:border-[#24371f]">
          <div className="min-w-0">
            <div className="font-mono-num text-xs font-medium text-[#52634c] dark:text-[#98ad90]">
              {isTikTok ? 'TikTok · @klp48_official' : 'YouTube · @KLP48'}
              {publishedLabel}
            </div>
            <h3 className="mt-0.5 truncate text-base font-bold text-[#131f10] dark:text-[#ecf4e8]">
              {video.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#dce6d7] text-[#52634c] transition-colors hover:text-[#131f10] dark:border-[#24371f] dark:text-[#98ad90] dark:hover:text-[#ecf4e8]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className={`relative w-full bg-black ${
            isTikTok ? 'mx-auto aspect-[9/16] max-h-[70vh]' : 'aspect-video'
          }`}
        >
          <iframe
            src={
              isTikTok
                ? `https://www.tiktok.com/player/v1/${video.tiktokId}?autoplay=1&music_info=1&description=1`
                : video.youtubePlaylistId
                  ? `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(video.youtubePlaylistId)}&autoplay=1&rel=0&playsinline=1`
                  : `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&playsinline=1`
            }
            title={video.title}
            className="h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#278500] hover:underline dark:text-[#6fd43a]"
          >
            <span>{isTikTok ? t.v_open_tt : t.v_watch}</span>
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
