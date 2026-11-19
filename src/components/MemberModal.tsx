import { Calendar, ExternalLink, X } from 'lucide-react';
import { useEffect } from 'react';
import {
  getMemberCategory,
  MemberItem,
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
    const combined = `${ev.title} ${ev.titleEn || ''} ${ev.notes} ${ev.notesEn || ''}`.toLowerCase();
    const matchesMember = combined.includes(member.nama.toLowerCase());
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={member.nama}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#dce6d7] bg-white p-6 shadow-2xl dark:border-[#24371f] dark:bg-[#142111]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <MemberAvatar
              member={member}
              indexNumber={indexNumber}
              className="h-20 w-16 shrink-0 rounded-xl border border-[#dce6d7] dark:border-[#24371f]"
              initialsClassName="text-2xl"
              priority
            />
            <div>
              <div className="font-mono-num text-xs font-medium text-[#52634c] dark:text-[#98ad90]">
                {t.m_gen} {member.gen} · {statusLabel}
              </div>
              <h2 className="font-display mt-0.5 text-2xl font-bold text-[#131f10] dark:text-[#ecf4e8]">
                {member.nama}
              </h2>
              <p className="text-sm text-[#52634c] dark:text-[#98ad90]">
                {member.nama_penuh}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#dce6d7] text-[#52634c] transition-colors hover:text-[#131f10] dark:border-[#24371f] dark:text-[#98ad90] dark:hover:text-[#ecf4e8]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {statusNote && (
          <div className="mt-4 rounded-xl bg-[#edf5e9] px-4 py-2.5 text-sm font-medium text-[#278500] dark:bg-[#1d3314] dark:text-[#6fd43a]">
            {statusNote}
          </div>
        )}

        <dl className="mt-6 divide-y divide-[#dce6d7] border-y border-[#dce6d7] text-sm dark:divide-[#24371f] dark:border-[#24371f]">
          <div className="flex items-center justify-between py-3">
            <dt className="text-[#52634c] dark:text-[#98ad90]">{t.m_birth}</dt>
            <dd className="font-mono-num font-semibold text-[#131f10] dark:text-[#ecf4e8]">
              {birthDate} {member.tahun_lahir}
            </dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-[#52634c] dark:text-[#98ad90]">{t.m_gen}</dt>
            <dd className="font-mono-num font-semibold text-[#131f10] dark:text-[#ecf4e8]">
              GEN {member.gen}
            </dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-[#52634c] dark:text-[#98ad90]">{t.m_status}</dt>
            <dd className="font-semibold text-[#131f10] dark:text-[#ecf4e8]">
              {statusLabel}
            </dd>
          </div>
        </dl>

        {socials.length > 0 && (
          <div className="mt-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#52634c] dark:text-[#98ad90]">
              {t.m_social}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {socials.map((s) => {
                const cleanHandle = s.handle.trim().replace(/^@/, '');
                return (
                  <a
                    key={s.label}
                    href={`${s.baseUrl}${cleanHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#dce6d7] px-3.5 py-1.5 text-sm font-semibold text-[#278500] transition-colors hover:border-[#278500] dark:border-[#24371f] dark:text-[#6fd43a] dark:hover:border-[#6fd43a]"
                  >
                    <span>{s.label}</span>
                    <span className="font-mono-num text-xs font-normal text-[#52634c] dark:text-[#98ad90]">
                      @{cleanHandle}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {relatedEvents.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#52634c] dark:text-[#98ad90]">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.s_up}</span>
            </div>
            <div className="mt-2 space-y-2">
              {relatedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-xl border border-[#dce6d7] p-3 text-sm dark:border-[#24371f]"
                >
                  <div className="font-mono-num text-xs text-[#52634c] dark:text-[#98ad90]">
                    {ev.startDate.getDate()} {months[ev.startDate.getMonth()]}{' '}
                    {ev.startDate.getFullYear()} ·{' '}
                    {lang === 'en' && ev.venueEn ? ev.venueEn : ev.venue}
                  </div>
                  <div className="mt-0.5 font-semibold text-[#131f10] dark:text-[#ecf4e8]">
                    {lang === 'en' && ev.titleEn ? ev.titleEn : ev.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
