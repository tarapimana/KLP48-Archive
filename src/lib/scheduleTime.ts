export function formatScheduleTime(time: string): string {
  const withMeridiem = time
    .replace(/\btengah\s+hari\b/gi, 'PM')
    .replace(/\bpagi\b/gi, 'AM')
    .replace(/\b(?:petang|malam)\b/gi, 'PM');

  return withMeridiem.replace(
    /\b(\d{1,2}):([0-5]\d)(?:\s*(AM|PM))?\b/gi,
    (match, hourText: string, minute: string, meridiem?: string) => {
      const hour = Number(hourText);
      if (meridiem) return `${hour}:${minute} ${meridiem.toUpperCase()}`;
      if (hour > 23) return match;

      const suffix = hour >= 12 ? 'PM' : 'AM';
      return `${hour % 12 || 12}:${minute} ${suffix}`;
    }
  );
}
