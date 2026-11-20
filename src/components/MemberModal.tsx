import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getMemberCategory,
  MemberItem,
  parseEventMemberNames,
} from '../data/klp48Data';
import { useScheduleEvents } from '../context/useScheduleEvents';
import { Lang, MONTHS_EN, MONTHS_MS, TRANSLATIONS } from '../i18n/translations';
import { MemberAvatar } from './MemberAvatar';
import { ScheduleEventModal } from './ScheduleEventModal';

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
  const [eventPageIndex, setEventPageIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<(typeof events)[number] | null>(null);

  useEffect(() => {
    setEventPageIndex(0);
    setSelectedEvent(null);
  }, [member]);

  useEffect(() => {
    if (!member) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (selectedEvent) {
        setSelectedEvent(null);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [member, onClose, selectedEvent]);

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
  const pageCount = Math.ceil(relatedEvents.length / 3);
  const currentEventPage = Math.min(eventPageIndex, Math.max(0, pageCount - 1));
  const visibleEvents = relatedEvents.slice(
    currentEventPage * 3,
    currentEventPage * 3 + 3
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={member.nama}
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(95dvh,900px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#dce6d7] bg-[#f6faf4] text-[#131f10] shadow-2xl dark:border-[#24371f] dark:bg-[#142111] dark:text-[#ecf4e8]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="inline-flex min-h-10 items-center gap-2 rounded-md pr-3 font-mono-num text-xs font-semibold uppercase tracking-[0.16em] text-[#52634c] transition-colors hover:text-[#131f10] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#278500] dark:text-[#a8bc9f] dark:hover:text-[#ecf4e8] dark:focus-visible:outline-[#6fd43a]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>{t.m_all}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dce6d7] text-[#52634c] transition-colors hover:border-[#278500] hover:text-[#278500] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#24371f] dark:text-[#98ad90] dark:hover:border-[#6fd43a] dark:hover:text-[#6fd43a] dark:focus-visible:outline-[#6fd43a]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto px-4 pb-4 sm:gap-6 sm:px-6 sm:pb-6 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.85fr)] lg:gap-10 lg:px-8 lg:pb-8">
          <div className="mx-auto flex w-full max-w-[420px] shrink-0 flex-col gap-3 lg:sticky lg:top-0 lg:max-w-none lg:self-start">
            <MemberAvatar
              member={member}
              indexNumber={indexNumber}
              className="aspect-[4/5] w-full rounded-[1.25rem] bg-[#e3f2da] dark:bg-[#0d180b] lg:aspect-[3/4] lg:max-h-[calc(100dvh-8rem)]"
              initialsClassName="text-6xl"
              priority
            />

            {member.catchphrase && (
              <blockquote className="rounded-xl border-l-2 border-[#278500] bg-white/70 px-4 py-3 text-sm leading-relaxed italic text-[#52634c] dark:border-[#6fd43a] dark:bg-[#101c0d]/70 dark:text-[#a8bc9f]">
                {member.catchphrase}
              </blockquote>
            )}
          </div>

          <section className="min-w-0 pt-1 lg:pt-2">
            <p className="font-mono-num text-xs font-semibold uppercase tracking-[0.24em] text-[#278500] dark:text-[#6fd43a]">
              {member.nama} <span className="px-1">·</span> {t.m_gen} {member.gen}
            </p>
            <h2 className="font-display mt-3 break-words text-[clamp(2.25rem,5vw,5.25rem)] font-black uppercase leading-[0.88] tracking-[-0.065em] text-[#131f10] dark:text-[#ecf4e8]">
              {member.nama_penuh}
            </h2>
            <div className="mt-5 h-[2px] w-full bg-[#278500] dark:bg-[#6fd43a]" />

            <dl className="mt-6 rounded-[1.5rem] border border-[#dce6d7] bg-[#ffffff]/95 px-4 sm:px-6 dark:border-[#2b4523] dark:bg-[#101c0d]/95">
              <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-3 py-4 sm:py-5">
                <dt className="text-sm text-[#52634c] sm:text-base dark:text-[#a8bc9f]">{t.m_birth}</dt>
                <dd className="text-right font-semibold text-[#131f10] sm:text-lg dark:text-[#ecf4e8]">
                  {birthDate} {member.tahun_lahir}
                </dd>
              </div>
              <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-3 border-t border-[#e3ecde] py-4 sm:py-5 dark:border-[#24371f]">
                <dt className="text-sm text-[#52634c] sm:text-base dark:text-[#a8bc9f]">{t.m_place}</dt>
                <dd className="text-right font-semibold text-[#131f10] sm:text-lg dark:text-[#ecf4e8]">
                  {member.birthplace}
                </dd>
              </div>
              <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-start gap-3 border-t border-[#e3ecde] py-4 sm:py-5 dark:border-[#24371f]">
                <dt className="pt-0.5 text-sm text-[#52634c] sm:text-base dark:text-[#a8bc9f]">{t.m_status}</dt>
                <dd className="text-right font-semibold text-[#131f10] sm:text-lg dark:text-[#ecf4e8]">
                  {statusLabel}
                  {statusNote && (
                    <span className="mt-1 block text-xs font-normal leading-relaxed text-[#52634c] sm:text-sm dark:text-[#a8bc9f]">
                      {statusNote}
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            {relatedEvents.length > 0 && (
              <section className="mt-6">
                <h3 className="flex items-center gap-2 font-mono-num text-xs font-semibold uppercase tracking-[0.16em] text-[#52634c] dark:text-[#a8bc9f]">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.s_up}</span>
                </h3>
                <div className="mt-2.5 space-y-2.5">
                  {visibleEvents.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      aria-label={`${t.detail}: ${lang === 'en' && ev.titleEn ? ev.titleEn : ev.title}`}
                      onClick={() => setSelectedEvent(ev)}
                      className="block min-h-11 w-full rounded-xl border border-[#dce6d7] bg-[#ffffff]/75 p-3.5 text-left text-sm transition-colors hover:border-[#278500] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#24371f] dark:bg-[#101c0d]/75 dark:hover:border-[#6fd43a] dark:hover:bg-[#101c0d] dark:focus-visible:outline-[#6fd43a]"
                    >
                      <div className="font-mono-num text-xs text-[#52634c] dark:text-[#98ad90]">
                        {ev.startDate.getDate()} {months[ev.startDate.getMonth()]}{' '}
                        {ev.startDate.getFullYear()} ·{' '}
                        {lang === 'en' && ev.venueEn ? ev.venueEn : ev.venue}
                      </div>
                      <div className="mt-1 font-semibold text-[#131f10] dark:text-[#ecf4e8]">
                        {lang === 'en' && ev.titleEn ? ev.titleEn : ev.title}
                      </div>
                    </button>
                  ))}
                </div>
                {pageCount > 1 && (
                  <nav
                    aria-label={t.s_up}
                    className="mt-3 flex items-center justify-between"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setEventPageIndex((page) => Math.max(0, page - 1))
                      }
                      disabled={currentEventPage === 0}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#dce6d7] px-3 text-xs font-semibold text-[#52634c] transition-colors hover:border-[#278500] hover:text-[#278500] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] disabled:pointer-events-none disabled:opacity-40 dark:border-[#24371f] dark:text-[#a8bc9f] dark:hover:border-[#6fd43a] dark:hover:text-[#6fd43a] dark:focus-visible:outline-[#6fd43a]"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t.prev_page}</span>
                    </button>
                    <span
                      aria-atomic="true"
                      aria-live="polite"
                      className="font-mono-num text-xs text-[#52634c] dark:text-[#98ad90]"
                    >
                      {currentEventPage + 1} / {pageCount}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setEventPageIndex((page) =>
                          Math.min(pageCount - 1, page + 1)
                        )
                      }
                      disabled={currentEventPage >= pageCount - 1}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#dce6d7] px-3 text-xs font-semibold text-[#52634c] transition-colors hover:border-[#278500] hover:text-[#278500] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] disabled:pointer-events-none disabled:opacity-40 dark:border-[#24371f] dark:text-[#a8bc9f] dark:hover:border-[#6fd43a] dark:hover:text-[#6fd43a] dark:focus-visible:outline-[#6fd43a]"
                    >
                      <span>{t.next_page}</span>
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </nav>
                )}
              </section>
            )}
          </section>
        </div>
      </div>
      <ScheduleEventModal
        event={selectedEvent}
        lang={lang}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
