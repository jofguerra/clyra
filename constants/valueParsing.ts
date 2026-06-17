/**
 * Robust parsing of lab-result values and reference ranges.
 *
 * WHY: Spanish/LatAm labs use a comma as the decimal separator ("1,25" = 1.25).
 * A naive `parseFloat("1,25")` returns 1 — silently corrupting every trend,
 * chart and computed metric. This module centralizes numeric parsing and makes
 * biomarker status deterministic (computed from the reference range) instead of
 * trusting the LLM's own classification.
 */

export type BiomarkerStatusValue = 'normal' | 'low' | 'high' | 'borderline';

/**
 * Parses a biomarker value string into a number, handling locale separators.
 *
 * Handles:
 *  - "1.25"        → 1.25   (US decimal)
 *  - "1,25"        → 1.25   (ES decimal comma)
 *  - "0,250"       → 0.25   (leading-zero ⇒ decimal)
 *  - "250,000"     → 250000 (US thousands)
 *  - "1.200.000"   → 1200000 (ES thousands with dots)
 *  - "1.234,56"    → 1234.56 (ES mixed)
 *  - "1,234.56"    → 1234.56 (US mixed)
 *  - "< 5.7" / "7.2 mg/dL" → 5.7 / 7.2 (strips operators/units)
 *
 * Returns NaN for non-numeric values ("Negativo", "Amarillo", "", etc.).
 */
export function parseBiomarkerNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  if (value == null) return NaN;

  const raw = String(value).trim();
  if (!raw) return NaN;

  // Grab the first numeric token (with separators), ignoring units / operators.
  const token = raw.match(/\d[\d.,\s]*\d|\d/);
  if (!token) return NaN;

  let num = token[0].replace(/\s/g, '');
  const hasDot = num.includes('.');
  const hasComma = num.includes(',');

  if (hasDot && hasComma) {
    // The separator that appears LAST is the decimal one.
    if (num.lastIndexOf(',') > num.lastIndexOf('.')) {
      num = num.replace(/\./g, '').replace(',', '.'); // ES: dots=thousands, comma=decimal
    } else {
      num = num.replace(/,/g, '');                    // US: commas=thousands, dot=decimal
    }
  } else if (hasComma) {
    const parts = num.split(',');
    const intPart = parts[0].replace('-', '');
    if (parts.length === 2 && (parts[1].length !== 3 || intPart === '0' || intPart === '')) {
      // "1,25" / "1,2567" / "0,250" → decimal comma
      num = parts[0] + '.' + parts[1];
    } else {
      // "250,000" / "1,234,567" → thousands separators
      num = num.replace(/,/g, '');
    }
  } else if (hasDot) {
    const parts = num.split('.');
    if (parts.length > 2) {
      num = num.replace(/\./g, ''); // "1.200.000" → thousands separators
    }
    // single dot → standard decimal, leave as-is
  }

  const n = parseFloat(num);
  return isNaN(n) ? NaN : n;
}

/**
 * Parses a reference-range string into numeric bounds.
 * Returns null when the range can't be interpreted (qualitative results,
 * free text, missing range).
 *
 * Handles: "70 - 100", "70–100", "70 a 100", "70 to 100",
 *          "< 5.7", "≤ 5.7", "hasta 100", "menor a 100",
 *          "> 40", "≥ 40", "mayor a 40", "70-100 mg/dL".
 */
export function parseReferenceRange(
  range?: string | null,
): { min: number | null; max: number | null } | null {
  if (!range) return null;
  let s = String(range).trim().toLowerCase();
  if (!s) return null;

  s = s
    .replace(/[–—]/g, '-')      // normalize dashes
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=');

  const firstNum = (str: string): number => {
    const m = str.match(/\d[\d.,]*\d|\d/);
    return m ? parseBiomarkerNumber(m[0]) : NaN;
  };

  const hasLower = /(>=?|mayor|superior|desde|m[ií]nimo|min\b)/.test(s);
  const hasUpper = /(<=?|menor|inferior|hasta|m[áa]ximo|max\b)/.test(s);

  // Upper-bound only ("< 5.7", "hasta 100")
  if (hasUpper && !hasLower) {
    const v = firstNum(s);
    return isNaN(v) ? null : { min: null, max: v };
  }
  // Lower-bound only ("> 40", "mayor a 40")
  if (hasLower && !hasUpper) {
    const v = firstNum(s);
    return isNaN(v) ? null : { min: v, max: null };
  }

  // Two-number range. Split the range dash without confusing it for a sign.
  const cleaned = s.replace(/(\d)\s*-\s*(\d)/, '$1|$2');
  const parts = cleaned.split(/\||\bto\b|\sa\s|\sy\s/).map(p => p.trim()).filter(Boolean);
  const numbers: number[] = [];
  for (const p of parts) {
    const v = firstNum(p);
    if (!isNaN(v)) numbers.push(v);
  }
  if (numbers.length >= 2) {
    return { min: Math.min(numbers[0], numbers[1]), max: Math.max(numbers[0], numbers[1]) };
  }
  return null;
}

/**
 * Computes biomarker status deterministically from value vs. reference range.
 * Returns null when it can't decide (non-numeric value or unparseable range) —
 * the caller should keep the AI-provided status in that case.
 *
 * "borderline" = within 10% of the violated limit; beyond that → high/low.
 * Note: this is POSITIONAL (above max = high, below min = low). It does not
 * encode whether high is clinically good or bad (e.g. HDL) — that's a separate
 * concern handled by display semantics.
 */
export function computeStatusFromRange(
  value: string | number | null | undefined,
  range?: string | null,
): BiomarkerStatusValue | null {
  const v = parseBiomarkerNumber(value);
  if (isNaN(v)) return null;

  const r = parseReferenceRange(range);
  if (!r || (r.min == null && r.max == null)) return null;

  const BORDER = 0.10;

  if (r.max != null && v > r.max) {
    return v <= r.max * (1 + BORDER) ? 'borderline' : 'high';
  }
  if (r.min != null && v < r.min) {
    return v >= r.min * (1 - BORDER) ? 'borderline' : 'low';
  }
  return 'normal';
}
