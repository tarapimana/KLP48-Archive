import { MessageCircle, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { CANONICAL_ACTIVE_MEMBER_IDS, MEMBERS_DATA } from '../data/klp48Data';
import type { MemberItem } from '../data/klp48Data';
import { Lang, TRANSLATIONS } from '../i18n/translations';
import { MemberAvatar } from './MemberAvatar';

interface OshiSorterViewProps {
  lang: Lang;
}

interface SortSnapshot {
  sorted: MemberItem[];
  queue: MemberItem[];
  current: MemberItem | null;
  low: number;
  high: number;
  comparisons: number;
}

interface SortSession extends SortSnapshot {
  history: SortSnapshot[];
}

const SORTER_MEMBERS = CANONICAL_ACTIVE_MEMBER_IDS
  .map((id) => MEMBERS_DATA.find((member) => member.id === id))
  .filter((member): member is MemberItem => Boolean(member));

const SORTER_GENERATIONS = Array.from(new Set(SORTER_MEMBERS.map((member) => member.gen))).sort(
  (first, second) => Number(first) - Number(second),
);

const MEMBER_INDEX_BY_ID = new Map(MEMBERS_DATA.map((member, index) => [member.id, index]));

interface RankedMemberCardProps {
  member: MemberItem;
  rank: number;
  podium?: boolean;
}

function RankedMemberCard({ member, rank, podium = false }: RankedMemberCardProps) {
  const borderTone =
    rank === 1
      ? 'border-[#278500] dark:border-[#6fd43a]'
      : rank === 2
        ? 'border-[#8da57c] dark:border-[#5a704f]'
        : 'border-[#4e7c3e] dark:border-[#456c36]';
  const podiumBadgeTone =
    rank === 1
      ? 'bg-[#278500] text-white dark:bg-[#6fd43a] dark:text-[#0a1407]'
      : rank === 2
        ? 'bg-[#65765c] text-white dark:bg-[#65765c] dark:text-white'
        : 'bg-[#426e34] text-white dark:bg-[#426e34] dark:text-white';

  return podium ? (
    <li className={`group relative aspect-[4/5] min-w-0 overflow-hidden rounded-xl border-2 bg-[#111b0e] ${borderTone}`}>
      <MemberAvatar
        member={member}
        indexNumber={MEMBER_INDEX_BY_ID.get(member.id) ?? 0}
        className="absolute inset-0"
        imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
        initialsClassName="text-2xl"
      />
      <span className={`absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-black shadow-sm ${podiumBadgeTone}`}>
        {rank}
      </span>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#071006] via-[#071006]/85 to-transparent px-2 pb-2 pt-12 sm:px-3 sm:pb-3">
        <p className="truncate text-xs font-bold text-white sm:text-sm">{member.nama}</p>
        <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#d1e0c8]">
          Gen {member.gen}
        </p>
      </div>
    </li>
  ) : (
    <li className="group flex min-h-[82px] min-w-0 items-center gap-3 rounded-xl border border-[#dce6d7] bg-white/85 p-2.5 shadow-sm transition-colors hover:border-[#a9b8a2] dark:border-[#2b4225] dark:bg-[#141f11]/95 dark:hover:border-[#456c36]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#dce6d7] bg-[#f6faf4] text-xs font-bold text-[#263b20] dark:border-[#34472d] dark:bg-[#1a2816] dark:text-[#e3efdc]">
        {rank}
      </span>
      <MemberAvatar
        member={member}
        indexNumber={MEMBER_INDEX_BY_ID.get(member.id) ?? 0}
        className="h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-[#278500]/60 bg-[#e3f2da] dark:border-[#6fd43a]/60 dark:bg-[#0d180b]"
        imgClassName="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.04]"
        initialsClassName="text-xl"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-[#131f10] dark:text-[#ecf4e8] sm:text-sm">
          {member.nama}
        </p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#62765a] dark:text-[#a8b99f]">
          Gen {member.gen}
        </p>
      </div>
    </li>
  );
}

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
      history: [],
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
      const previousSnapshot: SortSnapshot = {
        sorted: currentSession.sorted,
        queue: currentSession.queue,
        current: currentSession.current,
        low: currentSession.low,
        high: currentSession.high,
        comparisons: currentSession.comparisons,
      };
      const history = [...currentSession.history, previousSnapshot];

      if (nextLow < nextHigh) {
        return {
          ...currentSession,
          low: nextLow,
          high: nextHigh,
          comparisons,
          history,
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
        history,
      };
    });
  };

  const undoChoice = () => {
    setSession((currentSession) => {
      if (!currentSession?.history.length) {
        return currentSession;
      }

      const previousSnapshot = currentSession.history[currentSession.history.length - 1];
      return {
        ...previousSnapshot,
        history: currentSession.history.slice(0, -1),
      };
    });
  };

  const currentOpponent = session?.current
    ? session.sorted[Math.floor((session.low + session.high) / 2)]
    : undefined;
  const progress = session
    ? Math.round((session.sorted.length / Math.max(SORTER_MEMBERS.length, 1)) * 100)
    : 0;
  const shareUrl = session && !session.current
    ? `https://wa.me/?text=${encodeURIComponent(
        [
          t.oshi_share_intro,
          ...session.sorted.map((member, index) => `${index + 1}. ${member.nama}`),
        ].join('\n'),
      )}`
    : undefined;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8" aria-labelledby="oshi-sorter-title">
      {(!session || session.current) && (
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
          {session?.current && (
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={undoChoice}
                disabled={!session.history.length}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#c8d6c0] bg-white/75 px-2.5 text-xs font-semibold text-[#263b20] transition-colors hover:bg-[#edf5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#34472d] dark:bg-[#152112]/80 dark:text-[#e3efdc] dark:hover:bg-[#1d2d17] dark:focus-visible:outline-[#6fd43a]"
              >
                <Undo2 aria-hidden="true" className="h-3.5 w-3.5" />
                {t.oshi_undo}
              </button>
              <button
                type="button"
                onClick={startSort}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#278500]/50 px-2.5 text-xs font-semibold text-[#278500] transition-colors hover:bg-[#e3f2da] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#6fd43a]/50 dark:text-[#6fd43a] dark:hover:bg-[#1d3314] dark:focus-visible:outline-[#6fd43a]"
              >
                {t.oshi_restart}
              </button>
            </div>
          )}
        </div>
      )}

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
        <div className="mx-auto max-w-4xl space-y-4 rounded-2xl border border-[#dce6d7] bg-white/85 p-4 shadow-sm backdrop-blur-sm dark:border-[#24371f] dark:bg-[#111b0e]/90 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#278500] dark:text-[#6fd43a]">
                {t.oshi_completed}
              </p>
              <h2 id="oshi-sorter-title" className="truncate text-lg font-bold tracking-tight text-[#131f10] dark:text-[#ecf4e8] sm:text-xl">
                {t.oshi_results}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={undoChoice}
                disabled={!session.history.length}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#c8d6c0] bg-white/75 px-2.5 text-xs font-semibold text-[#263b20] transition-colors hover:bg-[#edf5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#34472d] dark:bg-[#152112]/80 dark:text-[#e3efdc] dark:hover:bg-[#1d2d17] dark:focus-visible:outline-[#6fd43a]"
              >
                <Undo2 aria-hidden="true" className="h-3.5 w-3.5" />
                {t.oshi_undo}
              </button>
              <button
                type="button"
                onClick={startSort}
                className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#278500]/50 px-2.5 text-xs font-semibold text-[#278500] transition-colors hover:bg-[#e3f2da] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#6fd43a]/50 dark:text-[#6fd43a] dark:hover:bg-[#1d3314] dark:focus-visible:outline-[#6fd43a]"
              >
                {t.oshi_restart}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border border-[#dce6d7] bg-[#f6faf4] px-3 py-2.5 text-xs dark:border-[#2b4225] dark:bg-[#152112]">
            <p className="flex flex-wrap items-center gap-x-2 text-[#263b20] dark:text-[#e3efdc]">
              <span className="font-semibold">{t.oshi_active_count.replace('%n', String(SORTER_MEMBERS.length))}</span>
              <span aria-hidden="true" className="text-[#8a9b82]">·</span>
              <span className="text-[#52634c] dark:text-[#a8b99f]">
                {t.oshi_filter_label}: {SORTER_GENERATIONS.map((generation) => `Gen ${generation}`).join(', ')}
              </span>
            </p>
            <p className="text-[#52634c] dark:text-[#a8b99f]">
              {t.oshi_comparisons}: {session.comparisons}
            </p>
          </div>

          <ol className="mx-auto grid w-full max-w-[36rem] grid-cols-3 gap-2 sm:gap-3" aria-label={`${t.oshi_results} 1–3`}>
            {session.sorted.slice(0, 3).map((member, index) => (
              <RankedMemberCard key={member.id} member={member} rank={index + 1} podium />
            ))}
          </ol>

          {session.sorted.length > 3 && (
            <ol start={4} className="grid grid-cols-1 gap-2 min-[520px]:grid-cols-2 sm:gap-3" aria-label={`${t.oshi_results} 4–${session.sorted.length}`}>
              {session.sorted.slice(3).map((member, index) => (
                <RankedMemberCard key={member.id} member={member} rank={index + 4} />
              ))}
            </ol>
          )}

          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#278500] px-4 text-sm font-bold text-white shadow-[0_5px_16px_rgba(39,133,0,0.2)] transition-colors hover:bg-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:bg-[#6fd43a] dark:text-[#0a1407] dark:hover:bg-[#82df52] dark:focus-visible:outline-[#6fd43a]"
          >
            <MessageCircle aria-hidden="true" className="h-4 w-4" />
            {t.oshi_share_whatsapp}
          </a>
        </div>
      )}
    </section>
  );
}
