import { ArrowLeft, Calendar, ExternalLink, X } from 'lucide-react';
import { useEffect } from 'react';
import {
  getMemberCategory,
  MemberItem,
  parseEventMemberNames,
} from '../data/klp48Data';
import { useScheduleEvents } from '../context/useScheduleEvents';
import { Lang, MONTHS_EN, MONTHS_MS, TRANSLATIONS } from '../i18n/translations';
import { MemberAvatar } from './MemberAvatar';

interface MemberModalProps {
  member: MemberItem | null;
  indexNumber: number;
  lang: Lang;
  onClose: () => void;
}

export function MemberModal({
  member,
  indexNumber,
  lang,
  onClose,
}: MemberModalProps) {
  const t = TRANSLATIONS[lang];
  const { events } = useScheduleEvents();

  useEffect(() => {
    if (!member) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [member, onClose]);

  if (!member) return null;

  const category = getMemberCategory(member.status);
  const statusLabel =
    category === 'grad'
      ? t.f_grad
      : category === 'non'
      ? t.f_non
      : t.f_aktif;
  const statusNote =
    lang === 'en' && member.nota_status_en
      ? member.nota_status_en
      : member.nota_status;
  const birthDate =
    lang === 'en' && member.tarikh_lahir_en
      ? member.tarikh_lahir_en
      : member.tarikh_lahir;

  const socials = [
    { label: 'Instagram', handle: member.instagram, baseUrl: 'https://www.instagram.com/' },
    { label: 'TikTok', handle: member.tiktok, baseUrl: 'https://www.tiktok.com/@' },
    { label: 'X', handle: member.x, baseUrl: 'https://x.com/' },
  ].filter((s) => /^[A-Za-z0-9._]{1,40}$/.test((s.handle || '').trim().replace(/^@/, '')));

  const now = new Date();
  const months = lang === 'en' ? MONTHS_EN : MONTHS_MS;
  const relatedEvents = events.filter((ev) => {
    const memberName = member.nama.toLowerCase();
    const combined = `${ev.title} ${ev.titleEn || ''} ${ev.notes} ${ev.notesEn || ''}`.toLowerCase();
    const matchesMember =
      combined.includes(memberName) ||
      parseEventMemberNames(ev.members).some((name) => name.toLowerCase() === memberName);
    const evEnd = new Date(
      ev.endDate.getFullYear(),
      ev.endDate.getMonth(),
      ev.endDate.getDate(),
      23,
      59
    );
    return matchesMember && evEnd >= now;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={member.nama}
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(72dvh,640px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#e0d9cf] bg-[#f3efe7] text-[#211a1d] shadow-2xl dark:border-[#24371f] dark:bg-[#142111] dark:text-[#ecf4e8]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="inline-flex min-h-10 items-center gap-2 rounded-md pr-3 font-mono-num text-xs font-semibold uppercase tracking-[0.16em] text-[#746b67] transition-colors hover:text-[#211a1d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c33d56] dark:text-[#a8bc9f] dark:hover:text-[#ecf4e8] dark:focus-visible:outline-[#ff8498]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>{t.m_all}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e0d9cf] text-[#746b67] transition-colors hover:border-[#c33d56] hover:text-[#c33d56] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c33d56] dark:border-[#24371f] dark:text-[#98ad90] dark:hover:border-[#ff8498] dark:hover:text-[#ff8498] dark:focus-visible:outline-[#ff8498]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto px-4 pb-4 sm:gap-6 sm:px-6 sm:pb-6 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.85fr)] lg:gap-10 lg:px-8 lg:pb-8">
          <MemberAvatar
            member={member}
            indexNumber={indexNumber}
            className="mx-auto aspect-[4/5] w-full max-w-[420px] shrink-0 rounded-[1.25rem] bg-[#ebe9e6] dark:bg-[#0d180b] lg:sticky lg:top-0 lg:aspect-[3/4] lg:max-h-[calc(100dvh-8rem)] lg:max-w-none lg:self-start"
            initialsClassName="text-6xl"
            priority
          />

          <section className="min-w-0 pt-1 lg:pt-2">
            <p className="font-mono-num text-xs font-semibold uppercase tracking-[0.24em] text-[#b93650] dark:text-[#ff8498]">
              {member.nama} <span className="px-1">·</span> KLP48
            </p>
            <h2 className="font-display mt-3 break-words text-[clamp(2.25rem,5vw,5.25rem)] font-black uppercase leading-[0.88] tracking-[-0.065em] text-[#1b1719] dark:text-[#f4f1e9]">
              {member.nama_penuh}
            </h2>
            <div className="mt-5 h-[2px] w-full bg-[#c33d56] dark:bg-[#ff8498]" />

            <dl className="mt-6 rounded-[1.5rem] border border-[#e3ddd5] bg-[#fbf9f5]/95 px-4 sm:px-6 dark:border-[#2b4523] dark:bg-[#101c0d]/95">
              <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-3 py-4 sm:py-5">
                <dt className="text-sm text-[#796f6a] sm:text-base dark:text-[#a8bc9f]">{t.m_birth}</dt>
                <dd className="text-right font-semibold text-[#211a1d] sm:text-lg dark:text-[#ecf4e8]">
                  {birthDate} {member.tahun_lahir}
                </dd>
              </div>
              <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-3 border-t border-[#e9e4dc] py-4 sm:py-5 dark:border-[#24371f]">
                <dt className="text-sm text-[#796f6a] sm:text-base dark:text-[#a8bc9f]">{t.m_gen}</dt>
                <dd className="text-right font-semibold text-[#211a1d] sm:text-lg dark:text-[#ecf4e8]">
                  {member.gen}
                </dd>
              </div>
              <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-start gap-3 border-t border-[#e9e4dc] py-4 sm:py-5 dark:border-[#24371f]">
                <dt className="pt-0.5 text-sm text-[#796f6a] sm:text-base dark:text-[#a8bc9f]">{t.m_status}</dt>
                <dd className="text-right font-semibold text-[#211a1d] sm:text-lg dark:text-[#ecf4e8]">
                  {statusLabel}
                  {statusNote && (
                    <span className="mt-1 block text-xs font-normal leading-relaxed text-[#796f6a] sm:text-sm dark:text-[#a8bc9f]">
                      {statusNote}
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            {socials.length > 0 && (
              <section className="mt-6">
                <h3 className="font-mono-num text-xs font-semibold uppercase tracking-[0.16em] text-[#796f6a] dark:text-[#a8bc9f]">
                  {t.m_social}
                </h3>
                <div className="mt-2.5 flex flex-wrap gap-2.5">
                  {socials.map((s) => {
                    const cleanHandle = s.handle.trim().replace(/^@/, '');
                    return (
                      <a
                        key={s.label}
                        href={`${s.baseUrl}${cleanHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[40px] max-w-full items-center gap-1.5 rounded-full border border-[#e0d9cf] bg-[#fbf9f5] px-3.5 py-1.5 text-sm font-semibold text-[#a72e46] transition-colors hover:border-[#c33d56] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c33d56] dark:border-[#24371f] dark:bg-[#101c0d] dark:text-[#ff9aa9] dark:hover:border-[#ff8498] dark:focus-visible:outline-[#ff8498]"
                      >
                        <span>{s.label}</span>
                        <span className="truncate font-mono-num text-xs font-normal text-[#796f6a] dark:text-[#a8bc9f]">
                          @{cleanHandle}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

            {relatedEvents.length > 0 && (
              <section className="mt-6">
                <h3 className="flex items-center gap-2 font-mono-num text-xs font-semibold uppercase tracking-[0.16em] text-[#796f6a] dark:text-[#a8bc9f]">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.s_up}</span>
                </h3>
                <div className="mt-2.5 space-y-2.5">
                  {relatedEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="rounded-xl border border-[#e3ddd5] bg-[#fbf9f5]/75 p-3.5 text-sm dark:border-[#24371f] dark:bg-[#101c0d]/75"
                    >
                      <div className="font-mono-num text-xs text-[#796f6a] dark:text-[#98ad90]">
                        {ev.startDate.getDate()} {months[ev.startDate.getMonth()]}{' '}
                        {ev.startDate.getFullYear()} ·{' '}
                        {lang === 'en' && ev.venueEn ? ev.venueEn : ev.venue}
                      </div>
                      <div className="mt-1 font-semibold text-[#211a1d] dark:text-[#ecf4e8]">
                        {lang === 'en' && ev.titleEn ? ev.titleEn : ev.title}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
