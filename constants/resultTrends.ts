import type { Biomarker } from '../services/openai';
import { parseBiomarkerNumber } from './valueParsing';

/** Bounds such as <5 are not exact measurements and must not become chart points. */
export function exactResultNumber(value: string | number, referenceRange?: string): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  const text = value.trim();
  if (!/^[-+]?\d+(?:[.,]\d+)*$/.test(text)) return NaN;
  const parsed = parseBiomarkerNumber(text, { refRange: referenceRange });
  return text.startsWith('-') ? -Math.abs(parsed) : parsed;
}
export type ResultDirection = 'rising' | 'declining' | 'improving_from_high' | 'improving_from_low' | null;
export function resultDirection(newestFirst: Biomarker[]): ResultDirection {
  if (newestFirst.length < 3 || new Set(newestFirst.map(b => b.unit.trim().toLowerCase())).size !== 1) return null;
  const rows = [...newestFirst].reverse();
  const values = rows.map(b => exactResultNumber(b.value, b.referenceRange));
  if (values.some(n => !Number.isFinite(n))) return null;
  const deltas = values.slice(1).map((n,i) => n - values[i]);
  const rising = deltas.every(n => n > 0.001), falling = deltas.every(n => n < -0.001);
  const latest = rows[rows.length - 1].status;
  if (rising) return rows[0].status === 'low' && latest === 'normal' ? 'improving_from_low' : 'rising';
  if (falling) return rows[0].status === 'high' && latest === 'normal' ? 'improving_from_high' : 'declining';
  return null;
}
