import { supabase } from './supabase';
import { Biomarker } from './openai';

// ─── Types matching Supabase schema ─────────────────────────────────────────

export interface DbProfile {
  id: string;
  display_name: string;
  age: string;
  sex: 'male' | 'female' | null;
  language: 'en' | 'es';
  health_goals: string[];
  test_reminder_days: number;
  has_completed_onboarding: boolean;
  xp: number;
  active_weeks: number;
  last_active_date: string | null;
}

export type MissionType = 'daily' | 'priority' | 'weekly';

export interface DbMissionEvent {
  id: string;
  user_id: string;
  mission_id: string;
  mission_type: MissionType;
  xp_earned: number;
  completed_at: string;
}

export interface DbExamSession {
  id: string;
  user_id: string;
  exam_date: string;
  label: string;
  file_name: string | null;
  file_hash: string | null;
  health_score: number;
  source: 'pdf' | 'photo' | 'manual';
  created_at: string;
}

export interface DbBiomarker {
  id: string;
  session_id: string;
  user_id: string;
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'low' | 'high' | 'borderline';
  reference_range: string | null;
  sample_type: 'blood' | 'urine' | 'stool' | 'saliva';
}

// ─── Auth helpers ───────────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithApple(idToken: string, nonce: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: idToken,
    nonce,
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle(idToken: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ─── Profile ────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<DbProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(updates: Partial<Omit<DbProfile, 'id'>>) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) throw error;
}

// ─── Exam Sessions ──────────────────────────────────────────────────────────

export async function getSessions(): Promise<DbExamSession[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('exam_date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createSession(
  session: Omit<DbExamSession, 'id' | 'user_id' | 'created_at'>
): Promise<DbExamSession> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('exam_sessions')
    .insert({ ...session, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSession(sessionId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('exam_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (error) throw error;
}

// ─── Biomarkers ─────────────────────────────────────────────────────────────

export async function getSessionBiomarkers(sessionId: string): Promise<DbBiomarker[]> {
  const { data, error } = await supabase
    .from('biomarkers')
    .select('*')
    .eq('session_id', sessionId);

  if (error) throw error;
  return data ?? [];
}

export async function getAllBiomarkers(): Promise<DbBiomarker[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('biomarkers')
    .select('*, exam_sessions!inner(exam_date)')
    .eq('user_id', user.id)
    .order('exam_sessions(exam_date)', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function insertBiomarkers(
  sessionId: string,
  biomarkers: Biomarker[],
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const rows = biomarkers.map((b) => ({
    session_id: sessionId,
    user_id: user.id,
    name: b.name,
    value: String(b.value),
    unit: b.unit,
    status: b.status,
    reference_range: b.referenceRange ?? null,
    sample_type: 'blood' as const,
  }));

  const { error } = await supabase
    .from('biomarkers')
    .insert(rows);

  if (error) throw error;
}

// ─── Mission events (daily / priority / weekly) ────────────────────────────

/**
 * Atomically record a mission completion on the server.
 * Inserts a row in mission_events and increments profiles.xp.
 * Returns the new running XP total (or null if offline / unauthenticated).
 */
export async function recordMissionEvent(
  missionId: string,
  missionType: MissionType,
  xp: number,
): Promise<{ eventId: string; newXp: number } | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase.rpc('record_mission_event', {
    p_mission_id: missionId,
    p_mission_type: missionType,
    p_xp: xp,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { eventId: row.event_id, newXp: row.new_xp };
}

/** Mission IDs completed by the current user since local midnight. */
export async function getTodayMissionIds(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  // Local midnight as ISO — server stores timestamptz so comparison is UTC-safe.
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('mission_events')
    .select('mission_id')
    .eq('user_id', user.id)
    .gte('completed_at', startOfDay.toISOString());

  if (error) throw error;
  return (data ?? []).map((r) => r.mission_id);
}

/**
 * Count mission events of a given type in the current ISO week
 * (Monday 00:00 local → now). Used for weekly challenge progress.
 */
export async function getWeeklyMissionCount(type: MissionType): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;

  const now = new Date();
  const day = now.getDay(); // 0 Sun … 6 Sat
  const daysSinceMonday = (day + 6) % 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysSinceMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('mission_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('mission_type', type)
    .gte('completed_at', startOfWeek.toISOString());

  if (error) throw error;
  return count ?? 0;
}

// ─── Achievements ───────────────────────────────────────────────────────────

export async function getAchievements(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('achievements')
    .select('achievement_key')
    .eq('user_id', user.id);

  if (error) throw error;
  return (data ?? []).map((a) => a.achievement_key);
}

export async function unlockAchievement(key: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const { error } = await supabase
    .from('achievements')
    .upsert(
      { user_id: user.id, achievement_key: key },
      { onConflict: 'user_id,achievement_key' }
    );

  if (error) throw error;
}

// ─── Subscription ───────────────────────────────────────────────────────────

export async function getSubscription() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['active', 'trial', 'grace_period'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ─── Full Sync: push local → cloud ─────────────────────────────────────────

export async function pushLocalToCloud(localState: {
  userName: string;
  age: string;
  sex: 'male' | 'female' | null;
  language: 'en' | 'es';
  healthGoals: string[];
  testReminderDays: number;
  hasCompletedOnboarding: boolean;
  xp: number;
  activeWeeks: number;
  lastActiveDate: string | null;
  sessions: Array<{
    id: string;
    date: string;
    label: string;
    fileName?: string;
    fileHash?: string;
    biomarkers: Biomarker[];
    healthScore: number;
  }>;
  achievements: string[];
}): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Update profile (mission events are recorded individually via
  //    recordMissionEvent — no array to sync here).
  await updateProfile({
    display_name: localState.userName,
    age: localState.age,
    sex: localState.sex,
    language: localState.language,
    health_goals: localState.healthGoals,
    test_reminder_days: localState.testReminderDays,
    has_completed_onboarding: localState.hasCompletedOnboarding,
    xp: localState.xp,
    active_weeks: localState.activeWeeks,
    last_active_date: localState.lastActiveDate,
  });

  // 2. Upload sessions + biomarkers (skip if already exists by file_hash)
  const existingSessions = await getSessions();
  const existingHashes = new Set(existingSessions.map((s) => s.file_hash).filter(Boolean));

  for (const session of localState.sessions) {
    if (session.fileHash && existingHashes.has(session.fileHash)) continue;

    const dbSession = await createSession({
      exam_date: session.date,
      label: session.label,
      file_name: session.fileName ?? null,
      file_hash: session.fileHash ?? null,
      health_score: session.healthScore,
      source: 'pdf',
    });

    if (session.biomarkers.length > 0) {
      await insertBiomarkers(dbSession.id, session.biomarkers);
    }
  }

  // 3. Sync achievements
  for (const key of localState.achievements) {
    await unlockAchievement(key);
  }
}

// ─── Full Sync: pull cloud → local ─────────────────────────────────────────

export async function pullCloudToLocal() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [profile, sessions, achievements, subscription, todayMissions] = await Promise.all([
    getProfile(),
    getSessions(),
    getAchievements(),
    getSubscription(),
    getTodayMissionIds(),
  ]);

  if (!profile) return null;

  // Fetch biomarkers for all sessions
  const sessionsWithBiomarkers = await Promise.all(
    sessions.map(async (s) => {
      const biomarkers = await getSessionBiomarkers(s.id);
      return {
        id: s.id,
        date: s.exam_date,
        label: s.label,
        fileName: s.file_name ?? undefined,
        fileHash: s.file_hash ?? undefined,
        biomarkers: biomarkers.map((b) => ({
          name: b.name,
          value: b.value,
          unit: b.unit,
          status: b.status,
          referenceRange: b.reference_range ?? undefined,
        })) as Biomarker[],
        healthScore: s.health_score,
      };
    })
  );

  return {
    userName: profile.display_name,
    age: profile.age,
    sex: profile.sex,
    language: profile.language as 'en' | 'es',
    healthGoals: profile.health_goals,
    testReminderDays: profile.test_reminder_days,
    hasCompletedOnboarding: profile.has_completed_onboarding,
    xp: profile.xp,
    activeWeeks: profile.active_weeks,
    lastActiveDate: profile.last_active_date,
    // Today's completed mission IDs (resets at local midnight via date filter)
    todayCompletedMissions: todayMissions,
    sessions: sessionsWithBiomarkers,
    achievements,
    isPro: !!subscription,
    subscriptionPlan: subscription?.plan as 'monthly' | 'annual' | null ?? null,
    subscriptionExpiresAt: subscription?.expires_at ?? null,
  };
}
