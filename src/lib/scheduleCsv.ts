import type { ScheduleRawItem } from '../data/klp48Data';

export const SCHEDULE_CSV_HEADERS = [
  'tarikh_mula',
  'tarikh_tamat',
  'tajuk',
  'tajuk_en',
  'lokasi',
  'lokasi_en',
  'masa',
  'masa_en',
  'jenis',
  'eksklusif',
  'nota',
  'nota_en',
  'members',
  'pautan',
] as const;

const MAX_ROWS = 250;
const MAX_FILE_CHARS = 2_000_000;

export interface ScheduleCsvParseResult {
  items: ScheduleRawItem[];
  errors: string[];
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"' && cell.length === 0) {
      inQuotes = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      row.push(cell);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
      if (char === '\r' && text[index + 1] === '\n') index += 1;
    } else {
      cell += char;
    }
  }

  if (inQuotes) throw new Error('The CSV has an unclosed quoted field.');
  row.push(cell);
  if (row.some((value) => value.trim() !== '')) rows.push(row);
  return rows;
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function readCell(row: string[], index: number): string {
  return index < 0 ? '' : (row[index] || '').trim();
}

function parseExclusive(value: string): 'yes' | 'no' | null {
  if (/^(yes|ya|y|true|1)$/i.test(value)) return 'yes';
  if (/^(no|tidak|n|false|0)?$/i.test(value)) return 'no';
  return null;
}

export function parseScheduleCsv(csv: string): ScheduleCsvParseResult {
  if (csv.length > MAX_FILE_CHARS) {
    return { items: [], errors: ['CSV is too large. Keep the file under 2 MB.'] };
  }

  let rows: string[][];
  try {
    rows = parseCsvRows(csv.replace(/^\uFEFF/, ''));
  } catch (error) {
    return {
      items: [],
      errors: [error instanceof Error ? error.message : 'The CSV could not be parsed.'],
    };
  }

  if (rows.length < 2) return { items: [], errors: ['The CSV needs a header row and at least one event.'] };
  if (rows.length - 1 > MAX_ROWS) {
    return { items: [], errors: [`The CSV has more than ${MAX_ROWS} events. Split it into smaller files.`] };
  }

  const headers = rows[0].map(normalizeHeader);
  const findColumn = (...names: string[]) => {
    const normalizedNames = new Set(names.map(normalizeHeader));
    return headers.findIndex((header) => normalizedNames.has(header));
  };

  const columns = {
    start: findColumn('tarikh_mula', 'start_date'),
    end: findColumn('tarikh_tamat', 'end_date'),
    title: findColumn('tajuk', 'title'),
    titleEn: findColumn('tajuk_en', 'title_en'),
    venue: findColumn('lokasi', 'venue'),
    venueEn: findColumn('lokasi_en', 'venue_en'),
    time: findColumn('masa', 'time'),
    timeEn: findColumn('masa_en', 'time_en'),
    type: findColumn('jenis', 'type'),
    exclusive: findColumn('eksklusif', 'exclusive'),
    notes: findColumn('nota', 'notes'),
    notesEn: findColumn('nota_en', 'notes_en'),
    members: findColumn('members', 'ahli'),
    link: findColumn('pautan', 'link', 'url'),
  };

  const requiredHeaders = [
    ['tarikh_mula / start_date', columns.start],
    ['tajuk / title', columns.title],
    ['lokasi / venue', columns.venue],
    ['jenis / type', columns.type],
  ] as const;
  const missingHeaders = requiredHeaders.filter(([, index]) => index < 0).map(([name]) => name);
  if (missingHeaders.length > 0) {
    return { items: [], errors: [`Missing required columns: ${missingHeaders.join(', ')}.`] };
  }

  const items: ScheduleRawItem[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const startDate = readCell(row, columns.start);
    const endDate = readCell(row, columns.end) || startDate;
    const title = readCell(row, columns.title);
    const venue = readCell(row, columns.venue);
    const type = readCell(row, columns.type).toLowerCase();
    const exclusive = parseExclusive(readCell(row, columns.exclusive));
    const link = readCell(row, columns.link);
    const rowErrors: string[] = [];

    if (!isIsoDate(startDate)) rowErrors.push('start date must use YYYY-MM-DD.');
    if (!isIsoDate(endDate)) rowErrors.push('end date must use YYYY-MM-DD.');
    if (isIsoDate(startDate) && isIsoDate(endDate) && endDate < startDate) {
      rowErrors.push('end date must be on or after start date.');
    }
    if (!title) rowErrors.push('title is required.');
    if (!venue) rowErrors.push('venue is required.');
    if (type !== 'show' && type !== 'event') rowErrors.push('type must be show or event.');
    if (exclusive === null) rowErrors.push('exclusive must be yes/no, ya/tidak, true/false, or 1/0.');
    if (link) {
      try {
        const parsedLink = new URL(link);
        if (parsedLink.protocol !== 'https:' && parsedLink.protocol !== 'http:') {
          rowErrors.push('event link must use HTTP or HTTPS.');
        }
      } catch {
        rowErrors.push('event link must be a valid HTTP or HTTPS URL.');
      }
    }

    const item: ScheduleRawItem = {
      tarikh_mula: startDate,
      tarikh_tamat: endDate,
      tajuk: title,
      tajuk_en: readCell(row, columns.titleEn),
      lokasi: venue,
      lokasi_en: readCell(row, columns.venueEn),
      masa: readCell(row, columns.time),
      masa_en: readCell(row, columns.timeEn),
      jenis: type,
      eksklusif: exclusive || 'no',
      nota: readCell(row, columns.notes),
      nota_en: readCell(row, columns.notesEn),
      members: readCell(row, columns.members),
      pautan: link,
    };

    const limits: Array<[keyof ScheduleRawItem, number]> = [
      ['tajuk', 300],
      ['tajuk_en', 300],
      ['lokasi', 500],
      ['lokasi_en', 500],
      ['masa', 200],
      ['masa_en', 200],
      ['nota', 2000],
      ['nota_en', 2000],
      ['members', 1000],
      ['pautan', 1000],
    ];
    limits.forEach(([field, limit]) => {
      if ((item[field] || '').length > limit) rowErrors.push(`${field} must be ${limit} characters or fewer.`);
    });

    const duplicateKey = [startDate, title.toLowerCase(), venue.toLowerCase(), (item.masa || '').toLowerCase()].join('|');
    if (seen.has(duplicateKey)) rowErrors.push('duplicate event row.');
    seen.add(duplicateKey);

    if (rowErrors.length > 0) {
      errors.push(`Row ${rowNumber}: ${rowErrors.join(' ')}`);
    } else {
      items.push(item);
    }
  });

  return { items, errors };
}

function escapeCsvCell(value: string | undefined): string {
  const text = value || '';
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildScheduleCsv(items: ScheduleRawItem[]): string {
  const headerRow = SCHEDULE_CSV_HEADERS.join(',');
  const dataRows = items.map((item) =>
    SCHEDULE_CSV_HEADERS.map((header) => {
      if (header === 'tarikh_tamat') return escapeCsvCell(item.tarikh_tamat || item.tarikh_mula);
      if (header === 'eksklusif') {
        return escapeCsvCell(/^(yes|ya|y|true|1)$/i.test(item.eksklusif) ? 'yes' : 'no');
      }
      return escapeCsvCell(item[header] || '');
    }).join(',')
  );
  return [headerRow, ...dataRows].join('\r\n');
}
