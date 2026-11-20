import { ArrowUpRight, CalendarDays, Clock3, MapPin, UsersRound, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { parseEventMemberNames, ParsedEvent } from '../data/klp48Data';
import { formatScheduleTime } from '../lib/scheduleTime';
import { Lang, MONTHS_EN, MONTHS_MS, TRANSLATIONS } from '../i18n/translations';

interface ScheduleEventModalProps {
  event: ParsedEvent | null;
  lang: Lang;
  onClose: () => void;
}

export function ScheduleEventModal({ event, lang, onClose }: ScheduleEventModalProps) {
  const t = TRANSLATIONS[lang];
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!event) return;

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key !== 'Tab') return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (keyboardEvent.shiftKey && document.activeElement === first) {
        keyboardEvent.preventDefault();
        last.focus();
      } else if (!keyboardEvent.shiftKey && document.activeElement === last) {
        keyboardEvent.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [event]);

  if (!event) return null;

  const months = lang === 'en' ? MONTHS_EN : MONTHS_MS;
  const title = lang === 'en' && event.titleEn ? event.titleEn : event.title;
  const venue = lang === 'en' && event.venueEn ? event.venueEn : event.venue;
  const time = lang === 'en' && event.timeEn ? event.timeEn : event.time;
  const notes = lang === 'en' && event.notesEn ? event.notesEn : event.notes;
  const participants = parseEventMemberNames(event.members).sort((a, b) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' })
  );
  const formatDate = (date: Date) =>
    `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  const dateLabel = formatDate(event.startDate) +
    (event.endDate.getTime() === event.startDate.getTime()
      ? ''
      : ` – ${formatDate(event.endDate)}`);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-event-title"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation();
        onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="flex max-h-[min(90dvh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#2b4523] bg-[#142111] text-[#ecf4e8] shadow-2xl shadow-black/50"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#2b4523] px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="font-mono-num text-xs font-semibold uppercase tracking-[0.16em] text-[#7ddb47]">
              {event.type === 'show' ? t.t_show : t.t_event}
              {event.exclusive && <span className="ml-2 text-[#ecf4e8]">· {t.exclusive}</span>}
            </p>
            <h2
              id="schedule-event-title"
              className="font-display mt-2 break-words text-xl font-bold leading-snug sm:text-2xl"
            >
              {title}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#2b4523] text-[#a8bc9f] transition-colors hover:border-[#7ddb47] hover:text-[#ecf4e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7ddb47]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <dl className="space-y-4 text-sm leading-relaxed sm:text-base">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#7ddb47]" aria-hidden="true" />
              <div>
                <dt className="sr-only">{t.event_date}</dt>
                <dd className="font-mono-num text-[#d4dfcf]">
                  <time dateTime={`${event.startDate.getFullYear()}-${String(event.startDate.getMonth() + 1).padStart(2, '0')}-${String(event.startDate.getDate()).padStart(2, '0')}`}>
                    {dateLabel}
                  </time>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#7ddb47]" aria-hidden="true" />
              <div>
                <dt className="sr-only">{t.event_location}</dt>
                <dd className="text-[#d4dfcf]">{venue}</dd>
              </div>
            </div>
            {time && (
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#7ddb47]" aria-hidden="true" />
                <div>
                  <dt className="sr-only">{t.event_time}</dt>
                  <dd className="font-mono-num text-[#d4dfcf]">{formatScheduleTime(time)}</dd>
                </div>
              </div>
            )}
            {participants.length > 0 && (
              <div className="flex items-start gap-3">
                <UsersRound className="mt-0.5 h-5 w-5 shrink-0 text-[#7ddb47]" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="sr-only">{t.j_members}</dt>
                  <dd className="text-[#d4dfcf]">{participants.join(', ')}</dd>
                </div>
              </div>
            )}
          </dl>

          {notes && (
            <p className="mt-5 border-t border-[#2b4523] pt-4 text-sm leading-relaxed text-[#c7d7c0] sm:text-base">
              {notes}
            </p>
          )}

          {event.link && (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#2b4523] px-3 py-2 text-sm font-semibold text-[#7ddb47] transition-colors hover:border-[#7ddb47] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7ddb47]"
            >
              <span>{t.j_link}</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
