import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  getMemberCategory,
  MemberItem,
  MEMBERS_DATA,
  parseMemberBirthday,
} from '../data/klp48Data';
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
import { MemberAvatar } from './MemberAvatar';
import { BirthdayCalendarMenu } from './BirthdayCalendarMenu';

interface BirthdayCalendarProps {
  lang: Lang;
  onSelectMember: (member: MemberItem) => void;
}

type RosterFilter = 'current' | 'all';

interface CalendarBirthdayEntry {
  member: MemberItem;
  originalIndex: number;
  day: number;
  monthIndex: number;
  birthYear: number | null;
  isGraduated: boolean;
}

export function BirthdayCalendar({ lang, onSelectMember }: BirthdayCalendarProps) {
  const t = TRANSLATIONS[lang];
  const months = lang === 'en' ? MONTHS_EN : MONTHS_MS;
  const shortMonths = lang === 'en' ? MONTHS_SHORT_EN : MONTHS_SHORT_MS;
  const weekdays = lang === 'en' ? WEEKDAYS_EN : WEEKDAYS_MS;

  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDay = now.getDate();

  const [viewYear, setViewYear] = useState<number>(todayYear);
  const [viewMonth, setViewMonth] = useState<number>(todayMonth);
  const [rosterFilter, setRosterFilter] = useState<RosterFilter>('current');

  const allEntries = useMemo<CalendarBirthdayEntry[]>(() => {
    return MEMBERS_DATA.map((member, originalIndex) => {
      const parsed = parseMemberBirthday(member);
      if (!parsed) return null;
      return {
        member,
        originalIndex,
        day: parsed.day,
        monthIndex: parsed.monthIndex,
        birthYear: parsed.birthYear,
        isGraduated: getMemberCategory(member.status) === 'grad',
      };
    }).filter((item): item is CalendarBirthdayEntry => item !== null);
  }, []);

  const filteredEntries = useMemo(() => {
    return rosterFilter === 'all'
      ? allEntries
      : allEntries.filter((e) => !e.isGraduated);
  }, [allEntries, rosterFilter]);

  const countsByMonth = useMemo(() => {
    const counts = new Array<number>(12).fill(0);
    for (const entry of filteredEntries) {
      counts[entry.monthIndex] += 1;
    }
    return counts;
  }, [filteredEntries]);

  const monthEntries = useMemo(() => {
    return filteredEntries
      .filter((e) => e.monthIndex === viewMonth)
      .sort((a, b) => a.day - b.day || a.member.nama.localeCompare(b.member.nama));
  }, [filteredEntries, viewMonth]);

  const entriesByDay = useMemo(() => {
    const map = new Map<number, CalendarBirthdayEntry[]>();
    for (const entry of monthEntries) {
      const list = map.get(entry.day);
      if (list) {
        list.push(entry);
      } else {
        map.set(entry.day, [entry]);
      }
    }
    return map;
  }, [monthEntries]);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalGridCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

  const isViewingTodayMonth = viewYear === todayYear && viewMonth === todayMonth;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    setViewYear(todayYear);
    setViewMonth(todayMonth);
  };

  const monthCountLabel =
    monthEntries.length === 1
      ? t.bd_month_one
      : t.bd_month_many.replace('%n', String(monthEntries.length));

  return (
    <section
      aria-label={t.bd_cal_title}
      className="overflow-hidden rounded-2xl border border-[#dce6d7] bg-white/90 backdrop-blur-md dark:border-[#24371f] dark:bg-[#142111]/90"
    >
      {/* Top Bar: Title, Month Controls & Roster Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce6d7] px-5 py-4 dark:border-[#24371f]">
        <div className="flex items-center gap-2.5">
          <CalendarDays
            className="h-4 w-4 shrink-0 text-[#278500] dark:text-[#6fd43a]"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-tight text-[#131f10] dark:text-[#ecf4e8]">
              {months[viewMonth]}{' '}
              <span className="font-mono-num font-bold text-[#278500] dark:text-[#6fd43a]">
                {viewYear}
              </span>
            </h2>
            <p className="text-xs text-[#52634c] dark:text-[#98ad90]">
              {t.bd_cal_title} · {monthCountLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Current / All Roster Toggle */}
          <div
            className="inline-flex rounded-lg border border-[#dce6d7] bg-[#f6faf4] p-0.5 dark:border-[#24371f] dark:bg-[#0e190b]"
            role="group"
            aria-label={t.m_status}
          >
            {(['current', 'all'] as RosterFilter[]).map((key) => {
              const active = rosterFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRosterFilter(key)}
                  className={`min-h-[32px] whitespace-nowrap rounded-md px-2.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-[#278500] text-white dark:bg-[#66c91a] dark:text-[#0b1608]'
                      : 'text-[#52634c] hover:text-[#131f10] dark:text-[#98ad90] dark:hover:text-[#ecf4e8]'
                  }`}
                >
                  {key === 'current' ? t.bd_filter_current : t.bd_filter_all}
                </button>
              );
            })}
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-1">
            {!isViewingTodayMonth && (
              <button
                type="button"
                onClick={handleJumpToday}
                className="min-h-[34px] whitespace-nowrap rounded-lg border border-[#dce6d7] bg-white px-2.5 text-xs font-semibold text-[#278500] transition-colors hover:border-[#278500] dark:border-[#24371f] dark:bg-[#1a2b15] dark:text-[#6fd43a] dark:hover:border-[#6fd43a]"
              >
                {t.bd_today_btn}
              </button>
            )}
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label={t.bd_prev_month}
              className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-[#dce6d7] bg-white text-[#131f10] transition-colors hover:border-[#278500] dark:border-[#24371f] dark:bg-[#1a2b15] dark:text-[#ecf4e8] dark:hover:border-[#6fd43a]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label={t.bd_next_month}
              className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-[#dce6d7] bg-white text-[#131f10] transition-colors hover:border-[#278500] dark:border-[#24371f] dark:bg-[#1a2b15] dark:text-[#ecf4e8] dark:hover:border-[#6fd43a]"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* 12-Month Quick Jump Strip */}
      <div className="grid grid-cols-6 gap-1 border-b border-[#dce6d7] bg-[#f7faf5]/70 px-3 py-2.5 sm:grid-cols-12 dark:border-[#24371f] dark:bg-[#0e190b]/60">
        {shortMonths.map((label, idx) => {
          const isSelected = idx === viewMonth;
          const count = countsByMonth[idx];
          return (
            <button
              key={label}
              type="button"
              onClick={() => setViewMonth(idx)}
              className={`flex flex-col items-center justify-center rounded-lg py-1.5 text-center transition-colors ${
                isSelected
                  ? 'bg-[#278500] text-white dark:bg-[#66c91a] dark:text-[#0b1608]'
                  : 'text-[#52634c] hover:bg-[#e3f2da]/70 hover:text-[#131f10] dark:text-[#98ad90] dark:hover:bg-[#1a2b15] dark:hover:text-[#ecf4e8]'
              }`}
            >
              <span className="text-[11px] font-bold tracking-wider">{label}</span>
              <span
                className={`font-mono-num text-[10px] leading-tight ${
                  isSelected
                    ? 'text-white/90 dark:text-[#0b1608]/85'
                    : count > 0
                    ? 'font-semibold text-[#278500] dark:text-[#6fd43a]'
                    : 'opacity-45'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Weekday Header Row */}
      <div className="grid grid-cols-7 border-b border-[#dce6d7] bg-[#f7faf5]/40 dark:border-[#24371f] dark:bg-[#0e190b]/35">
        {weekdays.map((wd) => (
          <div
            key={wd}
            className="py-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[#52634c] sm:text-[11px] dark:text-[#98ad90]"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* 7-Column Calendar Grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: totalGridCells }, (_, cellIndex) => {
          const dayNum = cellIndex - firstDayOfMonth + 1;
          const isValidDay = dayNum >= 1 && dayNum <= daysInMonth;
          const isRightEdge = (cellIndex + 1) % 7 === 0;
          const isBottomRow = cellIndex >= totalGridCells - 7;

          const cellBorders = `${!isRightEdge ? 'border-r' : ''} ${
            !isBottomRow ? 'border-b' : ''
          } border-[#dce6d7] dark:border-[#24371f]`;

          if (!isValidDay) {
            return (
              <div
                key={`empty-${cellIndex}`}
                className={`min-h-[68px] bg-[#f7faf5]/35 sm:min-h-[88px] dark:bg-[#0b1409]/35 ${cellBorders}`}
                aria-hidden="true"
              />
            );
          }

          const dayEntries = entriesByDay.get(dayNum) || [];
          const isToday =
            isViewingTodayMonth && dayNum === todayDay;
          const hasBirthdays = dayEntries.length > 0;

          return (
            <div
              key={dayNum}
              className={`relative flex min-h-[68px] flex-col justify-between p-1.5 transition-colors sm:min-h-[88px] sm:p-2 ${cellBorders} ${
                isToday
                  ? 'bg-[#e3f2da]/75 ring-2 ring-inset ring-[#278500] dark:bg-[#193012]/90 dark:ring-[#66c91a]'
                  : hasBirthdays
                  ? 'bg-[#edf5e9]/65 dark:bg-[#172812]/70'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`font-mono-num text-xs leading-none ${
                    isToday
                      ? 'font-black text-[#278500] dark:text-[#66c91a]'
                      : hasBirthdays
                      ? 'font-bold text-[#131f10] dark:text-[#ecf4e8]'
                      : 'font-medium text-[#52634c] dark:text-[#98ad90]'
                  }`}
                >
                  {dayNum}
                </span>
                {isToday && (
                  <span className="hidden text-[9px] font-extrabold uppercase tracking-wider text-[#278500] sm:inline dark:text-[#66c91a]">
                    {t.bd_today_short}
                  </span>
                )}
              </div>

              {hasBirthdays && (
                <div className="mt-1 space-y-1">
                  {dayEntries.map((entry) => (
                    <button
                      key={entry.member.nama}
                      type="button"
                      onClick={() => onSelectMember(entry.member)}
                      title={`${entry.member.nama} (${entry.day} ${shortMonths[viewMonth]})`}
                      className="group flex w-full items-center gap-1.5 rounded-lg border border-[#c6dec0] bg-white/95 p-1 text-left transition-colors hover:border-[#278500] hover:bg-[#edf5e9] dark:border-[#2b4423] dark:bg-[#0e190b]/95 dark:hover:border-[#66c91a] dark:hover:bg-[#1a2b15]"
                    >
                      <MemberAvatar
                        member={entry.member}
                        indexNumber={entry.originalIndex}
                        className="h-5 w-5 shrink-0 rounded-md sm:h-6 sm:w-6"
                        initialsClassName="text-[9px]"
                      />
                      <span className="hidden min-w-0 flex-1 truncate text-[11px] font-bold text-[#131f10] group-hover:text-[#278500] sm:block dark:text-[#ecf4e8] dark:group-hover:text-[#66c91a]">
                        {entry.member.nama}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Month Roster Summary */}
      <div className="border-t border-[#dce6d7] px-5 py-4 dark:border-[#24371f]">
        {monthEntries.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {monthEntries.map((entry) => {
              const turningAge =
                entry.birthYear !== null ? viewYear - entry.birthYear : null;
              return (
                <div
                  key={entry.member.nama}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#dce6d7] bg-[#f7faf5] px-1.5 py-1.5 dark:border-[#24371f] dark:bg-[#0e190b]/80"
                >
                  <button
                    type="button"
                    onClick={() => onSelectMember(entry.member)}
                    className="inline-flex items-center gap-2.5 rounded-lg px-1.5 py-0.5 text-left transition-colors hover:bg-[#edf5e9] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#278500] dark:hover:bg-[#1a2b15] dark:focus-visible:outline-[#6fd43a]"
                  >
                    <MemberAvatar
                      member={entry.member}
                      indexNumber={entry.originalIndex}
                      className="h-8 w-8 shrink-0 rounded-lg border border-black/10"
                      initialsClassName="text-xs"
                    />
                    <div className="min-w-0">
                      <div className="font-display text-xs font-bold text-[#131f10] sm:text-sm dark:text-[#ecf4e8]">
                        {entry.member.nama}
                      </div>
                      <div className="font-mono-num text-[11px] text-[#52634c] dark:text-[#98ad90]">
                        {entry.day} {shortMonths[viewMonth]}
                        {turningAge !== null
                          ? ` · ${t.bd_years.replace('%n', String(turningAge))}`
                          : ''}
                        {entry.isGraduated ? ` · ${t.f_grad}` : ''}
                      </div>
                    </div>
                  </button>
                  <BirthdayCalendarMenu
                    member={entry.member}
                    date={new Date(viewYear, viewMonth, entry.day)}
                    lang={lang}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#52634c] dark:text-[#98ad90]">
            {t.bd_none_month}
          </p>
        )}
      </div>
    </section>
  );
}
