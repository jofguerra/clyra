import { useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useStore } from './useStore';

const DEBOUNCE_MS = 5_000;

/**
 * Listens to Supabase auth state and syncs store <-> cloud.
 * - On sign-in: pulls cloud data into the store.
 * - On significant store changes: debounce-pushes to cloud.
 * - Sync is best-effort; failures are logged but never break the app.
 */
export function useSyncEffect() {
  const syncInProgress = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pull the selectors we need outside the effect so React tracks them.
  const isGuest = useStore((s) => s.isGuest);
  const sessions = useStore((s) => s.sessions);
  const userName = useStore((s) => s.userName);
  const age = useStore((s) => s.age);
  const sex = useStore((s) => s.sex);
  const language = useStore((s) => s.language);
  const healthGoals = useStore((s) => s.healthGoals);
  const testReminderDays = useStore((s) => s.testReminderDays);
  const syncToCloud = useStore((s) => s.syncToCloud);
  const syncFromCloud = useStore((s) => s.syncFromCloud);

  // ── Auth state listener: pull on sign-in ─────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' && !syncInProgress.current) {
          syncInProgress.current = true;
          try {
            await syncFromCloud();
          } finally {
            syncInProgress.current = false;
          }
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [syncFromCloud]);

  // ── Debounced push on significant store changes ──────────────────
  useEffect(() => {
    // Skip sync for guests or if a sync is already running
    if (isGuest) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      if (syncInProgress.current) return;
      syncInProgress.current = true;
      try {
        await syncToCloud();
      } finally {
        syncInProgress.current = false;
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    // Trigger on meaningful data changes
  }, [isGuest, sessions, userName, age, sex, language, healthGoals, testReminderDays, syncToCloud]);
}
