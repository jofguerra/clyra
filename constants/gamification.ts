// ============================================================
// Gamification Constants — Clyra Health App
// ============================================================

// --------------- Shared Types ---------------

export interface BilingualText {
  en: string;
  es: string;
}

// --------------- 1. Score Levels ---------------

export interface ScoreLevel {
  id: string;
  minScore: number;
  maxScore: number;
  name: BilingualText;
  color: string;
}

export const SCORE_LEVELS: ScoreLevel[] = [
  {
    id: 'attention',
    minScore: 0,
    maxScore: 49,
    name: { en: 'Critical', es: 'Crítico' },
    color: '#ba1a1a',
  },
  {
    id: 'base',
    minScore: 50,
    maxScore: 64,
    name: { en: 'Needs Attention', es: 'Requiere Atención' },
    color: '#ca8a04',
  },
  {
    id: 'good_shape',
    minScore: 65,
    maxScore: 74,
    name: { en: 'Fair', es: 'Regular' },
    color: '#0058be',
  },
  {
    id: 'optimized',
    minScore: 75,
    maxScore: 89,
    name: { en: 'Good', es: 'Bueno' },
    color: '#006947',
  },
  {
    id: 'elite',
    minScore: 90,
    maxScore: 100,
    name: { en: 'Excellent', es: 'Excelente' },
    color: '#006947',
  },
];

/** Returns the ScoreLevel matching the given score (clamped 0-100). */
export function getScoreLevel(score: number): ScoreLevel {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(score) ? Math.round(score) : 0));
  const level = SCORE_LEVELS.find(
    (l) => clamped >= l.minScore && clamped <= l.maxScore,
  );
  // Fallback should never happen with valid data, but return first level as safety net
  return level ?? SCORE_LEVELS[0];
}

/** Returns the number of points needed to reach the next level, or 0 if already at the highest level. */
export function getPointsToNextLevel(score: number): number {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(score) ? Math.round(score) : 0));
  const currentIndex = SCORE_LEVELS.findIndex(
    (l) => clamped >= l.minScore && clamped <= l.maxScore,
  );
  if (currentIndex === -1 || currentIndex === SCORE_LEVELS.length - 1) {
    return 0;
  }
  const nextLevel = SCORE_LEVELS[currentIndex + 1];
  return nextLevel.minScore - clamped;
}

// --------------- 2. Health Point Actions ---------------

export const XP_ACTIONS: Record<string, number> = {
  first_exam: 50,
  additional_exam: 100,
  complete_profile: 40,
  improve_marker: 75,
  view_ai_insight: 10,
  quarterly_checkup: 30,
  complete_mission: 150,
  complete_category: 40,
};

// --------------- 3. Health Point Level Thresholds ---------------

export interface XPThreshold {
  level: number;
  xpRequired: number;
}

export const XP_LEVEL_THRESHOLDS: XPThreshold[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 100 },
  { level: 3, xpRequired: 250 },
  { level: 4, xpRequired: 500 },
  { level: 5, xpRequired: 800 },
  { level: 6, xpRequired: 1150 },
  { level: 7, xpRequired: 1550 },
  { level: 8, xpRequired: 2000 },
  { level: 9, xpRequired: 2500 },
  { level: 10, xpRequired: 3100 },
  { level: 11, xpRequired: 3800 },
  { level: 12, xpRequired: 4600 },
  { level: 13, xpRequired: 5500 },
  { level: 14, xpRequired: 6500 },
  { level: 15, xpRequired: 7600 },
  { level: 16, xpRequired: 8800 },
  { level: 17, xpRequired: 10100 },
  { level: 18, xpRequired: 11500 },
  { level: 19, xpRequired: 13000 },
  { level: 20, xpRequired: 14600 },
];

export interface XPLevelInfo {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
  isMaxLevel: boolean;
  remainingXP: number;
  totalXP: number;
}

/** Given total XP, returns the current level info including progress toward next level. */
export function getXPLevel(xp: number): XPLevelInfo {
  xp = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
  let currentLevel = XP_LEVEL_THRESHOLDS[0];

  for (const threshold of XP_LEVEL_THRESHOLDS) {
    if (xp >= threshold.xpRequired) {
      currentLevel = threshold;
    } else {
      break;
    }
  }

  const isMaxLevel = currentLevel.level === XP_LEVEL_THRESHOLDS[XP_LEVEL_THRESHOLDS.length - 1].level;
  const nextThreshold = isMaxLevel
    ? currentLevel
    : XP_LEVEL_THRESHOLDS.find((t) => t.level === currentLevel.level + 1)!;

  const xpIntoLevel = xp - currentLevel.xpRequired;
  const xpForNextLevel = nextThreshold.xpRequired - currentLevel.xpRequired;
  const progress = isMaxLevel ? 1 : xpForNextLevel > 0 ? xpIntoLevel / xpForNextLevel : 0;

  return {
    level: currentLevel.level,
    currentXP: xpIntoLevel,
    nextLevelXP: xpForNextLevel,
    progress,
    isMaxLevel,
    remainingXP: isMaxLevel ? 0 : nextThreshold.xpRequired - xp,
    totalXP: xp,
  };
}

// --------------- 4. Achievement Definitions ---------------

export interface Achievement {
  id: string;
  name: BilingualText;
  description: BilingualText;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_exam',
    name: { en: 'Health Journey Begins', es: 'Comienza tu Viaje de Salud' },
    description: {
      en: 'Upload your first blood test exam',
      es: 'Sube tu primer examen de sangre',
    },
    icon: '🔬',
  },
  {
    id: 'trend_unlocked',
    name: { en: 'Tracking Progress', es: 'Siguiendo tu Progreso' },
    description: {
      en: 'Unlock trends by uploading multiple exams',
      es: 'Desbloquea tendencias subiendo múltiples exámenes',
    },
    icon: '📈',
  },
  {
    id: 'heart_green',
    name: { en: 'Cardio Results in Range', es: 'Cardio en Rango' },
    description: {
      en: 'All recorded cardiovascular markers are in range',
      es: 'Todos los marcadores cardiovasculares registrados están en rango',
    },
    icon: '❤️',
  },
  {
    id: 'kidneys_green',
    name: { en: 'Urinary Results in Range', es: 'Urinario en Rango' },
    description: {
      en: 'All recorded renal and urinary markers are in range',
      es: 'Todos los marcadores renales y urinarios registrados están en rango',
    },
    icon: '🫘',
  },
  {
    id: 'five_improved',
    name: { en: 'Steady Improvement', es: 'Mejora Constante' },
    description: {
      en: 'Improve 5 biomarkers between exams',
      es: 'Mejora 5 biomarcadores entre exámenes',
    },
    icon: '⭐',
  },
  {
    id: 'full_profile',
    name: { en: 'Complete Health Profile', es: 'Perfil de Salud Completo' },
    description: {
      en: 'Complete your full health profile',
      es: 'Completa tu perfil de salud completo',
    },
    icon: '🪪',
  },
  {
    id: 'three_checkups',
    name: { en: 'Consistent Monitoring', es: 'Monitoreo Consistente' },
    description: {
      en: 'Record three exams',
      es: 'Registra tres exámenes',
    },
    icon: '👑',
  },
  {
    id: 'bio_age_reduced',
    name: { en: 'Younger Biology', es: 'Biología más Joven' },
    description: {
      en: 'Reduce your biological age',
      es: 'Reduce tu edad biológica',
    },
    icon: '⏳',
  },
  {
    id: 'metabolic_reboot',
    name: { en: 'Metabolic Balance', es: 'Balance Metabólico' },
    description: {
      en: 'All recorded metabolic markers are in range',
      es: 'Todos los marcadores metabólicos registrados están en rango',
    },
    icon: '⚡',
  },
  {
    id: 'coverage_50',
    name: { en: 'Halfway There', es: 'A Mitad de Camino' },
    description: {
      en: 'Reach 50% biomarker coverage',
      es: 'Alcanza 50% de cobertura de biomarcadores',
    },
    icon: '🗺️',
  },
  {
    id: 'coverage_80',
    name: { en: 'Comprehensive View', es: 'Visión Integral' },
    description: {
      en: 'Reach 80% biomarker coverage',
      es: 'Alcanza 80% de cobertura de biomarcadores',
    },
    icon: '🧭',
  },
  {
    id: 'elite_score',
    name: { en: 'Results Index 90+', es: 'Índice de Resultados 90+' },
    description: {
      en: 'Record a results index of 90 or more',
      es: 'Registra un índice de resultados de 90 o más',
    },
    icon: '💎',
  },
];

// --------------- 5. Health Goal Templates ---------------

export interface MissionTemplate {
  id: string;
  name: BilingualText;
  description: BilingualText;
  hpReward: number;
  /** @deprecated Use hpReward instead */
  xpReward: number;
  icon: string;
  condition: string;
}

export const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: 'upload_second',
    name: { en: 'Track Your Progress', es: 'Sigue tu Progreso' },
    description: {
      en: 'Upload a second blood test to unlock trends and comparisons',
      es: 'Sube un segundo examen de sangre para desbloquear tendencias y comparaciones',
    },
    hpReward: 100,
    xpReward: 100,
    icon: '🔬',
    condition: 'sessions.length === 1',
  },
  {
    id: 'complete_metabolic',
    name: { en: 'Know Your Metabolism', es: 'Conoce tu Metabolismo' },
    description: {
      en: 'Upload exams covering at least 80% of metabolic markers',
      es: 'Sube exámenes que cubran al menos 80% de los marcadores metabólicos',
    },
    hpReward: 40,
    xpReward: 40,
    icon: '⚡',
    condition: 'metabolic_coverage < 0.8',
  },
  {
    id: 'reduce_cardio_risk',
    name: { en: 'Protect Your Heart', es: 'Protege tu Corazón' },
    description: {
      en: 'Bring your cardiovascular risk markers to a healthy range',
      es: 'Lleva tus marcadores de riesgo cardiovascular a un rango saludable',
    },
    hpReward: 75,
    xpReward: 75,
    icon: '❤️',
    condition: 'cardio_risk === "moderate" || cardio_risk === "high"',
  },
  {
    id: 'unlock_vitamins',
    name: { en: 'Check Your Vitamins', es: 'Revisa tus Vitaminas' },
    description: {
      en: 'Upload an exam that includes vitamin and mineral markers',
      es: 'Sube un examen que incluya marcadores de vitaminas y minerales',
    },
    hpReward: 40,
    xpReward: 40,
    icon: '✨',
    condition: 'vitamin_system_coverage === 0',
  },
  {
    id: 'improve_two_markers',
    name: { en: 'Improve 2 Markers in 90 Days', es: 'Mejora 2 Marcadores en 90 Días' },
    description: {
      en: 'Improve at least 2 out-of-range markers within 90 days',
      es: 'Mejora al menos 2 marcadores fuera de rango en 90 días',
    },
    hpReward: 150,
    xpReward: 150,
    icon: '🎯',
    condition: 'has_out_of_range',
  },
  {
    id: 'lower_bio_age',
    name: { en: 'Lower Your Biological Age', es: 'Baja tu Edad Biológica' },
    description: {
      en: 'Reduce your biological age so it is lower than your chronological age',
      es: 'Reduce tu edad biológica para que sea menor a tu edad cronológica',
    },
    hpReward: 150,
    xpReward: 150,
    icon: '⏳',
    condition: 'bio_age_delta > 0',
  },
  {
    id: 'complete_profile_mission',
    name: { en: 'Complete Your Health Profile', es: 'Completa tu Perfil de Salud' },
    description: {
      en: 'Fill in all fields in your health profile',
      es: 'Completa todos los campos de tu perfil de salud',
    },
    hpReward: 40,
    xpReward: 40,
    icon: '🪪',
    condition: 'profile_incomplete',
  },
];
