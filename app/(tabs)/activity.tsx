import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Upload, Target, Lightbulb } from 'lucide-react-native';
import AppHeader from '../../components/AppHeader';
import PriorityCard from '../../components/PriorityCard';
import MissionCard from '../../components/MissionCard';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import {
  computeCardiovascularRisk,
  getTopPriorities,
  computeOverallCoverage, simulateImprovement,
  computeBiologicalAge,
} from '../../constants/healthMetrics';
import {
  BODY_SYSTEMS, getSystemBiomarkers,
} from '../../constants/biomarkerSystems';
import {
  MISSION_TEMPLATES,
} from '../../constants/gamification';
import { getTipsSlice } from '../../constants/healthTips';

// ─── Activity Screen ─────────────────────────────────────────────────────────

export default function ActivityScreen() {
  const router = useRouter();
  const t = useT();
  const healthScore = useStore(s => s.healthScore);
  const biomarkers = useStore(s => s.biomarkers);
  const sessions = useStore(s => s.sessions);
  const age = useStore(s => s.age);
  const language = useStore(s => s.language) as 'en' | 'es';
  const completedMissions = useStore(s => s.completedMissions);
  const activeWeeks = useStore(s => s.activeWeeks);
  const hasBiomarkers = biomarkers.length > 0;

  // Computed values
  const chronoAge = parseInt(age, 10) || 0;
  const bioAge = hasBiomarkers && chronoAge > 0 ? computeBiologicalAge(biomarkers, chronoAge) : null;
  const outOfRange = biomarkers.filter(b => b.status !== 'normal');
  const normalCount = biomarkers.filter(b => b.status === 'normal').length;
  const greenSystems = hasBiomarkers
    ? BODY_SYSTEMS.filter(sys => {
        const sysB = getSystemBiomarkers(sys, biomarkers);
        return sysB.length > 0 && sysB.every(b => b.status === 'normal');
      }).length
    : 0;
  const coverage = hasBiomarkers ? computeOverallCoverage(biomarkers) : null;
  const priorities = hasBiomarkers ? getTopPriorities(biomarkers, sessions, language) : [];

  // Risks
  const cardioRisk = hasBiomarkers ? computeCardiovascularRisk(biomarkers) : null;

  // Improvement simulation
  const topOutOfRange = outOfRange.slice(0, 2).map(b => b.name);
  const sim = hasBiomarkers && topOutOfRange.length > 0
    ? simulateImprovement(biomarkers, topOutOfRange, chronoAge || 40)
    : null;

  // Active missions with real progress evaluation
  const evaluatedMissions = MISSION_TEMPLATES
    .filter(m => !completedMissions.includes(m.id))
    .map(m => {
      let progress = 0;
      let relevant = true;
      switch (m.id) {
        case 'upload_second':
          progress = sessions.length >= 2 ? 100 : (sessions.length / 2) * 100;
          relevant = sessions.length < 2;
          break;
        case 'complete_metabolic': {
          const metSys = BODY_SYSTEMS.find(s => s.id === 'metabolico');
          if (metSys) {
            const cov = getSystemBiomarkers(metSys, biomarkers).length;
            progress = Math.min(100, Math.round((cov / metSys.biomarkerNames.length) * 125));
          }
          relevant = progress < 100;
          break;
        }
        case 'reduce_cardio_risk':
          if (cardioRisk) {
            progress = cardioRisk.level === 'low' ? 100 : cardioRisk.level === 'moderate' ? 50 : 20;
          }
          relevant = !!cardioRisk && cardioRisk.level !== 'low';
          break;
        case 'unlock_vitamins': {
          const vitSys = BODY_SYSTEMS.find(s => s.id === 'vitaminas');
          if (vitSys) {
            const cov = getSystemBiomarkers(vitSys, biomarkers).length;
            progress = cov > 0 ? 100 : 0;
          }
          relevant = progress < 100;
          break;
        }
        case 'improve_two_markers':
          if (sessions.length >= 2) {
            const prev = sessions[1].biomarkers;
            let improved = 0;
            for (const b of biomarkers) {
              const p = prev.find(pb => pb.name.toLowerCase() === b.name.toLowerCase());
              if (p && p.status !== 'normal' && b.status === 'normal') improved++;
            }
            progress = Math.min(100, (improved / 2) * 100);
          }
          relevant = outOfRange.length > 0;
          break;
        case 'lower_bio_age':
          if (bioAge) {
            progress = bioAge.delta <= 0 ? 100 : Math.max(0, 100 - bioAge.delta * 20);
          }
          relevant = !!bioAge && bioAge.delta > 0;
          break;
        case 'complete_profile_mission': {
          const s = useStore.getState();
          const fields = [s.userName, s.age, s.sex, s.healthGoals.length > 0];
          const filled = fields.filter(Boolean).length;
          progress = Math.round((filled / fields.length) * 100);
          relevant = progress < 100;
          break;
        }
      }
      return { ...m, progress: Math.round(progress), relevant };
    })
    .filter(m => m.relevant)
    .slice(0, 3);

  if (!hasBiomarkers) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader />
        <View style={styles.emptyState}>
          <Target size={48} color={Colors.outline} />
          <Text style={styles.emptyTitle}>
            {language === 'es' ? 'Tu plan de acción' : 'Your action plan'}
          </Text>
          <Text style={styles.emptySub}>
            {language === 'es'
              ? 'Sube tu primer examen para desbloquear prioridades, misiones y logros personalizados.'
              : 'Upload your first exam to unlock personalized priorities, missions and achievements.'}
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
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Daily Tips ── */}
        {hasBiomarkers && (
          <View style={styles.tipsSection}>
            <View style={styles.tipsTitleRow}>
              <Lightbulb size={18} color={Colors.gold} />
              <Text style={styles.sectionTitle}>
                {language === 'es' ? 'Tips del Día' : 'Daily Tips'}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tipsRow}>
                {getTipsSlice(5).map(tip => (
                  <View key={tip.id} style={styles.tipCard}>
                    <Text style={styles.tipTitle}>{tip.title[language]}</Text>
                    <Text style={styles.tipBody}>{tip.body[language]}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* ── 1. Your Priorities ── */}
        {priorities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('yourPriorities')}</Text>
            <Text style={styles.sectionSub}>{t('prioritiesSub')}</Text>
            <View style={{ gap: 10 }}>
              {priorities.map((p, i) => (
                <PriorityCard
                  key={i}
                  title={p.title}
                  subtitle={p.subtitle}
                  impact={p.impact}
                  icon={p.icon}
                  onPress={p.markerName
                    ? () => router.push(`/biomarker/${encodeURIComponent(p.markerName!)}` as any)
                    : undefined}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── 3. Improvement Simulation ── */}
        {sim && sim.scoreDelta > 0 && (
          <View style={styles.simCard}>
            <Text style={styles.simTitle}>{t('simTitle')}</Text>
            <Text style={styles.simBody}>
              {t('simBody', {
                markers: topOutOfRange.join(' & '),
                current: sim.currentScore,
                projected: sim.projectedScore,
              })}
            </Text>
            <View style={styles.simScoreRow}>
              <View style={styles.simScoreBox}>
                <Text style={[styles.simScoreNum, { color: Colors.outline }]}>{sim.currentScore}</Text>
                <Text style={styles.simScoreLabel}>{language === 'es' ? 'Actual' : 'Current'}</Text>
              </View>
              <Text style={styles.simArrow}>→</Text>
              <View style={styles.simScoreBox}>
                <Text style={[styles.simScoreNum, { color: Colors.optimal }]}>{sim.projectedScore}</Text>
                <Text style={styles.simScoreLabel}>{language === 'es' ? 'Proyectado' : 'Projected'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── 3. Next Steps ── */}
        {evaluatedMissions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('nextSteps')}</Text>
            <Text style={styles.sectionSub}>{t('nextStepsSub')}</Text>
            <View style={{ gap: 10 }}>
              {evaluatedMissions.map(m => (
                <MissionCard
                  key={m.id}
                  name={m.name[language]}
                  description={m.description[language]}
                  progress={m.progress}
                  xpReward={m.xpReward}
                  icon={m.icon}
                  completed={m.progress >= 100}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── 5. Progress Stats ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('yourProgressSection')}</Text>
          <View style={styles.progressGrid}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNum}>{normalCount}</Text>
              <Text style={styles.progressLabel}>{t('markersImproved', { n: normalCount })}</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNum}>{greenSystems}</Text>
              <Text style={styles.progressLabel}>{t('systemsInGreen', { n: greenSystems })}</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNum}>{coverage?.percentage ?? 0}%</Text>
              <Text style={styles.progressLabel}>{t('coveragePct', { n: coverage?.percentage ?? 0 })}</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNum}>{activeWeeks}</Text>
              <Text style={styles.progressLabel}>{t('activeStreakLabel', { n: activeWeeks })}</Text>
            </View>
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
  content: { padding: 20, paddingBottom: 100 },

  // Empty state
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 40, gap: 12,
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

  // Sections
  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: Typography.families.display,
    fontSize: 20, fontWeight: '800', color: Colors.foreground,
    letterSpacing: -0.3, marginBottom: 4,
  },
  sectionSub: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.mutedForeground, marginBottom: 12,
  },

  // Simulation card
  simCard: {
    backgroundColor: Colors.primary10, borderRadius: 18, padding: 16,
    marginBottom: 24, borderWidth: 1, borderColor: Colors.primary + '25',
  },
  simTitle: {
    fontFamily: Typography.families.display,
    fontSize: 14, fontWeight: '800', color: Colors.primary, marginBottom: 6,
  },
  simBody: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.foreground, lineHeight: 20, marginBottom: 12,
  },
  simScoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  simScoreBox: { alignItems: 'center' },
  simScoreNum: {
    fontFamily: Typography.families.display, fontSize: 28, fontWeight: '900',
  },
  simScoreLabel: {
    fontFamily: Typography.families.body, fontSize: 10, color: Colors.outline, fontWeight: '600',
  },
  simArrow: {
    fontFamily: Typography.families.display, fontSize: 20, color: Colors.primary, fontWeight: '700',
  },

  // Progress grid
  progressGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  progressItem: {
    width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  progressNum: {
    fontFamily: Typography.families.display, fontSize: 22, fontWeight: '900', color: Colors.primary,
  },
  progressLabel: {
    fontFamily: Typography.families.body, fontSize: 11, color: Colors.mutedForeground, marginTop: 2,
  },

  // Daily Tips
  tipsSection: { marginBottom: 24 },
  tipsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  tipsRow: { flexDirection: 'row', gap: 12, paddingRight: 20 },
  tipCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, width: 260,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
    borderLeftWidth: 3, borderLeftColor: Colors.gold,
  },
  tipTitle: {
    fontFamily: Typography.families.display,
    fontSize: 14, fontWeight: '700', color: Colors.foreground, marginBottom: 6,
  },
  tipBody: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.mutedForeground, lineHeight: 18,
  },

  // Upload CTA
  uploadCTA: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary10, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: Colors.primary + '30', marginTop: 8,
  },
  uploadCTAText: {
    fontFamily: Typography.families.display, fontSize: 16, fontWeight: '800', color: Colors.primary,
  },
});
