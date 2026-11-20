import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  getMemberCategory,
  MemberCategory,
  MemberItem,
  MEMBERS_DATA,
} from '../data/klp48Data';
import { Lang, TRANSLATIONS } from '../i18n/translations';
import { MemberAvatar } from './MemberAvatar';
import { MemberModal } from './MemberModal';

interface MembersViewProps {
  lang: Lang;
}

type StatusFilter = MemberCategory | 'semua';
type GenFilter = 'all' | '1' | '2';

export function MembersView({ lang }: MembersViewProps) {
  const t = TRANSLATIONS[lang];
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('aktif');
  const [genFilter, setGenFilter] = useState<GenFilter>('all');
  const [selected, setSelected] = useState<{ member: MemberItem; index: number } | null>(null);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MEMBERS_DATA.map((member, originalIndex) => ({ member, originalIndex }))
      .filter(({ member }) => {
        const matchesStatus =
          statusFilter === 'semua' || statusFilter === getMemberCategory(member.status);
        const matchesGen = genFilter === 'all' || member.gen === genFilter;
        const matchesQuery =
          !q ||
          `${member.nama} ${member.nama_penuh}`.toLowerCase().includes(q);
        return matchesStatus && matchesGen && matchesQuery;
      })
      .sort((a, b) =>
        a.member.nama.localeCompare(b.member.nama, undefined, { sensitivity: 'base' })
      );
  }, [query, statusFilter, genFilter]);

  return (
    <div>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#278500] dark:text-[#6fd43a]">
          {t.m_eyebrow}
        </p>
        <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-[#131f10] sm:text-6xl dark:text-[#ecf4e8]">
          {t.n_member}{' '}
          <span className="font-mono-num text-[#278500] dark:text-[#6fd43a]">
            / {filteredMembers.length}
          </span>
        </h1>
        <p className="mt-2 text-sm text-[#52634c] sm:text-base dark:text-[#98ad90]">
          {t.m_sub}
        </p>
      </header>

      {/* Search & Filter Toolbar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce6d7] pb-6 dark:border-[#24371f]">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#52634c] dark:text-[#98ad90]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.m_ph}
            aria-label={t.m_ph}
            className="min-h-[42px] w-full rounded-lg border border-[#dce6d7] bg-white py-2 pr-3 pl-10 text-sm text-[#131f10] placeholder:text-[#52634c] focus:border-[#278500] focus:outline-none dark:border-[#24371f] dark:bg-[#142111] dark:text-[#ecf4e8] dark:placeholder:text-[#98ad90] dark:focus:border-[#6fd43a]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Generation segmented filter */}
          <div
            className="inline-flex rounded-lg border border-[#dce6d7] bg-white p-1 dark:border-[#24371f] dark:bg-[#142111]"
            role="group"
            aria-label="Filter by generation"
          >
            {(
              [
                { key: 'all', label: t.gen_all },
                { key: '1', label: t.gen_1 },
                { key: '2', label: t.gen_2 },
              ] as Array<{ key: GenFilter; label: string }>
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setGenFilter(opt.key)}
                className={`min-h-[32px] whitespace-nowrap rounded-md px-3 text-xs font-semibold transition-colors ${
                  genFilter === opt.key
                    ? 'bg-[#278500] text-white dark:bg-[#6fd43a] dark:text-[#0a1407]'
                    : 'text-[#52634c] hover:text-[#131f10] dark:text-[#98ad90] dark:hover:text-[#ecf4e8]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Status segmented filter */}
          <div
            className="inline-flex flex-wrap rounded-lg border border-[#dce6d7] bg-white p-1 dark:border-[#24371f] dark:bg-[#142111]"
            role="group"
            aria-label="Filter by member status"
          >
            {(['aktif', 'non', 'grad', 'semua'] as StatusFilter[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`min-h-[32px] whitespace-nowrap rounded-md px-3 text-xs font-semibold transition-colors ${
                  statusFilter === key
                    ? 'bg-[#278500] text-white dark:bg-[#6fd43a] dark:text-[#0a1407]'
                    : 'text-[#52634c] hover:text-[#131f10] dark:text-[#98ad90] dark:hover:text-[#ecf4e8]'
                }`}
              >
                {t[`f_${key}`]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Member Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredMembers.map(({ member, originalIndex }, idx) => {
            const birthDate =
              lang === 'en' && member.tarikh_lahir_en
                ? member.tarikh_lahir_en
                : member.tarikh_lahir;
            const statusNote =
              member.statusCategory === 'active'
                ? lang === 'en' && member.nota_status_en
                  ? member.nota_status_en
                  : member.nota_status
                : '';

            const socials = [
              { label: 'Instagram', handle: member.instagram, base: 'https://www.instagram.com/' },
              { label: 'TikTok', handle: member.tiktok, base: 'https://www.tiktok.com/@' },
              { label: 'X', handle: member.x, base: 'https://x.com/' },
            ].filter((s) =>
              /^[A-Za-z0-9._]{1,40}$/.test((s.handle || '').trim().replace(/^@/, ''))
            );

            return (
              <article
                key={member.nama}
                className="group flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => setSelected({ member, index: originalIndex })}
                  className="w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#278500] dark:focus-visible:outline-[#6fd43a]"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#dce6d7] bg-[#e9f2e4] transition-transform duration-150 group-hover:-translate-y-0.5 dark:border-[#24371f] dark:bg-[#192915]">
                    <MemberAvatar
                      member={member}
                      indexNumber={originalIndex}
                      className="h-full w-full"
                      imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
                      initialsClassName="text-4xl"
                    />
                    <span className="font-mono-num pointer-events-none absolute top-2.5 left-3 text-xs font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between gap-2">
                    <h2 className="font-display truncate text-base font-bold text-[#131f10] transition-colors group-hover:text-[#278500] dark:text-[#ecf4e8] dark:group-hover:text-[#6fd43a]">
                      {member.nama}
                    </h2>
                    <span className="font-mono-num shrink-0 text-[11px] font-medium text-[#52634c] dark:text-[#98ad90]">
                      GEN {member.gen}
                    </span>
                  </div>

                  <p className="mt-0.5 break-words text-xs leading-relaxed text-[#52634c] dark:text-[#98ad90]">
                    {member.nama_penuh}
                    {birthDate && <span className="whitespace-nowrap"> · {birthDate}</span>}
                  </p>

                  {statusNote && (
                    <p className="mt-1 text-xs font-medium text-[#278500] dark:text-[#6fd43a]">
                      {statusNote}
                    </p>
                  )}
                </button>

                {socials.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#52634c] dark:text-[#98ad90]">
                    {socials.map((s, sIdx) => {
                      const handle = s.handle.trim().replace(/^@/, '');
                      return (
                        <span key={s.label} className="inline-flex items-center gap-2">
                          {sIdx > 0 && <span aria-hidden="true">·</span>}
                          <a
                            href={`${s.base}${handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#278500] hover:underline dark:text-[#6fd43a]"
                          >
                            {s.label}
                          </a>
                        </span>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-[#dce6d7] bg-white p-8 text-center text-sm text-[#52634c] dark:border-[#24371f] dark:bg-[#142111] dark:text-[#98ad90]">
          {t.nomatch}
        </div>
      )}

      <MemberModal
        member={selected?.member ?? null}
        indexNumber={selected?.index ?? 0}
        lang={lang}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
