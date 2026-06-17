import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import {
  Upload, Flame, Check, Ban, Footprints,
  Droplet, Salad, Sparkles, Award, Utensils,
} from 'lucide-react-native';
import Mascot from '../../components/Mascot';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import { getTopPriorities } from '../../constants/healthMetrics';
import { BODY_SYSTEMS, getSystemBiomarkers } from '../../constants/biomarkerSystems';
import { getBiomarkerKnowledge } from '../../constants/biomarkerKnowledge';
import { getXPLevel } from '../../constants/gamification';

// ─── Mini mission templates (shown as daily checklist in the reference) ──────
// These are lightweight, checkable goals — not the long-term MISSION_TEMPLATES.
// Use the `completedMissions` store to track which ones are done.
const MINI_MISSIONS = [
  { id: 'daily_water',    en: 'Drink 2L of water today',       es: 'Bebe 2L de agua hoy',            xp: 20, icon: Droplet },
  { id: 'daily_walk',     en: 'Walk 8,000 steps',              es: 'Camina 8,000 pasos',             xp: 30, icon: Footprints },
  { id: 'daily_meditate', en: '5-minute meditation',           es: 'Meditar 5 minutos',              xp: 15, icon: Sparkles },
  { id: 'daily_veggies',  en: 'Eat one extra serving of veggies', es: 'Come una porcion extra de verduras', xp: 25, icon: Salad },
];

const WEEKLY_CHALLENGE = {
  en: 'Log 3 healthy meals this week',
  es: 'Registra 3 comidas saludables esta semana',
  target: 3,
  xpPerLog: 40,
};

// ─── Activity Screen ─────────────────────────────────────────────────────────

export default function ActivityScreen() {
  const router = useRouter();
  const t = useT();
  const biomarkers = useStore(s => s.biomarkers);
  const sessions = useStore(s => s.sessions);
  const language = useStore(s => s.language) as 'en' | 'es';
  const xp = useStore(s => s.xp);
  const completedMissions = useStore(s => s.completedMissions);
  const completeMission = useStore(s => s.completeMission);
  const refreshWeeklyMissionCount = useStore(s => s.refreshWeeklyMissionCount);
  const weeklyMissionCount = useStore(s => s.weeklyMissionCount);
  const activeWeeks = useStore(s => s.activeWeeks);
  const hasBiomarkers = biomarkers.length > 0;

  // Refresh weekly count on mount so the bar reflects server truth
  useEffect(() => { refreshWeeklyMissionCount(); }, [refreshWeeklyMissionCount]);

  // ── Level progress ──
  const levelInfo = getXPLevel(xp);

  // ── Top priority biomarker (the one to focus on today) ──
  const priorities = hasBiomarkers ? getTopPriorities(biomarkers, sessions, language) : [];
  const topPriority = priorities[0];
  const topPriorityMarker = topPriority?.markerName
    ? biomarkers.find(b => b.name === topPriority.markerName)
    : null;
  const topKnowledge = topPriorityMarker ? getBiomarkerKnowledge(topPriorityMarker.name) : null;
  // Date-qualified ID so "done" only applies to TODAY's priority — resets at midnight.
  const todayIso = new Date().toISOString().split('T')[0];
  const todayPriorityDoneId = topPriorityMarker
    ? `priority_${topPriorityMarker.name}_${todayIso}`
    : null;
  const todayPriorityDone = todayPriorityDoneId ? completedMissions.includes(todayPriorityDoneId) : false;

  // ── Weekly challenge progress (server-tracked via mission_events) ──
  const weeklyChallengePercent = Math.min(100, (weeklyMissionCount / WEEKLY_CHALLENGE.target) * 100);
  const weeklyChallengeDone = weeklyMissionCount >= WEEKLY_CHALLENGE.target;

  // ── Stats for progress grid (kept but moved below) ──
  const normalCount = biomarkers.filter(b => b.status === 'normal').length;
  const greenSystems = hasBiomarkers
    ? BODY_SYSTEMS.filter(sys => {
        const sysB = getSystemBiomarkers(sys, biomarkers);
        return sysB.length > 0 && sysB.every(b => b.status === 'normal');
      }).length
    : 0;
  const markDone = (id: string, type: 'daily' | 'priority' | 'weekly', xpAmount: number) => {
    completeMission(id, type, xpAmount);
    Alert.alert(
      language === 'es' ? '\u00a1Bien hecho!' : 'Well done!',
      `+${xpAmount} XP`,
    );
  };

  // ── Empty state ──
  if (!hasBiomarkers) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerBlock}>
          <Text style={styles.pageTitle}>
            {language === 'es' ? 'Tus acciones \uD83C\uDF80' : 'Your actions \uD83C\uDF80'}
          </Text>
          <Text style={styles.pageSub}>
            {language === 'es' ? 'Pasos pequenos, grandes logros' : 'Small steps, big wins'}
          </Text>
        </View>
        <View style={styles.emptyState}>
          <LottieView
            source={require('../../assets/animations/heart-mascot-sleeping.json')}
            autoPlay
            loop
            style={styles.emptyLottie}
          />
          <Text style={styles.emptyTitle}>
            {language === 'es' ? 'Tu plan de accion' : 'Your action plan'}
          </Text>
          <Text style={styles.emptySub}>
            {language === 'es'
              ? 'Sube tu primer examen para desbloquear misiones personalizadas.'
              : 'Upload your first exam to unlock personalized missions.'}
          </Text>
          <TouchableOpacity
            style={styles.uploadCTA}
            onPress={() => router.push('/(tabs)/upload' as any)}
            activeOpacity={0.85}
          >
            <Upload size={20} color={Colors.primary} />
            <Text style={styles.uploadCTAText}>{t('uploadResults')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.headerBlock}>
          <Text style={styles.pageTitle}>
            {language === 'es' ? 'Tus acciones \uD83C\uDF80' : 'Your actions \uD83C\uDF80'}
          </Text>
          <Text style={styles.pageSub}>
            {language === 'es' ? 'Pasos pequenos, grandes logros' : 'Small steps, big wins'}
          </Text>
        </View>

        {/* ═══════════════════════ TODAY ═══════════════════════ */}
        <View style={styles.timeHeaderRow}>
          <Text style={styles.timeHeader}>
            {language === 'es' ? 'Hoy' : 'Today'}
          </Text>
          <View style={styles.timeHeaderLine} />
        </View>

        {/* Today's priority card — biggest, most actionable */}
        {topPriorityMarker && (
          <View style={styles.priorityCard}>
            <View style={styles.priorityHeader}>
              <Text style={styles.priorityBadge}>
                {language === 'es' ? 'PRIORIDAD DE HOY' : "TODAY'S PRIORITY"}
              </Text>
            </View>
            <Text style={styles.priorityTitle}>{topPriorityMarker.name}</Text>
            <Text style={styles.prioritySub}>
              {language === 'es' ? 'Enfocate en esto hoy' : 'Focus on this today'}
            </Text>

            {topKnowledge?.foodsToEat?.[language] && (
              <View style={styles.priorityItemRow}>
                <View style={[styles.priorityItemIcon, { backgroundColor: Colors.optimal10 }]}>
                  <Utensils size={14} color={Colors.optimal} />
                </View>
                <Text style={styles.priorityItemText}>
                  <Text style={styles.priorityItemLabel}>
                    {language === 'es' ? 'Come: ' : 'Eat: '}
                  </Text>
                  {topKnowledge.foodsToEat[language]}
                </Text>
              </View>
            )}

            {topKnowledge?.foodsToAvoid?.[language] && (
              <View style={styles.priorityItemRow}>
                <View style={[styles.priorityItemIcon, { backgroundColor: Colors.attention10 }]}>
                  <Ban size={14} color={Colors.attention} />
                </View>
                <Text style={styles.priorityItemText}>
                  <Text style={styles.priorityItemLabel}>
                    {language === 'es' ? 'Evita: ' : 'Avoid: '}
                  </Text>
                  {topKnowledge.foodsToAvoid[language]}
                </Text>
              </View>
            )}

            <View style={styles.priorityItemRow}>
              <View style={[styles.priorityItemIcon, { backgroundColor: '#E2ECFA' }]}>
                <Footprints size={14} color="#4A8AFF" />
              </View>
              <Text style={styles.priorityItemText}>
                {language === 'es' ? 'Camina 20 min despues de las comidas' : 'Walk 20 min after meals'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.priorityDoneBtn,
                todayPriorityDone && styles.priorityDoneBtnDone,
              ]}
              activeOpacity={0.85}
              disabled={todayPriorityDone}
              onPress={() => todayPriorityDoneId && markDone(todayPriorityDoneId, 'priority', 50)}
            >
              {todayPriorityDone ? (
                <>
                  <Check size={16} color="#fff" />
                  <Text style={styles.priorityDoneBtnText}>
                    {language === 'es' ? 'Completado \u00b7 +50 XP' : 'Done \u00b7 +50 XP'}
                  </Text>
                </>
              ) : (
                <Text style={styles.priorityDoneBtnText}>
                  {language === 'es' ? 'Completar \u00b7 +50 XP' : 'Complete \u00b7 +50 XP'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Mini missions — tap-to-complete list */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>
            {language === 'es' ? 'Mini misiones' : 'Mini missions'}
          </Text>
          <Text style={styles.sectionSub}>
            {language === 'es' ? 'Completa para ganar XP' : 'Tap to complete · earn XP'}
          </Text>

          {MINI_MISSIONS.map(mission => {
            // Date-qualified ID so daily missions reset at midnight
            const dailyId = `${mission.id}_${todayIso}`;
            const done = completedMissions.includes(dailyId);
            const Icon = mission.icon;
            return (
              <TouchableOpacity
                key={mission.id}
                style={styles.miniMissionRow}
                activeOpacity={0.75}
                disabled={done}
                onPress={() => markDone(dailyId, 'daily', mission.xp)}
              >
                <View style={[styles.miniMissionIcon, done && { backgroundColor: Colors.optimal10 }]}>
                  <Icon size={16} color={done ? Colors.optimal : Colors.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.miniMissionText, done && styles.miniMissionTextDone]}>
                    {mission[language]}
                  </Text>
                  <Text style={styles.miniMissionXP}>+{mission.xp} XP</Text>
                </View>
                <View style={[styles.miniMissionCheck, done && styles.miniMissionCheckDone]}>
                  {done && <Check size={14} color="#fff" strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ═══════════════════════ THIS WEEK ═══════════════════════ */}
        <View style={styles.timeHeaderRow}>
          <Text style={styles.timeHeader}>
            {language === 'es' ? 'Esta semana' : 'This week'}
          </Text>
          <View style={styles.timeHeaderLine} />
        </View>

        {/* Streak card */}
        {activeWeeks > 0 && (
          <View style={styles.streakCard}>
            <View style={styles.streakMascotWrap}>
              <Mascot pose="flexing" size={56} animation="idle-breath" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakTitle}>
                {language === 'es' ? `Racha de ${activeWeeks} semanas \uD83D\uDD25` : `${activeWeeks} week streak \uD83D\uDD25`}
              </Text>
              <Text style={styles.streakSub}>
                {language === 'es' ? '\u00a1Sigue asi!' : 'Keep it going!'}
              </Text>
            </View>
            <Flame size={18} color="#E67A3A" />
          </View>
        )}

        {/* Weekly challenge — log a meal to advance the bar */}
        <View style={styles.weeklyCard}>
          <View style={styles.weeklyHeader}>
            <Award size={16} color="#8E4FC0" />
            <Text style={styles.weeklyLabel}>
              {language === 'es' ? 'RETO SEMANAL' : 'WEEKLY CHALLENGE'}
            </Text>
          </View>
          <Text style={styles.weeklyTitle}>{WEEKLY_CHALLENGE[language]}</Text>
          <View style={styles.weeklyBarBg}>
            <LinearGradient
              colors={['#C4B5D4', '#8E4FC0']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.weeklyBarFill, { width: `${Math.max(4, weeklyChallengePercent)}%` as any }]}
            />
          </View>
          <View style={styles.weeklyFooter}>
            <Text style={styles.weeklyProgress}>
              {Math.min(weeklyMissionCount, WEEKLY_CHALLENGE.target)}{' '}
              {language === 'es'
                ? `de ${WEEKLY_CHALLENGE.target} completos`
                : `of ${WEEKLY_CHALLENGE.target} complete`}
            </Text>
            <TouchableOpacity
              style={[styles.weeklyLogBtn, weeklyChallengeDone && styles.weeklyLogBtnDone]}
              activeOpacity={0.85}
              disabled={weeklyChallengeDone}
              onPress={() => {
                // Unique per-log ID so multiple meals can be logged today.
                const id = `weekly_meal_${Date.now()}`;
                markDone(id, 'weekly', WEEKLY_CHALLENGE.xpPerLog);
              }}
            >
              {weeklyChallengeDone ? (
                <>
                  <Check size={14} color="#fff" strokeWidth={3} />
                  <Text style={styles.weeklyLogBtnText}>
                    {language === 'es' ? 'Logrado' : 'Done'}
                  </Text>
                </>
              ) : (
                <Text style={styles.weeklyLogBtnText}>
                  {language === 'es'
                    ? `Registrar \u00b7 +${WEEKLY_CHALLENGE.xpPerLog} XP`
                    : `Log meal \u00b7 +${WEEKLY_CHALLENGE.xpPerLog} XP`}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════ YOUR PROGRESS ═══════════════════════ */}
        <View style={styles.timeHeaderRow}>
          <Text style={styles.timeHeader}>
            {language === 'es' ? 'Tu progreso' : 'Your progress'}
          </Text>
          <View style={styles.timeHeaderLine} />
        </View>

        {/* Level progress card */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View style={styles.levelIconWrap}>
              <Sparkles size={16} color="#C87EA0" />
            </View>
            <Text style={styles.levelLabel}>
              {language === 'es' ? `Nivel ${levelInfo.level}` : `Level ${levelInfo.level}`}
            </Text>
            <Text style={styles.levelXP}>
              {levelInfo.currentXP} / {levelInfo.nextLevelXP} XP
            </Text>
          </View>
          <View style={styles.xpBarBg}>
            <LinearGradient
              colors={['#F8B4D0', '#C87EA0']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.xpBarFill, { width: `${Math.max(4, levelInfo.progress * 100)}%` as any }]}
            />
          </View>
        </View>

        {/* Key stats — 3 most meaningful, equal-weight grid */}
        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{normalCount}</Text>
            <Text style={styles.statLabel}>
              {language === 'es' ? 'en rango' : 'in range'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{greenSystems}</Text>
            <Text style={styles.statLabel}>
              {language === 'es' ? 'sistemas \u2713' : 'systems \u2713'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{activeWeeks}</Text>
            <Text style={styles.statLabel}>
              {language === 'es' ? 'semanas' : 'weeks'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 130 },

  // Header
  headerBlock: { marginBottom: 20 },
  pageTitle: {
    fontFamily: Typography.families.display,
    fontSize: 28, fontWeight: '800', color: Colors.foreground,
    letterSpacing: -0.5,
  },
  pageSub: {
    fontFamily: Typography.families.body,
    fontSize: 14, color: Colors.mutedForeground, marginTop: 4,
  },

  // Level card
  levelCard: {
    backgroundColor: '#fff',
    borderRadius: 20, padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  levelHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10,
  },
  levelIconWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FCE6EE',
    alignItems: 'center', justifyContent: 'center',
  },
  levelLabel: {
    flex: 1,
    fontFamily: Typography.families.display,
    fontSize: 16, fontWeight: '700', color: Colors.foreground,
  },
  levelXP: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.mutedForeground, fontWeight: '500',
  },
  xpBarBg: {
    height: 10, borderRadius: 5,
    backgroundColor: '#F1E3EA', overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%', borderRadius: 5,
  },

  // Streak card
  streakCard: {
    backgroundColor: '#FCECD8',
    borderRadius: 16, padding: 14,
    marginBottom: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  streakIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  streakMascotWrap: {
    width: 56, height: 56,
    alignItems: 'center', justifyContent: 'center',
  },
  streakTitle: {
    fontFamily: Typography.families.display,
    fontSize: 15, fontWeight: '800', color: '#8B3A1E',
  },
  streakSub: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: '#8B3A1E', opacity: 0.75, marginTop: 2,
  },

  // Priority card
  priorityCard: {
    backgroundColor: '#fff',
    borderRadius: 20, padding: 18,
    marginBottom: 20,
    borderWidth: 1, borderColor: '#FCE6EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
  },
  priorityHeader: { marginBottom: 6 },
  priorityBadge: {
    fontFamily: Typography.families.body,
    fontSize: 11, fontWeight: '800',
    color: '#C87EA0', letterSpacing: 0.8,
  },
  priorityTitle: {
    fontFamily: Typography.families.display,
    fontSize: 20, fontWeight: '800', color: Colors.foreground,
    marginBottom: 4,
  },
  prioritySub: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.mutedForeground, marginBottom: 14,
  },
  priorityItemRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    marginBottom: 10,
  },
  priorityItemIcon: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  priorityItemText: {
    flex: 1,
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.foreground, lineHeight: 19,
  },
  priorityItemLabel: { fontWeight: '700' },
  priorityDoneBtn: {
    backgroundColor: '#C87EA0',
    paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 6,
    marginTop: 6,
    shadowColor: '#C87EA0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  priorityDoneBtnDone: {
    backgroundColor: Colors.optimal,
    shadowColor: Colors.optimal,
  },
  priorityDoneBtnText: {
    fontFamily: Typography.families.body,
    fontSize: 14, fontWeight: '700', color: '#fff',
  },

  // Time-based section headers (Today / This week / Your progress)
  timeHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 18, marginBottom: 12,
  },
  timeHeader: {
    fontFamily: Typography.families.display,
    fontSize: 13, fontWeight: '800',
    color: Colors.mutedForeground,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  timeHeaderLine: {
    flex: 1, height: 1, backgroundColor: Colors.border,
  },

  // Inner sub-section titles (inside a time group)
  section: { marginBottom: 16 },
  sectionTitle: {
    fontFamily: Typography.families.display,
    fontSize: 20, fontWeight: '800', color: Colors.foreground,
    letterSpacing: -0.3, marginBottom: 4,
  },
  subsectionTitle: {
    fontFamily: Typography.families.display,
    fontSize: 16, fontWeight: '700', color: Colors.foreground,
    letterSpacing: -0.2, marginBottom: 2,
  },
  sectionSub: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.mutedForeground, marginBottom: 12,
  },

  // Mini mission row
  miniMissionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14, padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  miniMissionIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  miniMissionText: {
    fontFamily: Typography.families.body,
    fontSize: 14, fontWeight: '600', color: Colors.foreground,
  },
  miniMissionTextDone: {
    textDecorationLine: 'line-through',
    color: Colors.outline,
  },
  miniMissionXP: {
    fontFamily: Typography.families.body,
    fontSize: 11, color: '#C87EA0', fontWeight: '700', marginTop: 2,
  },
  miniMissionCheck: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.outline + '60',
    alignItems: 'center', justifyContent: 'center',
  },
  miniMissionCheckDone: {
    backgroundColor: '#C87EA0', borderColor: '#C87EA0',
  },

  // Weekly challenge
  weeklyCard: {
    backgroundColor: '#F2ECFA',
    borderRadius: 18, padding: 16,
    marginBottom: 20,
    borderWidth: 1, borderColor: '#DCCDEA',
  },
  weeklyHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 8,
  },
  weeklyLabel: {
    fontFamily: Typography.families.body,
    fontSize: 11, fontWeight: '800',
    color: '#8E4FC0', letterSpacing: 0.8,
  },
  weeklyTitle: {
    fontFamily: Typography.families.display,
    fontSize: 16, fontWeight: '800', color: Colors.foreground,
    marginBottom: 10,
  },
  weeklyBarBg: {
    height: 10, borderRadius: 5,
    backgroundColor: '#fff', overflow: 'hidden',
    marginBottom: 6,
  },
  weeklyBarFill: {
    height: '100%', borderRadius: 5,
  },
  weeklyProgress: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: '#6B4B8A', fontWeight: '600',
  },
  weeklyFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: 10, marginTop: 2,
  },
  weeklyLogBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#8E4FC0',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8,
    shadowColor: '#8E4FC0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
  },
  weeklyLogBtnDone: {
    backgroundColor: Colors.optimal,
    shadowColor: Colors.optimal,
  },
  weeklyLogBtnText: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '700', color: '#fff',
  },

  // Compact 3-col stats row (replaces busy 4-tile grid)
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16, padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  statCell: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  statDivider: {
    width: 1, backgroundColor: Colors.border, marginVertical: 4,
  },
  statNum: {
    fontFamily: Typography.families.display,
    fontSize: 22, fontWeight: '800', color: '#C87EA0',
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: Typography.families.body,
    fontSize: 11, color: Colors.mutedForeground,
    textAlign: 'center',
  },

  // Empty state
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 40, gap: 12,
  },
  emptyLottie: {
    width: 180, height: 180,
  },
  emptyTitle: {
    fontFamily: Typography.families.display,
    fontSize: 22, fontWeight: '800', color: Colors.foreground,
    textAlign: 'center', marginTop: 8,
  },
  emptySub: {
    fontFamily: Typography.families.body,
    fontSize: 14, color: Colors.mutedForeground,
    textAlign: 'center', lineHeight: 22,
  },
  uploadCTA: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary10,
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24,
    marginTop: 12,
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  uploadCTAText: {
    fontFamily: Typography.families.body,
    fontSize: 14, fontWeight: '700', color: Colors.primary,
  },
});
