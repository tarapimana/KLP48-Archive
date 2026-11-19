import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';

interface YouTubeThumbnailProps {
  youtubeId?: string;
  title: string;
  indexLabel?: string;
  playLabel?: string;
  badgeSize?: 'md' | 'lg';
}

export function YouTubeThumbnail({
  youtubeId,
  title,
  indexLabel,
  playLabel,
  badgeSize = 'md',
}: YouTubeThumbnailProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [youtubeId]);

  const thumbUrl = youtubeId
    ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
    : '';
  const showThumb = Boolean(thumbUrl) && !failed;

  return (
    <div className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#193012] via-[#13240e] to-[#0a1407]">
      {showThumb && (
        <>
          <img
            src={thumbUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/35 transition-opacity group-hover:opacity-85"
          />
        </>
      )}

      {indexLabel && (
        <span className="font-mono-num pointer-events-none absolute top-3 left-3 z-10 text-[11px] font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
          {indexLabel}
        </span>
      )}

      <div
        className={`relative z-10 flex items-center justify-center rounded-full bg-[#6fd43a] text-[#0a1407] shadow-lg transition-transform duration-150 group-hover:scale-105 ${
          badgeSize === 'lg' ? 'h-14 w-14' : 'h-12 w-12'
        }`}
      >
        <Play
          className={
            badgeSize === 'lg'
              ? 'ml-0.5 h-6 w-6 fill-current'
              : 'ml-0.5 h-5 w-5 fill-current'
          }
          aria-hidden="true"
        />
      </div>

      {playLabel && (
        <span className="relative z-10 mt-3 text-xs font-semibold uppercase tracking-wider text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
          {playLabel}
        </span>
      )}
    </div>
  );
}
