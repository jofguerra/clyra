import { HealthGoal } from '../hooks/useStore';
import { TranslationKey } from './i18n';

export type GoalDef = { id: HealthGoal; emoji: string; labelKey: TranslationKey };

export const GOALS: GoalDef[] = [
  { id: 'mood',             emoji: '☀️', labelKey: 'goalMood' },
  { id: 'metabolism',       emoji: '🔥', labelKey: 'goalMetabolism' },
  { id: 'performance',      emoji: '💪', labelKey: 'goalPerformance' },
  { id: 'testosterone',     emoji: '🧬', labelKey: 'goalTestosterone' },
  { id: 'female_hormones',  emoji: '🌸', labelKey: 'goalFemaleHormones' },
  { id: 'longevity',        emoji: '🧠', labelKey: 'goalLongevity' },
  { id: 'preventative',     emoji: '🛡️', labelKey: 'goalPreventative' },
];
