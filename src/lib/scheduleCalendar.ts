import type { ParsedEvent } from '../data/klp48Data';
import { formatScheduleTime } from './scheduleTime';

const KUALA_LUMPUR_UTC_OFFSET_MINUTES = 8 * 60;

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function foldIcsLine(line: string): string {
  let folded = '';
  let byteLength = 0;

  for (const character of line) {
    const characterBytes = new TextEncoder().encode(character).length;
    if (byteLength + characterBytes > 73) {
      folded += '\r\n ';
      byteLength = 1;
    }
    folded += character;
    byteLength += characterBytes;
  }

  return folded;
}

function formatCalendarDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function formatUtcDateTime(date: Date, minutesAfterMidnight: number): string {
  const utcDate = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      minutesAfterMidnight - KUALA_LUMPUR_UTC_OFFSET_MINUTES
    )
  );
  return utcDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function toMinutes(match: RegExpMatchArray): number {
  const hour = Number(match[1]) % 12;
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  return hour * 60 + minute + (meridiem === 'PM' ? 12 * 60 : 0);
}

function getEventTimes(value: string): number[] {
  const normalizedTime = formatScheduleTime(value);
  const matches = normalizedTime.matchAll(/\b(\d{1,2}):([0-5]\d)\s*(AM|PM)\b/gi);
  return Array.from(matches, (match) => toMinutes(match));
}

function addCalendarDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function safeFileName(title: string): string {
  const fileName = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `${fileName || 'klp48-event'}.ics`;
}

export function downloadScheduleEventCalendar(
  event: ParsedEvent,
  details: { title: string; venue: string; notes: string }
): void {
  const eventTimes = getEventTimes(event.timeEn || event.time);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KLP48 Archive//Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${encodeURIComponent(event.id)}@klp48-archive`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `SUMMARY:${escapeIcsText(details.title)}`,
    `LOCATION:${escapeIcsText(details.venue)}`,
  ];

  if (eventTimes.length > 0) {
    const startMinutes = eventTimes[0];
    const sameDay = formatCalendarDate(event.startDate) === formatCalendarDate(event.endDate);
    let endMinutes = eventTimes[1] ?? startMinutes + 60;
    if (sameDay && endMinutes <= startMinutes) endMinutes += 24 * 60;

    lines.push(
      `DTSTART:${formatUtcDateTime(event.startDate, startMinutes)}`,
      `DTEND:${formatUtcDateTime(sameDay ? event.startDate : event.endDate, endMinutes)}`
    );
  } else {
    lines.push(
      `DTSTART;VALUE=DATE:${formatCalendarDate(event.startDate)}`,
      `DTEND;VALUE=DATE:${formatCalendarDate(addCalendarDay(event.endDate))}`
    );
  }

  if (details.notes) lines.push(`DESCRIPTION:${escapeIcsText(details.notes)}`);
  if (event.link) lines.push(`URL:${event.link}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');

  const calendarFile = new Blob([`${lines.map(foldIcsLine).join('\r\n')}\r\n`], {
    type: 'text/calendar;charset=utf-8',
  });
  const downloadUrl = URL.createObjectURL(calendarFile);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = safeFileName(details.title);
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}
