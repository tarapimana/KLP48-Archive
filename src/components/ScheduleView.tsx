import { ArrowRight, Check, Clock, MapPin, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useScheduleEvents } from '../context/useScheduleEvents';
import { MEMBERS_DATA, MemberItem, parseEventMemberNames } from '../data/klp48Data';
import { formatScheduleTime } from '../lib/scheduleTime';
import { ScheduleCsvImporter } from './ScheduleCsvImporter';
import { MemberAvatar } from './MemberAvatar';
import { MemberModal } from './MemberModal';
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

interface ScheduleViewProps {
  lang: Lang;
}

type ScheduleFilter = 'all' | 'show' | 'event';

const MEMBER_LOOKUP = new Map(
  MEMBERS_DATA.map((member, index) => [member.nama.trim().toLowerCase(), { member, index }])
);

export function ScheduleView({ lang }: ScheduleViewProps) {
  const t = TRANSLATIONS[lang];
  const { events: allEvents } = useScheduleEvents();
  const now = new Date();

  const initialPeriod = useMemo(() => {
    const thisMonthEvent = allEvents.find(
      (ev) =>
        ev.startDate.getMonth() === now.getMonth() &&
        ev.startDate.getFullYear() === now.getFullYear()
    );
    const fallback = thisMonthEvent || allEvents[allEvents.length - 1];
    return {
      month: fallback ? fallback.startDate.getMonth() + 1 : now.getMonth() + 1,
      year: fallback ? fallback.startDate.getFullYear() : now.getFullYear(),
    };
  }, [allEvents]);

  const [month, setMonth] = useState<number>(initialPeriod.month);
  const [year, setYear] = useState<number>(initialPeriod.year);
  const [typeFilter, setTypeFilter] = useState<ScheduleFilter>('all');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<{
    member: MemberItem;
    index: number;
  } | null>(null);

  const months = lang === 'en' ? MONTHS_EN : MONTHS_MS;
  const shortMonths = lang === 'en' ? MONTHS_SHORT_EN : MONTHS_SHORT_MS;
  const weekdays = lang === 'en' ? WEEKDAYS_EN : WEEKDAYS_MS;

  const years = useMemo(() => {
    const set = new Set<number>([year]);
    allEvents.forEach((ev) => set.add(ev.startDate.getFullYear()));
    return Array.from(set).sort((a, b) => a - b);
  }, [allEvents, year]);

  const availableMembers = useMemo(() => {
    const names = new Map<string, string>();
    allEvents.forEach((ev) => {
      parseEventMemberNames(ev.members).forEach((name) => {
        names.set(name.toLocaleLowerCase('en'), name);
      });
    });
    return Array.from(names.values()).sort((a, b) =>
      a.localeCompare(b, 'en', { sensitivity: 'base' })
    );
  }, [allEvents]);

  const visibleMembers = useMemo(() => {
    const query = memberSearch.trim().toLocaleLowerCase('en');
    return query
      ? availableMembers.filter((name) => name.toLocaleLowerCase('en').includes(query))
      : availableMembers;
  }, [availableMembers, memberSearch]);

  const selectedMemberNames = useMemo(() => new Set(selectedMembers), [selectedMembers]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(
      (ev) =>
        ev.startDate.getMonth() + 1 === month &&
        ev.startDate.getFullYear() === year &&
        (typeFilter === 'all' || ev.type === typeFilter) &&
        (selectedMemberNames.size === 0 ||
          parseEventMemberNames(ev.members).some((name) =>
            selectedMemberNames.has(name.toLocaleLowerCase('en'))
          ))
    );
  }, [allEvents, month, year, typeFilter, selectedMemberNames]);

  const firstUpcomingIndex = useMemo(() => {
    return filteredEvents.findIndex((ev) => {
      const endOfDay = new Date(
        ev.endDate.getFullYear(),
        ev.endDate.getMonth(),
        ev.endDate.getDate(),
        23,
        59
      );
      return endOfDay >= now;
    });
  }, [filteredEvents]);

  const pad2 = (n: number) => String(n).padStart(2, '0');

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#131f10] sm:text-4xl dark:text-[#ecf4e8]">
          {t.n_jadwal}
        </h1>
        <p className="mt-1.5 text-sm text-[#3f503a] sm:text-base dark:text-[#c7d7c0]">
          {t.j_sub}
        </p>
      </header>

      <ScheduleCsvImporter lang={lang} />

      {/* Filter Toolbar */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#dce6d7] pb-6 dark:border-[#24371f]">
        <div className="flex flex-wrap gap-4">
          <div>
            <label
              htmlFor="schedule-month"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#3f503a] dark:text-[#c7d7c0]"
            >
              {t.j_m}
            </label>
            <select
              id="schedule-month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="min-h-[42px] min-w-[155px] rounded-lg border border-[#dce6d7] bg-white px-3 py-2 text-sm font-medium text-[#131f10] focus:border-[#278500] focus:outline-none dark:border-[#24371f] dark:bg-[#142111] dark:text-[#ecf4e8] dark:focus:border-[#6fd43a]"
            >
              {months.map((mName, idx) => (
                <option key={mName} value={idx + 1}>
                  {mName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="schedule-year"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#3f503a] dark:text-[#c7d7c0]"
            >
              {t.j_y}
            </label>
            <select
              id="schedule-year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="font-mono-num min-h-[42px] min-w-[110px] rounded-lg border border-[#dce6d7] bg-white px-3 py-2 text-sm font-medium text-[#131f10] focus:border-[#278500] focus:outline-none dark:border-[#24371f] dark:bg-[#142111] dark:text-[#ecf4e8] dark:focus:border-[#6fd43a]"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative z-10">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#3f503a] dark:text-[#c7d7c0]">
            {t.j_member_filter}
          </span>
          <details className="group relative">
            <summary className="flex min-h-[42px] min-w-[190px] cursor-pointer list-none items-center justify-between gap-3 rounded-lg border border-[#dce6d7] bg-white px-3 py-2 text-sm font-medium text-[#131f10] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] [&::-webkit-details-marker]:hidden dark:border-[#24371f] dark:bg-[#142111] dark:text-[#ecf4e8] dark:focus-visible:outline-[#6fd43a]">
              <span>{t.j_member_filter}</span>
              <span className="text-xs text-[#52634c] dark:text-[#b5c7ae]">
                {selectedMembers.length
                  ? t.j_member_selected.replace('%n', String(selectedMembers.length))
                  : t.j_member_all}
              </span>
            </summary>
            <div className="absolute left-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-[#dce6d7] bg-white p-2 shadow-xl dark:border-[#2b4523] dark:bg-[#142111]">
              <div className="flex items-center justify-between gap-3 px-2 py-1.5">
                <span className="text-xs font-semibold text-[#52634c] dark:text-[#b5c7ae]">
                  {t.j_member_filter}
                </span>
                {selectedMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedMembers([])}
                    className="min-h-9 rounded px-2 text-xs font-semibold text-[#278500] hover:bg-[#edf5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:text-[#7ce043] dark:hover:bg-[#1d3314] dark:focus-visible:outline-[#6fd43a]"
                  >
                    {t.j_member_clear}
                  </button>
                )}
              </div>
              <label htmlFor="schedule-member-search" className="sr-only">
                {t.j_member_search}
              </label>
              <input
                id="schedule-member-search"
                type="search"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder={t.j_member_search}
                className="min-h-10 w-full rounded-lg border border-[#dce6d7] bg-white px-3 text-sm text-[#131f10] placeholder:text-[#72816d] focus:border-[#278500] focus:outline-none dark:border-[#2b4523] dark:bg-[#101c0d] dark:text-[#ecf4e8] dark:placeholder:text-[#8ea184] dark:focus:border-[#6fd43a]"
              />
              <div className="mt-1 max-h-56 overflow-y-auto">
                {visibleMembers.length > 0 ? (
                  visibleMembers.map((name) => {
                    const key = name.toLocaleLowerCase('en');
                    return (
                      <label
                        key={key}
                        className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-2 text-sm text-[#263421] hover:bg-[#edf5e9] dark:text-[#e2eee0] dark:hover:bg-[#1d3314]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMemberNames.has(key)}
                          onChange={() =>
                            setSelectedMembers((current) =>
                              current.includes(key)
                                ? current.filter((member) => member !== key)
                                : [...current, key]
                            )
                          }
                          className="size-4 accent-[#278500] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:accent-[#6fd43a]"
                        />
                        <span>{name}</span>
                      </label>
                    );
                  })
                ) : (
                  <p className="px-2 py-3 text-sm text-[#52634c] dark:text-[#b5c7ae]">
                    {t.j_member_no_results}
                  </p>
                )}
              </div>
            </div>
          </details>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#3f503a] dark:text-[#c7d7c0]">
            {t.j_t}
          </span>
          <div
            className="inline-flex rounded-lg border border-[#dce6d7] bg-white p-1 dark:border-[#24371f] dark:bg-[#142111]"
            role="group"
            aria-label={t.j_t}
          >
            {(['all', 'show', 'event'] as ScheduleFilter[]).map((filterKey) => {
              const active = typeFilter === filterKey;
              return (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setTypeFilter(filterKey)}
                  className={`inline-flex min-h-[34px] items-center gap-1.5 whitespace-nowrap rounded-md px-3.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-[#278500] text-white dark:bg-[#6fd43a] dark:text-[#0a1407]'
                      : 'text-[#52634c] hover:text-[#131f10] dark:text-[#b5c7ae] dark:hover:text-[#ecf4e8]'
                  }`}
                >
                  {active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                  <span>{t[`t_${filterKey}`]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* High-Contrast Two-Column Schedule Cards */}
      {filteredEvents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredEvents.map((ev, idx) => {
            const endOfDay = new Date(
              ev.endDate.getFullYear(),
              ev.endDate.getMonth(),
              ev.endDate.getDate(),
              23,
              59
            );
            const isPast = endOfDay < now;
            const isRange = ev.endDate.getTime() > ev.startDate.getTime();
            const isNext = idx === firstUpcomingIndex;

            const dayLabel = isRange
              ? `${pad2(ev.startDate.getDate())}~${pad2(ev.endDate.getDate())}`
              : pad2(ev.startDate.getDate());
            const weekdayLabel = isRange
              ? `${weekdays[ev.startDate.getDay()]}~${weekdays[ev.endDate.getDay()]}`
              : weekdays[ev.startDate.getDay()];

            const title = lang === 'en' && ev.titleEn ? ev.titleEn : ev.title;
            const venue = lang === 'en' && ev.venueEn ? ev.venueEn : ev.venue;
            const VenueIcon = /fan\s*club/i.test(venue) ? UsersRound : MapPin;
            const time = lang === 'en' && ev.timeEn ? ev.timeEn : ev.time;
            const notes = lang === 'en' && ev.notesEn ? ev.notesEn : ev.notes;
            const members = ev.members || '';
            const participants = parseEventMemberNames(members)
              .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
              .map((name) => ({
                name,
                profile: MEMBER_LOOKUP.get(name.toLowerCase()),
              }));
            const isBirthdayEvent = /birthday/i.test(ev.title);

            return (
              <article
                key={ev.id}
                className={`rounded-2xl border p-5 backdrop-blur-md transition-colors ${
                  isNext
                    ? 'border-[#278500] bg-white shadow-sm dark:border-[#66c91a] dark:bg-[#11200d]'
                    : isPast
                    ? 'border-[#dce6d7] bg-white/92 dark:border-[#24371f] dark:bg-[#0e180b]/92'
                    : 'border-[#c8dcc0] bg-white/96 dark:border-[#2b4523] dark:bg-[#101c0d]/95'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Date & Main Info */}
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    {/* Crisp Tabular Date Column */}
                    <div className="flex shrink-0 flex-col items-start border-r border-[#e3ecde] pr-4 dark:border-[#24371f]">
                      <div className="flex items-center gap-1">
                        {isNext && (
                          <ArrowRight
                            className="h-4 w-4 shrink-0 text-[#278500] dark:text-[#7ce043]"
                            aria-label={t.upcoming_badge}
                          />
                        )}
                        <span
                          className={`font-mono-num font-extrabold leading-none tracking-tight ${
                            isRange ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                          } ${
                            isPast
                              ? 'text-[#3f6a29] dark:text-[#86cf5b]'
                              : 'text-[#278500] dark:text-[#7ce043]'
                          }`}
                        >
                          {dayLabel}
                        </span>
                      </div>
                      <div className="font-mono-num mt-1.5 text-[11px] font-semibold leading-snug text-[#4d5e47] dark:text-[#c7d7c0]">
                        {shortMonths[month - 1]} {year}
                      </div>
                      <div
                        className={`font-mono-num text-[11px] font-bold ${
                          isPast
                            ? 'text-[#3f6a29] dark:text-[#86cf5b]'
                            : 'text-[#278500] dark:text-[#7ce043]'
                        }`}
                      >
                        {weekdayLabel}
                      </div>
                    </div>

                    {/* Title, Category & Quick Summary */}
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
                        {isNext && (
                          <>
                            <span aria-hidden="true" className="text-[#8da087]">·</span>
                            <span className="font-bold text-[#278500] dark:text-[#7ce043]">
                              {t.upcoming_badge}
                            </span>
                          </>
                        )}
                      </div>

                      <h2
                        className={`font-display mt-1 text-base font-bold leading-snug sm:text-lg ${
                          isPast
                            ? 'text-[#263421] dark:text-[#e2eee0]'
                            : 'text-[#131f10] dark:text-white'
                        }`}
                      >
                        {title}
                      </h2>

                      <div className="mt-2 space-y-1 text-xs leading-relaxed text-[#3f503a] sm:text-sm dark:text-[#c7d7c0]">
                        <div className="flex items-start gap-1.5">
                          <VenueIcon
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#278500] dark:text-[#7ce043]"
                            aria-hidden="true"
                          />
                          <span>{venue}</span>
                        </div>
                        {time && (
                          <div className="flex items-start gap-1.5">
                            <Clock
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#278500] dark:text-[#7ce043]"
                              aria-hidden="true"
                            />
                            <span className="font-mono-num">{formatScheduleTime(time)}</span>
                          </div>
                        )}
                        {members && (
                          <div className="flex items-start gap-1.5">
                            <UsersRound
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#278500] dark:text-[#7ce043]"
                              aria-hidden="true"
                            />
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
                                    onClick={() => setSelectedMember(profile)}
                                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#dce6d7] bg-white/80 py-1 pr-2.5 pl-1 text-xs font-semibold text-[#278500] transition-colors hover:border-[#278500] hover:bg-[#edf5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#2b4523] dark:bg-[#142111] dark:text-[#7ce043] dark:hover:border-[#6fd43a] dark:hover:bg-[#1d3314] dark:focus-visible:outline-[#6fd43a]"
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
                        {ev.link && (
                          <a
                            href={ev.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-1.5 font-bold text-[#278500] hover:underline dark:text-[#7ce043]"
                          >
                            <span>{t.j_link}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>


                </div>

              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-[#dce6d7] bg-white p-8 text-center text-sm text-[#3f503a] dark:border-[#24371f] dark:bg-[#142111] dark:text-[#c7d7c0]">
          {selectedMembers.length > 0 ? t.j_member_no_events : t.noevents}
        </div>
      )}
      <MemberModal
        member={selectedMember?.member ?? null}
        indexNumber={selectedMember?.index ?? 0}
        lang={lang}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
