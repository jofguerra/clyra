import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Biomarker } from '../services/openai';
import { computeHealthScore } from '../constants/biomarkerSystems';
import { Lang } from '../constants/i18n';
import { XP_ACTIONS } from '../constants/gamification';
import { pushLocalToCloud, pullCloudToLocal, signOut as supabaseSignOut } from '../services/sync';

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
  date: string;
  label: string;
  fileName?: string;
  fileHash?: string;
  biomarkers: Biomarker[];
  healthScore: number;
}

interface UserState {
  authUserId: string | null;
  setAuthUserId: (id: string | null) => void;
  isGuest: boolean;
  setIsGuest: (val: boolean) => void;
  deviceId: string;
  hasCompletedOnboarding: boolean;
  userName: string;
  age: string;
  sex: 'male' | 'female' | null;
  language: Lang;
  healthGoals: HealthGoal[];
  biomarkers: Biomarker[];
  healthScore: number;
  sessions: ExamSession[];
  // Gamification
  xp: number;
  achievements: string[];
  completedMissions: string[];
  lastActiveDate: string | null;
  activeWeeks: number;
  // Test reminder
  testReminderDays: number;
  // Subscription
  isPro: boolean;
  subscriptionPlan: 'monthly' | 'annual' | null;
  subscriptionExpiresAt: string | null;
  subscriptionCancelled: boolean;
  // Sync
  lastSyncedAt: string | null;
  // Actions
  setHasCompletedOnboarding: (val: boolean) => void;
  setUserName: (val: string) => void;
  setAge: (val: string) => void;
  setSex: (val: 'male' | 'female' | null) => void;
  setLanguage: (val: Lang) => void;
  setHealthGoals: (val: HealthGoal[]) => void;
  setHealthScore: (val: number) => void;
  setBiomarkers: (biomarkers: Biomarker[], testDate?: string | null, fileName?: string, fileHash?: string) => void;
  setSessions: (sessions: ExamSession[]) => void;
  addXP: (amount: number) => void;
  unlockAchievement: (id: string) => void;
  completeMission: (id: string) => void;
  updateStreak: () => void;
  setTestReminderDays: (days: number) => void;
  setSubscription: (plan: 'monthly' | 'annual' | null, expiresAt: string | null) => void;
  setSubscriptionCancelled: (val: boolean) => void;
  signOutUser: () => Promise<void>;
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  clearAllData: () => void;
}

export const useStore = create<UserState>()(
  persist(
    (set, get) => ({
      authUserId: null,
      setAuthUserId: (id) => set({ authUserId: id }),
      isGuest: true,
      setIsGuest: (val) => set({ isGuest: val }),
      deviceId: Date.now().toString(36) + Math.random().toString(36).slice(2),
      hasCompletedOnboarding: false,
      userName: '',
      age: '',
      sex: null,
      language: 'en',
      healthGoals: [],
      biomarkers: [],
      healthScore: 0,
      sessions: [],
      // Gamification
      xp: 0,
      achievements: [],
      completedMissions: [],
      lastActiveDate: null,
      activeWeeks: 0,
      // Test reminder
      testReminderDays: 90,
      // Subscription
      isPro: false,
      subscriptionPlan: null,
      subscriptionExpiresAt: null,
      subscriptionCancelled: false,
      // Sync
      lastSyncedAt: null,

      setHasCompletedOnboarding: (val) => set({ hasCompletedOnboarding: val }),
      setUserName: (val) => set({ userName: val }),
      setAge: (val) => set({ age: val }),
      setSex: (val) => set({ sex: val }),
      setLanguage: (val) => set({ language: val }),
      setHealthGoals: (val) => set({ healthGoals: val }),
      setHealthScore: (val) => set({ healthScore: val }),

      setBiomarkers: (val, testDate, fileName, fileHash) => {
        const score = computeHealthScore(val);
        const sessionDate = testDate ? new Date(testDate) : new Date();
        const session: ExamSession = {
          id: Date.now().toString(),
          date: sessionDate.toISOString(),
          label: `Exam ${sessionDate.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}`,
          fileName,
          fileHash,
          biomarkers: val,
          healthScore: score,
        };
        const state = get();
        const isFirstExam = state.sessions.length === 0;
        const xpGain = isFirstExam ? XP_ACTIONS.first_exam : XP_ACTIONS.additional_exam;

        // Merge biomarkers: keep existing, update/add from new ones
        const merged = [...state.biomarkers];
        for (const newBm of val) {
          const idx = merged.findIndex(b => b.name.toLowerCase() === newBm.name.toLowerCase());
          if (idx >= 0) {
            merged[idx] = newBm; // Update existing biomarker with new value
          } else {
            merged.push(newBm); // Add new biomarker
          }
        }
        const mergedScore = computeHealthScore(merged);

        // Check for improved markers vs previous exam
        let improvedCount = 0;
        if (state.sessions.length > 0) {
          const prevBiomarkers = state.sessions[0].biomarkers;
          for (const b of val) {
            const prev = prevBiomarkers.find(p => p.name.toLowerCase() === b.name.toLowerCase());
            if (prev && prev.status !== 'normal' && b.status === 'normal') {
              improvedCount++;
            }
          }
        }
        const improveXP = improvedCount * XP_ACTIONS.improve_marker;

        // Auto-unlock achievements
        const newAchievements = [...state.achievements];
        const totalSessions = state.sessions.length + 1;

        if (!newAchievements.includes('first_exam')) {
          newAchievements.push('first_exam');
        }
        if (totalSessions >= 2 && !newAchievements.includes('trend_unlocked')) {
          newAchievements.push('trend_unlocked');
        }
        if (totalSessions >= 3 && !newAchievements.includes('three_checkups')) {
          newAchievements.push('three_checkups');
        }
        if (mergedScore >= 90 && !newAchievements.includes('elite_score')) {
          newAchievements.push('elite_score');
        }

        // Check system-level achievements (use merged biomarkers for full picture)
        const allNormalInSystem = (names: string[]) =>
          merged.filter(b => names.some(n => b.name.toLowerCase().includes(n.toLowerCase())))
             .every(b => b.status === 'normal') &&
          merged.some(b => names.some(n => b.name.toLowerCase().includes(n.toLowerCase())));

        if (allNormalInSystem(['colesterol', 'ldl', 'hdl', 'triglicér', 'pcr']) && !newAchievements.includes('heart_green')) {
          newAchievements.push('heart_green');
        }
        if (allNormalInSystem(['creatinina', 'úrico', 'urea', 'bun']) && !newAchievements.includes('kidneys_green')) {
          newAchievements.push('kidneys_green');
        }
        if (allNormalInSystem(['glucosa', 'a1c', 'insulina']) && !newAchievements.includes('metabolic_reboot')) {
          newAchievements.push('metabolic_reboot');
        }

        // Check improved markers total across all exams
        if (improvedCount >= 5 && !newAchievements.includes('five_improved')) {
          newAchievements.push('five_improved');
        }

        set({
          biomarkers: merged,
          healthScore: mergedScore,
          sessions: [session, ...state.sessions],
          xp: state.xp + xpGain + improveXP,
          achievements: newAchievements,
        });
      },

      setSessions: (sessions) => {
        // Rebuild merged biomarkers from all sessions (latest values win)
        const merged: Biomarker[] = [];
        // Process sessions from oldest to newest so latest values overwrite
        for (let i = sessions.length - 1; i >= 0; i--) {
          for (const bm of sessions[i].biomarkers) {
            const idx = merged.findIndex(b => b.name.toLowerCase() === bm.name.toLowerCase());
            if (idx >= 0) {
              merged[idx] = bm;
            } else {
              merged.push(bm);
            }
          }
        }
        set({
          sessions,
          biomarkers: merged,
          healthScore: merged.length > 0 ? computeHealthScore(merged) : 0,
        });
      },

      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),

      unlockAchievement: (id) => set((state) => {
        if (state.achievements.includes(id)) return state;
        return { achievements: [...state.achievements, id] };
      }),

      completeMission: (id) => set((state) => {
        if (state.completedMissions.includes(id)) return state;
        return {
          completedMissions: [...state.completedMissions, id],
          xp: state.xp + 150,
        };
      }),

      updateStreak: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        if (state.lastActiveDate === today) return state;
        const lastDate = state.lastActiveDate ? new Date(state.lastActiveDate) : null;
        const daysSinceLast = lastDate
          ? Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        return {
          lastActiveDate: today,
          activeWeeks: daysSinceLast <= 7 ? state.activeWeeks + 1 : 1,
        };
      }),

      setTestReminderDays: (days) => set({ testReminderDays: days }),

      setSubscription: (plan, expiresAt) => set({
        isPro: plan !== null,
        subscriptionPlan: plan,
        subscriptionExpiresAt: expiresAt,
        subscriptionCancelled: false,
      }),

      setSubscriptionCancelled: (val) => set({ subscriptionCancelled: val }),

      signOutUser: async () => {
        try {
          await supabaseSignOut();
        } catch (err) {
          console.warn('[Clyra] signOut failed:', err);
        }
        set({ isGuest: true, authUserId: null });
      },

      syncToCloud: async () => {
        try {
          const state = get();
          await pushLocalToCloud({
            userName: state.userName,
            age: state.age,
            sex: state.sex,
            language: state.language,
            healthGoals: state.healthGoals,
            testReminderDays: state.testReminderDays,
            hasCompletedOnboarding: state.hasCompletedOnboarding,
            xp: state.xp,
            activeWeeks: state.activeWeeks,
            lastActiveDate: state.lastActiveDate,
            completedMissions: state.completedMissions,
            sessions: state.sessions,
            achievements: state.achievements,
          });
          set({ lastSyncedAt: new Date().toISOString() });
        } catch (err) {
          console.warn('[Clyra] syncToCloud failed:', err);
        }
      },

      syncFromCloud: async () => {
        try {
          const cloudData = await pullCloudToLocal();
          if (!cloudData) return;
          set({
            userName: cloudData.userName,
            age: cloudData.age,
            sex: cloudData.sex,
            language: cloudData.language,
            healthGoals: cloudData.healthGoals as HealthGoal[],
            testReminderDays: cloudData.testReminderDays,
            hasCompletedOnboarding: cloudData.hasCompletedOnboarding,
            xp: cloudData.xp,
            activeWeeks: cloudData.activeWeeks,
            lastActiveDate: cloudData.lastActiveDate,
            completedMissions: cloudData.completedMissions,
            sessions: cloudData.sessions,
            achievements: cloudData.achievements,
            isPro: cloudData.isPro,
            subscriptionPlan: cloudData.subscriptionPlan,
            subscriptionExpiresAt: cloudData.subscriptionExpiresAt,
            biomarkers: cloudData.sessions.length > 0
              ? (() => {
                  const merged: Biomarker[] = [];
                  for (let i = cloudData.sessions.length - 1; i >= 0; i--) {
                    for (const bm of cloudData.sessions[i].biomarkers) {
                      const idx = merged.findIndex(b => b.name.toLowerCase() === bm.name.toLowerCase());
                      if (idx >= 0) merged[idx] = bm;
                      else merged.push(bm);
                    }
                  }
                  return merged;
                })()
              : [],
            healthScore: cloudData.sessions.length > 0
              ? computeHealthScore(
                  (() => {
                    const merged: Biomarker[] = [];
                    for (let i = cloudData.sessions.length - 1; i >= 0; i--) {
                      for (const bm of cloudData.sessions[i].biomarkers) {
                        const idx = merged.findIndex(b => b.name.toLowerCase() === bm.name.toLowerCase());
                        if (idx >= 0) merged[idx] = bm;
                        else merged.push(bm);
                      }
                    }
                    return merged;
                  })()
                )
              : 0,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('[Clyra] syncFromCloud failed:', err);
        }
      },

      clearAllData: () => set({
        authUserId: null,
        isGuest: true,
        biomarkers: [],
        healthScore: 0,
        sessions: [],
        hasCompletedOnboarding: false,
        userName: '',
        age: '',
        sex: null,
        healthGoals: [],
        xp: 0,
        achievements: [],
        completedMissions: [],
        isPro: false,
        subscriptionPlan: null,
        subscriptionExpiresAt: null,
        subscriptionCancelled: false,
        testReminderDays: 90,
        lastActiveDate: null,
        activeWeeks: 0,
        lastSyncedAt: null,
      }),
    }),
    {
      name: 'clyra-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
