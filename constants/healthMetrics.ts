/**
 * Advanced health metrics:
 * - Biological Age estimate
 * - Risk Scores (cardiovascular, metabolic, inflammatory)
 * - Doctor question suggestions for out-of-range markers
 */

import { Biomarker } from '../services/openai';

// ── Biological Age ─────────────────────────────────────────────────────────────

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
 * Generates questions a patient should ask their doctor about out-of-range markers.
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

  return questions;
}
