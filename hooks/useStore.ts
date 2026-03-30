import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Biomarker } from '../services/openai';
import { computeHealthScore } from '../constants/biomarkerSystems';
import { Lang } from '../constants/i18n';

export type HealthGoal =
  | 'mood'
  | 'metabolism'
  | 'performance'
  | 'testosterone'
  | 'female_hormones'
  | 'longevity'
  | 'preventative';

export interface ExamSession {
  id: string;
  date: string;        // ISO string — test date (from PDF) or upload date
  label: string;       // "Exam Mar 26, 2026"
  fileName?: string;   // original PDF filename
  biomarkers: Biomarker[];
  healthScore: number;
}

interface UserState {
  hasCompletedOnboarding: boolean;
  userName: string;
  age: string;
  sex: 'male' | 'female' | null;
  language: Lang;
  healthGoals: HealthGoal[];
  biomarkers: Biomarker[];
  healthScore: number;
  sessions: ExamSession[];
  setHasCompletedOnboarding: (val: boolean) => void;
  setUserName: (val: string) => void;
  setAge: (val: string) => void;
  setSex: (val: 'male' | 'female' | null) => void;
  setLanguage: (val: Lang) => void;
  setHealthGoals: (val: HealthGoal[]) => void;
  setHealthScore: (val: number) => void;
  setBiomarkers: (biomarkers: Biomarker[], testDate?: string | null, fileName?: string) => void;
  setSessions: (sessions: ExamSession[]) => void;
  clearAllData: () => void;
}

export const useStore = create<UserState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      userName: '',
      age: '',
      sex: null,
      language: 'en',
      healthGoals: [],
      biomarkers: [],
      healthScore: 0,
      sessions: [],

      setHasCompletedOnboarding: (val) => set({ hasCompletedOnboarding: val }),
      setUserName: (val) => set({ userName: val }),
      setAge: (val) => set({ age: val }),
      setSex: (val) => set({ sex: val }),
      setLanguage: (val) => set({ language: val }),
      setHealthGoals: (val) => set({ healthGoals: val }),
      setHealthScore: (val) => set({ healthScore: val }),

      setBiomarkers: (val, testDate, fileName) => {
        const score = computeHealthScore(val);
        // Use the test date from the PDF if available, otherwise use today
        const sessionDate = testDate ? new Date(testDate) : new Date();
        const session: ExamSession = {
          id: Date.now().toString(),
          date: sessionDate.toISOString(),
          label: `Exam ${sessionDate.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}`,
          fileName,
          biomarkers: val,
          healthScore: score,
        };
        set((state) => ({
          biomarkers: val,
          healthScore: score,
          sessions: [session, ...state.sessions],
        }));
      },

      setSessions: (sessions) => {
        const latest = sessions[0];
        set({
          sessions,
          biomarkers: latest?.biomarkers ?? [],
          healthScore: latest?.healthScore ?? 0,
        });
      },

      clearAllData: () => set({
        biomarkers: [],
        healthScore: 0,
        sessions: [],
        hasCompletedOnboarding: false,
        userName: '',
        age: '',
        sex: null,
        healthGoals: [],
      }),
    }),
    {
      name: 'vitaliq-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
