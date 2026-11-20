import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import { Lang, TRANSLATIONS } from '../i18n/translations';

interface BackgroundVideoProps {
  lang: Lang;
  isVideoOnly: boolean;
  onToggleVideoOnly: () => void;
}

export function BackgroundVideo({
  lang,
  isVideoOnly,
  onToggleVideoOnly,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const manuallyEnabledRef = useRef(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [manuallyEnabled, setManuallyEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
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

  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted) {
      void audio.play().catch(() => {
        audio.muted = true;
        setIsMuted(true);
      });
    }
  };

  const t = TRANSLATIONS[lang];
  const playLabel = lang === 'en' ? 'Play background video' : 'Mainkan video latar';

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/klp48-background-music.m4a"
        preload="none"
        muted={isMuted}
        loop
        aria-hidden="true"
      />
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
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSound}
          aria-label={isMuted ? t.video_sound_on : t.video_sound_off}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-black/85 px-4 text-sm font-semibold text-white shadow-xl backdrop-blur-sm transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {isMuted ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
          <span>{isMuted ? t.video_sound_on : t.video_sound_off}</span>
        </button>
        <button
          type="button"
          onClick={onToggleVideoOnly}
          aria-label={isVideoOnly ? t.show_content : t.video_only}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-black/85 px-4 text-sm font-semibold text-white shadow-xl backdrop-blur-sm transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {isVideoOnly ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
          <span>{isVideoOnly ? t.show_content : t.video_only}</span>
        </button>
      </div>
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
