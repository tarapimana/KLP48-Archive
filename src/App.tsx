/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AdminAuthModal } from './components/AdminAuthModal';
import { BirthdaysView } from './components/BirthdaysView';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { LiveView } from './components/LiveView';
import { MembersView } from './components/MembersView';
import { NewsView } from './components/NewsView';
import { ScheduleView } from './components/ScheduleView';
import { UtilityBar } from './components/UtilityBar';
import { VideoModal } from './components/VideoModal';
import { VideosView } from './components/VideosView';
import { AuthProvider } from './context/AuthContext';
import { RouteKey, VideoItem } from './data/klp48Data';
import { Lang } from './i18n/translations';

const VALID_ROUTES: RouteKey[] = [
  'home',
  'live',
  'jadwal',
  'member',
  'berita',
  'bday',
  'video',
];

function getRouteFromHash(): RouteKey {
  const hash = window.location.hash.slice(1) as RouteKey;
  return VALID_ROUTES.includes(hash) ? hash : 'home';
}

function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'ms') return saved;
    if ((navigator.language || '').slice(0, 2) === 'en') return 'en';
  } catch {
    // ignore storage errors
  }
  return 'ms';
}

function getInitialTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // ignore storage errors
  }
  return 'dark';
}

export default function App() {
  const [route, setRoute] = useState<RouteKey>(getRouteFromHash);
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRouteFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('lang', lang);
    } catch {
      // ignore storage errors
    }
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const navigate = (nextRoute: RouteKey) => {
    if (window.location.hash.slice(1) !== nextRoute) {
      window.location.hash = nextRoute;
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLang = () => setLang((prev) => (prev === 'ms' ? 'en' : 'ms'));
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <AuthProvider>
      <div className="relative min-h-screen text-[#131f10] transition-colors duration-150 dark:text-[#ecf4e8]">
        {/* Whole-page Video Background */}
        <video
          src="/video/bg-loop.mp4?v=1080p"
          poster="/video/bg-poster.jpg"
          preload="auto"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover motion-reduce:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-[#f6faf4]/82 transition-colors duration-150 dark:bg-[#0a1407]/72"
        />

        <div className="relative z-10 flex min-h-screen flex-col">
          <Header
            route={route}
            onNavigate={navigate}
            lang={lang}
            onToggleLang={toggleLang}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-8 sm:px-6">
            <UtilityBar
              lang={lang}
              onChangeLang={setLang}
              theme={theme}
              onToggleTheme={toggleTheme}
            />

            {route === 'home' && (
              <HomeView
                lang={lang}
                onNavigate={navigate}
                onPlayVideo={(vid) => setActiveVideo(vid)}
              />
            )}
            {route === 'jadwal' && <ScheduleView lang={lang} />}
            {route === 'member' && <MembersView lang={lang} />}
            {route === 'berita' && <NewsView lang={lang} />}
            {route === 'bday' && <BirthdaysView lang={lang} />}
            {route === 'video' && (
              <VideosView lang={lang} onPlayVideo={(vid) => setActiveVideo(vid)} />
            )}
            {route === 'live' && (
              <LiveView lang={lang} onPlayVideo={(vid) => setActiveVideo(vid)} />
            )}
          </main>

          <Footer lang={lang} onNavigate={navigate} />
        </div>

        <VideoModal
          video={activeVideo}
          lang={lang}
          onClose={() => setActiveVideo(null)}
        />

        <AdminAuthModal lang={lang} />
      </div>
    </AuthProvider>
  );
}
