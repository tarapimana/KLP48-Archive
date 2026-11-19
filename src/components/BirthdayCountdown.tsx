import { Cake, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  getUpcomingBirthdays,
  MemberItem,
  UpcomingBirthday,
} from '../data/klp48Data';
import { Lang, MONTHS_EN, MONTHS_MS, TRANSLATIONS } from '../i18n/translations';
import { BirthdayCalendar } from './BirthdayCalendar';
import { MemberAvatar } from './MemberAvatar';

interface BirthdayCountdownProps {
  lang: Lang;
  showAll?: boolean;
  compact?: boolean;
  includeCalendar?: boolean;
  onSelectMember?: (member: MemberItem) => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isCelebratingToday: boolean;
}

const WEEKDAYS_FULL_MS = [
  'Ahad',
  'Isnin',
  'Selasa',
  'Rabu',
  'Khamis',
  'Jumaat',
  'Sabtu',
];

const WEEKDAYS_FULL_EN = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function calcTimeLeft(targetDate: Date): TimeLeft {
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isCelebratingToday: true };
  }
  const totalSec = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    isCelebratingToday: false,
  };
}

const ITEMS_PER_PAGE = 5;

export function BirthdayCountdown({
  lang,
  showAll = false,
  compact = false,
  includeCalendar = false,
  onSelectMember,
}: BirthdayCountdownProps) {
  const t = TRANSLATIONS[lang];
  const months = lang === 'en' ? MONTHS_EN : MONTHS_MS;
  const weekdaysFull = lang === 'en' ? WEEKDAYS_FULL_EN : WEEKDAYS_FULL_MS;

  const birthdays = useMemo(() => getUpcomingBirthdays(), []);
  const nextBirthday = birthdays[0];

  const [page, setPage] = useState(1);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    nextBirthday
      ? calcTimeLeft(nextBirthday.date)
      : { days: 0, hours: 0, minutes: 0, seconds: 0, isCelebratingToday: false }
  );

  useEffect(() => {
    if (!nextBirthday) return;
    setTimeLeft(calcTimeLeft(nextBirthday.date));
    const timer = window.setInterval(() => {
      setTimeLeft(calcTimeLeft(nextBirthday.date));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [nextBirthday?.date.getTime()]);

  if (!birthdays.length || !nextBirthday) {
    return (
      <div className="rounded-2xl border border-[#dce6d7] bg-white/90 p-6 text-sm text-[#52634c] backdrop-blur-md dark:border-[#24371f] dark:bg-[#142111]/88 dark:text-[#98ad90]">
        {t.nomatch}
      </div>
    );
  }

  const sameDayEntries = birthdays.filter(
    (b) => b.date.getTime() === nextBirthday.date.getTime()
  );
  const featuredNames = sameDayEntries.map((b) => b.member.nama).join(' & ');

  const featuredWeekday = weekdaysFull[nextBirthday.date.getDay()];
  const featuredMonth = months[nextBirthday.date.getMonth()];
  const featuredDay = nextBirthday.date.getDate();
  const featuredAgeText =
    nextBirthday.ageTurning !== null
      ? t.bd_years.replace('%n', String(nextBirthday.ageTurning))
      : '';

  const allRestEntries = birthdays.slice(sameDayEntries.length);
  const totalPages = showAll
    ? Math.max(1, Math.ceil(allRestEntries.length / ITEMS_PER_PAGE))
    : 1;
  const safePage = Math.min(page, totalPages);

  const visibleEntries = showAll
    ? allRestEntries.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE
      )
    : allRestEntries.slice(0, compact ? 3 : 5);

  const groupedByMonth = useMemo(() => {
    const groups: Array<{ monthLabel: string; entries: UpcomingBirthday[] }> = [];
    for (const entry of visibleEntries) {
      const mLabel = months[entry.date.getMonth()].toUpperCase();
      const last = groups[groups.length - 1];
      if (last && last.monthLabel === mLabel) {
        last.entries.push(entry);
      } else {
        groups.push({ monthLabel: mLabel, entries: [entry] });
      }
    }
    return groups;
  }, [visibleEntries, months]);

  const formatDaysShort = (daysLeft: number) => {
    if (daysLeft === 0) return t.bd_today_short;
    if (daysLeft === 1) return t.bd_tomorrow_short;
    return t.bd_days_short.replace('%n', String(daysLeft));
  };

  return (
    <div className="space-y-4">
      {/* Featured Birthday Spotlight Card */}
      <div
        className={`relative overflow-hidden rounded-2xl border border-[#4ca812] bg-[#66c91a] text-[#0b1608] ${
          compact ? 'p-4' : 'p-5 sm:p-6'
        }`}
        style={{
          backgroundImage:
            'radial-gradient(rgba(11, 22, 8, 0.14) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      >
        <div
          className={`flex flex-col items-center sm:flex-row sm:items-stretch ${
            compact ? 'gap-4' : 'gap-6'
          }`}
        >
          {/* Left Framed Member Portrait */}
          <button
            type="button"
            onClick={() => onSelectMember?.(nextBirthday.member)}
            disabled={!onSelectMember}
            aria-label={nextBirthday.member.nama}
            className={`group relative aspect-[3/4] shrink-0 overflow-hidden rounded-xl border-2 border-[#0b1608]/25 bg-[#e6f4dc] shadow-sm transition-transform duration-150 enabled:cursor-pointer enabled:hover:scale-[1.01] ${
              compact ? 'w-32 sm:w-28' : 'w-44 sm:w-48'
            }`}
          >
            <MemberAvatar
              member={nextBirthday.member}
              indexNumber={nextBirthday.originalIndex}
              className="h-full w-full"
              initialsClassName={compact ? 'text-3xl' : 'text-5xl'}
              fallbackTone="light"
              priority
            />
          </button>

          {/* Right Centered Typographic Spotlight */}
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0b1608]/85">
              <Cake className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {timeLeft.isCelebratingToday ? t.bd_t : t.bd_next}
              </span>
            </div>

            <h3
              className={`font-display mt-1.5 font-black uppercase tracking-tight text-[#0b1608] ${
                compact ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'
              }`}
            >
              {featuredNames}
            </h3>

            <p
              className={`mt-1 font-medium text-[#0b1608]/80 ${
                compact ? 'text-xs' : 'text-sm'
              }`}
            >
              {featuredWeekday}, {featuredDay} {featuredMonth}
              {featuredAgeText ? ` · ${featuredAgeText}` : ''}
            </p>

            <div
              className={`h-px w-full max-w-md bg-[#0b1608]/15 ${
                compact ? 'my-3' : 'my-5'
              }`}
            />

            {timeLeft.isCelebratingToday ? (
              <div
                className={`inline-flex items-center gap-2 rounded-full bg-[#0b1608] font-bold text-[#8be05a] ${
                  compact ? 'px-4 py-2 text-xs' : 'px-5 py-2.5 text-sm'
                }`}
              >
                <Cake className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.bd_hb}</span>
              </div>
            ) : (
              <div
                className={`grid w-full max-w-md grid-cols-4 ${
                  compact ? 'gap-1.5' : 'gap-2'
                }`}
              >
                {[
                  { val: timeLeft.days, label: t.d_day },
                  { val: timeLeft.hours, label: t.d_hr },
                  { val: timeLeft.minutes, label: t.d_min },
                  { val: timeLeft.seconds, label: t.d_sec },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className={`rounded-xl bg-[#0b1608] text-center ${
                      compact ? 'px-1.5 py-2' : 'px-2 py-2.5'
                    }`}
                  >
                    <div
                      className={`font-mono-num font-bold text-[#8be05a] ${
                        compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'
                      }`}
                    >
                      {String(unit.val).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-white/75 sm:text-[10px]">
                      {unit.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar + Upcoming Birthdays */}
      {includeCalendar && onSelectMember ? (
        <div className="grid items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <BirthdayCalendar lang={lang} onSelectMember={onSelectMember} />
          </div>

          <div className="lg:col-span-5">
            {groupedByMonth.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-[#dce6d7] bg-white/90 backdrop-blur-md dark:border-[#24371f] dark:bg-[#142111]/90">
                <div className="border-b border-[#dce6d7] px-5 py-3.5 dark:border-[#24371f]">
                  <h2 className="font-display text-base font-extrabold tracking-tight text-[#131f10] dark:text-[#ecf4e8]">
                    {t.bd_upcoming_title}
                  </h2>
                </div>

                {groupedByMonth.map((group, gIdx) => (
                  <div
                    key={group.monthLabel}
                    className={
                      gIdx > 0
                        ? 'border-t border-[#dce6d7] dark:border-[#24371f]'
                        : ''
                    }
                  >
                    <div className="px-5 pt-4 pb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#52634c] dark:text-[#98ad90]">
                      {group.monthLabel}
                    </div>

                    <div className="divide-y divide-[#dce6d7] dark:divide-[#24371f]">
                      {group.entries.map((entry) => {
                        const mName = months[entry.date.getMonth()];
                        const dayNum = entry.date.getDate();
                        const ageLabel =
                          entry.ageTurning !== null
                            ? ` · ${t.bd_years.replace('%n', String(entry.ageTurning))}`
                            : '';

                        return (
                          <button
                            key={entry.member.nama}
                            type="button"
                            onClick={() => onSelectMember(entry.member)}
                            className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-[#edf5e9]/70 dark:hover:bg-[#1a2b15]/80"
                          >
                            <div className="flex min-w-0 items-center gap-3.5">
                              <MemberAvatar
                                member={entry.member}
                                indexNumber={entry.originalIndex}
                                className="h-11 w-11 shrink-0 rounded-xl border border-black/10"
                                initialsClassName="text-sm"
                              />
                              <div className="min-w-0">
                                <div className="truncate font-display text-base font-bold text-[#131f10] dark:text-[#ecf4e8]">
                                  {entry.member.nama}
                                </div>
                                <div className="truncate text-xs text-[#52634c] dark:text-[#98ad90]">
                                  {dayNum} {mName}
                                  {ageLabel}
                                </div>
                              </div>
                            </div>

                            <span className="font-mono-num shrink-0 whitespace-nowrap text-xs font-bold tracking-wider text-[#278500] dark:text-[#6fd43a]">
                              {formatDaysShort(entry.daysLeft)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {showAll && totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-[#dce6d7] px-5 py-3.5 dark:border-[#24371f]">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#dce6d7] bg-white px-3.5 text-xs font-semibold text-[#131f10] transition-colors hover:border-[#278500] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#24371f] dark:bg-[#1a2b15] dark:text-[#ecf4e8] dark:hover:border-[#6fd43a]"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t.prev_page}</span>
                    </button>

                    <span className="font-mono-num text-xs font-semibold text-[#52634c] dark:text-[#98ad90]">
                      {safePage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#dce6d7] bg-white px-3.5 text-xs font-semibold text-[#131f10] transition-colors hover:border-[#278500] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#24371f] dark:bg-[#1a2b15] dark:text-[#ecf4e8] dark:hover:border-[#6fd43a]"
                    >
                      <span>{t.next_page}</span>
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        groupedByMonth.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-[#dce6d7] bg-white/90 backdrop-blur-md dark:border-[#24371f] dark:bg-[#142111]/90">
            {groupedByMonth.map((group, gIdx) => (
              <div
                key={group.monthLabel}
                className={
                  gIdx > 0
                    ? 'border-t border-[#dce6d7] dark:border-[#24371f]'
                    : ''
                }
              >
                <div className="px-5 pt-4 pb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#52634c] dark:text-[#98ad90]">
                  {group.monthLabel}
                </div>

                <div className="divide-y divide-[#dce6d7] dark:divide-[#24371f]">
                  {group.entries.map((entry) => {
                    const mName = months[entry.date.getMonth()];
                    const dayNum = entry.date.getDate();
                    const ageLabel =
                      entry.ageTurning !== null
                        ? ` · ${t.bd_years.replace('%n', String(entry.ageTurning))}`
                        : '';
                    const RowTag = onSelectMember ? 'button' : 'div';

                    return (
                      <RowTag
                        key={entry.member.nama}
                        {...(onSelectMember
                          ? {
                              type: 'button' as const,
                              onClick: () => onSelectMember(entry.member),
                            }
                          : {})}
                        className={`flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors ${
                          onSelectMember
                            ? 'cursor-pointer hover:bg-[#edf5e9]/70 dark:hover:bg-[#1a2b15]/80'
                            : ''
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3.5">
                          <MemberAvatar
                            member={entry.member}
                            indexNumber={entry.originalIndex}
                            className="h-11 w-11 shrink-0 rounded-xl border border-black/10"
                            initialsClassName="text-sm"
                          />
                          <div className="min-w-0">
                            <div className="truncate font-display text-base font-bold text-[#131f10] dark:text-[#ecf4e8]">
                              {entry.member.nama}
                            </div>
                            <div className="truncate text-xs text-[#52634c] dark:text-[#98ad90]">
                              {dayNum} {mName}
                              {ageLabel}
                            </div>
                          </div>
                        </div>

                        <span className="font-mono-num shrink-0 whitespace-nowrap text-xs font-bold tracking-wider text-[#278500] dark:text-[#6fd43a]">
                          {formatDaysShort(entry.daysLeft)}
                        </span>
                      </RowTag>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Pagination Footer (Full Calendar View) */}
            {showAll && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#dce6d7] px-5 py-3.5 dark:border-[#24371f]">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#dce6d7] bg-white px-3.5 text-xs font-semibold text-[#131f10] transition-colors hover:border-[#278500] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#24371f] dark:bg-[#1a2b15] dark:text-[#ecf4e8] dark:hover:border-[#6fd43a]"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.prev_page}</span>
                </button>

                <span className="font-mono-num text-xs font-semibold text-[#52634c] dark:text-[#98ad90]">
                  {safePage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#dce6d7] bg-white px-3.5 text-xs font-semibold text-[#131f10] transition-colors hover:border-[#278500] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#24371f] dark:bg-[#1a2b15] dark:text-[#ecf4e8] dark:hover:border-[#6fd43a]"
                >
                  <span>{t.next_page}</span>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
