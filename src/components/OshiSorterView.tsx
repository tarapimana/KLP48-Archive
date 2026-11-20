import { useState } from 'react';
import { CANONICAL_ACTIVE_MEMBER_IDS, MEMBERS_DATA } from '../data/klp48Data';
import type { MemberItem } from '../data/klp48Data';
import { Lang, TRANSLATIONS } from '../i18n/translations';
import { MemberAvatar } from './MemberAvatar';

interface OshiSorterViewProps {
  lang: Lang;
}

interface SortSession {
  sorted: MemberItem[];
  queue: MemberItem[];
  current: MemberItem | null;
  low: number;
  high: number;
  comparisons: number;
}

const SORTER_MEMBERS = CANONICAL_ACTIVE_MEMBER_IDS
  .map((id) => MEMBERS_DATA.find((member) => member.id === id))
  .filter((member): member is MemberItem => Boolean(member));

const MEMBER_INDEX_BY_ID = new Map(MEMBERS_DATA.map((member, index) => [member.id, index]));

function shuffleMembers(members: MemberItem[]): MemberItem[] {
  const shuffled = [...members];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

export function OshiSorterView({ lang }: OshiSorterViewProps) {
  const t = TRANSLATIONS[lang];
  const [session, setSession] = useState<SortSession | null>(null);

  const startSort = () => {
    const [first, second, ...queue] = shuffleMembers(SORTER_MEMBERS);

    setSession({
      sorted: first ? [first] : [],
      queue,
      current: second ?? null,
      low: 0,
      high: first && second ? 1 : 0,
      comparisons: 0,
    });
  };

  const chooseMember = (preferCurrent: boolean) => {
    setSession((currentSession) => {
      if (!currentSession?.current || currentSession.low >= currentSession.high) {
        return currentSession;
      }

      const middle = Math.floor((currentSession.low + currentSession.high) / 2);
      const nextLow = preferCurrent ? currentSession.low : middle + 1;
      const nextHigh = preferCurrent ? middle : currentSession.high;
      const comparisons = currentSession.comparisons + 1;

      if (nextLow < nextHigh) {
        return {
          ...currentSession,
          low: nextLow,
          high: nextHigh,
          comparisons,
        };
      }

      const sorted = [...currentSession.sorted];
      sorted.splice(nextLow, 0, currentSession.current);
      const [nextCandidate, ...queue] = currentSession.queue;

      return {
        sorted,
        queue,
        current: nextCandidate ?? null,
        low: 0,
        high: sorted.length,
        comparisons,
      };
    });
  };

  const currentOpponent = session?.current
    ? session.sorted[Math.floor((session.low + session.high) / 2)]
    : undefined;
  const progress = session
    ? Math.round((session.sorted.length / Math.max(SORTER_MEMBERS.length, 1)) * 100)
    : 0;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8" aria-labelledby="oshi-sorter-title">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#278500] dark:text-[#6fd43a]">
            {t.oshi_eyebrow}
          </p>
          <h1 id="oshi-sorter-title" className="text-3xl font-bold tracking-tight text-[#131f10] dark:text-[#ecf4e8] sm:text-4xl">
            {t.oshi_title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#52634c] dark:text-[#a8b99f] sm:text-base">
            {t.oshi_sub.replace('%n', String(SORTER_MEMBERS.length))}
          </p>
        </div>
        {session && (
          <button
            type="button"
            onClick={startSort}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-[#c8d6c0] bg-white/75 px-4 text-sm font-semibold text-[#263b20] transition-colors hover:bg-[#edf5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#34472d] dark:bg-[#152112]/80 dark:text-[#e3efdc] dark:hover:bg-[#1d2d17] dark:focus-visible:outline-[#6fd43a]"
          >
            {t.oshi_restart}
          </button>
        )}
      </div>

      {!session && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-[#dce6d7] bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-[#24371f] dark:bg-[#111b0e]/85 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-base font-semibold text-[#131f10] dark:text-[#ecf4e8]">
                {t.oshi_active_count.replace('%n', String(SORTER_MEMBERS.length))}
              </p>
              <p className="mt-1 text-sm text-[#52634c] dark:text-[#a8b99f]">
                {t.oshi_session_note}
              </p>
            </div>
            <button
              type="button"
              onClick={startSort}
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-[#278500] px-5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(39,133,0,0.2)] transition-colors hover:bg-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:bg-[#6fd43a] dark:text-[#0a1407] dark:hover:bg-[#82df52] dark:focus-visible:outline-[#6fd43a]"
            >
              {t.oshi_start}
            </button>
          </div>

          <div className="max-w-5xl">
            <h2 className="inline-flex -rotate-1 items-center rounded-md bg-[#ffd83d] px-3 py-1 text-lg font-black uppercase leading-none tracking-tight text-[#17140b] shadow-sm sm:text-xl">
              {t.oshi_items_to_rank} ({SORTER_MEMBERS.length})
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 min-[520px]:grid-cols-4 sm:gap-3" aria-label={t.oshi_items_to_rank}>
              {SORTER_MEMBERS.map((member) => (
                <li
                  key={member.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-[#dce6d7] bg-[#111b0e] dark:border-[#34472d]"
                >
                  <MemberAvatar
                    member={member}
                    indexNumber={MEMBER_INDEX_BY_ID.get(member.id) ?? 0}
                    className="absolute inset-0"
                    imgClassName="transition-transform duration-300 group-hover:scale-[1.04]"
                    initialsClassName="text-3xl"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-2 pb-2 pt-8 text-xs font-bold leading-tight text-white sm:px-3 sm:pb-3 sm:text-sm">
                    {member.nama}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {session?.current && currentOpponent && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#dce6d7] bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-[#24371f] dark:bg-[#111b0e]/85 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-[#263b20] dark:text-[#e3efdc]">
                {t.oshi_ranked}: {session.sorted.length} / {SORTER_MEMBERS.length}
              </span>
              <span className="text-[#52634c] dark:text-[#a8b99f]">
                {t.oshi_comparisons}: {session.comparisons}
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-[#e7eee3] dark:bg-[#263720]"
              role="progressbar"
              aria-label={t.oshi_progress_label}
              aria-valuemin={0}
              aria-valuemax={SORTER_MEMBERS.length}
              aria-valuenow={session.sorted.length}
            >
              <div
                className="h-full rounded-full bg-[#278500] transition-[width] duration-300 dark:bg-[#6fd43a]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#dce6d7] bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-[#24371f] dark:bg-[#111b0e]/85 sm:p-5">
            <p className="mb-4 text-center text-sm font-semibold text-[#52634c] dark:text-[#a8b99f]">
              {t.oshi_question}
            </p>
            <div className="mx-auto grid max-w-4xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2 sm:gap-3 md:items-center md:gap-5">
              <button
                type="button"
                onClick={() => chooseMember(true)}
                aria-label={t.oshi_choose.replace('%n', session.current.nama)}
                className="group rounded-xl border border-[#dce6d7] bg-[#f8fbf6] p-2 text-center transition-all hover:-translate-y-0.5 hover:border-[#278500] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#2a3d24] dark:bg-[#172313] dark:hover:border-[#6fd43a] dark:focus-visible:outline-[#6fd43a] sm:p-3"
              >
                <MemberAvatar
                  member={session.current}
                  indexNumber={MEMBER_INDEX_BY_ID.get(session.current.id) ?? 0}
                  className="mx-auto aspect-square w-full max-w-[12rem] rounded-lg"
                  imgClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  initialsClassName="text-3xl"
                  priority
                />
                <span className="mt-2 block text-sm font-bold text-[#131f10] dark:text-[#ecf4e8] sm:text-base">
                  {session.current.nama}
                </span>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#62765a] dark:text-[#a8b99f]">
                  {t.oshi_choose.replace('%n', session.current.nama)}
                </span>
              </button>

              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-[#dce6d7] bg-white text-[9px] font-bold tracking-wider text-[#52634c] dark:border-[#34472d] dark:bg-[#182414] dark:text-[#a8b99f]">
                {t.oshi_vs}
              </span>

              <button
                type="button"
                onClick={() => chooseMember(false)}
                aria-label={t.oshi_choose.replace('%n', currentOpponent.nama)}
                className="group rounded-xl border border-[#dce6d7] bg-[#f8fbf6] p-2 text-center transition-all hover:-translate-y-0.5 hover:border-[#278500] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#2a3d24] dark:bg-[#172313] dark:hover:border-[#6fd43a] dark:focus-visible:outline-[#6fd43a] sm:p-3"
              >
                <MemberAvatar
                  member={currentOpponent}
                  indexNumber={MEMBER_INDEX_BY_ID.get(currentOpponent.id) ?? 0}
                  className="mx-auto aspect-square w-full max-w-[12rem] rounded-lg"
                  imgClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  initialsClassName="text-3xl"
                />
                <span className="mt-2 block text-sm font-bold text-[#131f10] dark:text-[#ecf4e8] sm:text-base">
                  {currentOpponent.nama}
                </span>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#62765a] dark:text-[#a8b99f]">
                  {t.oshi_choose.replace('%n', currentOpponent.nama)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {session && !session.current && (
        <div className="rounded-2xl border border-[#dce6d7] bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-[#24371f] dark:bg-[#111b0e]/85 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#278500] dark:text-[#6fd43a]">
                {t.oshi_completed}
              </p>
              <h2 className="inline-flex -rotate-1 items-center rounded-md bg-[#ffd83d] px-3 py-1 text-lg font-black uppercase leading-none tracking-tight text-[#17140b] shadow-sm sm:text-xl">
                {t.oshi_results} ({session.sorted.length})
              </h2>
            </div>
            <p className="text-sm text-[#52634c] dark:text-[#a8b99f]">
              {t.oshi_comparisons}: {session.comparisons}
            </p>
          </div>
          <ol className="grid grid-cols-2 gap-2 min-[520px]:grid-cols-4 sm:gap-3" aria-label={t.oshi_results}>
            {session.sorted.map((member, index) => (
              <li
                key={member.id}
                className={`group relative aspect-square overflow-hidden rounded-lg border bg-[#111b0e] ${
                  index === 0
                    ? 'border-[#ffd83d] ring-1 ring-[#ffd83d]'
                    : 'border-[#34472d]'
                }`}
              >
                <MemberAvatar
                  member={member}
                  indexNumber={MEMBER_INDEX_BY_ID.get(member.id) ?? 0}
                  className="absolute inset-0"
                  imgClassName="transition-transform duration-300 group-hover:scale-[1.04]"
                  initialsClassName="text-3xl"
                />
                <span className="absolute left-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-[#ffd83d] px-2 text-xs font-black text-[#17140b] shadow-sm">
                  {index + 1}
                </span>
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-2 pb-2 pt-8 sm:px-3 sm:pb-3">
                  <span className="min-w-0 truncate text-xs font-bold text-white sm:text-sm">
                    {member.nama}
                  </span>
                  {index === 0 && (
                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-[#ffd83d] sm:text-[10px]">
                      {t.oshi_first}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
