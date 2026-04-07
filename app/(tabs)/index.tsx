import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import {
  ShieldCheck, TrendingUp, TrendingDown, Minus,
  Heart, Zap, Flame, Baby, ChevronRight, Upload, FileText,
} from 'lucide-react-native';
import AppHeader from '../../components/AppHeader';
import BodyMap from '../../components/BodyMap';
import LevelBadge from '../../components/ui/LevelBadge';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import {
  computeBiologicalAge, computeCardiovascularRisk, computeMetabolicRisk,
  computeInflammatoryRisk, computeOptimalPercentage, RiskLevel,
} from '../../constants/healthMetrics';
import {
  BODY_SYSTEMS, getSystemBiomarkers,
} from '../../constants/biomarkerSystems';
import { getBiomarkerKnowledge } from '../../constants/biomarkerKnowledge';
import { Biomarker } from '../../services/openai';
import { shareHealthReport } from '../../services/pdfExport';

// ─── Score helpers ────────────────────────────────────────────────────────────

function scoreRingColor(score: number): string {
  if (score >= 65) return Colors.optimal;
  if (score >= 50) return Colors.borderline;
  return Colors.attention;
}

function ScoreGauge({ score, size = 130 }: { score: number; size?: number }) {
  const r = (size / 2) - 10;
  const circumference = 2 * Math.PI * r;
  const ARC = 0.75;
  const dashLen = circumference * ARC;
  const blankLen = circumference - dashLen;
  const filled = circumference - (score / 100) * dashLen;
  const color = scoreRingColor(score);
  const cx = size / 2;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={cx} cy={cx} r={r} stroke={Colors.surfaceHigh} strokeWidth={10}
          strokeDasharray={`${dashLen} ${blankLen}`} strokeDashoffset={0}
          strokeLinecap="round" fill="none"
          transform={`rotate(135 ${cx} ${cx})`} />
        <Circle cx={cx} cy={cx} r={r} stroke={color} strokeWidth={10}
          strokeDasharray={`${circumference}`} strokeDashoffset={filled}
          strokeLinecap="round" fill="none"
          transform={`rotate(135 ${cx} ${cx})`} />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text style={[styles.gaugeScore, { color: Colors.foreground }]}>{score}</Text>
        <Text style={[styles.gaugeLabel, { color: Colors.outline }]}>Score</Text>
      </View>
    </View>
  );
}

// ─── Risk helpers ────────────────────────────────────────────────────────────

const RISK_COLOR: Record<RiskLevel, string> = { low: Colors.optimal, moderate: Colors.borderline, high: Colors.attention };
const RISK_BG: Record<RiskLevel, string> = { low: Colors.optimal10, moderate: Colors.borderline10, high: Colors.attention10 };

function markerStatusColor(status: string) {
  if (status === 'normal') return Colors.optimal;
  if (status === 'borderline') return Colors.borderline;
  return Colors.attention;
}

// ─── Marker row ──────────────────────────────────────────────────────────────

function MarkerRow({ biomarker, language, t, onPress }: {
  biomarker: Biomarker; language: string; t: ReturnType<typeof useT>; onPress: () => void;
}) {
  const knowledge = getBiomarkerKnowledge(biomarker.name);
  const displayName = knowledge?.simpleName?.[language as 'en' | 'es'] ?? biomarker.name;
  const color = markerStatusColor(biomarker.status);
  const bg = biomarker.status === 'normal' ? Colors.optimal10
    : biomarker.status === 'borderline' ? Colors.borderline10
    : Colors.attention10;
  const statusLabel: Record<string, string> = {
    normal: t('statusNormal'), borderline: t('statusBorderline'),
    high: t('statusHigh'), low: t('statusLow'),
  };

  return (
    <TouchableOpacity style={[styles.markerRow, { borderLeftColor: color }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.markerInfo}>
        <Text style={styles.markerName}>{displayName}</Text>
        <Text style={styles.markerOriginal}>{biomarker.name}</Text>
      </View>
      <View style={styles.markerRight}>
        <Text style={[styles.markerValue, { color }]}>{biomarker.value} {biomarker.unit}</Text>
        <View style={[styles.markerChip, { backgroundColor: bg }]}>
          <Text style={[styles.markerChipText, { color }]}>{statusLabel[biomarker.status] ?? biomarker.status}</Text>
        </View>
        <ChevronRight size={14} color={Colors.outline} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const router = useRouter();
  const t = useT();
  const healthScore = useStore(s => s.healthScore);
  const userName = useStore(s => s.userName);
  const biomarkers = useStore(s => s.biomarkers);
  const sessions = useStore(s => s.sessions);
  const age = useStore(s => s.age);
  const sex = useStore(s => s.sex);
  const language = useStore(s => s.language) as 'en' | 'es';
  const testReminderDays = useStore(s => s.testReminderDays);
  const hasBiomarkers = biomarkers.length > 0;

  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Days since last test
  const daysSinceLastTest = useMemo(() => {
    if (sessions.length === 0) return null;
    const lastDate = new Date(sessions[0].date);
    const now = new Date();
    return Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  }, [sessions]);

  const showTestReminder = daysSinceLastTest !== null && daysSinceLastTest >= testReminderDays;

  const handleShareWithDoctor = useCallback(async () => {
    if (biomarkers.length === 0) {
      Alert.alert(t('noDataToShare'), t('noDataToShareMsg'));
      return;
    }
    try {
      await shareHealthReport({
        userName,
        age,
        sex,
        language,
        healthScore,
        biomarkers,
      });
    } catch (err) {
      console.warn('[Clyra] PDF share error:', err);
    }
  }, [userName, age, sex, language, healthScore, biomarkers, t]);

  // Score trend
  const scoreDelta = sessions.length >= 2
    ? sessions[0].healthScore - sessions[1].healthScore : null;
  const TrendIcon = scoreDelta === null ? Minus : scoreDelta > 0 ? TrendingUp : scoreDelta < 0 ? TrendingDown : Minus;
  const trendColor = scoreDelta === null ? Colors.outline : scoreDelta > 0 ? Colors.optimal : scoreDelta < 0 ? Colors.attention : Colors.outline;

  // Bio age
  const chronoAge = parseInt(age, 10) || 0;
  const bioAge = hasBiomarkers && chronoAge > 0 ? computeBiologicalAge(biomarkers, chronoAge) : null;
  const bioAgeColor = bioAge ? (bioAge.delta < -1 ? Colors.optimal : bioAge.delta > 1 ? Colors.attention : Colors.borderline) : Colors.outline;

  // Optimal percentage
  const optimalPct = hasBiomarkers ? computeOptimalPercentage(biomarkers) : 0;

  // Risks
  const cardioRisk = hasBiomarkers ? computeCardiovascularRisk(biomarkers) : null;
  const metaRisk = hasBiomarkers ? computeMetabolicRisk(biomarkers) : null;
  const inflaRisk = hasBiomarkers ? computeInflammatoryRisk(biomarkers) : null;

  // Smart coach message — single concise line
  const outOfRange = biomarkers.filter(b => b.status !== 'normal');
  const criticalMarkers = outOfRange.filter(b => b.status === 'high' || b.status === 'low');

  // Category filter chips
  const systemsWithData = BODY_SYSTEMS.filter(sys => getSystemBiomarkers(sys, biomarkers).length > 0);
  const filterChips = [
    { id: 'all', label: t('filterAll'), emoji: '📋' },
    ...systemsWithData.map(sys => ({ id: sys.id, label: sys.shortName[language], emoji: sys.emoji })),
  ];

  const filteredBiomarkers = activeFilter === 'all'
    ? [...biomarkers].sort((a, b) => {
        const rank = { high: 0, low: 0, borderline: 1, normal: 2 };
        return (rank[a.status as keyof typeof rank] ?? 2) - (rank[b.status as keyof typeof rank] ?? 2);
      })
    : (() => {
        const sys = BODY_SYSTEMS.find(s => s.id === activeFilter);
        return sys ? getSystemBiomarkers(sys, biomarkers) : [];
      })();

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── 1. Welcome ── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingName}>
            {t('greeting')}{userName ? `, ${userName}` : ''}
          </Text>
          <Text style={styles.greetingSub}>
            {hasBiomarkers ? t('homeSummary') : t('coachNoData')}
          </Text>
        </View>

        {hasBiomarkers ? (
          <>
            {/* ── 2. Score Card ── */}
            <View style={styles.scoreBento}>
              <View style={styles.scoreLeft}>
                <ScoreGauge score={healthScore} size={130} />
              </View>
              <View style={styles.scoreRight}>
                <LevelBadge score={healthScore} language={language} />

                {/* Score change */}
                <View style={styles.trendRow}>
                  <TrendIcon size={13} color={trendColor} />
                  <Text style={[styles.trendText, { color: trendColor }]}>
                    {scoreDelta !== null
                      ? `${scoreDelta > 0 ? '+' : ''}${scoreDelta} ${t('vsLastTest')}`
                      : t('noChangeYet')}
                  </Text>
                </View>

                {/* Bio age */}
                {bioAge && (
                  <View style={[styles.bioAgeRow, { backgroundColor: bioAgeColor + '12' }]}>
                    <Baby size={13} color={bioAgeColor} />
                    <Text style={[styles.bioAgeNum, { color: bioAgeColor }]}>
                      {bioAge.biologicalAge} {language === 'es' ? 'anos bio' : 'bio yrs'}
                    </Text>
                  </View>
                )}

                {/* Optimal range percentage */}
                <Text style={styles.optimalPctText}>
                  {t('optimalRangePct', { n: optimalPct })}
                </Text>
              </View>
            </View>

            {/* ── 2. Body Map / Your Biomarkers ── */}
            <View style={[styles.section, { alignItems: 'center' }]}>
              <Text style={[styles.sectionTitle, { alignSelf: 'flex-start' }]}>{t('yourBody')}</Text>
              <Text style={[styles.sectionSub, { alignSelf: 'flex-start' }]}>{t('bodyMapSubtitle')}</Text>
              <BodyMap biomarkers={biomarkers} />
            </View>

            {/* ── 3. All Markers with category filter ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('allMarkersTitle')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <View style={styles.filterRow}>
                  {filterChips.map(chip => (
                    <TouchableOpacity
                      key={chip.id}
                      style={[styles.filterChip, activeFilter === chip.id && styles.filterChipActive]}
                      onPress={() => setActiveFilter(chip.id)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.filterChipEmoji}>{chip.emoji}</Text>
                      <Text style={[styles.filterChipText, activeFilter === chip.id && styles.filterChipTextActive]}>
                        {chip.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <View style={styles.markerList}>
                {filteredBiomarkers.map(b => (
                  <MarkerRow key={b.name} biomarker={b} language={language} t={t}
                    onPress={() => router.push(`/biomarker/${encodeURIComponent(b.name)}` as any)} />
                ))}
              </View>
            </View>

            {/* ── 4. Risk Dashboard ── */}
            {(cardioRisk || metaRisk || inflaRisk || criticalMarkers.length > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('riskScores')}</Text>

                {/* Urgent alerts banner */}
                {criticalMarkers.length > 0 && (
                  <TouchableOpacity
                    style={styles.criticalBanner}
                    onPress={() => router.push('/(tabs)/activity' as any)}
                    activeOpacity={0.85}
                  >
                    <ShieldCheck size={18} color={Colors.attention} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.criticalTitle}>
                        {criticalMarkers.length} {t('urgentAlerts')}
                      </Text>
                    </View>
                    <ChevronRight size={16} color={Colors.attention} />
                  </TouchableOpacity>
                )}

                <View style={styles.riskRow}>
                  {[
                    { label: t('riskCardio'), risk: cardioRisk, icon: Heart },
                    { label: t('riskMetabolic'), risk: metaRisk, icon: Zap },
                    { label: t('riskInflammation'), risk: inflaRisk, icon: Flame },
                  ].map(({ label, risk, icon: Icon }) => {
                    if (!risk) return null;
                    const color = RISK_COLOR[risk.level];
                    const bg = RISK_BG[risk.level];
                    return (
                      <View key={label} style={[styles.riskCard, { backgroundColor: bg, borderColor: color + '30' }]}>
                        <View style={[styles.riskIconWrap, { backgroundColor: color + '20' }]}>
                          <Icon size={16} color={color} />
                        </View>
                        <Text style={styles.riskCardLabel}>{label}</Text>
                        <Text style={[styles.riskCardLevel, { color }]}>
                          {t(risk.level === 'low' ? 'riskLow' : risk.level === 'moderate' ? 'riskModerate' : 'riskHigh')}
                        </Text>
                        <View style={styles.riskBar}>
                          <View style={[styles.riskBarFill, { width: `${risk.score}%` as any, backgroundColor: color }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── 5. Share with Doctor ── */}
            <TouchableOpacity style={styles.shareBtn} onPress={handleShareWithDoctor} activeOpacity={0.8}>
              <FileText size={14} color={Colors.mutedForeground} />
              <Text style={styles.shareBtnText}>{t('shareWithDoctor')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* ── Empty state ── */
          <View>
            <View style={[styles.section, { alignItems: 'center' }]}>
              <Text style={[styles.sectionTitle, { alignSelf: 'flex-start' }]}>{t('yourBody')}</Text>
              <Text style={[styles.sectionSub, { alignSelf: 'flex-start' }]}>{t('bodyMapSubtitle')}</Text>
              <BodyMap biomarkers={biomarkers} />
            </View>
            <TouchableOpacity style={styles.uploadCTA}
              onPress={() => router.push('/(tabs)/upload' as any)} activeOpacity={0.85}>
              <Upload size={20} color={Colors.primary} />
              <Text style={styles.uploadCTAText}>{t('uploadResults')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },

  // Greeting
  greetingSection: { marginBottom: 16 },
  greetingName: {
    fontFamily: Typography.families.display,
    fontSize: 26, fontWeight: '800', color: Colors.foreground,
    letterSpacing: -0.5, marginBottom: 6,
  },
  greetingSub: {
    fontFamily: Typography.families.body,
    fontSize: 14, color: Colors.mutedForeground, lineHeight: 20,
  },

  // Score bento
  scoreBento: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 16, elevation: 2,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },
  scoreLeft: { marginRight: 12 },
  scoreRight: { flex: 1, gap: 6 },
  gaugeScore: {
    fontFamily: Typography.families.display,
    fontSize: 32, fontWeight: '900', letterSpacing: -2, lineHeight: 38,
  },
  gaugeLabel: {
    fontFamily: Typography.families.body,
    fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2,
  },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendText: { fontFamily: Typography.families.body, fontSize: 11, fontWeight: '600' },
  bioAgeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
  },
  bioAgeNum: {
    fontFamily: Typography.families.display, fontSize: 12, fontWeight: '800',
  },
  optimalPctText: {
    fontFamily: Typography.families.body, fontSize: 11, fontWeight: '600',
    color: Colors.optimal, marginTop: 2,
  },

  // Share button (subtle secondary at bottom)
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'transparent', borderRadius: 12, paddingVertical: 14,
    marginTop: 8, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.outlineVariant,
  },
  shareBtnText: {
    fontFamily: Typography.families.body, fontSize: 13, fontWeight: '600', color: Colors.mutedForeground,
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

  // Filter chips
  filterScroll: { marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.surfaceLow, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipEmoji: { fontSize: 13 },
  filterChipText: {
    fontFamily: Typography.families.body, fontSize: 12, fontWeight: '600', color: Colors.mutedForeground,
  },
  filterChipTextActive: { color: 'white' },

  // Markers
  markerList: { gap: 8 },
  markerRow: {
    backgroundColor: '#fff', borderRadius: 14, borderLeftWidth: 3,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  markerInfo: { flex: 1 },
  markerName: { fontFamily: Typography.families.body, fontSize: 14, fontWeight: '700', color: Colors.foreground },
  markerOriginal: { fontFamily: Typography.families.body, fontSize: 10, color: Colors.outline, marginTop: 1 },
  markerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  markerValue: { fontFamily: Typography.families.body, fontSize: 13, fontWeight: '700' },
  markerChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  markerChipText: { fontFamily: Typography.families.body, fontSize: 10, fontWeight: '700' },

  // Risk dashboard
  riskRow: { flexDirection: 'row', gap: 8 },
  riskCard: { flex: 1, borderRadius: 18, padding: 14, borderWidth: 1 },
  riskIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  riskCardLabel: {
    fontFamily: Typography.families.body, fontSize: 10, fontWeight: '700', color: Colors.foreground,
    textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4,
  },
  riskCardLevel: { fontFamily: Typography.families.display, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  riskBar: { height: 4, backgroundColor: Colors.outlineVariant, borderRadius: 2, overflow: 'hidden' },
  riskBarFill: { height: 4, borderRadius: 2 },

  // Critical banner
  criticalBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.attention10, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.attention + '30', marginBottom: 16,
  },
  criticalTitle: { fontFamily: Typography.families.body, fontSize: 14, fontWeight: '700', color: Colors.attention },

  // Empty state upload CTA
  uploadCTA: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary10, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  uploadCTAText: {
    fontFamily: Typography.families.display, fontSize: 16, fontWeight: '800', color: Colors.primary,
  },
});
