import { useEffect, useRef, useState } from 'react';
import { Lang } from '../i18n/translations';

interface BackgroundVideoProps {
  lang: Lang;
}

export function BackgroundVideo({ lang }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const manuallyEnabledRef = useRef(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [manuallyEnabled, setManuallyEnabled] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPlayback = () => {
      const shouldReduceMotion = motionPreference.matches;
      setPrefersReducedMotion(shouldReduceMotion);

      if (shouldReduceMotion && !manuallyEnabledRef.current) {
        video.pause();
        setNeedsPlay(true);
        return;
      }

      void video.play().catch(() => setNeedsPlay(true));
    };
    const showPlayFallback = () => setNeedsPlay(true);
    const hidePlayFallback = () => setNeedsPlay(false);

    motionPreference.addEventListener('change', syncPlayback);
    video.addEventListener('error', showPlayFallback);
    video.addEventListener('playing', hidePlayFallback);
    syncPlayback();

    return () => {
      motionPreference.removeEventListener('change', syncPlayback);
      video.removeEventListener('error', showPlayFallback);
      video.removeEventListener('playing', hidePlayFallback);
    };
  }, []);

  const enablePlayback = () => {
    manuallyEnabledRef.current = true;
    setManuallyEnabled(true);
    setNeedsPlay(false);

    const video = videoRef.current;
    if (video) void video.play().catch(() => setNeedsPlay(true));
  };

  const playLabel = lang === 'en' ? 'Play background video' : 'Mainkan video latar';

  return (
    <>
      <video
        ref={videoRef}
        src="/video/bg-loop.mp4?v=1080p"
        poster="/video/bg-poster.jpg"
        preload="metadata"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-0 h-full w-full object-cover ${
          prefersReducedMotion && !manuallyEnabled ? 'hidden' : ''
        }`}
      />
      {needsPlay && (
        <button
          type="button"
          onClick={enablePlayback}
          className="fixed bottom-4 left-4 z-20 inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-black/75 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {playLabel}
        </button>
      )}
    </>
  );
}
