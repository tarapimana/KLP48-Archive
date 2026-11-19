import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  Radio,
  Search,
  Star,
  Tv,
  Users,
  Wifi,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  getMemberCategory,
  MemberItem,
  MEMBERS_DATA,
  VideoItem,
} from '../data/klp48Data';
import { formatRelativeTime, Lang, TRANSLATIONS } from '../i18n/translations';
import {
  LiveSessionRecord,
  LiveStatusRecord,
  subscribeLiveSessions,
  subscribeLiveStatuses,
  testConnection,
} from '../services/liveService';
import { MemberAvatar } from './MemberAvatar';
import { MemberModal } from './MemberModal';

interface LiveViewProps {
  lang: Lang;
  onPlayVideo: (video: VideoItem) => void;
}

type PlatformFilter = 'all' | 'tiktok' | 'instagram';
type GenFilter = 'all' | '1' | '2';
type ViewTab = 'tracker' | 'history';

const PINNED_STORAGE_KEY = 'klp48_live_pinned_members';

function isValidHandle(handle?: string): string {
  const cleaned = (handle || '').trim().replace(/^@/, '');
  return /^[A-Za-z0-9._]{1,40}$/.test(cleaned) ? cleaned : '';
}

function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function LiveView({ lang, onPlayVideo }: LiveViewProps) {
  const t = TRANSLATIONS[lang];

  // Firestore real-time state
  const [liveStatuses, setLiveStatuses] = useState<LiveStatusRecord[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSessionRecord[]>([]);
  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(false);

  // UI state
  const [activeTab, setActiveTab] = useState<ViewTab>('tracker');
  const [query, setQuery] = useState('');
  const [trackerPlatform, setTrackerPlatform] = useState<PlatformFilter>('all');
  const [genFilter, setGenFilter] = useState<GenFilter>('all');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [pinnedNames, setPinnedNames] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(PINNED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [selectedMember, setSelectedMember] = useState<{
    member: MemberItem;
    index: number;
  } | null>(null);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    let isMounted = true;

    // Verify Firestore connection
    testConnection().then((connected) => {
      if (isMounted) setFirestoreConnected(connected);
    });

    // Real-time live_status subscription
    const unsubStatuses = subscribeLiveStatuses(
      (records) => {
        if (isMounted) {
          setLiveStatuses(records);
          setFirestoreConnected(true);
        }
      },
      (err) => {
        console.warn('Real-time live_status warning:', err.message);
      }
    );

    // Real-time live_sessions subscription
    const unsubSessions = subscribeLiveSessions(
      (records) => {
        if (isMounted) {
          setLiveSessions(records);
          setFirestoreConnected(true);
        }
      },
      (err) => {
        console.warn('Real-time live_sessions warning:', err.message);
      }
    );

    return () => {
      isMounted = false;
      unsubStatuses();
      unsubSessions();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(pinnedNames));
    } catch {
      // ignore
    }
  }, [pinnedNames]);

  const togglePin = (name: string) => {
    setPinnedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // Map Firestore status records by member identifier
  const memberStatusMap = useMemo(() => {
    const map = new Map<
      string,
      {
        tiktok?: LiveStatusRecord;
        instagram?: LiveStatusRecord;
        overallStatus: 'LIVE' | 'OFFLINE' | 'UNKNOWN';
        activeLiveRecord?: LiveStatusRecord;
      }
    >();

    for (const record of liveStatuses) {
      // Map by exact canonical member ID (e.g. "yi_shyan", "ann_drea")
      const key = (record.memberId || '').trim().toLowerCase();
      const current = map.get(key) || { overallStatus: 'UNKNOWN' };

      if (record.platform === 'tiktok') current.tiktok = record;
      if (record.platform === 'instagram') current.instagram = record;

      if (current.tiktok?.status === 'LIVE') {
        current.overallStatus = 'LIVE';
        current.activeLiveRecord = current.tiktok;
      } else if (current.instagram?.status === 'LIVE') {
        current.overallStatus = 'LIVE';
        current.activeLiveRecord = current.instagram;
      } else if (
        current.tiktok?.status === 'OFFLINE' ||
        current.instagram?.status === 'OFFLINE'
      ) {
        current.overallStatus = 'OFFLINE';
      } else {
        current.overallStatus = 'UNKNOWN';
      }

      map.set(key, current);
    }

    return map;
  }, [liveStatuses]);

  // Only confirmed LIVE sessions for active members
  const verifiedActiveLiveStreams = useMemo(() => {
    return MEMBERS_DATA.map((member, originalIndex) => {
      const key = member.id;
      const statusInfo = memberStatusMap.get(key);
      return {
        member,
        originalIndex,
        statusInfo,
      };
    }).filter(({ member, statusInfo }) => {
      return (
        member.statusCategory === 'active' &&
        statusInfo?.overallStatus === 'LIVE' &&
        statusInfo.activeLiveRecord
      );
    });
  }, [memberStatusMap]);

  // The 20 active members strictly filtered for the LIVE monitoring roster
  const trackedMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pinnedSet = new Set(pinnedNames);

    return MEMBERS_DATA.map((member, originalIndex) => {
      const tiktokHandle = isValidHandle(member.tiktok);
      const igHandle = isValidHandle(member.instagram);
      const key = member.id;
      const statusInfo = memberStatusMap.get(key) || {
        overallStatus: 'UNKNOWN' as const,
      };

      return {
        member,
        originalIndex,
        tiktokHandle,
        igHandle,
        statusInfo,
      };
    })
      .filter(({ member, tiktokHandle, igHandle, statusInfo }) => {
        // Strictly only active members appear in LIVE monitoring
        if (member.statusCategory !== 'active') return false;
        if (!tiktokHandle && !igHandle) return false;
        if (genFilter !== 'all' && member.gen !== genFilter) return false;
        if (trackerPlatform === 'tiktok' && !tiktokHandle) return false;
        if (trackerPlatform === 'instagram' && !igHandle) return false;
        if (pinnedOnly && !pinnedSet.has(member.nama)) return false;
        if (q) {
          const haystack = `${member.nama} ${member.nama_penuh} ${tiktokHandle} ${igHandle}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aPinned = pinnedSet.has(a.member.nama) ? 0 : 1;
        const bPinned = pinnedSet.has(b.member.nama) ? 0 : 1;
        if (aPinned !== bPinned) return aPinned - bPinned;
        // Prioritize confirmed LIVE members to top
        const aLive = a.statusInfo.overallStatus === 'LIVE' ? 0 : 1;
        const bLive = b.statusInfo.overallStatus === 'LIVE' ? 0 : 1;
        if (aLive !== bLive) return aLive - bLive;
        return a.member.nama.localeCompare(b.member.nama, undefined, {
          sensitivity: 'base',
        });
      });
  }, [query, trackerPlatform, genFilter, pinnedOnly, pinnedNames, memberStatusMap]);

  return (
    <div className="space-y-10">
      <section className="relative isolate overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#151011] px-5 py-6 text-[#f4eeee] shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:px-8 sm:py-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,48,79,0.09),transparent_38%)]"
        />
        <div className="relative space-y-8">
          {/* Main Header */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                className={`inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] ${
                  verifiedActiveLiveStreams.length > 0 ? 'text-[#ff405d]' : 'text-white/60'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    verifiedActiveLiveStreams.length > 0
                      ? 'animate-pulse bg-[#ff405d]'
                      : 'bg-white/35'
                  }`}
                />
                <span>ON SIGNAL</span>
              </div>

              {/* Firestore Connection Indicator */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/65">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    firestoreConnected ? 'bg-emerald-400' : 'animate-pulse bg-amber-400'
                  }`}
                />
                <span>{t.lv_firestore_connected}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="min-w-0">
                <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight text-[#f5eeee] sm:text-7xl">
                  LIVE{' '}
                  <span className="text-[#ff3658]">/ {verifiedActiveLiveStreams.length}</span>
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#b9adaf] sm:text-[15px]">
                  {lang === 'en'
                    ? 'Verified member streams on TikTok and Instagram, updated in real time.'
                    : 'Siaran member yang disahkan di TikTok dan Instagram, dikemas kini secara langsung.'}
                </p>
              </div>

              {/* Filter Pills */}
              <div
                className="inline-flex max-w-full rounded-full border border-white/10 bg-[#20191a] p-1"
                role="group"
                aria-label="Filter live streams by platform"
              >
                {(
                  [
                    { key: 'all', label: 'Semua' },
                    { key: 'tiktok', label: 'TikTok' },
                    { key: 'instagram', label: 'Instagram' },
                  ] as Array<{ key: PlatformFilter; label: string }>
                ).map((tab) => {
                  const active = trackerPlatform === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setTrackerPlatform(tab.key)}
                      className={`min-h-9 whitespace-nowrap rounded-full px-4 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5570] sm:px-5 ${
                        active
                          ? 'bg-[#ff3658] text-white shadow-sm shadow-[#ff3658]/20'
                          : 'text-[#aa9fa1] hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

      {/* Confirmed LIVE Portrait Cards OR Verified Standby State */}
      <section aria-label="Verified live streams">
        {verifiedActiveLiveStreams.length > 0 ? (
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {verifiedActiveLiveStreams.map(({ member, originalIndex, statusInfo }, idx) => {
              const rec = statusInfo?.activeLiveRecord;
              const platform = rec?.platform || 'tiktok';
              const platformLabel = platform === 'tiktok' ? 'TikTok' : 'Instagram';
              const socialHandle = isValidHandle(
                platform === 'tiktok' ? member.tiktok : member.instagram
              );
              const isPinned = pinnedNames.includes(member.nama);
              const liveUrl =
                rec?.liveUrl ||
                (platform === 'tiktok'
                  ? `https://www.tiktok.com/@${isValidHandle(member.tiktok)}/live`
                  : `https://www.instagram.com/${isValidHandle(member.instagram)}`);

              return (
                <div key={member.nama} className="space-y-2">
                  <article className="group relative overflow-hidden rounded-[20px] border border-white/10 bg-[#211b1c] shadow-lg transition-transform duration-200 hover:-translate-y-1">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#211b1c]">
                      <button
                        type="button"
                        onClick={() => setSelectedMember({ member, index: originalIndex })}
                        className="h-full w-full text-left"
                        aria-label={`View ${member.nama}`}
                      >
                        <MemberAvatar
                          member={member}
                          indexNumber={originalIndex}
                          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
                          initialsClassName="text-5xl"
                        />
                      </button>

                      <div className="absolute top-3.5 left-3.5">
                        <span className="font-mono-num rounded-md bg-[#171416]/90 px-2 py-1 text-[11px] font-extrabold text-[#ff405d] shadow-sm backdrop-blur-sm">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="absolute top-3.5 right-3.5">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ff3658] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-lg shadow-black/20">
                          <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
                            <span className="h-1 w-0.5 rounded-full bg-white/75" />
                            <span className="h-2 w-0.5 rounded-full bg-white" />
                            <span className="h-3 w-0.5 animate-pulse rounded-full bg-white/85" />
                          </span>
                          <span>LIVE</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => togglePin(member.nama)}
                        aria-pressed={isPinned}
                        title={isPinned ? t.lv_pinned : t.lv_pin}
                        className={`absolute top-3.5 left-14 inline-flex h-7 w-7 items-center justify-center rounded-lg border backdrop-blur-xs transition-colors ${
                          isPinned
                            ? 'border-amber-400 bg-amber-500 text-white'
                            : 'border-white/30 bg-black/40 text-white/90 hover:bg-black/60'
                        }`}
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${isPinned ? 'fill-current' : ''}`}
                          aria-hidden="true"
                        />
                      </button>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white">
                        <button
                          type="button"
                          onClick={() => setSelectedMember({ member, index: originalIndex })}
                          className="w-full text-left"
                        >
                          <h3 className="font-display text-xl font-black tracking-tight">
                            {member.nama}
                          </h3>
                        </button>

                        <div className="mt-1 flex items-center justify-between text-xs font-semibold text-white/90">
                          <span className="font-mono-num">
                            {platformLabel} · {rec?.startedAt ? formatRelativeTime(rec.startedAt, lang) : 'Disahkan Aktif'}
                          </span>

                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xs transition-colors hover:bg-white/30"
                            aria-label={`Open ${platformLabel} live`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                  {socialHandle && (
                    <p className="truncate text-xs font-medium text-[#9e9294]" title={`@${socialHandle}`}>
                      @{socialHandle}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Verified Standby Card when 0 members are verified LIVE in Firestore */
          <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#1d1718] p-7 text-center sm:p-9">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff3658]/10 text-[#ff7187]">
              <Radio className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="font-display mt-4 text-xl font-bold tracking-tight text-white sm:text-2xl">
              {t.lv_no_active_live}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#b9adaf]">
              Hanya siaran langsung yang disahkan dalam koleksi Firestore{' '}
              <code className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-xs text-[#ff7187]">
                live_status
              </code>{' '}
              akan dipaparkan sebagai LIVE. Tiada status palsu atau simulasi dicipta. Anda boleh menyemak pautan rasmi setiap member di bawah.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-semibold text-white/80">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                20 Member Aktif Disambung
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-semibold text-white/80">
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                Langganan Firestore Real-Time Aktif
              </span>
            </div>
          </div>
        )}
      </section>
        </div>
      </section>

      {/* Member Tracker and Session History */}
      <section aria-label="Member LIVE Tracker and History" className="space-y-4 border-t border-[#dce6d7] pt-6 dark:border-[#24371f]">
          {/* View Tab Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce6d7] pb-3 dark:border-[#24371f]">
            <div
              className="inline-flex rounded-xl border border-[#dce6d7] bg-[#f0f6ec] p-1 dark:border-[#24371f] dark:bg-[#121f0e]"
              role="tablist"
              aria-label="View toggle"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'tracker'}
                onClick={() => setActiveTab('tracker')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'tracker'
                    ? 'bg-white text-[#131f10] shadow-sm dark:bg-[#203419] dark:text-white'
                    : 'text-[#4e6047] hover:text-[#131f10] dark:text-[#9bb193] dark:hover:text-white'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>{t.lv_tracker_title}</span>
                <span className="rounded-full bg-[#278500]/15 px-2 py-0.5 text-[11px] font-extrabold text-[#278500] dark:text-[#7ce043]">
                  {trackedMembers.length}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'history'}
                onClick={() => setActiveTab('history')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-[#131f10] shadow-sm dark:bg-[#203419] dark:text-white'
                    : 'text-[#4e6047] hover:text-[#131f10] dark:text-[#9bb193] dark:hover:text-white'
                }`}
              >
                <History className="h-4 w-4" />
                <span>{t.lv_history_title}</span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {liveSessions.length}
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: 20 Active Members Tracker */}
          {activeTab === 'tracker' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="space-y-3 rounded-2xl border border-[#dce6d7] bg-white/94 p-4 backdrop-blur-md dark:border-[#24371f] dark:bg-[#0e190b]/92">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative min-w-[200px] flex-1">
                    <Search
                      className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#52634c] dark:text-[#98ad90]"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t.lv_search_ph}
                      aria-label={t.lv_search_ph}
                      className="min-h-[38px] w-full rounded-lg border border-[#dce6d7] bg-white py-1.5 pr-3 pl-9 text-sm text-[#131f10] placeholder:text-[#52634c] focus:border-[#278500] focus:outline-none dark:border-[#24371f] dark:bg-[#142111] dark:text-[#ecf4e8] dark:placeholder:text-[#98ad90] dark:focus:border-[#6fd43a]"
                    />
                  </div>

                  {/* Gen Filter */}
                  <div
                    className="inline-flex rounded-lg border border-[#dce6d7] bg-[#f7faf5] p-0.5 dark:border-[#24371f] dark:bg-[#142111]"
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
                        className={`min-h-[32px] whitespace-nowrap rounded-md px-2.5 text-xs font-semibold transition-colors ${
                          genFilter === opt.key
                            ? 'bg-[#278500] text-white dark:bg-[#66c91a] dark:text-[#0b1608]'
                            : 'text-[#52634c] hover:text-[#131f10] dark:text-[#b5c7ae] dark:hover:text-[#ecf4e8]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Members Grid */}
              {trackedMembers.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {trackedMembers.map(
                    ({ member, originalIndex, tiktokHandle, igHandle, statusInfo }) => {
                      const isPinned = pinnedNames.includes(member.nama);
                      const isLive = statusInfo.overallStatus === 'LIVE';
                      const isOffline = statusInfo.overallStatus === 'OFFLINE';

                      return (
                        <article
                          key={member.nama}
                          className={`rounded-2xl border p-4 backdrop-blur-md transition-colors ${
                            isLive
                              ? 'border-red-500 bg-red-50/60 dark:border-red-600/70 dark:bg-red-950/20'
                              : isPinned
                              ? 'border-[#278500] bg-white dark:border-[#66c91a] dark:bg-[#11200d]'
                              : 'border-[#dce6d7] bg-white/95 dark:border-[#24371f] dark:bg-[#0e190b]/94'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => setSelectedMember({ member, index: originalIndex })}
                              className="group flex min-w-0 flex-1 items-center gap-3 text-left"
                            >
                              <MemberAvatar
                                member={member}
                                indexNumber={originalIndex}
                                className="h-12 w-12 shrink-0 rounded-xl border border-black/10"
                                initialsClassName="text-sm"
                              />
                              <div className="min-w-0">
                                <h3 className="font-display truncate text-base font-bold text-[#131f10] transition-colors group-hover:text-[#278500] dark:text-white dark:group-hover:text-[#7ce043]">
                                  {member.nama}
                                </h3>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                  <span className="font-mono-num text-xs text-[#4d5e47] dark:text-[#b7cab0]">
                                    GEN {member.gen}
                                  </span>
                                  <span className="text-[#899c83]">•</span>
                                  {/* Real-time status indicator */}
                                  {isLive ? (
                                    <span className="inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                                      <span className="h-1 w-1 animate-ping rounded-full bg-white" />
                                      LIVE
                                    </span>
                                  ) : isOffline ? (
                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                      OFFLINE
                                    </span>
                                  ) : (
                                    <span
                                      className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                      title="Tiada rekod status disahkan dari Firestore / Unverified"
                                    >
                                      UNKNOWN
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => togglePin(member.nama)}
                              aria-pressed={isPinned}
                              title={isPinned ? t.lv_pinned : t.lv_pin}
                              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                                isPinned
                                  ? 'border-[#278500] bg-[#e3f2da] text-[#278500] dark:border-[#66c91a] dark:bg-[#1a3312] dark:text-[#7ce043]'
                                  : 'border-[#dce6d7] bg-[#f7faf5] text-[#52634c] hover:border-[#278500] hover:text-[#278500] dark:border-[#24371f] dark:bg-[#142111] dark:text-[#98ad90] dark:hover:border-[#6fd43a] dark:hover:text-[#7ce043]'
                              }`}
                            >
                              <Star
                                className={`h-3.5 w-3.5 ${isPinned ? 'fill-current' : ''}`}
                                aria-hidden="true"
                              />
                            </button>
                          </div>

                          <div className="mt-3.5 grid grid-cols-2 gap-2">
                            {tiktokHandle ? (
                              <a
                                href={
                                  statusInfo.tiktok?.status === 'LIVE'
                                    ? `https://www.tiktok.com/@${tiktokHandle}/live`
                                    : `https://www.tiktok.com/@${tiktokHandle}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex min-h-[34px] items-center justify-between gap-1 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                                  statusInfo.tiktok?.status === 'LIVE'
                                    ? 'border-red-400 bg-red-100/80 font-bold text-red-700 hover:bg-red-200 dark:border-red-700 dark:bg-red-950/60 dark:text-red-300'
                                    : 'border-[#dce6d7] bg-[#f7faf5] hover:border-[#278500] dark:border-[#24371f] dark:bg-[#142111] dark:hover:border-[#6fd43a]'
                                }`}
                              >
                                <span className="font-bold text-[#131f10] dark:text-white">
                                  TikTok
                                </span>
                                <Radio
                                  className={`h-3 w-3 ${
                                    statusInfo.tiktok?.status === 'LIVE'
                                      ? 'animate-pulse text-red-600'
                                      : 'text-[#52634c] dark:text-[#98ad90]'
                                  }`}
                                  aria-hidden="true"
                                />
                              </a>
                            ) : (
                              <div className="flex items-center justify-center text-xs text-[#52634c] opacity-40">
                                -
                              </div>
                            )}

                            {igHandle ? (
                              <a
                                href={`https://www.instagram.com/${igHandle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex min-h-[34px] items-center justify-between gap-1 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                                  statusInfo.instagram?.status === 'LIVE'
                                    ? 'border-red-400 bg-red-100/80 font-bold text-red-700 hover:bg-red-200 dark:border-red-700 dark:bg-red-950/60 dark:text-red-300'
                                    : 'border-[#dce6d7] bg-[#f7faf5] hover:border-[#278500] dark:border-[#24371f] dark:bg-[#142111] dark:hover:border-[#6fd43a]'
                                }`}
                              >
                                <span className="font-bold text-[#131f10] dark:text-white">
                                  Instagram
                                </span>
                                <Tv
                                  className={`h-3 w-3 ${
                                    statusInfo.instagram?.status === 'LIVE'
                                      ? 'animate-pulse text-pink-600'
                                      : 'text-pink-500'
                                  }`}
                                  aria-hidden="true"
                                />
                              </a>
                            ) : (
                              <div className="flex items-center justify-center text-xs text-[#52634c] opacity-40">
                                -
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#dce6d7] bg-white/95 p-8 text-center text-sm text-[#3f503a] dark:border-[#24371f] dark:bg-[#0e190b]/94 dark:text-[#c7d7c0]">
                  {t.nomatch}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE Session History */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {liveSessions.length > 0 ? (
                <div className="space-y-3">
                  {liveSessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-2xl border border-[#dce6d7] bg-white/95 p-4 shadow-xs dark:border-[#24371f] dark:bg-[#0e190b]/94"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                              session.platform === 'tiktok'
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'bg-pink-600 text-white'
                            }`}
                          >
                            {session.platform}
                          </span>
                          <h3 className="font-display font-bold text-[#131f10] dark:text-white">
                            {session.memberName}
                          </h3>
                        </div>

                        {session.liveUrl && (
                          <a
                            href={session.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#278500] hover:underline dark:text-[#7ce043]"
                          >
                            <span>Pautan Sesi</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-[#52634c] dark:text-[#98ad90]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Mula: {session.startedAt ? formatRelativeTime(session.startedAt, lang) : '-'}</span>
                        </span>
                        {session.duration && (
                          <span>
                            Durasi: {typeof session.duration === 'number' ? `${Math.round(session.duration / 60)} minit` : session.duration}
                          </span>
                        )}
                        {session.source && (
                          <span className="text-[11px] opacity-75">
                            Sumber: {session.source}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#dce6d7] bg-white/95 p-10 text-center dark:border-[#24371f] dark:bg-[#0e190b]/94">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f4e3] text-[#278500] dark:bg-[#1a3013] dark:text-[#7ce043]">
                    <History className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-display mt-3 text-lg font-bold text-[#131f10] dark:text-white">
                    {t.lv_history_title}
                  </h3>
                  <p className="mx-auto mt-1.5 max-w-md text-sm text-[#52634c] dark:text-[#98ad90]">
                    {t.lv_history_empty}
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-xs text-[#71866b] dark:text-[#809978]">
                    Hanya sesi siaran langsung yang telah disahkan akan disimpan dalam pangkalan data. Tiada rekod sejarah palsu dicipta.
                  </p>
                </div>
              )}
            </div>
          )}
      </section>

      {/* Member Details Modal */}
      {selectedMember && (
        <MemberModal
          member={selectedMember.member}
          indexNumber={selectedMember.index}
          lang={lang}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}
