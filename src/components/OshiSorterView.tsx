import { Check, RotateCcw, Search, Share2, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { MEMBERS_DATA } from '../data/klp48Data';
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

const SORTER_MEMBERS = [...MEMBERS_DATA].sort(
  (first, second) =>
    Number(first.gen) - Number(second.gen) || first.nama.localeCompare(second.nama, 'en', { sensitivity: 'base' }),
);

const SORTER_GENERATIONS = Array.from(new Set(SORTER_MEMBERS.map((member) => member.gen))).sort(
  (first, second) => Number(first) - Number(second),
);

type OshiStatusFilter = 'all' | MemberItem['statusCategory'];

const MEMBER_INDEX_BY_ID = new Map(MEMBERS_DATA.map((member, index) => [member.id, index]));

function getGenerationLabel(member: MemberItem, lang: Lang) {
  const generation = Number(member.gen);
  if (lang !== 'en') return `Gen ${generation}`;

  const suffix = generation === 1 ? 'st' : generation === 2 ? 'nd' : generation === 3 ? 'rd' : 'th';
  return `${generation}${suffix} Gen`;
}

function getStatusLabel(member: MemberItem, lang: Lang) {
  const t = TRANSLATIONS[lang];
  if (member.statusCategory === 'graduated') return t.f_grad;
  if (member.statusCategory === 'non-active') return t.f_non;
  return t.f_aktif;
}

interface ComparisonMemberCardProps {
  member: MemberItem;
  lang: Lang;
  onSelect: () => void;
}

function ComparisonMemberCard({ member, lang, onSelect }: ComparisonMemberCardProps) {
  const t = TRANSLATIONS[lang];
  const generationLabel = getGenerationLabel(member, lang);
  const statusLabel = getStatusLabel(member, lang);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${t.oshi_choose.replace('%n', member.nama)}, ${generationLabel}, ${statusLabel}`}
      className="group min-w-0 rounded-xl border border-[#dce6d7] bg-white/90 p-2.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#278500] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#2a3d24] dark:bg-[#172313]/95 dark:hover:border-[#6fd43a] dark:focus-visible:outline-[#6fd43a] sm:p-3"
    >
      <div className="relative mb-3 aspect-[4/5] w-full overflow-hidden rounded-lg bg-[#e3f2da] dark:bg-[#0d180b]">
        <MemberAvatar
          member={member}
          indexNumber={MEMBER_INDEX_BY_ID.get(member.id) ?? 0}
          className="absolute inset-0"
          imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
          initialsClassName="text-3xl"
          fallbackTone="light"
          priority
        />
        <span className="absolute left-0 top-0 rounded-br-lg rounded-tl-lg bg-[#278500] px-2 py-1 text-[10px] font-bold text-white shadow-sm dark:bg-[#6fd43a] dark:text-[#0a1407]">
          {generationLabel}
        </span>
      </div>
      <span className="block truncate text-sm font-semibold text-[#131f10] dark:text-[#ecf4e8]">
        {member.nama}
      </span>
      <span className="mt-2 inline-flex rounded-md bg-[#e3f2da] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1e6800] dark:bg-[#1d3314] dark:text-[#8be05a]">
        {statusLabel}
      </span>
    </button>
  );
}

interface SelectableMemberCardProps {
  member: MemberItem;
  lang: Lang;
  selected: boolean;
  onToggle: () => void;
}

function SelectableMemberCard({ member, lang, selected, onToggle }: SelectableMemberCardProps) {
  const t = TRANSLATIONS[lang];

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={(selected ? t.oshi_remove_member : t.oshi_add_member).replace('%n', member.nama)}
      className={`group min-w-0 overflow-hidden rounded-xl border p-2 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:focus-visible:outline-[#6fd43a] sm:p-2.5 ${
        selected
          ? 'border-[#278500] bg-[#f6faf4] ring-1 ring-[#278500]/20 dark:border-[#6fd43a] dark:bg-[#152112] dark:ring-[#6fd43a]/20'
          : 'border-[#dce6d7] bg-white/80 hover:border-[#a9b8a2] dark:border-[#2b4225] dark:bg-[#141f11]/90 dark:hover:border-[#456c36]'
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#e3f2da] dark:bg-[#0d180b]">
        <MemberAvatar
          member={member}
          indexNumber={MEMBER_INDEX_BY_ID.get(member.id) ?? 0}
          className="absolute inset-0"
          imgClassName="transition-transform duration-300 group-hover:scale-[1.04]"
          initialsClassName="text-3xl"
          fallbackTone="light"
        />
        <span className="absolute left-2 top-2 rounded-full bg-[#111b0e]/80 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
          Gen {member.gen}
        </span>
        <span
          aria-hidden="true"
          className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full shadow-sm ${
            selected ? 'bg-[#6fd43a] text-[#0a1407]' : 'bg-black/45 text-white'
          }`}
        >
          {selected && <Check aria-hidden="true" className="h-4 w-4" />}
        </span>
      </div>
      <span className="mt-2 block truncate text-xs font-bold text-[#131f10] dark:text-[#ecf4e8] sm:text-sm">
        {member.nama}
      </span>
      <span className="mt-1 inline-flex rounded-md bg-[#e3f2da] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#1e6800] dark:bg-[#1d3314] dark:text-[#8be05a]">
        {getStatusLabel(member, lang)}
      </span>
    </button>
  );
}

interface RankedMemberCardProps {
  member: MemberItem;
  rank: number;
  podium?: boolean;
}

function RankedMemberCard({ member, rank, podium = false }: RankedMemberCardProps) {
  const borderTone =
    rank === 1
      ? 'border-[#d4af37] dark:border-[#f4c44e]'
      : rank === 2
        ? 'border-[#aeb6bf] dark:border-[#c7cdd2]'
        : 'border-[#b87333] dark:border-[#d7975c]';
  const podiumBadgeTone =
    rank === 1
      ? 'bg-[#d4af37] text-[#211b08] dark:bg-[#f4c44e] dark:text-[#211b08]'
      : rank === 2
        ? 'bg-[#aeb6bf] text-[#171a1d] dark:bg-[#c7cdd2] dark:text-[#171a1d]'
        : 'bg-[#b87333] text-[#21130a] dark:bg-[#d7975c] dark:text-[#21130a]';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [generationFilter, setGenerationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<OshiStatusFilter>('all');
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(
    () => new Set(SORTER_MEMBERS.map((member) => member.id)),
  );
  const selectedMembers = SORTER_MEMBERS.filter((member) => selectedMemberIds.has(member.id));
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const filteredMembers = SORTER_MEMBERS.filter((member) => {
    const matchesGeneration = generationFilter === 'all' || member.gen === generationFilter;
    const matchesStatus = statusFilter === 'all' || member.statusCategory === statusFilter;
    const matchesSearch =
      !normalizedSearch ||
      member.nama.toLocaleLowerCase().includes(normalizedSearch) ||
      member.nama_penuh.toLocaleLowerCase().includes(normalizedSearch);
    return matchesGeneration && matchesStatus && matchesSearch;
  });

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((currentSelection) => {
      const nextSelection = new Set(currentSelection);
      if (nextSelection.has(memberId)) nextSelection.delete(memberId);
      else nextSelection.add(memberId);
      return nextSelection;
    });
  };

  const applyMemberFilters = (generation: string, status: OshiStatusFilter) => {
    setGenerationFilter(generation);
    setStatusFilter(status);
    setSelectedMemberIds(
      new Set(
        SORTER_MEMBERS.filter(
          (member) =>
            (generation === 'all' || member.gen === generation) &&
            (status === 'all' || member.statusCategory === status),
        ).map((member) => member.id),
      ),
    );
  };

  const selectGeneration = (generation: string) => {
    applyMemberFilters(generation, statusFilter);
  };

  const selectStatus = (status: OshiStatusFilter) => {
    applyMemberFilters(generationFilter, status);
  };

  const setVisibleMembersSelected = (selected: boolean) => {
    const visibleIds = new Set(filteredMembers.map((member) => member.id));
    setSelectedMemberIds((currentSelection) => {
      const nextSelection = new Set(currentSelection);
      visibleIds.forEach((memberId) => {
        if (selected) nextSelection.add(memberId);
        else nextSelection.delete(memberId);
      });
      return nextSelection;
    });
  };

  const startSort = () => {
    if (selectedMembers.length < 2) return;

    const [first, second, ...queue] = shuffleMembers(selectedMembers);

    setSession({
      sorted: [first],
      queue,
      current: second,
      low: 0,
      high: 1,
      comparisons: 0,
      history: [],
    });
  };

  const returnToSelection = () => {
    setSession(null);
    setSearchTerm('');
    setGenerationFilter('all');
    setStatusFilter('all');
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

  const tieMembers = () => {
    setSession((currentSession) => {
      if (!currentSession?.current || currentSession.low >= currentSession.high) {
        return currentSession;
      }

      const middle = Math.floor((currentSession.low + currentSession.high) / 2);
      const sorted = [...currentSession.sorted];
      // Keep tied members adjacent, with the existing sorted member first for stable ordering.
      sorted.splice(middle + 1, 0, currentSession.current);
      const [nextCandidate, ...queue] = currentSession.queue;
      const previousSnapshot: SortSnapshot = {
        sorted: currentSession.sorted,
        queue: currentSession.queue,
        current: currentSession.current,
        low: currentSession.low,
        high: currentSession.high,
        comparisons: currentSession.comparisons,
      };

      return {
        sorted,
        queue,
        current: nextCandidate ?? null,
        low: 0,
        high: sorted.length,
        comparisons: currentSession.comparisons + 1,
        history: [...currentSession.history, previousSnapshot],
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
  const sessionMemberCount = session
    ? session.sorted.length + session.queue.length + Number(Boolean(session.current))
    : 0;
  const progress = session
    ? Math.round((session.sorted.length / Math.max(sessionMemberCount, 1)) * 100)
    : 0;
  const rankedGenerations = session
    ? Array.from(new Set(session.sorted.map((member) => member.gen))).sort(
        (first, second) => Number(first) - Number(second),
      )
    : [];
  const rankingText = session && !session.current
    ? [
        t.oshi_share_intro,
        ...session.sorted.map((member, index) => `${index + 1}. ${member.nama}`),
      ].join('\n')
    : '';
  const shareUrl = rankingText ? `https://wa.me/?text=${encodeURIComponent(rankingText)}` : undefined;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8" aria-labelledby="oshi-sorter-title">
      {!session && (
        <div className="space-y-4">
          <header className="overflow-hidden rounded-2xl border border-[#24371f] bg-[#111b0e] p-5 text-white shadow-[0_12px_30px_rgba(10,20,7,0.16)] sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8be05a]">
                  {t.oshi_eyebrow}
                </p>
                <h1 id="oshi-sorter-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {t.oshi_title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-white sm:text-base">
                  {t.oshi_setup_sub}
                </p>
              </div>
              <div className="flex items-center gap-3 self-start rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 sm:self-auto">
                <span className="text-2xl font-black leading-none text-[#8be05a]">{selectedMembers.length}</span>
                <span className="text-xs font-semibold leading-tight text-white">
                  {t.oshi_selected_members.replace('%n', String(selectedMembers.length))}
                  <span className="mt-0.5 block text-[10px] opacity-75">/ {SORTER_MEMBERS.length} {t.oshi_member_count.replace('%n', '').trim()}</span>
                </span>
              </div>
            </div>
            <div
              className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-label={t.oshi_selected_members.replace('%n', String(selectedMembers.length))}
              aria-valuemin={0}
              aria-valuemax={SORTER_MEMBERS.length}
              aria-valuenow={selectedMembers.length}
            >
              <div
                className="h-full rounded-full bg-[#6fd43a] transition-[width] duration-300"
                style={{ width: `${(selectedMembers.length / SORTER_MEMBERS.length) * 100}%` }}
              />
            </div>
          </header>

          <div className="rounded-2xl border border-[#dce6d7] bg-white/85 p-4 shadow-sm backdrop-blur-sm dark:border-[#24371f] dark:bg-[#111b0e]/90 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">{t.oshi_search_label}</span>
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687964] dark:text-[#a8b99f]" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t.oshi_search_placeholder}
                  className="min-h-11 w-full rounded-xl border border-[#dce6d7] bg-[#f8fbf6] pl-10 pr-3 text-sm text-[#131f10] outline-none transition-colors placeholder:text-[#80907a] focus:border-[#278500] focus:ring-2 focus:ring-[#278500]/20 dark:border-[#34472d] dark:bg-[#152112] dark:text-[#ecf4e8] dark:placeholder:text-[#83947b] dark:focus:border-[#6fd43a] dark:focus:ring-[#6fd43a]/20"
                />
              </label>
              <div className="flex flex-wrap gap-2" role="group" aria-label={t.oshi_generation_filter}>
                <button
                  type="button"
                  aria-pressed={generationFilter === 'all'}
                  onClick={() => selectGeneration('all')}
                  className={`min-h-9 rounded-lg px-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:focus-visible:outline-[#6fd43a] ${
                    generationFilter === 'all'
                      ? 'bg-[#278500] text-white dark:bg-[#6fd43a] dark:text-[#0a1407]'
                      : 'border border-[#dce6d7] bg-white text-[#52634c] hover:bg-[#f2f8ef] dark:border-[#34472d] dark:bg-[#152112] dark:text-[#bfd0b6] dark:hover:bg-[#1d2d17]'
                  }`}
                >
                  {t.oshi_all_generations}
                </button>
                {SORTER_GENERATIONS.map((generation) => {
                  const generationValue = String(generation);
                  const isActive = generationFilter === generationValue;
                  return (
                    <button
                      key={generationValue}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => selectGeneration(generationValue)}
                      className={`min-h-9 rounded-lg px-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:focus-visible:outline-[#6fd43a] ${
                        isActive
                          ? 'bg-[#278500] text-white dark:bg-[#6fd43a] dark:text-[#0a1407]'
                          : 'border border-[#dce6d7] bg-white text-[#52634c] hover:bg-[#f2f8ef] dark:border-[#34472d] dark:bg-[#152112] dark:text-[#bfd0b6] dark:hover:bg-[#1d2d17]'
                      }`}
                    >
                      Gen {generationValue}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t.oshi_status_filter}>
              {(
                [
                  { value: 'all', label: t.oshi_all_statuses },
                  { value: 'active', label: t.f_aktif },
                  { value: 'non-active', label: t.f_non },
                  { value: 'graduated', label: t.f_grad },
                ] as const
              ).map(({ value, label }) => {
                const isActive = statusFilter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => selectStatus(value)}
                    className={`min-h-9 rounded-lg px-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:focus-visible:outline-[#6fd43a] ${
                      isActive
                        ? 'bg-[#278500] text-white dark:bg-[#6fd43a] dark:text-[#0a1407]'
                        : 'border border-[#dce6d7] bg-white text-[#52634c] hover:bg-[#f2f8ef] dark:border-[#34472d] dark:bg-[#152112] dark:text-[#bfd0b6] dark:hover:bg-[#1d2d17]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#e4ece0] pt-3 dark:border-[#263820]">
              <p className="text-xs font-semibold text-[#52634c] dark:text-[#a8b99f]">
                {t.oshi_visible_members.replace('%n', String(filteredMembers.length))}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleMembersSelected(true)}
                  disabled={!filteredMembers.length}
                  className="min-h-8 rounded-lg px-2.5 text-xs font-semibold text-[#278500] transition-colors hover:bg-[#edf5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#8be05a] dark:hover:bg-[#1d2d17] dark:focus-visible:outline-[#6fd43a]"
                >
                  {t.oshi_select_visible}
                </button>
                <button
                  type="button"
                  onClick={() => setVisibleMembersSelected(false)}
                  disabled={!filteredMembers.some((member) => selectedMemberIds.has(member.id))}
                  className="min-h-8 rounded-lg px-2.5 text-xs font-semibold text-[#52634c] transition-colors hover:bg-[#f2f6ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#a8b99f] dark:hover:bg-[#1d2d17] dark:focus-visible:outline-[#6fd43a]"
                >
                  {t.oshi_clear_visible}
                </button>
              </div>
            </div>

            {filteredMembers.length ? (
              <ul className="mt-3 grid grid-cols-2 gap-2 min-[520px]:grid-cols-3 xl:grid-cols-4 sm:gap-3" aria-label={t.oshi_items_to_rank}>
                {filteredMembers.map((member) => (
                  <li key={member.id}>
                    <SelectableMemberCard
                      member={member}
                      lang={lang}
                      selected={selectedMemberIds.has(member.id)}
                      onToggle={() => toggleMember(member.id)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 rounded-xl bg-[#f6faf4] px-4 py-8 text-center text-sm text-[#52634c] dark:bg-[#152112] dark:text-[#a8b99f]" role="status">
                {t.oshi_empty_search}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-[#dce6d7] bg-white/85 p-4 shadow-sm backdrop-blur-sm dark:border-[#24371f] dark:bg-[#111b0e]/90 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="font-semibold text-[#131f10] dark:text-[#ecf4e8]">
                {t.oshi_selected_members.replace('%n', String(selectedMembers.length))}
              </p>
              <p className="mt-1 text-xs text-[#52634c] dark:text-[#a8b99f]">
                {selectedMembers.length < 2 ? t.oshi_min_members : t.oshi_session_note}
              </p>
            </div>
            <button
              type="button"
              onClick={startSort}
              disabled={selectedMembers.length < 2}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#278500] px-6 text-sm font-bold text-white shadow-[0_4px_12px_rgba(39,133,0,0.2)] transition-colors hover:bg-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#6fd43a] dark:text-[#0a1407] dark:hover:bg-[#82df52] dark:focus-visible:outline-[#6fd43a]"
            >
              {t.oshi_start_selected}
            </button>
          </div>
        </div>
      )}

      {session?.current && currentOpponent && (
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#278500] dark:text-[#6fd43a]">
                {t.oshi_eyebrow}
              </p>
              <h1 id="oshi-sorter-title" className="text-2xl font-bold tracking-tight text-[#131f10] dark:text-[#ecf4e8] sm:text-3xl">
                {t.oshi_title}
              </h1>
            </div>
            <div className="flex justify-end gap-1.5">
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
              onClick={returnToSelection}
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#278500]/50 px-2.5 text-xs font-semibold text-[#278500] transition-colors hover:bg-[#e3f2da] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#6fd43a]/50 dark:text-[#6fd43a] dark:hover:bg-[#1d3314] dark:focus-visible:outline-[#6fd43a]"
            >
              {t.oshi_restart}
            </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#dce6d7] bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-[#24371f] dark:bg-[#111b0e]/85 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-[#263b20] dark:text-[#e3efdc]">
                {t.oshi_ranked}: {session.sorted.length} / {sessionMemberCount}
              </span>
              <span className="text-[#52634c] dark:text-[#a8b99f]">
                {t.oshi_progress}: {progress}%
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-[#e7eee3] dark:bg-[#263720]"
              role="progressbar"
              aria-label={t.oshi_progress_label}
              aria-valuemin={0}
              aria-valuemax={sessionMemberCount}
              aria-valuenow={session.sorted.length}
            >
              <div
                className="h-full rounded-full bg-[#278500] transition-[width] duration-300 dark:bg-[#6fd43a]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#dce6d7] bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-[#24371f] dark:bg-[#111b0e]/85 sm:p-5">
            <h2 className="mb-5 text-center text-base font-light uppercase tracking-[0.1em] text-[#131f10] dark:text-[#ecf4e8] sm:text-lg">
              {t.oshi_question}
            </h2>
            <div className="mx-auto w-full max-w-[34rem]">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
                <ComparisonMemberCard member={session.current} lang={lang} onSelect={() => chooseMember(true)} />
                <span className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#52634c] dark:text-[#a8b99f]">
                  {t.oshi_vs}
                </span>
                <ComparisonMemberCard member={currentOpponent} lang={lang} onSelect={() => chooseMember(false)} />
              </div>
              <button
                type="button"
                onClick={tieMembers}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#278500] px-5 text-sm font-bold uppercase text-white shadow-[0_4px_12px_rgba(39,133,0,0.2)] transition-colors hover:bg-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:bg-[#6fd43a] dark:text-[#0a1407] dark:hover:bg-[#82df52] dark:focus-visible:outline-[#6fd43a]"
              >
                {t.oshi_tie}
              </button>
            </div>
          </div>
        </div>
      )}

      {session && !session.current && (
        <div className="mx-auto max-w-4xl space-y-4 rounded-2xl border border-[#dce6d7] bg-white/85 p-4 shadow-sm backdrop-blur-sm dark:border-[#24371f] dark:bg-[#111b0e]/90 sm:p-5">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#278500] dark:text-[#6fd43a]">
              {t.oshi_completed}
            </p>
            <h2 id="oshi-sorter-title" className="truncate text-lg font-bold tracking-tight text-[#131f10] dark:text-[#ecf4e8] sm:text-xl">
              {t.oshi_results}
            </h2>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-[#dce6d7] bg-[#f6faf4] px-3 py-2.5 text-xs dark:border-[#2b4225] dark:bg-[#152112] sm:flex-row sm:items-center sm:justify-between">
            <p className="flex flex-wrap items-center gap-x-2 text-[#263b20] dark:text-[#e3efdc]">
              <span className="font-semibold">{t.oshi_member_count.replace('%n', String(session.sorted.length))}</span>
              <span aria-hidden="true" className="text-[#8a9b82]">·</span>
              <span className="text-[#52634c] dark:text-[#a8b99f]">
                {t.oshi_filter_label}: {rankedGenerations.map((generation) => `Gen ${generation}`).join(', ')}
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="rounded-lg border border-[#dce6d7] px-2.5 py-2 text-[#52634c] dark:border-[#34472d] dark:text-[#a8b99f]">
                {t.oshi_comparisons}: {session.comparisons}
              </p>
              <button
                type="button"
                onClick={returnToSelection}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-[#263b20] px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#1d2d17] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:bg-[#263720] dark:text-[#e3efdc] dark:hover:bg-[#33472b] dark:focus-visible:outline-[#6fd43a]"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span>{t.oshi_sort_again}</span>
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => {
                  if (navigator.share) {
                    event.preventDefault();
                    void navigator.share({ title: t.oshi_title, text: rankingText }).catch(() => {});
                  }
                }}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-[#278500] px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:bg-[#6fd43a] dark:text-[#0a1407] dark:hover:bg-[#82df52] dark:focus-visible:outline-[#6fd43a]"
              >
                <Share2 aria-hidden="true" className="h-4 w-4" />
                {t.oshi_share_ranking}
              </a>
            </div>
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
        </div>
      )}
    </section>
  );
}
