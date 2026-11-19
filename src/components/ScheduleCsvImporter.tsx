import { useState } from 'react';
import { Check, Download, FileSpreadsheet, LoaderCircle, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useScheduleEvents } from '../context/useScheduleEvents';
import { Lang } from '../i18n/translations';
import { buildScheduleCsv, parseScheduleCsv, ScheduleCsvParseResult } from '../lib/scheduleCsv';
import { replaceScheduleEvents } from '../services/scheduleService';

interface ScheduleCsvImporterProps {
  lang: Lang;
}

interface ImportPreview extends ScheduleCsvParseResult {
  filename: string;
}

const COPY = {
  ms: {
    title: 'Urus jadual',
    description: 'Muat naik CSV untuk menggantikan keseluruhan jadual yang disimpan dalam Firestore.',
    database: 'Firestore langsung',
    bundled: 'Jadual terbina dalam',
    loading: 'Menyambung ke Firestore…',
    unavailable: 'Firestore belum dapat dibaca. Jadual terbina dalam masih dipaparkan.',
    rules: 'Peraturan Firestore untuk jadual_events perlu diterbitkan sebelum import dan penyegerakan berfungsi.',
    csvLabel: 'Fail jadual CSV',
    select: 'Pilih fail CSV',
    download: 'Muat turun CSV semasa',
    accepted: 'CSV UTF-8 · maksimum 2 MB · sehingga 250 acara',
    replaceWarning: 'Import akan menggantikan semua acara jadual semasa dengan baris dalam fail ini.',
    confirm: 'Saya faham bahawa import ini menggantikan keseluruhan jadual.',
    preview: 'Pratonton import',
    ready: 'acara sedia untuk diimport',
    firstRows: '5 baris pertama dipaparkan.',
    date: 'Tarikh',
    event: 'Acara',
    venue: 'Lokasi',
    type: 'Jenis',
    import: 'Import dan gantikan jadual',
    importing: 'Mengimport…',
    success: 'acara berjaya disimpan ke Firestore.',
    permission: 'Firestore menolak akses. Terbitkan peraturan schedule_events yang dikemas kini dahulu.',
    chooseFile: 'Pilih fail CSV untuk melihat pratonton.',
  },
  en: {
    title: 'Manage schedule',
    description: 'Upload a CSV to replace the full schedule stored in Firestore.',
    database: 'Live from Firestore',
    bundled: 'Built-in schedule',
    loading: 'Connecting to Firestore…',
    unavailable: 'Firestore could not be read. The built-in schedule is still displayed.',
    rules: 'Firestore schedule_events rules must be published before import and sync can work.',
    csvLabel: 'Schedule CSV file',
    select: 'Choose CSV file',
    download: 'Download current CSV',
    accepted: 'UTF-8 CSV · max 2 MB · up to 250 events',
    replaceWarning: 'Import replaces every current schedule event with the rows in this file.',
    confirm: 'I understand this import replaces the entire schedule.',
    preview: 'Import preview',
    ready: 'events ready to import',
    firstRows: 'First 5 rows shown.',
    date: 'Date',
    event: 'Event',
    venue: 'Venue',
    type: 'Type',
    import: 'Import and replace schedule',
    importing: 'Importing…',
    success: 'events saved to Firestore.',
    permission: 'Firestore rejected access. Publish the updated schedule_events rules first.',
    chooseFile: 'Choose a CSV file to preview it.',
  },
} as const;

function getErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
}

function getErrorMessage(error: unknown, lang: Lang): string {
  const copy = COPY[lang];
  if (getErrorCode(error) === 'permission-denied') return copy.permission;
  return error instanceof Error ? error.message : 'Unable to import this CSV.';
}

function downloadCsv(content: string) {
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'klp48-schedule.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function ScheduleCsvImporter({ lang }: ScheduleCsvImporterProps) {
  const { isAdmin } = useAuth();
  const { rows, isFromFirestore, isLoading, error: scheduleError } = useScheduleEvents();
  const copy = COPY[lang];
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isAdmin) return null;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    setFeedback(null);
    setConfirmed(false);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setPreview({ filename: file.name, items: [], errors: ['Choose a .csv file.'] });
      return;
    }
    if (file.size > 2_000_000) {
      setPreview({ filename: file.name, items: [], errors: ['CSV is too large. Keep the file under 2 MB.'] });
      return;
    }

    try {
      const result = parseScheduleCsv(await file.text());
      setPreview({ filename: file.name, ...result });
    } catch {
      setPreview({ filename: file.name, items: [], errors: ['The selected file could not be read.'] });
    }
  };

  const handleImport = async () => {
    if (!preview || preview.errors.length > 0 || preview.items.length === 0 || !confirmed) return;
    setIsImporting(true);
    setFeedback(null);
    try {
      await replaceScheduleEvents(preview.items);
      setFeedback({ type: 'success', text: `${preview.items.length} ${copy.success}` });
      setPreview(null);
      setConfirmed(false);
    } catch (importError) {
      setFeedback({ type: 'error', text: getErrorMessage(importError, lang) });
    } finally {
      setIsImporting(false);
    }
  };

  const databasePermissionDenied = getErrorCode(scheduleError) === 'permission-denied';
  const sourceLabel = isLoading
    ? copy.loading
    : isFromFirestore
    ? `${copy.database} · ${rows.length}`
    : copy.bundled;

  return (
    <section className="mb-6 rounded-2xl border border-[#c8dcc0] bg-white/95 p-4 shadow-sm backdrop-blur-md sm:p-5 dark:border-[#2b4523] dark:bg-[#101c0d]/95">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 shrink-0 text-[#278500] dark:text-[#7ce043]" aria-hidden="true" />
            <h2 className="font-display text-base font-bold text-[#131f10] dark:text-[#ecf4e8]">
              {copy.title}
            </h2>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-[#52634c] dark:text-[#a8bc9f]">
            {copy.description}
          </p>
        </div>
        <span className={`inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
          isFromFirestore
            ? 'bg-[#e3f2da] text-[#1e6800] dark:bg-[#1d3314] dark:text-[#8be05a]'
            : 'bg-[#edf5e9] text-[#52634c] dark:bg-[#1a2a15] dark:text-[#b5c7ae]'
        }`}>
          {sourceLabel}
        </span>
      </div>

      {scheduleError && (
        <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200" role="status">
          {databasePermissionDenied ? copy.rules : copy.unavailable}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label htmlFor="schedule-csv-file" className="mb-1.5 block text-xs font-semibold text-[#3f503a] dark:text-[#c7d7c0]">
            {copy.csvLabel}
          </label>
          <input
            id="schedule-csv-file"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            aria-describedby="schedule-csv-help"
            className="block min-h-[42px] w-full rounded-lg border border-[#dce6d7] bg-white text-sm text-[#3f503a] file:mr-3 file:min-h-[40px] file:border-0 file:border-r file:border-[#dce6d7] file:bg-[#edf5e9] file:px-3 file:font-semibold file:text-[#1e6800] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#24371f] dark:bg-[#142111] dark:text-[#c7d7c0] dark:file:border-[#24371f] dark:file:bg-[#1d3314] dark:file:text-[#8be05a] dark:focus-visible:outline-[#6fd43a]"
          />
          <p id="schedule-csv-help" className="mt-1 text-[11px] text-[#65745f] dark:text-[#98ad90]">
            {copy.accepted}
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadCsv(buildScheduleCsv(rows))}
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-[#dce6d7] bg-white px-3.5 text-sm font-semibold text-[#278500] transition-colors hover:border-[#278500] hover:bg-[#edf5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#24371f] dark:bg-[#142111] dark:text-[#7ce043] dark:hover:border-[#6fd43a] dark:hover:bg-[#1d3314] dark:focus-visible:outline-[#6fd43a]"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {copy.download}
        </button>
      </div>

      {!preview && !feedback && (
        <p className="mt-3 text-xs text-[#65745f] dark:text-[#98ad90]">{copy.chooseFile}</p>
      )}

      {preview && (
        <div className="mt-4 border-t border-[#dce6d7] pt-4 dark:border-[#24371f]">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-bold text-[#131f10] dark:text-[#ecf4e8]">{copy.preview}</h3>
            <span className="text-xs text-[#52634c] dark:text-[#a8bc9f]">
              {preview.filename} · {preview.items.length} {copy.ready}
            </span>
          </div>

          {preview.errors.length > 0 && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200" role="alert">
              <p className="font-semibold">{preview.errors.length} CSV validation {preview.errors.length === 1 ? 'issue' : 'issues'}</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {preview.errors.slice(0, 8).map((message) => <li key={message}>{message}</li>)}
              </ul>
              {preview.errors.length > 8 && <p className="mt-1">…and {preview.errors.length - 8} more.</p>}
            </div>
          )}

          {preview.items.length > 0 && (
            <div className="mt-3 overflow-x-auto rounded-lg border border-[#dce6d7] dark:border-[#24371f]">
              <table className="min-w-full divide-y divide-[#dce6d7] text-left text-xs dark:divide-[#24371f]">
                <caption className="sr-only">{copy.preview}</caption>
                <thead className="bg-[#edf5e9] text-[#3f503a] dark:bg-[#1a2a15] dark:text-[#c7d7c0]">
                  <tr>
                    {[copy.date, copy.event, copy.venue, copy.type].map((heading) => (
                      <th key={heading} scope="col" className="whitespace-nowrap px-3 py-2 font-semibold">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4ece0] bg-white dark:divide-[#24371f] dark:bg-[#142111]">
                  {preview.items.slice(0, 5).map((item, index) => (
                    <tr key={`${item.tarikh_mula}-${item.tajuk}-${index}`}>
                      <td className="whitespace-nowrap px-3 py-2 font-mono-num text-[#52634c] dark:text-[#a8bc9f]">{item.tarikh_mula}</td>
                      <td className="min-w-[180px] px-3 py-2 font-semibold text-[#131f10] dark:text-[#ecf4e8]">{item.tajuk}</td>
                      <td className="min-w-[180px] px-3 py-2 text-[#52634c] dark:text-[#a8bc9f]">{item.lokasi}</td>
                      <td className="px-3 py-2 capitalize text-[#52634c] dark:text-[#a8bc9f]">{item.jenis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.items.length > 5 && (
                <p className="border-t border-[#dce6d7] px-3 py-2 text-[11px] text-[#65745f] dark:border-[#24371f] dark:text-[#98ad90]">
                  {copy.firstRows}
                </p>
              )}
            </div>
          )}

          {preview.errors.length === 0 && preview.items.length > 0 && (
            <div className="mt-4 space-y-3">
              <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                {copy.replaceWarning}
              </p>
              <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-[#3f503a] dark:text-[#c7d7c0]">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.currentTarget.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#278500] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:accent-[#6fd43a]"
                />
                <span>{copy.confirm}</span>
              </label>
              <button
                type="button"
                onClick={handleImport}
                disabled={!confirmed || isImporting}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#278500] px-4 text-sm font-bold text-white transition-colors hover:bg-[#206e00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#6fd43a] dark:text-[#0a1407] dark:hover:bg-[#82df52] dark:focus-visible:outline-[#6fd43a]"
              >
                {isImporting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
                {isImporting ? copy.importing : copy.import}
              </button>
            </div>
          )}
        </div>
      )}

      {feedback && (
        <p className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-relaxed ${
          feedback.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-200'
            : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
        }`} role={feedback.type === 'error' ? 'alert' : 'status'}>
          {feedback.type === 'success' && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
          <span>{feedback.text}</span>
        </p>
      )}
    </section>
  );
}
