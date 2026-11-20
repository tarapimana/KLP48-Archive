import { ArrowRight, Clock, MapPin, Music, Play, UsersRound } from 'lucide-react';
import { useState } from 'react';
import {
  getMemberCategory,
  MemberItem,
  MEMBERS_DATA,
  NEWS_DATA,
  NewsItem,
  parseEventMemberNames,
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
import { formatScheduleTime } from '../lib/scheduleTime';
import { BirthdayCountdown } from './BirthdayCountdown';
import { MemberAvatar } from './MemberAvatar';
import { MemberModal } from './MemberModal';
import { NewsModal } from './NewsModal';
import { TikTokThumbnail } from './TikTokThumbnail';
import { YouTubeThumbnail } from './YouTubeThumbnail';

interface HomeViewProps {
  lang: Lang;
  onNavigate: (route: RouteKey) => void;
  onPlayVideo: (video: VideoItem) => void;
}

const MEMBER_LOOKUP = new Map(
  MEMBERS_DATA.map((member, index) => [member.nama.trim().toLowerCase(), { member, index }])
);

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

  const nextEvents = upcomingEvents.slice(0, 4);
  const featuredVideos = VIDEOS.slice(0, 6);

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
        {/* LEFT COLUMN: Hero + Stats + Latest News + Discography + Videos */}
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
                href="#member"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('member');
                }}
                className="inline-flex min-h-[42px] items-center rounded-full border border-[#278500] bg-white/75 px-6 py-2.5 text-sm font-bold text-[#278500] backdrop-blur-xs transition-colors hover:bg-[#edf5e9] dark:border-[#66c91a]/75 dark:bg-[#0e190b]/60 dark:text-[#6fd43a] dark:hover:border-[#66c91a] dark:hover:bg-[#162712]"
              >
                {t.h_b2}
              </a>
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
                href="#video"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('video');
                }}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-[#278500] bg-white/75 px-6 py-2.5 text-sm font-bold text-[#278500] backdrop-blur-xs transition-colors hover:bg-[#edf5e9] dark:border-[#66c91a]/75 dark:bg-[#0e190b]/60 dark:text-[#6fd43a] dark:hover:border-[#66c91a] dark:hover:bg-[#162712]"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                {t.n_video}
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

              <button
                type="button"
                onClick={() => onNavigate('video')}
                className={`${cardSurface} w-full cursor-pointer p-4 text-center hover:border-[#278500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#278500] focus-visible:ring-offset-2 sm:p-5 dark:hover:border-[#66c91a] dark:focus-visible:ring-[#66c91a] dark:focus-visible:ring-offset-[#0a1407]`}
              >
                <div className="font-mono-num text-3xl font-bold text-[#278500] sm:text-4xl dark:text-[#66c91a]">
                  {VIDEOS.length}
                </div>
                <div className="mt-1 text-xs font-medium text-[#52634c] dark:text-[#a8bc9f]">
                  {t.n_video}
                </div>
              </button>
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

          {/* Discography */}
          <section>
            <div className="mb-3.5">
              <h2 className="font-display text-lg font-extrabold tracking-tight text-[#131f10] sm:text-xl dark:text-white">
                {t.n_release}
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {RELEASES.map((rel) => {
                const video = rel.video;
                const cardContent = (
                  <>
                    <div className="flex items-start justify-between gap-3">
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
                      {rel.video && (
                        <span
                          className="inline-flex size-8 items-center justify-center rounded-full bg-[#e3f2da] text-[#278500] dark:bg-[#193012] dark:text-[#6fd43a]"
                          aria-hidden="true"
                        >
                          <Play className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                    <div className="mt-4">
                      <h3 className="font-display text-base font-bold text-[#131f10] dark:text-white">
                        {rel.title}
                      </h3>
                      {(rel.type || rel.date) && (
                        <div className="font-mono-num mt-0.5 text-xs text-[#52634c] dark:text-[#98ad90]">
                          {rel.type && rel.date ? `${rel.type} · ${rel.date}` : rel.type || rel.date}
                        </div>
                      )}
                    </div>
                  </>
                );

                return video ? (
                  <button
                    key={rel.title}
                    type="button"
                    onClick={() => onPlayVideo(video)}
                    aria-label={`${t.v_preview}: ${rel.title}`}
                    className={`${cardSurface} block w-full cursor-pointer p-4 text-left transition-colors hover:border-[#278500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#278500] focus-visible:ring-offset-2 sm:p-5 dark:hover:border-[#66c91a] dark:focus-visible:ring-[#66c91a] dark:focus-visible:ring-offset-[#0a1407]`}
                  >
                    {cardContent}
                  </button>
                ) : (
                  <div key={rel.title} className={`${cardSurface} p-4 sm:p-5`}>
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Videos */}
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

                    </div>
                  </div>
                );
              })}
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
                className="inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-xs font-bold text-[#131f10] hover:text-[#278500] sm:text-sm dark:text-[#ecf4e8] dark:hover:text-[#66c91a]"
              >
                <span>{t.alls}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            {nextEvents.length > 0 ? (
              <div className="space-y-3">
                {nextEvents.map((ev, index) => {
                  const title = lang === 'en' && ev.titleEn ? ev.titleEn : ev.title;
                  const venue = lang === 'en' && ev.venueEn ? ev.venueEn : ev.venue;
                  const VenueIcon = /fan\s*club/i.test(venue) ? UsersRound : MapPin;
                  const notes = lang === 'en' && ev.notesEn ? ev.notesEn : ev.notes;
                  const eventTime = lang === 'en' && ev.timeEn ? ev.timeEn : ev.time;
                  const members = ev.members || '';
                  const isBirthdayEvent = /birthday/i.test(ev.title);
                  const isRange = ev.endDate.getTime() > ev.startDate.getTime();
                  const dateNumber = isRange
                    ? `${String(ev.startDate.getDate()).padStart(2, '0')}~${String(ev.endDate.getDate()).padStart(2, '0')}`
                    : String(ev.startDate.getDate()).padStart(2, '0');
                  const dateTime = [
                    ev.startDate.getFullYear(),
                    String(ev.startDate.getMonth() + 1).padStart(2, '0'),
                    String(ev.startDate.getDate()).padStart(2, '0'),
                  ].join('-');
                  const participants = parseEventMemberNames(members)
                    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
                    .map((name) => ({
                      name,
                      profile: MEMBER_LOOKUP.get(name.toLowerCase()),
                    }));

                  return (
                    <article
                      key={ev.id}
                      className={`rounded-2xl border p-5 backdrop-blur-md transition-colors ${
                        index === 0
                          ? 'border-[#278500] bg-white shadow-sm dark:border-[#66c91a] dark:bg-[#11200d]'
                          : 'border-[#c8dcc0] bg-white/96 dark:border-[#2b4523] dark:bg-[#101c0d]/95'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          <time
                            dateTime={dateTime}
                            aria-label={formatEventDateRange(ev.startDate, ev.endDate)}
                            className="flex shrink-0 flex-col items-start border-r border-[#e3ecde] pr-4 dark:border-[#24371f]"
                          >
                            <span
                              className={`font-mono-num font-extrabold leading-none tracking-tight ${
                                isRange ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                              } text-[#278500] dark:text-[#7ce043]`}
                            >
                              {dateNumber}
                            </span>
                            <span className="font-mono-num mt-1.5 text-[11px] font-semibold leading-snug text-[#4d5e47] dark:text-[#c7d7c0]">
                              {shortMonths[ev.startDate.getMonth()]} {ev.startDate.getFullYear()}
                            </span>
                            <span className="font-mono-num text-[11px] font-bold text-[#278500] dark:text-[#7ce043]">
                              {weekdays[ev.startDate.getDay()]}
                            </span>
                          </time>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                              <span className="font-bold text-[#278500] dark:text-[#7ce043]">
                                {ev.type === 'show' ? t.t_show : t.t_event}
                              </span>
                              {ev.exclusive && (
                                <>
                                  <span aria-hidden="true" className="text-[#8da087]">·</span>
                                  <span className="font-bold text-[#131f10] dark:text-white">
                                    {t.exclusive}
                                  </span>
                                </>
                              )}
                              {isBirthdayEvent && (
                                <>
                                  <span aria-hidden="true" className="text-[#8da087]">·</span>
                                  <span className="font-bold text-amber-700 dark:text-amber-300">
                                    {t.birthday_tag}
                                  </span>
                                </>
                              )}
                              {index === 0 && (
                                <>
                                  <span aria-hidden="true" className="text-[#8da087]">·</span>
                                  <span className="font-bold text-[#278500] dark:text-[#7ce043]">
                                    {t.upcoming_badge}
                                  </span>
                                </>
                              )}
                            </div>

                            <h3 className="font-display mt-1 text-base font-bold leading-snug text-[#131f10] sm:text-lg dark:text-white">
                              <a
                                href="#jadwal"
                                onClick={(e) => {
                                  e.preventDefault();
                                  onNavigate('jadwal');
                                }}
                                className="inline-block min-h-11 align-middle transition-colors hover:text-[#278500] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:hover:text-[#6fd43a] dark:focus-visible:outline-[#6fd43a]"
                              >
                                {title}
                              </a>
                            </h3>

                            <div className="mt-2 space-y-1 text-xs leading-relaxed text-[#3f503a] sm:text-sm dark:text-[#c7d7c0]">
                              <div className="flex items-start gap-1.5">
                                <VenueIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#278500] dark:text-[#7ce043]" aria-hidden="true" />
                                <span>{venue}</span>
                              </div>
                              {eventTime && (
                                <div className="flex items-start gap-1.5">
                                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#278500] dark:text-[#7ce043]" aria-hidden="true" />
                                  <span className="font-mono-num">{formatScheduleTime(eventTime)}</span>
                                </div>
                              )}
                              {members && (
                                <div className="flex items-start gap-1.5">
                                  <UsersRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#278500] dark:text-[#7ce043]" aria-hidden="true" />
                                  <div
                                    role="group"
                                    aria-label={t.j_members}
                                    className="flex min-w-0 flex-wrap gap-1.5"
                                  >
                                    {participants.map(({ name, profile }) =>
                                      profile ? (
                                        <button
                                          key={name}
                                          type="button"
                                          aria-label={t.j_member_profile.replace('%n', name)}
                                          onClick={() => setSelectedMember(profile.member)}
                                          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#dce6d7] bg-white/80 py-1 pr-2.5 pl-1 text-xs font-semibold text-[#278500] transition-colors hover:border-[#278500] hover:bg-[#edf5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#2b4523] dark:bg-[#142111] dark:text-[#7ce043] dark:hover:border-[#6fd43a] dark:hover:bg-[#1d3314] dark:focus-visible:outline-[#6fd43a]"
                                        >
                                          <MemberAvatar
                                            member={profile.member}
                                            indexNumber={profile.index}
                                            className="h-7 w-7 shrink-0 rounded-full"
                                            initialsClassName="text-[10px]"
                                          />
                                          <span>{name}</span>
                                        </button>
                                      ) : (
                                        <span
                                          key={name}
                                          className="inline-flex min-h-10 items-center text-xs text-[#3f503a] dark:text-[#c7d7c0]"
                                        >
                                          {name}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                              {notes && <p className="leading-relaxed">{notes}</p>}
                            </div>

                            {ev.link && (
                              <a
                                href={ev.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-bold text-[#278500] transition-colors hover:text-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:text-[#6fd43a] dark:hover:text-[#82df52] dark:focus-visible:outline-[#6fd43a]"
                              >
                                <span>{t.j_link}</span>
                              </a>
                            )}
                          </div>
                        </div>
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
