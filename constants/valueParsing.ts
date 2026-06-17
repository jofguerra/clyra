/**
 * Robust parsing of lab-result values and reference ranges.
 *
 * WHY: Spanish/LatAm labs use a comma as the decimal separator ("1,25" = 1.25).
 * A naive `parseFloat("1,25")` returns 1 — silently corrupting every trend,
 * chart and computed metric. This module centralizes numeric parsing and makes
 * biomarker status deterministic (computed from the reference range) instead of
 * trusting the LLM's own classification.
 *
 * It also disambiguates the count-vs-decimal case (e.g. "12.500" Leucocitos =
 * 12500, not 12.5) using context (a count flag and/or the reference range), and
 * parses sex-specific reference ranges ("H: 13-17  M: 12-15").
 */

export type BiomarkerStatusValue = 'normal' | 'low' | 'high' | 'borderline';
export type Sex = 'male' | 'female' | null | undefined;

export interface NumberParseOpts {
  /** Marker is a cell count (Leucocitos/Plaquetas) → a lone dot before 3 digits is a thousands separator. */
  isCount?: boolean;
  /** Reference range string used to disambiguate the count-vs-decimal case by magnitude. */
  refRange?: string | null;
  /** Sex, used when refRange is sex-specific. */
  sex?: Sex;
}

/** True when a string looks purely numeric (digits + separators + optional sign/operator), no letters/words. */
export function isNumericValue(value: string | number | null | undefined): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  if (value == null) return false;
  return /^[<>≤≥=~\s]*[-+]?\d[\d.,\s]*\d?\s*$/.test(String(value).trim());
}

/** Parse the bounds of a reference range without triggering count disambiguation. */
function parseBound(str: string): number {
  const m = str.match(/-?\d[\d.,]*\d|-?\d/);
  if (!m) return NaN;
  return parseSimpleNumber(m[0]);
}

/** Core locale-aware number parse (no count/refRange disambiguation). */
function parseSimpleNumber(token: string): number {
  let num = token.replace(/\s/g, '');
  const hasDot = num.includes('.');
  const hasComma = num.includes(',');

  if (hasDot && hasComma) {
    if (num.lastIndexOf(',') > num.lastIndexOf('.')) {
      num = num.replace(/\./g, '').replace(',', '.'); // ES: dots=thousands, comma=decimal
    } else {
      num = num.replace(/,/g, '');                    // US: commas=thousands, dot=decimal
    }
  } else if (hasComma) {
    const parts = num.split(',');
    const intPart = parts[0].replace('-', '');
    if (parts.length === 2 && (parts[1].length !== 3 || intPart === '0' || intPart === '')) {
      num = parts[0] + '.' + parts[1];        // "1,25" / "0,250" → decimal comma
    } else {
      num = num.replace(/,/g, '');            // "250,000" → thousands
    }
  } else if (hasDot) {
    const parts = num.split('.');
    if (parts.length > 2) num = num.replace(/\./g, ''); // "1.200.000" → thousands
    // single dot → standard decimal, left as-is (count disambiguation handled by caller)
  }

  const n = parseFloat(num);
  return isNaN(n) ? NaN : n;
}

/**
 * Parses a biomarker value string into a number, handling locale separators and
 * (with context) the count-vs-decimal ambiguity.
 *
 *  - "1.25"/"1,25"/"0,250"  → 1.25 / 1.25 / 0.25
 *  - "250,000"/"1.200.000"  → 250000 / 1200000
 *  - "1.234,56"/"1,234.56"  → 1234.56
 *  - "4.5x10^6"/"4.5e6"     → 4500000 (scientific)
 *  - "< 5.7"/"7.2 mg/dL"    → 5.7 / 7.2
 *  - "12.500" + {isCount}   → 12500 (else 12.5)
 */
export function parseBiomarkerNumber(
  value: string | number | null | undefined,
  opts: NumberParseOpts = {},
): number {
  if (typeof value === 'number') return value;
  if (value == null) return NaN;

  const raw = String(value).trim();
  if (!raw) return NaN;

  // Scientific notation: "4.5 x 10^6", "4,5x10e6", "4.5e6"
  const sci = raw.match(/(-?\d[\d.,]*)\s*(?:x\s*10\s*[\^e]?|e)\s*(-?\d+)/i);
  if (sci) {
    const mant = parseSimpleNumber(sci[1]);
    const exp = parseInt(sci[2], 10);
    if (!isNaN(mant) && !isNaN(exp)) return mant * Math.pow(10, exp);
  }

  // First numeric token (ignores units / comparison operators).
  const token = raw.match(/\d[\d.,\s]*\d|\d/);
  if (!token) return NaN;
  const t = token[0].replace(/\s/g, '');

  // Count-vs-decimal ambiguity: a single dot with exactly 3 trailing digits
  // ("12.500", "5.800") — could be 12.5 or 12500.
  const ambiguous = /^\d{1,3}\.\d{3}$/.test(t);
  if (ambiguous) {
    const [intPart, decPart] = t.split('.');
    const asDecimal = parseFloat(intPart + '.' + decPart);
    const asThousands = parseFloat(intPart + decPart);
    if (opts.isCount) return asThousands;
    const r = parseReferenceRange(opts.refRange, opts.sex);
    if (r) {
      const fits = (x: number) =>
        (r.min == null || x >= r.min * 0.5) && (r.max == null || x <= r.max * 2);
      const decFits = fits(asDecimal);
      const thoFits = fits(asThousands);
      if (thoFits && !decFits) return asThousands;
      if (decFits && !thoFits) return asDecimal;
    }
    return asDecimal; // conservative default when no context
  }

  return parseSimpleNumber(t);
}

/**
 * Returns a canonical numeric string for a value, or the original string when
 * it's qualitative (e.g. "Negativo"). Used at ingestion so every downstream
 * consumer agrees on the number (fixes the 1000x count display bug).
 */
export function canonicalizeValue(
  value: string | number,
  opts: NumberParseOpts = {},
): string {
  if (!isNumericValue(value)) return String(value).trim();
  const n = parseBiomarkerNumber(value, opts);
  if (isNaN(n)) return String(value).trim();
  return String(n);
}

/** Detect which sub-segment of a sex-specific range applies to the given sex. */
function pickSexSegment(s: string, sex: Sex): string | null {
  if (!sex) return null;
  const lower = ` ${s.toLowerCase()} `;
  // Word-labelled segments: "hombres 13-17 mujeres 12-15", "male: .. female: .."
  const maleWords = /(hombre|var[oó]n|masculino|\bmale\b)/;
  const femaleWords = /(mujer|femenino|\bfemale\b)/;
  const wantMale = sex === 'male';
  // Split on the opposite-sex label to isolate the wanted segment.
  const labelRe = /(hombres?|varones?|masculino|mujeres?|femenino|males?|females?|[♂♀]|\bh\b|\bv\b|\bm\b|\bf\b)\s*[:=]?/gi;
  const matches = [...s.matchAll(labelRe)];
  if (matches.length >= 2) {
    // Build labelled segments [label, text-until-next-label]
    const segs: { male: boolean; female: boolean; text: string }[] = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index ?? 0;
      const end = i + 1 < matches.length ? (matches[i + 1].index ?? s.length) : s.length;
      const label = matches[i][1].toLowerCase();
      const text = s.slice(start, end);
      const isM = /^(h|v|hombre|hombres|var|varon|varones|masculino|male|males|♂)/.test(label);
      const isF = /^(m|f|mujer|mujeres|femenino|female|females|♀)/.test(label) && !isM;
      // Ambiguity: lone "m" means Mujer (female) in ES if an "h"/"v" male label also exists;
      // means Male in EN if an "f" label exists. Resolve by what other labels are present.
      segs.push({ male: isM, female: isF, text });
    }
    const hasH = segs.some(g => g.male);
    const hasF = matches.some(m => /^f/i.test(m[1]));
    const fixed = segs.map(g => {
      let male = g.male, female = g.female;
      const lbl = (g.text.match(labelRe)?.[0] || '').trim().toLowerCase();
      if (/^m\b|^m[:=]/.test(lbl)) { // lone "m"
        if (hasH) { male = false; female = true; }   // ES: M = Mujer
        else if (hasF) { male = true; female = false; } // EN: M = Male
      }
      return { male, female, text: g.text };
    });
    const want = fixed.find(g => (wantMale ? g.male : g.female));
    if (want) return want.text;
  }
  // Fallback: if the whole string mentions only the wanted sex's word, use it.
  if (wantMale && maleWords.test(lower) && !femaleWords.test(lower)) return s;
  if (!wantMale && femaleWords.test(lower) && !maleWords.test(lower)) return s;
  return null;
}

/**
 * Parses a reference-range string into numeric bounds.
 * Returns null when it can't be interpreted (qualitative / free text / missing).
 * If `sex` is given and the range is sex-specific, the matching sub-range is used.
 *
 * Handles: "70 - 100", "70–100", "70 a 100", "70 to 100",
 *          "< 5.7", "≤ 5.7", "hasta 100", "menor a 100",
 *          "> 40", "≥ 40", "mayor a 40", "70-100 mg/dL",
 *          "H: 13-17 M: 12-15", scientific notation bounds.
 */
export function parseReferenceRange(
  range?: string | null,
  sex?: Sex,
): { min: number | null; max: number | null } | null {
  if (!range) return null;
  let s = String(range).trim();
  if (!s) return null;

  // Sex-specific range → narrow to the relevant segment first.
  if (sex && /(hombre|mujer|var[oó]n|masculino|femenino|male|female|[♂♀])/i.test(s) ||
      (sex && /\b[hvmf]\b\s*[:=]/i.test(s))) {
    const seg = pickSexSegment(s, sex);
    if (seg) s = seg;
  }

  s = s.toLowerCase().replace(/[–—]/g, '-').replace(/≤/g, '<=').replace(/≥/g, '>=');

  // Scientific bounds: "4.5x10^6 - 5.9x10^6"
  const sciRange = s.match(/(-?\d[\d.,]*\s*(?:x\s*10\s*[\^e]?|e)\s*-?\d+)\s*-\s*(-?\d[\d.,]*\s*(?:x\s*10\s*[\^e]?|e)\s*-?\d+)/i);
  if (sciRange) {
    const a = parseBiomarkerNumber(sciRange[1]);
    const b = parseBiomarkerNumber(sciRange[2]);
    if (!isNaN(a) && !isNaN(b)) return { min: Math.min(a, b), max: Math.max(a, b) };
  }

  const hasLower = /(>=?|mayor|superior|desde|m[ií]nimo|min\b)/.test(s);
  const hasUpper = /(<=?|menor|inferior|hasta|m[áa]ximo|max\b)/.test(s);

  if (hasUpper && !hasLower) {
    const v = parseBound(s);
    return isNaN(v) ? null : { min: null, max: v };
  }
  if (hasLower && !hasUpper) {
    const v = parseBound(s);
    return isNaN(v) ? null : { min: v, max: null };
  }

  // Two-number range. Split the range dash without confusing it for a sign.
  const cleaned = s.replace(/(\d)\s*-\s*(\d)/, '$1|$2');
  const parts = cleaned.split(/\||\bto\b|\sa\s|\sy\s/).map(p => p.trim()).filter(Boolean);
  const numbers: number[] = [];
  for (const p of parts) {
    const v = parseBound(p);
    if (!isNaN(v)) numbers.push(v);
  }
  if (numbers.length >= 2) {
    return { min: Math.min(numbers[0], numbers[1]), max: Math.max(numbers[0], numbers[1]) };
  }
  return null;
}

export interface StatusOpts {
  sex?: Sex;
  isCount?: boolean;
}

/**
 * Computes biomarker status deterministically from value vs. reference range.
 * Returns null when it can't decide (non-numeric value or unparseable range) —
 * the caller should keep the AI-provided status in that case.
 *
 * "borderline" = within 10% of the violated limit; beyond that → high/low.
 * Positional only (above max = high, below min = low); clinical direction-of-good
 * (e.g. HDL) is a separate display concern.
 */
export function computeStatusFromRange(
  value: string | number | null | undefined,
  range?: string | null,
  opts: StatusOpts = {},
): BiomarkerStatusValue | null {
  const v = parseBiomarkerNumber(value, { refRange: range, sex: opts.sex, isCount: opts.isCount });
  if (isNaN(v)) return null;

  const r = parseReferenceRange(range, opts.sex);
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

/** Placeholder / non-result tokens that should never be persisted as data. */
const PLACEHOLDER_VALUES = new Set([
  '', '-', '--', '---', 'n/a', 'na', 'n.a.', 'nd', 'n.d.', 's/d',
  'no aplica', 'pendiente', 'no realizado', 'sin dato', 'sin resultado', '...', '—',
]);

/** True when a value carries no usable information and the row should be dropped. */
export function isPlaceholderValue(value: string | number | null | undefined): boolean {
  if (value == null) return true;
  if (typeof value === 'number') return !Number.isFinite(value);
  return PLACEHOLDER_VALUES.has(String(value).trim().toLowerCase());
}
