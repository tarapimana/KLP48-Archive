import { ArrowRight, Clock, ExternalLink, MapPin, Music, Users } from 'lucide-react';
import { useState } from 'react';
import {
  getMemberCategory,
  MemberItem,
  MEMBERS_DATA,
  NEWS_DATA,
  NewsItem,
  RELEASES,
  RouteKey,
  VideoItem,
  VIDEOS,
} from '../data/klp48Data';
import { useScheduleEvents } from '../context/useScheduleEvents';
import {
  Lang,
  MONTHS_EN,
  MONTHS_MS,
  MONTHS_SHORT_EN,
  MONTHS_SHORT_MS,
  TRANSLATIONS,
  WEEKDAYS_EN,
  WEEKDAYS_MS,
} from '../i18n/translations';
import { BirthdayCountdown } from './BirthdayCountdown';
import { MemberModal } from './MemberModal';
import { NewsModal } from './NewsModal';
import { TikTokThumbnail } from './TikTokThumbnail';
import { YouTubeThumbnail } from './YouTubeThumbnail';

interface HomeViewProps {
  lang: Lang;
  onNavigate: (route: RouteKey) => void;
  onPlayVideo: (video: VideoItem) => void;
}

export function HomeView({ lang, onNavigate, onPlayVideo }: HomeViewProps) {
  const t = TRANSLATIONS[lang];
  const months = lang === 'en' ? MONTHS_EN : MONTHS_MS;
  const shortMonths = lang === 'en' ? MONTHS_SHORT_EN : MONTHS_SHORT_MS;
  const weekdays = lang === 'en' ? WEEKDAYS_EN : WEEKDAYS_MS;
  const { events } = useScheduleEvents();
  const now = new Date();
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const selectedMemberIdx = selectedMember
    ? MEMBERS_DATA.findIndex((m) => m.nama === selectedMember.nama)
    : 0;

  const activeMembersCount = MEMBERS_DATA.filter(
    (m) => getMemberCategory(m.status) === 'aktif'
  ).length;

  const upcomingEvents = events.filter((ev) => {
    const endOfDay = new Date(
      ev.endDate.getFullYear(),
      ev.endDate.getMonth(),
      ev.endDate.getDate(),
      23,
      59
    );
    return endOfDay >= now;
  });

  const nextEvents = upcomingEvents.slice(0, 3);
  const featuredVideos = VIDEOS.slice(0, 4);

  const formatEventDateRange = (start: Date, end: Date) => {
    if (end.getTime() > start.getTime()) {
      return `${start.getDate()}~${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
    }
    return `${start.getDate()} ${months[start.getMonth()]} ${start.getFullYear()}`;
  };

  const cardSurface =
    'rounded-2xl border border-[#d5e2cf] bg-white/88 backdrop-blur-md transition-colors dark:border-[#253c1e] dark:bg-[#0e190b]/80';

  return (
    <div className="space-y-10 pt-2">
      {/* Main 2-Column Editorial Grid */}
      <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        {/* LEFT COLUMN: Hero + Stats + Latest News + Discography */}
        <div className="space-y-9 lg:col-span-7">
          {/* Hero Banner */}
          <section>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#278500] dark:text-[#6fd43a]">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#278500] dark:bg-[#66c91a]"
                aria-hidden="true"
              />
              <span>{t.h_eb}</span>
            </div>

            <h1 className="font-display mt-3 text-balance text-5xl font-black tracking-tight text-[#131f10] sm:text-6xl dark:text-white">
              Arkib <span className="text-[#278500] dark:text-[#66c91a]">KLP48</span>
            </h1>

            <p className="mt-3 max-w-xl text-base leading-relaxed text-[#2b3b25] dark:text-[#c7d7c0]">
              {t.h_sub}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#jadwal"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('jadwal');
                }}
                className="inline-flex min-h-[42px] items-center rounded-full bg-[#278500] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#206e00] dark:bg-[#66c91a] dark:text-[#0b1608] dark:hover:bg-[#7ad92e]"
              >
                {t.h_b1}
              </a>
              <a
                href="#member"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('member');
                }}
                className="inline-flex min-h-[42px] items-center rounded-full border border-[#278500] bg-white/75 px-6 py-2.5 text-sm font-bold text-[#278500] backdrop-blur-xs transition-colors hover:bg-[#edf5e9] dark:border-[#66c91a]/75 dark:bg-[#0e190b]/60 dark:text-[#6fd43a] dark:hover:border-[#66c91a] dark:hover:bg-[#162712]"
              >
                {t.h_b2}
              </a>
            </div>
          </section>

          {/* 3-Column Quantitative Strip */}
          <section aria-label="Archive summary">
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => onNavigate('member')}
                className={`${cardSurface} p-4 text-center hover:border-[#278500] sm:p-5 dark:hover:border-[#66c91a]`}
              >
                <div className="font-mono-num text-3xl font-bold text-[#278500] sm:text-4xl dark:text-[#66c91a]">
                  {activeMembersCount}
                </div>
                <div className="mt-1 text-xs font-medium text-[#52634c] dark:text-[#a8bc9f]">
                  {t.s_mem}
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('jadwal')}
                className={`${cardSurface} p-4 text-center hover:border-[#278500] sm:p-5 dark:hover:border-[#66c91a]`}
              >
                <div className="font-mono-num text-3xl font-bold text-[#278500] sm:text-4xl dark:text-[#66c91a]">
                  {upcomingEvents.length}
                </div>
                <div className="mt-1 text-xs font-medium text-[#52634c] dark:text-[#a8bc9f]">
                  {t.s_up}
                </div>
              </button>

              <div className={`${cardSurface} p-4 text-center sm:p-5`}>
                <div className="font-mono-num text-3xl font-bold text-[#278500] sm:text-4xl dark:text-[#66c91a]">
                  {VIDEOS.length}
                </div>
                <div className="mt-1 text-xs font-medium text-[#52634c] dark:text-[#a8bc9f]">
                  {t.n_video}
                </div>
              </div>
            </div>
          </section>

          {/* Latest News Stacked Cards */}
          <section>
            <div className="mb-3.5 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-lg font-extrabold tracking-tight text-[#131f10] sm:text-xl dark:text-white">
                {t.latest}
              </h2>
              <a
                href="#berita"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('berita');
                }}
                className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-bold text-[#131f10] hover:text-[#278500] sm:text-sm dark:text-[#ecf4e8] dark:hover:text-[#66c91a]"
              >
                <span>{t.alln}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            <div className="space-y-3">
              {NEWS_DATA.slice(0, 5).map((item) => (
                <button
                  key={item.pautan}
                  type="button"
                  onClick={() => setSelectedNews(item)}
                  aria-haspopup="dialog"
                  className={`${cardSurface} group block w-full px-5 py-4 text-left transition-colors hover:border-[#278500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#278500] dark:hover:border-[#66c91a] dark:focus-visible:ring-[#66c91a]`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="rounded-md bg-[#e3f2da] px-2 py-0.5 font-semibold text-[#278500] dark:bg-[#193012] dark:text-[#6fd43a]">
                      {item.kategori}
                    </span>
                    <span className="font-mono-num text-[#52634c] dark:text-[#98ad90]">
                      {item.tarikh}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold leading-snug text-[#131f10] transition-colors group-hover:text-[#278500] sm:text-base dark:text-white dark:group-hover:text-[#66c91a]">
                    {item.tajuk}
                  </h3>
                </button>
              ))}
            </div>
          </section>

          {/* Discography Grid */}
          <section>
            <div className="mb-3.5">
              <h2 className="font-display text-lg font-extrabold tracking-tight text-[#131f10] sm:text-xl dark:text-white">
                {t.n_release}
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {RELEASES.map((rel) => (
                <div key={rel.title} className={`${cardSurface} p-4 sm:p-5`}>
                  {rel.artworkUrl ? (
                    <img
                      src={rel.artworkUrl}
                      alt={`${rel.title} cover art`}
                      loading="lazy"
                      decoding="async"
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f2da] text-[#278500] dark:bg-[#193012] dark:text-[#6fd43a]">
                      <Music className="h-4 w-4" aria-hidden="true" />
                    </div>
                  )}
                  <div className="mt-4">
                    <h3 className="font-display text-base font-bold text-[#131f10] dark:text-white">
                      {rel.title}
                    </h3>
                    <div className="font-mono-num mt-0.5 text-xs text-[#52634c] dark:text-[#98ad90]">
                      {rel.type} · {rel.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Next Event Stack + Birthdays */}
        <div className="space-y-7 lg:col-span-5">
          {/* Next Event Stack */}
          <section>
            <div className="mb-3.5 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-lg font-extrabold tracking-tight text-[#131f10] sm:text-xl dark:text-white">
                {t.nextev}
              </h2>
              <a
                href="#jadwal"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('jadwal');
                }}
                className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-bold text-[#131f10] hover:text-[#278500] sm:text-sm dark:text-[#ecf4e8] dark:hover:text-[#66c91a]"
              >
                <span>{t.alls}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            {nextEvents.length > 0 ? (
              <div className="space-y-3">
                {nextEvents.map((ev) => {
                  const title = lang === 'en' && ev.titleEn ? ev.titleEn : ev.title;
                  const venue = lang === 'en' && ev.venueEn ? ev.venueEn : ev.venue;
                  const notes = lang === 'en' && ev.notesEn ? ev.notesEn : ev.notes;
                  const eventTime = lang === 'en' && ev.timeEn ? ev.timeEn : ev.time;
                  const dateNumber = ev.startDate.getTime() === ev.endDate.getTime()
                    ? String(ev.startDate.getDate())
                    : `${ev.startDate.getDate()}–${ev.endDate.getDate()}`;
                  const dateTime = [
                    ev.startDate.getFullYear(),
                    String(ev.startDate.getMonth() + 1).padStart(2, '0'),
                    String(ev.startDate.getDate()).padStart(2, '0'),
                  ].join('-');

                  return (
                    <article
                      key={ev.id}
                      className="grid grid-cols-[72px_minmax(0,1fr)] gap-3.5 rounded-2xl border border-[#d5e2cf] bg-white/88 p-4 backdrop-blur-md transition-colors hover:border-[#278500] sm:gap-4 sm:p-5 dark:border-[#2b4522] dark:bg-[#10200e]/90 dark:hover:border-[#6fd43a]"
                    >
                      <time
                        dateTime={dateTime}
                        aria-label={formatEventDateRange(ev.startDate, ev.endDate)}
                        className="flex flex-col items-start border-r border-[#d5e2cf] pr-4 pt-0.5 text-[10px] font-bold leading-tight text-[#52634c] dark:border-[#2b4522] dark:text-[#a8bc9f]"
                      >
                        <span className="font-mono-num text-3xl leading-none text-[#278500] dark:text-[#6fd43a]">
                          {dateNumber}
                        </span>
                        <span className="mt-1">
                          {shortMonths[ev.startDate.getMonth()]} {ev.startDate.getFullYear()}
                        </span>
                        <span className="mt-0.5 text-[#278500] dark:text-[#6fd43a]">
                          {weekdays[ev.startDate.getDay()]}
                        </span>
                      </time>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-[#278500] dark:text-[#6fd43a]">
                            {ev.type === 'show' ? t.t_show : t.t_event}
                          </span>
                          {ev.exclusive && (
                            <span className="font-semibold text-[#52634c] dark:text-[#98ad90]">
                              · {t.exclusive}
                            </span>
                          )}
                        </div>

                        <h3 className="font-display mt-1.5 text-base font-bold leading-snug text-[#131f10] dark:text-white">
                          <a
                            href="#jadwal"
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate('jadwal');
                            }}
                            className="transition-colors hover:text-[#278500] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:hover:text-[#6fd43a] dark:focus-visible:outline-[#6fd43a]"
                          >
                            {title}
                          </a>
                        </h3>

                        <div className="mt-2.5 space-y-1.5 text-[13px] leading-snug text-[#52634c] dark:text-[#c7d7c0]">
                          <p className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#278500] dark:text-[#6fd43a]" aria-hidden="true" />
                            <span>{venue}</span>
                          </p>
                          {eventTime && (
                            <p className="flex items-start gap-2">
                              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#278500] dark:text-[#6fd43a]" aria-hidden="true" />
                              <span className="font-mono-num">{eventTime}</span>
                            </p>
                          )}
                          {ev.members && (
                            <p className="flex items-start gap-2">
                              <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#278500] dark:text-[#6fd43a]" aria-hidden="true" />
                              <span>{ev.members}</span>
                            </p>
                          )}
                          {notes && <p className="pl-[1.375rem]">{notes}</p>}
                        </div>

                        {ev.link && (
                          <a
                            href={ev.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex min-h-8 items-center gap-1.5 rounded-md text-sm font-bold text-[#278500] transition-colors hover:text-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:text-[#6fd43a] dark:hover:text-[#82df52] dark:focus-visible:outline-[#6fd43a]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{lang === 'en' ? 'Event link' : 'Pautan acara'}</span>
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={`${cardSurface} p-6 text-sm text-[#52634c] dark:text-[#98ad90]`}>
                {t.noup}
              </div>
            )}
          </section>

          <div className="border-t border-[#d5e2cf] dark:border-[#253c1e]" />

          {/* Birthdays Section */}
          <section>
            <div className="mb-3.5 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-lg font-extrabold tracking-tight text-[#131f10] sm:text-xl dark:text-white">
                {t.n_bd}
              </h2>
              <a
                href="#bday"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('bday');
                }}
                className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-bold text-[#131f10] hover:text-[#278500] sm:text-sm dark:text-[#ecf4e8] dark:hover:text-[#66c91a]"
              >
                <span>{t.bd_all_link}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
            <BirthdayCountdown
              lang={lang}
              compact
              onSelectMember={(member) => setSelectedMember(member)}
            />
          </section>
        </div>
      </div>

      {/* Featured Videos Row */}
      <section className="border-t border-[#d5e2cf] pt-8 dark:border-[#253c1e]">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-lg font-extrabold tracking-tight text-[#131f10] sm:text-xl dark:text-white">
            {t.n_video}
          </h2>
          <a
            href="#video"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('video');
            }}
            className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-bold text-[#131f10] hover:text-[#278500] sm:text-sm dark:text-[#ecf4e8] dark:hover:text-[#66c91a]"
          >
            <span>{t.allv}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {featuredVideos.map((vid) => {
            const isYouTube = vid.platform === 'youtube';

            return (
              <div key={vid.url} className={`${cardSurface} overflow-hidden`}>
                <button
                  type="button"
                  onClick={() => onPlayVideo(vid)}
                  className="group relative block w-full text-left"
                  aria-label={`${t.v_preview}: ${vid.title}`}
                >
                  {isYouTube ? (
                    <YouTubeThumbnail
                      youtubeId={vid.youtubeId}
                      title={vid.title}
                      playLabel={t.v_preview}
                      badgeSize="lg"
                    />
                  ) : (
                    <TikTokThumbnail thumbnail={vid.thumbnail} title={vid.title} />
                  )}
                </button>
                <div className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#278500] dark:text-[#6fd43a]">
                      {isYouTube ? 'YouTube' : 'TikTok'}
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-[#131f10] dark:text-white">
                      {vid.title}
                    </h3>
                  </div>
                  <a
                    href={vid.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-[#278500] hover:underline dark:text-[#6fd43a]"
                  >
                    <span>{isYouTube ? 'YouTube' : t.v_open_tt}</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <MemberModal
        member={selectedMember}
        indexNumber={selectedMemberIdx >= 0 ? selectedMemberIdx : 0}
        lang={lang}
        onClose={() => setSelectedMember(null)}
      />
      <NewsModal
        item={selectedNews}
        lang={lang}
        onClose={() => setSelectedNews(null)}
      />
    </div>
  );
}
