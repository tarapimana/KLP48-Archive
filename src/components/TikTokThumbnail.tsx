import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TikTokThumbnailProps {
  thumbnail?: string;
  title: string;
  indexLabel?: string;
}

export function TikTokThumbnail({
  thumbnail,
  title,
  indexLabel,
}: TikTokThumbnailProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [thumbnail]);

  const showThumb = Boolean(thumbnail) && !failed;

  return (
    <div className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#122625] via-[#101e1d] to-[#091211]">
      {showThumb && (
        <>
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
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

      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/55 text-white shadow-lg backdrop-blur-xs transition-transform duration-150 group-hover:scale-105 group-hover:bg-[#6fd43a] group-hover:text-[#0a1407] group-hover:border-transparent">
        <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
      </div>
    </div>
  );
}
