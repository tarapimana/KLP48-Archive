import { CheckCircle2, ExternalLink, Radio, Star, Wifi } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MemberItem, MEMBERS_DATA, VideoItem } from '../data/klp48Data';
import { formatRelativeTime, Lang, TRANSLATIONS } from '../i18n/translations';
import {
  LiveStatusRecord,
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

const PINNED_STORAGE_KEY = 'klp48_live_pinned_members';

function isValidHandle(handle?: string): string {
  const cleaned = (handle || '').trim().replace(/^@/, '');
  return /^[A-Za-z0-9._]{1,40}$/.test(cleaned) ? cleaned : '';
}

export function LiveView({ lang, onPlayVideo }: LiveViewProps) {
  const t = TRANSLATIONS[lang];

  // Firestore real-time state
  const [liveStatuses, setLiveStatuses] = useState<LiveStatusRecord[]>([]);
  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(false);

  // UI state
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
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

    return () => {
      isMounted = false;
      unsubStatuses();
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

  const filteredActiveLiveStreams = useMemo(() => {
    if (platformFilter === 'all') return verifiedActiveLiveStreams;
    return verifiedActiveLiveStreams.filter(
      ({ statusInfo }) => statusInfo?.activeLiveRecord?.platform === platformFilter
    );
  }, [platformFilter, verifiedActiveLiveStreams]);

  return (
    <div className="space-y-10">
      <section className="relative isolate overflow-hidden rounded-[28px] border border-[#dce6d7] bg-white/[0.92] px-5 py-6 text-[#131f10] shadow-[0_24px_80px_rgba(10,20,7,0.12)] backdrop-blur-md sm:px-8 sm:py-8 dark:border-[#24371f] dark:bg-[#0e180b]/90 dark:text-[#ecf4e8] dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(111,212,58,0.1),transparent_38%)]"
        />
        <div className="relative space-y-8">
          {/* Main Header */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                className={`inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] ${
                  filteredActiveLiveStreams.length > 0
                    ? 'text-[#278500] dark:text-[#6fd43a]'
                    : 'text-[#52634c] dark:text-[#98ad90]'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    filteredActiveLiveStreams.length > 0
                      ? 'animate-pulse bg-[#278500] dark:bg-[#6fd43a]'
                      : 'bg-[#8da087] dark:bg-[#5a7152]'
                  }`}
                />
                <span>ON SIGNAL</span>
              </div>

              {/* Firestore Connection Indicator */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#dce6d7] bg-[#f6faf4] px-3 py-1.5 text-[11px] font-semibold text-[#52634c] dark:border-[#24371f] dark:bg-[#142111] dark:text-[#98ad90]">
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
                <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight text-[#131f10] sm:text-7xl dark:text-[#ecf4e8]">
                  LIVE{' '}
                  <span className="text-[#278500] dark:text-[#6fd43a]">/ {filteredActiveLiveStreams.length}</span>
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#52634c] sm:text-[15px] dark:text-[#98ad90]">
                  {lang === 'en'
                    ? 'Members currently streaming on Showroom and IDN. Updated every minute.'
                    : 'Member yang sedang siaran di Showroom dan IDN. Diperbarui setiap menit.'}
                </p>
              </div>

              {/* Filter Pills */}
              <div
                className="inline-flex max-w-full rounded-full border border-[#dce6d7] bg-[#f6faf4] p-1 dark:border-[#24371f] dark:bg-[#142111]"
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
                  const active = platformFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setPlatformFilter(tab.key)}
                      className={`min-h-9 whitespace-nowrap rounded-full px-4 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:focus-visible:outline-[#6fd43a] sm:px-5 ${
                        active
                          ? 'bg-[#278500] text-white shadow-sm shadow-[#278500]/20 dark:bg-[#6fd43a] dark:text-[#0a1407] dark:shadow-[#6fd43a]/15'
                          : 'text-[#52634c] hover:text-[#131f10] dark:text-[#98ad90] dark:hover:text-[#ecf4e8]'
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
        {filteredActiveLiveStreams.length > 0 ? (
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredActiveLiveStreams.map(({ member, originalIndex, statusInfo }, idx) => {
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
                  <article className="group relative overflow-hidden rounded-[20px] border border-[#dce6d7] bg-white shadow-lg transition-transform duration-200 hover:-translate-y-1 dark:border-[#24371f] dark:bg-[#142111]">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#e9f2e4] dark:bg-[#192915]">
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
                        <span className="font-mono-num rounded-md bg-black/70 px-2 py-1 text-[11px] font-extrabold text-[#6fd43a] shadow-sm backdrop-blur-sm">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="absolute top-3.5 right-3.5">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#278500] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-lg shadow-black/20 dark:bg-[#6fd43a] dark:text-[#0a1407]">
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
                    <p className="truncate text-xs font-medium text-[#52634c] dark:text-[#98ad90]" title={`@${socialHandle}`}>
                      @{socialHandle}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Verified Standby Card when 0 members are verified LIVE in Firestore */
          <div className="overflow-hidden rounded-[22px] border border-[#dce6d7] bg-white/[0.78] p-7 text-center backdrop-blur-sm sm:p-9 dark:border-[#24371f] dark:bg-[#142111]/90">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3f2da] text-[#278500] dark:bg-[#1d3314] dark:text-[#6fd43a]">
              <Radio className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="font-display mt-4 text-xl font-bold tracking-tight text-[#131f10] sm:text-2xl dark:text-[#ecf4e8]">
              {t.lv_no_active_live}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#52634c] dark:text-[#98ad90]">
              Hanya siaran langsung yang disahkan dalam koleksi Firestore{' '}
              <code className="rounded bg-[#e3f2da] px-1.5 py-0.5 font-mono text-xs text-[#278500] dark:bg-[#1d3314] dark:text-[#6fd43a]">
                live_status
              </code>{' '}
              akan dipaparkan sebagai LIVE. Tiada status palsu atau simulasi dicipta. Anda boleh menyemak pautan rasmi setiap member di bawah.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#dce6d7] bg-[#f6faf4] px-3 py-1.5 font-semibold text-[#52634c] dark:border-[#24371f] dark:bg-[#0e190b] dark:text-[#c7d7c0]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                20 Member Aktif Disambung
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#dce6d7] bg-[#f6faf4] px-3 py-1.5 font-semibold text-[#52634c] dark:border-[#24371f] dark:bg-[#0e190b] dark:text-[#c7d7c0]">
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                Langganan Firestore Real-Time Aktif
              </span>
            </div>
          </div>
        )}
      </section>
        </div>
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
