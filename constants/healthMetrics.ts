/**
 * Advanced health metrics:
 * - Biological Age estimate
 * - Risk Scores (cardiovascular, metabolic, inflammatory)
 * - Doctor question suggestions for out-of-range markers
 */

import { Biomarker } from '../services/openai';
import { BodySystem, BODY_SYSTEMS, computeHealthScore } from './biomarkerSystems';

// ── Optimal Percentage ──────────────────────��─────────────────────────────────

/**
 * Computes the percentage of biomarkers currently in the optimal (normal) range.
 */
export function computeOptimalPercentage(biomarkers: Biomarker[]): number {
  if (biomarkers.length === 0) return 0;
  const optimal = biomarkers.filter(b => b.status === 'normal').length;
  return Math.round((optimal / biomarkers.length) * 100);
}

// ── Biological Age ───────────────────────────────────────────────────────���─────

/**
 * Estimates a biological age offset in years based on biomarker deviations.
 * Each out-of-range marker adds to or subtracts from chronological age.
 * Returns { biologicalAge, delta, label } where delta = bio - chrono.
 */
export function computeBiologicalAge(
  biomarkers: Biomarker[],
  chronologicalAge: number,
): { biologicalAge: number; delta: number } {
  if (!biomarkers.length || !chronologicalAge || chronologicalAge <= 0) {
    return { biologicalAge: chronologicalAge, delta: 0 };
  }

  let offset = 0; // total offset in years

  for (const b of biomarkers) {
    switch (b.status) {
      case 'normal':
        offset -= 0.15;   // each normal marker = -2 months
        break;
      case 'borderline':
        offset += 0.5;    // borderline = +6 months
        break;
      case 'high':
      case 'low':
        offset += 1.5;    // critical = +18 months
        break;
    }
  }

  // Clamp to ±15 years max
  const clampedOffset = Math.max(-15, Math.min(15, offset));
  const biologicalAge = Math.round(chronologicalAge + clampedOffset);

  return {
    biologicalAge,
    delta: biologicalAge - chronologicalAge,
  };
}

// ── Risk Scores ────────────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface RiskScore {
  level: RiskLevel;
  score: number;    // 0–100
  markers: string[]; // names of contributing markers
}

function findBiomarker(biomarkers: Biomarker[], ...names: string[]): Biomarker | undefined {
  const lowerNames = names.map(n => n.toLowerCase());
  return biomarkers.find(b => lowerNames.some(n => b.name.toLowerCase().includes(n)));
}

/**
 * Cardiovascular risk based on lipids and inflammation markers.
 */
export function computeCardiovascularRisk(biomarkers: Biomarker[]): RiskScore {
  const relevant: string[] = [];
  let riskPoints = 0;

  const ldl = findBiomarker(biomarkers, 'ldl', 'colesterol ldl');
  const hdl = findBiomarker(biomarkers, 'hdl', 'colesterol hdl');
  const tri = findBiomarker(biomarkers, 'triglicér', 'trigliceridos', 'triglycerides');
  const crp = findBiomarker(biomarkers, 'pcr', 'proteína c', 'crp');
  const tc  = findBiomarker(biomarkers, 'colesterol total', 'total cholesterol');

  if (ldl) {
    relevant.push(ldl.name);
    if (ldl.status === 'high') riskPoints += 35;
    else if (ldl.status === 'borderline') riskPoints += 15;
  }
  if (hdl) {
    relevant.push(hdl.name);
    if (hdl.status === 'low') riskPoints += 25;
    else if (hdl.status === 'normal') riskPoints -= 10;
  }
  if (tri) {
    relevant.push(tri.name);
    if (tri.status === 'high') riskPoints += 20;
    else if (tri.status === 'borderline') riskPoints += 8;
  }
  if (crp) {
    relevant.push(crp.name);
    if (crp.status === 'high') riskPoints += 20;
    else if (crp.status === 'borderline') riskPoints += 8;
  }
  if (tc) {
    relevant.push(tc.name);
    if (tc.status === 'high') riskPoints += 15;
  }

  const score = Math.min(100, Math.max(0, riskPoints));
  const level: RiskLevel = score >= 50 ? 'high' : score >= 25 ? 'moderate' : 'low';

  return { level, score, markers: relevant };
}

/**
 * Metabolic risk based on blood sugar and lipid markers.
 */
export function computeMetabolicRisk(biomarkers: Biomarker[]): RiskScore {
  const relevant: string[] = [];
  let riskPoints = 0;

  const glucose = findBiomarker(biomarkers, 'glucosa', 'glucose');
  const hba1c   = findBiomarker(biomarkers, 'hemoglobina a1c', 'hba1c', 'a1c');
  const insulin = findBiomarker(biomarkers, 'insulina', 'insulin');
  const tri     = findBiomarker(biomarkers, 'triglicér', 'trigliceridos');

  if (glucose) {
    relevant.push(glucose.name);
    if (glucose.status === 'high') riskPoints += 40;
    else if (glucose.status === 'borderline') riskPoints += 20;
  }
  if (hba1c) {
    relevant.push(hba1c.name);
    if (hba1c.status === 'high') riskPoints += 45;
    else if (hba1c.status === 'borderline') riskPoints += 20;
  }
  if (insulin) {
    relevant.push(insulin.name);
    if (insulin.status === 'high') riskPoints += 20;
    else if (insulin.status === 'borderline') riskPoints += 10;
  }
  if (tri) {
    relevant.push(tri.name);
    if (tri.status === 'high') riskPoints += 15;
    else if (tri.status === 'borderline') riskPoints += 5;
  }

  const score = Math.min(100, Math.max(0, riskPoints));
  const level: RiskLevel = score >= 50 ? 'high' : score >= 20 ? 'moderate' : 'low';

  return { level, score, markers: relevant };
}

/**
 * Inflammatory risk based on CRP, white blood cells.
 */
export function computeInflammatoryRisk(biomarkers: Biomarker[]): RiskScore {
  const relevant: string[] = [];
  let riskPoints = 0;

  const crp  = findBiomarker(biomarkers, 'pcr', 'proteína c', 'proteina c');
  const wbc  = findBiomarker(biomarkers, 'leucocitos', 'glóbulos blancos', 'wbc');
  const uric = findBiomarker(biomarkers, 'ácido úrico', 'acido urico', 'uric');

  if (crp) {
    relevant.push(crp.name);
    if (crp.status === 'high') riskPoints += 50;
    else if (crp.status === 'borderline') riskPoints += 20;
  }
  if (wbc) {
    relevant.push(wbc.name);
    if (wbc.status === 'high') riskPoints += 30;
    else if (wbc.status === 'low') riskPoints += 20;
    else if (wbc.status === 'borderline') riskPoints += 10;
  }
  if (uric) {
    relevant.push(uric.name);
    if (uric.status === 'high') riskPoints += 15;
    else if (uric.status === 'borderline') riskPoints += 5;
  }

  const score = Math.min(100, Math.max(0, riskPoints));
  const level: RiskLevel = score >= 40 ? 'high' : score >= 15 ? 'moderate' : 'low';

  return { level, score, markers: relevant };
}

// ── Doctor Questions ───────────────────────────────────────────────────────────

export interface DoctorQuestion {
  marker: string;
  question: { en: string; es: string };
}

/**
 * General wellness questions used as fallbacks when there aren't enough
 * biomarker-specific questions to reach the minimum of 3.
 */
const GENERAL_WELLNESS_QUESTIONS: DoctorQuestion[] = [
  {
    marker: 'Screening',
    question: {
      en: 'What screening tests do you recommend for my age and profile?',
      es: '¿Qué exámenes preventivos recomienda para mi edad y perfil?',
    },
  },
  {
    marker: 'Lifestyle',
    question: {
      en: 'Are there any lifestyle changes that could improve my results?',
      es: '¿Hay cambios de estilo de vida que podrían mejorar mis resultados?',
    },
  },
  {
    marker: 'Follow-up',
    question: {
      en: 'How often should I retest these markers?',
      es: '¿Con qué frecuencia debo repetir estos análisis?',
    },
  },
  {
    marker: 'Supplements',
    question: {
      en: 'Should I consider any supplements based on my results?',
      es: '¿Debería considerar algún suplemento basado en mis resultados?',
    },
  },
  {
    marker: 'Priorities',
    question: {
      en: 'What are the most important markers for me to focus on?',
      es: '¿Cuáles son los marcadores más importantes en los que debo enfocarme?',
    },
  },
];

const MIN_DOCTOR_QUESTIONS = 3;

/**
 * Generates questions a patient should ask their doctor about out-of-range markers.
 * Always returns at least 3 questions, padding with general wellness questions if needed.
 */
export function generateDoctorQuestions(biomarkers: Biomarker[]): DoctorQuestion[] {
  const questions: DoctorQuestion[] = [];
  const outOfRange = biomarkers.filter(b => b.status !== 'normal');

  for (const b of outOfRange.slice(0, 6)) { // max 6 questions
    const name = b.name;
    const val = `${b.value} ${b.unit}`;
    const refRange = b.referenceRange ? ` (normal: ${b.referenceRange} ${b.unit})` : '';

    questions.push({
      marker: name,
      question: {
        en: `My ${name} is ${val}${refRange} — marked as ${b.status}. Should I be concerned, and what lifestyle changes or tests do you recommend?`,
        es: `Mi ${name} es ${val}${refRange} — marcado como ${b.status === 'high' ? 'alto' : b.status === 'low' ? 'bajo' : 'límite'}. ¿Debo preocuparme? ¿Qué cambios o exámenes recomienda?`,
      },
    });
  }

  // Pad with general wellness questions to ensure at least MIN_DOCTOR_QUESTIONS
  let fallbackIdx = 0;
  while (questions.length < MIN_DOCTOR_QUESTIONS && fallbackIdx < GENERAL_WELLNESS_QUESTIONS.length) {
    questions.push(GENERAL_WELLNESS_QUESTIONS[fallbackIdx]);
    fallbackIdx++;
  }

  return questions;
}

// ── System Coverage ───────────────────────────────────────────────────────────

export interface SystemCoverage {
  covered: number;
  total: number;
  percentage: number;
}

/**
 * Computes how many biomarkers the user has for a given body system.
 */
export function computeSystemCoverage(
  biomarkers: Biomarker[],
  system: BodySystem,
): SystemCoverage {
  const total = system.biomarkerNames.length;
  const covered = system.biomarkerNames.filter(sysName => {
    const s = sysName.toLowerCase();
    return biomarkers.some(b => {
      const bn = b.name.toLowerCase();
      return bn === s || bn.includes(s) || s.includes(bn);
    });
  }).length;
  const percentage = total > 0 ? Math.round((covered / total) * 100) : 0;
  return { covered, total, percentage };
}

export interface OverallCoverage {
  percentage: number;
  systemCoverages: { systemId: string; percentage: number }[];
}

/**
 * Computes coverage across all body systems, returns average percentage.
 */
export function computeOverallCoverage(biomarkers: Biomarker[]): OverallCoverage {
  const systemCoverages = BODY_SYSTEMS.map(sys => ({
    systemId: sys.id,
    percentage: computeSystemCoverage(biomarkers, sys).percentage,
  }));
  const avg =
    systemCoverages.length > 0
      ? Math.round(
          systemCoverages.reduce((sum, sc) => sum + sc.percentage, 0) /
            systemCoverages.length,
        )
      : 0;
  return { percentage: avg, systemCoverages };
}

// ── Simulate Improvement ──────────────────────────────────────────────────────

export interface ImprovementSimulation {
  currentScore: number;
  projectedScore: number;
  scoreDelta: number;
  currentBioAge: number;
  projectedBioAge: number;
  bioAgeDelta: number;
}

/**
 * Simulates the effect of normalizing specific markers on health score and bio age.
 */
export function simulateImprovement(
  biomarkers: Biomarker[],
  markersToNormalize: string[],
  chronologicalAge: number = 40,
): ImprovementSimulation {
  const currentScore = computeHealthScore(biomarkers);
  const { biologicalAge: currentBioAge } = computeBiologicalAge(biomarkers, chronologicalAge);

  const lowerNames = markersToNormalize.map(n => n.toLowerCase());
  const modified = biomarkers.map(b => {
    const bn = b.name.toLowerCase();
    const shouldNormalize = lowerNames.some(
      n => bn === n || bn.includes(n) || n.includes(bn),
    );
    return shouldNormalize ? { ...b, status: 'normal' as const } : b;
  });

  const projectedScore = computeHealthScore(modified);
  const { biologicalAge: projectedBioAge } = computeBiologicalAge(modified, chronologicalAge);

  return {
    currentScore,
    projectedScore,
    scoreDelta: projectedScore - currentScore,
    currentBioAge,
    projectedBioAge,
    bioAgeDelta: projectedBioAge - currentBioAge,
  };
}

// ── Top Priorities ────────────────────────────────────────────────────────────

export interface Priority {
  title: string;
  subtitle: string;
  impact: string;
  icon: string;
  markerName?: string;
}

type SimplifiedSession = { biomarkers: Biomarker[]; healthScore: number; date: string };

const SYSTEM_EMOJI_MAP: Record<string, string> = {
  cardiovascular: '❤️',
  hepatico: '🟤',
  metabolico: '⚡',
  renal: '🫘',
  tiroideo: '🦋',
  hematologico: '🩸',
  vitaminas: '✨',
  hormonal: '💊',
};

function getMarkerSystemEmoji(markerName: string): string {
  const lower = markerName.toLowerCase();
  for (const sys of BODY_SYSTEMS) {
    const match = sys.biomarkerNames.some(n => {
      const s = n.toLowerCase();
      return lower === s || lower.includes(s) || s.includes(lower);
    });
    if (match) return SYSTEM_EMOJI_MAP[sys.id] || '🔬';
  }
  return '🔬';
}

function simpleName(name: string): string {
  // Return a shorter, user-friendly version of the biomarker name
  return name
    .replace(/\s*\(.*\)/, '')   // remove parenthetical
    .replace(/en ayunas/i, '')  // remove "en ayunas"
    .trim();
}

/**
 * Returns top 3 actionable priorities based on out-of-range markers and coverage gaps.
 */
export function getTopPriorities(
  biomarkers: Biomarker[],
  _sessions: SimplifiedSession[],
  language: 'en' | 'es',
): Priority[] {
  const priorities: Priority[] = [];

  // ── 1. Out-of-range markers sorted by severity ─────────────────────────────
  const outOfRange = biomarkers.filter(b => b.status !== 'normal');

  // Sort: high/low first, then borderline
  const sorted = [...outOfRange].sort((a, b) => {
    const severityOrder = (s: string) =>
      s === 'high' || s === 'low' ? 0 : s === 'borderline' ? 1 : 2;
    return severityOrder(a.status) - severityOrder(b.status);
  });

  for (const marker of sorted) {
    if (priorities.length >= 3) break;

    const sim = simulateImprovement(biomarkers, [marker.name]);
    const delta = sim.scoreDelta;
    const shortName = simpleName(marker.name);
    const icon = getMarkerSystemEmoji(marker.name);

    const isHigh = marker.status === 'high';
    const isLow = marker.status === 'low';

    let title: string;
    let subtitle: string;

    if (language === 'es') {
      title = isHigh
        ? `Bajar ${shortName}`
        : isLow
          ? `Subir ${shortName}`
          : `Mejorar ${shortName}`;
      subtitle = isHigh
        ? `Tu ${shortName} está por encima del rango ideal. Enfócate en hábitos que lo reduzcan.`
        : isLow
          ? `Tu ${shortName} está bajo. Considera ajustes en dieta o suplementación.`
          : `Tu ${shortName} está en el límite. Pequeños cambios pueden normalizarlo.`;
    } else {
      title = isHigh
        ? `Lower ${shortName}`
        : isLow
          ? `Raise ${shortName}`
          : `Improve ${shortName}`;
      subtitle = isHigh
        ? `Your ${shortName} is above the ideal range. Focus on habits to bring it down.`
        : isLow
          ? `Your ${shortName} is low. Consider diet adjustments or supplementation.`
          : `Your ${shortName} is borderline. Small changes can normalize it.`;
    }

    const impact =
      language === 'es'
        ? `+${delta} puntos al score`
        : `+${delta} points to score`;

    priorities.push({ title, subtitle, impact, icon, markerName: marker.name });
  }

  // ── 2. Coverage gaps — suggest completing uncovered systems ─────────────────
  if (priorities.length < 3) {
    for (const sys of BODY_SYSTEMS) {
      if (priorities.length >= 3) break;
      const cov = computeSystemCoverage(biomarkers, sys);
      if (cov.covered === 0) {
        const sysName = language === 'es' ? sys.name.es : sys.name.en;
        priorities.push({
          title:
            language === 'es'
              ? `Completar ${sysName}`
              : `Complete ${sysName}`,
          subtitle:
            language === 'es'
              ? `No tienes marcadores de ${sysName}. Agrega estos análisis para una visión completa.`
              : `You have no ${sysName} markers yet. Add these tests for a complete picture.`,
          impact:
            language === 'es'
              ? 'Visión más completa de tu salud'
              : 'More complete health picture',
          icon: SYSTEM_EMOJI_MAP[sys.id] || '🔬',
        });
      }
    }
  }

  return priorities.slice(0, 3);
}
