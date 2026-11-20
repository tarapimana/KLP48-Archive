import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Eye, EyeOff, MoreVertical } from 'lucide-react';
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
  const [controlsOpen, setControlsOpen] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const controlsButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    const syncAudioToVideo = () => {
      if (audio.muted || audio.paused || !Number.isFinite(audio.duration)) return;

      const targetTime = video.currentTime % audio.duration;
      if (Math.abs(audio.currentTime - targetTime) > 0.35) {
        audio.currentTime = targetTime;
      }
    };

    video.addEventListener('timeupdate', syncAudioToVideo);
    video.addEventListener('seeking', syncAudioToVideo);

    return () => {
      video.removeEventListener('timeupdate', syncAudioToVideo);
      video.removeEventListener('seeking', syncAudioToVideo);
    };
  }, []);

  useEffect(() => {
    if (!controlsOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!controlsRef.current?.contains(event.target as Node)) {
        setControlsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setControlsOpen(false);
      controlsButtonRef.current?.focus();
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [controlsOpen]);

  const enablePlayback = () => {
    manuallyEnabledRef.current = true;
    setManuallyEnabled(true);
    setNeedsPlay(false);

    const video = videoRef.current;
    if (video) void video.play().catch(() => setNeedsPlay(true));
  };

  const toggleSound = () => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;

    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);

    if (nextMuted) {
      audio.pause();
      return;
    }

    if (video && Number.isFinite(video.currentTime)) {
      const targetTime = Number.isFinite(audio.duration) && audio.duration > 0
        ? video.currentTime % audio.duration
        : video.currentTime;
      audio.currentTime = targetTime;
    }

    void audio.play().catch(() => {
      audio.pause();
      audio.muted = true;
      setIsMuted(true);
    });
  };

  const t = TRANSLATIONS[lang];
  const playLabel = lang === 'en' ? 'Play background video' : 'Mainkan video latar';

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/klp48-background-music.m4a"
        preload="metadata"
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
      <div ref={controlsRef} className="fixed bottom-4 right-4 z-50">
        <button
          ref={controlsButtonRef}
          type="button"
          onClick={() => setControlsOpen((open) => !open)}
          aria-label={t.video_controls}
          aria-expanded={controlsOpen}
          aria-controls="background-video-controls"
          className="inline-flex size-11 items-center justify-center rounded-full border border-[#278500] bg-[#278500] text-white shadow-lg backdrop-blur-md transition-colors hover:border-[#206e00] hover:bg-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#6fd43a] dark:bg-[#6fd43a] dark:text-[#0a1407] dark:hover:border-[#82df52] dark:hover:bg-[#82df52] dark:focus-visible:outline-[#6fd43a]"
        >
          <MoreVertical className="size-5" aria-hidden="true" />
        </button>
        <div
          id="background-video-controls"
          role="group"
          aria-label={t.video_controls}
          hidden={!controlsOpen}
          className="absolute bottom-[calc(100%+0.5rem)] right-0 flex w-64 flex-col gap-1.5 rounded-2xl border border-[#278500]/35 bg-[#e3f2da]/98 p-2 shadow-2xl backdrop-blur-xl dark:border-[#6fd43a]/40 dark:bg-[#18300f]/98"
        >
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={!isMuted}
            className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#cbdcc3] bg-[#f6faf4] px-3 text-sm font-semibold text-[#131f10] transition-colors hover:border-[#278500]/45 hover:bg-[#edf5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#33502a] dark:bg-[#1d3314] dark:text-[#ecf4e8] dark:hover:border-[#6fd43a]/50 dark:hover:bg-[#28481d] dark:focus-visible:outline-[#6fd43a]"
          >
            <span className="inline-flex min-w-0 items-center gap-3">
              {isMuted ? <Volume2 className="size-4 shrink-0" aria-hidden="true" /> : <VolumeX className="size-4 shrink-0" aria-hidden="true" />}
              <span>{isMuted ? t.video_sound_on : t.video_sound_off}</span>
            </span>
            <span
              data-active={!isMuted}
              aria-hidden="true"
              className="relative h-5 w-9 shrink-0 rounded-full bg-[#c3d8b9] transition-colors data-[active=true]:bg-[#278500] dark:bg-[#425d37] dark:data-[active=true]:bg-[#6fd43a]"
            >
              <span
                data-active={!isMuted}
                className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform data-[active=true]:translate-x-4 dark:bg-[#b7cbae] dark:data-[active=true]:bg-[#0a1407]"
              />
            </span>
          </button>
          <button
            type="button"
            onClick={onToggleVideoOnly}
            aria-pressed={isVideoOnly}
            className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#cbdcc3] bg-[#f6faf4] px-3 text-sm font-semibold text-[#131f10] transition-colors hover:border-[#278500]/45 hover:bg-[#edf5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#33502a] dark:bg-[#1d3314] dark:text-[#ecf4e8] dark:hover:border-[#6fd43a]/50 dark:hover:bg-[#28481d] dark:focus-visible:outline-[#6fd43a]"
          >
            <span className="inline-flex min-w-0 items-center gap-3">
              {isVideoOnly ? <Eye className="size-4 shrink-0" aria-hidden="true" /> : <EyeOff className="size-4 shrink-0" aria-hidden="true" />}
              <span>{isVideoOnly ? t.show_content : t.video_only}</span>
            </span>
            <span
              data-active={isVideoOnly}
              aria-hidden="true"
              className="relative h-5 w-9 shrink-0 rounded-full bg-[#c3d8b9] transition-colors data-[active=true]:bg-[#278500] dark:bg-[#425d37] dark:data-[active=true]:bg-[#6fd43a]"
            >
              <span
                data-active={isVideoOnly}
                className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform data-[active=true]:translate-x-4 dark:bg-[#b7cbae] dark:data-[active=true]:bg-[#0a1407]"
              />
            </span>
          </button>
        </div>
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
