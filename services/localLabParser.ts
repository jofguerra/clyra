import type { Biomarker } from './openai';

export type PdfTextItem = { text: string; x: number; y: number };
export type PdfTextPage = PdfTextItem[];
export type ReviewMarker = Omit<Biomarker, 'status'> & { status: Biomarker['status'] | null };
export type LocalLabDraft = { biomarkers: ReviewMarker[]; testDate: string; dateSource: 'report' | null; skippedRows: number; warnings: string[]; contentHash?: string };
const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const numeric = /^(?:<=|>=|[<>≤≥])?\s*[-+]?\d+(?:[.,]\d+)?$/;
export function isSupportedLocalValue(value: string | number): boolean { return numeric.test(String(value).trim()); }

// PDF cells stay strings: decimal separators, precision and comparison operators are retained.
// Only simple unambiguous ranges receive a suggestion; all others need an explicit review choice.
export function suggestLocalStatus(value: string, range: string): Biomarker['status'] | null {
  if (!/^[-+]?\d+(?:[.,]\d+)?$/.test(value.trim())) return null;
  const decimal = (s: string) => Number(s.replace(',', '.'));
  // A three-digit fractional part is locale-ambiguous. Do not guess its magnitude.
  if (/\d[.,]\d{3}(?:\D|$)/.test(value + ' ' + range)) return null;
  const n = decimal(value);
  const pair = range.trim().match(/^([-+]?\d+(?:[.,]\d+)?)\s*[-–]\s*([-+]?\d+(?:[.,]\d+)?)$/);
  if (pair) {
    const min = decimal(pair[1]), max = decimal(pair[2]);
    if (min > max) return null;
    return n < min ? 'low' : n > max ? 'high' : 'normal';
  }
  const bound = range.trim().match(/^(<=|>=|<|>|≤|≥)\s*([-+]?\d+(?:[.,]\d+)?)$/);
  if (!bound) return null;
  const limit = decimal(bound[2]);
  if (bound[1] === '<') return n >= limit ? 'high' : 'normal';
  if (bound[1] === '>') return n <= limit ? 'low' : 'normal';
  return ['<=', '≤'].includes(bound[1]) ? (n > limit ? 'high' : 'normal') : (n < limit ? 'low' : 'normal');
}

export function isValidLabDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(date + 'T12:00:00Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

function lines(page: PdfTextPage): PdfTextItem[][] {
  const rows: PdfTextItem[][] = [];
  for (const item of [...page].filter(i => i.text.trim()).sort((a,b) => b.y-a.y || a.x-b.x)) {
    const row = rows.find(r => Math.abs(r[0].y - item.y) <= 2);
    if (row) row.push(item); else rows.push([item]);
  }
  return rows.map(row => row.sort((a,b) => a.x-b.x));
}

export function parseRalyPages(pages: PdfTextPage[]): LocalLabDraft {
  const biomarkers: ReviewMarker[] = [];
  const dates = new Set<string>();
  let skippedRows = 0, supportedTables = 0;
  const warnings: string[] = [];
  for (const page of pages) {
    let columns: number[] | null = null;
    for (const row of lines(page)) {
      const text = row.map(i => i.text).join(' ');
      for (const match of text.matchAll(/REPORTE\s*:\s*(\d{2})\/(\d{2})\/(\d{4})/gi)) {
        const date = `${match[3]}-${match[2]}-${match[1]}`;
        if (isValidLabDate(date)) dates.add(date);
      }
      const names = row.map(i => normalize(i.text));
      const exam = names.findIndex(n => n === 'examen');
      const result = names.findIndex(n => n === 'resultado');
      const range = names.findIndex(n => /^rango\s+ref\.?$/.test(n));
      const unit = names.findIndex(n => n === 'unidades');
      if (exam >= 0 && result >= 0 && range >= 0 && unit >= 0) {
        columns = [row[exam].x, row[result].x, row[range].x, row[unit].x];
        if (!columns.every((x,i) => i === 0 || x > columns![i-1])) { columns = null; continue; }
        supportedTables++; continue;
      }
      if (!columns) continue;
      if (/tecnologia aplicada|su medico|tecnologo|^lic\./i.test(normalize(text))) { columns = null; continue; }
      const cells = ['', '', '', ''];
      for (const item of row) {
        // Cells may be right-aligned; headings mark the start of each column.
        let index = 0;
        while (index < 3 && item.x >= columns[index+1] - 5) index++;
        cells[index] += (cells[index] ? ' ' : '') + item.text;
      }
      const [name, rawValue, referenceRange, unitText] = cells.map(c => c.trim());
      if (!rawValue) continue; // section titles and signatures aren't result rows
      const value = rawValue.replace(/^[*]\s*|\s*[*]$/g, '').trim();
      if (!name || !isSupportedLocalValue(value) || /^[-+]?\d/.test(name)) { skippedRows++; continue; }
      if (biomarkers.some(b => normalize(b.name) === normalize(name))) { skippedRows++; warnings.push('duplicate'); continue; }
      biomarkers.push({ name, value, unit: unitText, ...(referenceRange ? { referenceRange } : {}), status: suggestLocalStatus(value, referenceRange) });
    }
  }
  if (!supportedTables) throw new Error('unsupported');
  if (!biomarkers.length) throw new Error('no-results');
  if (dates.size !== 1) warnings.push(dates.size ? 'ambiguous-date' : 'missing-date');
  if (skippedRows) warnings.push('skipped-rows');
  return { biomarkers, testDate: dates.size === 1 ? [...dates][0] : '', dateSource: dates.size === 1 ? 'report' : null, skippedRows, warnings: [...new Set(warnings)] };
}
