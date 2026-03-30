import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import {
  ShieldCheck, TrendingUp, TrendingDown, Minus,
  Heart, Zap, Flame, Baby, ChevronRight,
} from 'lucide-react-native';
import AppHeader from '../../components/AppHeader';
import BodyMap from '../../components/BodyMap';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import {
  computeBiologicalAge, computeCardiovascularRisk, computeMetabolicRisk,
  computeInflammatoryRisk, RiskLevel,
} from '../../constants/healthMetrics';
import {
  BODY_SYSTEMS, getSystemBiomarkers,
} from '../../constants/biomarkerSystems';
import { getBiomarkerKnowledge } from '../../constants/biomarkerKnowledge';
import { Biomarker } from '../../services/openai';

// ─── Score helpers ────────────────────────────────────────────────────────────

function scoreGrade(score: number, t: ReturnType<typeof useT>): string {
  if (score >= 80) return t('scoreOptimal');
  if (score >= 65) return t('scoreGood');
  if (score >= 50) return t('scoreFair');
  return t('scoreAttention');
}

function scoreInsight(score: number, t: ReturnType<typeof useT>): string {
  if (score >= 80) return t('insight80');
  if (score >= 65) return t('insight65');
  if (score >= 50) return t('insight50');
  return t('insight0');
}

function scoreRingColor(score: number): string {
  if (score >= 65) return Colors.optimal;
  if (score >= 50) return Colors.borderline;
  return Colors.attention;
}

// ─── Score gauge ring (SVG) ───────────────────────────────────────────────────

function ScoreGauge({ score, size = 140 }: { score: number; size?: number }) {
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

// ─── Risk level helpers ───────────────────────────────────────────────────────

const RISK_COLOR: Record<RiskLevel, string> = {
  low: Colors.optimal,
  moderate: Colors.borderline,
  high: Colors.attention,
};
const RISK_BG: Record<RiskLevel, string> = {
  low: Colors.optimal10,
  moderate: Colors.borderline10,
  high: Colors.attention10,
};

// ─── Marker status color ──────────────────────────────────────────────────────

function markerStatusColor(status: string) {
  if (status === 'normal') return Colors.optimal;
  if (status === 'borderline') return Colors.borderline;
  return Colors.attention;
}

// ─── Marker row for grouped list ─────────────────────────────────────────────

function MarkerRow({ biomarker, language, t, onPress }: {
  biomarker: Biomarker;
  language: string;
  t: ReturnType<typeof useT>;
  onPress: () => void;
}) {
  const knowledge = getBiomarkerKnowledge(biomarker.name);
  const displayName = knowledge?.simpleName?.[language as 'en' | 'es'] ?? biomarker.name;
  const color = markerStatusColor(biomarker.status);
  const bg = biomarker.status === 'normal' ? Colors.optimal10
    : biomarker.status === 'borderline' ? Colors.borderline10
    : Colors.attention10;
  const statusLabel = {
    normal: t('statusNormal'),
    borderline: t('statusBorderline'),
    high: t('statusHigh'),
    low: t('statusLow'),
  }[biomarker.status] ?? biomarker.status;

  return (
    <TouchableOpacity style={[styles.markerRow, { borderLeftColor: color }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.markerInfo}>
        <Text style={styles.markerName}>{displayName}</Text>
        <Text style={styles.markerOriginal}>{biomarker.name}</Text>
      </View>
      <View style={styles.markerRight}>
        <Text style={[styles.markerValue, { color }]}>{biomarker.value} {biomarker.unit}</Text>
        <View style={[styles.markerChip, { backgroundColor: bg }]}>
          <Text style={[styles.markerChipText, { color }]}>{statusLabel}</Text>
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
  const healthScore = useStore((s) => s.healthScore);
  const userName = useStore((s) => s.userName);
  const biomarkers = useStore((s) => s.biomarkers);
  const sessions = useStore((s) => s.sessions);
  const age = useStore((s) => s.age);
  const language = useStore((s) => s.language) as 'en' | 'es';
  const hasBiomarkers = biomarkers.length > 0;

  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Score trend vs previous session
  const scoreDelta = sessions.length >= 2
    ? sessions[0].healthScore - sessions[1].healthScore
    : null;

  const TrendIcon = scoreDelta === null ? Minus
    : scoreDelta > 0 ? TrendingUp
    : scoreDelta < 0 ? TrendingDown
    : Minus;

  const trendColor = scoreDelta === null ? Colors.outline
    : scoreDelta > 0 ? Colors.optimal
    : scoreDelta < 0 ? Colors.attention
    : Colors.outline;

  const grade = hasBiomarkers ? scoreGrade(healthScore, t) : '';
  const insight = hasBiomarkers ? scoreInsight(healthScore, t) : '';
  const ringColor = scoreRingColor(healthScore);

  // Biological Age
  const chronoAge = parseInt(age, 10) || 0;
  const bioAge = hasBiomarkers && chronoAge > 0
    ? computeBiologicalAge(biomarkers, chronoAge)
    : null;
  const bioAgeColor = bioAge
    ? bioAge.delta < -1 ? Colors.optimal
    : bioAge.delta > 1 ? Colors.attention
    : Colors.borderline
    : Colors.outline;
  const bioAgeLabel = bioAge
    ? bioAge.delta < -1 ? t('bioAgeYounger', { n: Math.abs(bioAge.delta) })
    : bioAge.delta > 1 ? t('bioAgeOlder', { n: bioAge.delta })
    : t('bioAgeSame')
    : '';

  // Risk scores
  const cardioRisk = hasBiomarkers ? computeCardiovascularRisk(biomarkers) : null;
  const metaRisk = hasBiomarkers ? computeMetabolicRisk(biomarkers) : null;
  const inflaRisk = hasBiomarkers ? computeInflammatoryRisk(biomarkers) : null;

  // Category filter chips: ALL + each system that has biomarkers
  const systemsWithData = BODY_SYSTEMS.filter(sys =>
    getSystemBiomarkers(sys, biomarkers).length > 0
  );
  const filterChips = [
    { id: 'all', label: t('filterAll'), emoji: '📋' },
    ...systemsWithData.map(sys => ({
      id: sys.id,
      label: sys.shortName[language],
      emoji: sys.emoji,
    })),
  ];

  // Filtered biomarkers
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting ── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingName}>
            {t('greeting')}{userName ? `, ${userName}` : ''}
          </Text>
          <View style={styles.greetingMeta}>
            {hasBiomarkers && <View style={[styles.metaDot, { backgroundColor: Colors.optimal }]} />}
            <Text style={styles.greetingSubtitle}>
              {hasBiomarkers
                ? `${biomarkers.length} ${t('markersAnalyzed')}`
                : t('uploadToStart')}
            </Text>
          </View>
        </View>

        {hasBiomarkers && (
          <>
            {/* ── Score bento card (with bio age embedded) ── */}
            <View style={styles.scoreBento}>
              <View style={styles.scoreLeft}>
                <ScoreGauge score={healthScore} size={140} />
              </View>
              <View style={styles.scoreRight}>
                <Text style={[styles.scoreGrade, { color: ringColor }]}>{grade}</Text>
                <Text style={styles.scoreInsight}>{insight}</Text>

                {/* Bio age row embedded in score */}
                {bioAge && (
                  <View style={[styles.bioAgeRow, { backgroundColor: bioAgeColor + '12' }]}>
                    <Baby size={13} color={bioAgeColor} />
                    <View>
                      <Text style={[styles.bioAgeNum, { color: bioAgeColor }]}>
                        {bioAge.biologicalAge} {language === 'es' ? 'años bio' : 'bio yrs'}
                      </Text>
                      <Text style={[styles.bioAgeSub, { color: bioAgeColor }]}>{bioAgeLabel}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.trendRow}>
                  <TrendIcon size={13} color={trendColor} />
                  <Text style={[styles.trendText, { color: trendColor }]}>
                    {scoreDelta !== null
                      ? (scoreDelta > 0 ? t('improving') : scoreDelta < 0 ? t('declining') : t('stable'))
                      : t('noChangeYet')}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Body map ── */}
            <View style={styles.mapSection}>
              <Text style={styles.sectionTitle}>{t('yourBody')}</Text>
              <Text style={styles.sectionSub}>{t('bodyMapSubtitle')}</Text>
              <BodyMap biomarkers={biomarkers} />
            </View>

            {/* ── All Markers with category filter ── */}
            <View style={styles.markersSection}>
              <Text style={styles.sectionTitle}>{t('allMarkersTitle')}</Text>

              {/* Filter chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <View style={styles.filterRow}>
                  {filterChips.map(chip => (
                    <TouchableOpacity
                      key={chip.id}
                      style={[
                        styles.filterChip,
                        activeFilter === chip.id && styles.filterChipActive,
                      ]}
                      onPress={() => setActiveFilter(chip.id)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.filterChipEmoji}>{chip.emoji}</Text>
                      <Text style={[
                        styles.filterChipText,
                        activeFilter === chip.id && styles.filterChipTextActive,
                      ]}>{chip.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Marker rows */}
              <View style={styles.markerList}>
                {filteredBiomarkers.map(b => (
                  <MarkerRow
                    key={b.name}
                    biomarker={b}
                    language={language}
                    t={t}
                    onPress={() => router.push(`/biomarker/${encodeURIComponent(b.name)}` as any)}
                  />
                ))}
              </View>
            </View>

            {/* ── Risk Dashboard (below body) ── */}
            {(cardioRisk || metaRisk || inflaRisk) && (
              <View style={styles.riskSection}>
                <Text style={styles.sectionTitle}>{t('riskScores')}</Text>
                <Text style={styles.sectionSub}>{t('riskSectionSub')}</Text>
                <View style={styles.riskRow}>
                  {[
                    { label: t('riskCardio'), risk: cardioRisk, icon: Heart, route: '/(tabs)/progress' },
                    { label: t('riskMetabolic'), risk: metaRisk, icon: Zap, route: '/(tabs)/progress' },
                    { label: t('riskInflammation'), risk: inflaRisk, icon: Flame, route: '/(tabs)/progress' },
                  ].map(({ label, risk, icon: Icon, route }) => {
                    if (!risk) return null;
                    const color = RISK_COLOR[risk.level];
                    const bg = RISK_BG[risk.level];
                    const riskLabel = t(
                      risk.level === 'low' ? 'riskLow'
                      : risk.level === 'moderate' ? 'riskModerate'
                      : 'riskHigh'
                    );
                    return (
                      <TouchableOpacity
                        key={label}
                        style={[styles.riskCard, { backgroundColor: bg, borderColor: color + '30' }]}
                        onPress={() => router.push(route as any)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.riskIconWrap, { backgroundColor: color + '20' }]}>
                          <Icon size={16} color={color} />
                        </View>
                        <Text style={styles.riskCardLabel}>{label}</Text>
                        <Text style={[styles.riskCardLevel, { color }]}>{riskLabel}</Text>
                        <View style={styles.riskBar}>
                          <View style={[styles.riskBarFill, { width: `${risk.score}%` as any, backgroundColor: color }]} />
                        </View>
                        <Text style={[styles.riskTap, { color }]}>
                          {language === 'es' ? 'Ver detalles →' : 'See details →'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── Critical count summary ── */}
            {(() => {
              const criticalCount = biomarkers.filter(b => b.status === 'high' || b.status === 'low').length;
              if (criticalCount === 0) return null;
              return (
                <TouchableOpacity
                  style={styles.criticalBanner}
                  onPress={() => router.push('/(tabs)/progress' as any)}
                  activeOpacity={0.85}
                >
                  <ShieldCheck size={18} color={Colors.attention} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.criticalTitle}>
                      {criticalCount} {t('urgentAlerts')}
                    </Text>
                    <Text style={styles.criticalSub}>
                      {language === 'es' ? 'Toca para ver recomendaciones' : 'Tap to see recommendations'}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={Colors.attention} />
                </TouchableOpacity>
              );
            })()}
          </>
        )}

        {/* ── Empty state body map (no biomarkers) ── */}
        {!hasBiomarkers && (
          <View style={styles.mapSection}>
            <Text style={styles.sectionTitle}>{t('yourBody')}</Text>
            <Text style={styles.sectionSub}>{t('bodyMapSubtitle')}</Text>
            <BodyMap biomarkers={biomarkers} />
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

  greetingSection: { marginBottom: 20 },
  greetingName: {
    fontFamily: Typography.families.display,
    fontSize: 26, fontWeight: '800', color: Colors.foreground,
    letterSpacing: -0.5, marginBottom: 6,
  },
  greetingMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaDot: { width: 8, height: 8, borderRadius: 4 },
  greetingSubtitle: {
    fontFamily: Typography.families.body,
    fontSize: 14, color: Colors.mutedForeground, fontWeight: '500',
  },

  // Score bento
  scoreBento: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 18,
    flexDirection: 'row', alignItems: 'center', marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 2,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },
  scoreLeft: { marginRight: 14 },
  scoreRight: { flex: 1 },
  scoreGrade: {
    fontFamily: Typography.families.display,
    fontSize: 19, fontWeight: '800', marginBottom: 4, letterSpacing: -0.3,
  },
  scoreInsight: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.mutedForeground, lineHeight: 17, marginBottom: 8,
  },

  gaugeScore: {
    fontFamily: Typography.families.display,
    fontSize: 34, fontWeight: '900', letterSpacing: -2, lineHeight: 40,
  },
  gaugeLabel: {
    fontFamily: Typography.families.body,
    fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2,
  },

  // Bio age embedded row
  bioAgeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5,
    marginBottom: 8,
  },
  bioAgeNum: {
    fontFamily: Typography.families.display,
    fontSize: 13, fontWeight: '800', letterSpacing: -0.3,
  },
  bioAgeSub: {
    fontFamily: Typography.families.body,
    fontSize: 10, fontWeight: '600',
  },

  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendText: { fontFamily: Typography.families.body, fontSize: 11, fontWeight: '600' },

  // Sections
  mapSection: { marginBottom: 28 },
  sectionTitle: {
    fontFamily: Typography.families.display,
    fontSize: 20, fontWeight: '800', color: Colors.foreground,
    letterSpacing: -0.3, marginBottom: 4,
  },
  sectionSub: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.mutedForeground, marginBottom: 14,
  },

  // All Markers
  markersSection: { marginBottom: 28 },
  filterScroll: { marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.surfaceLow,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipEmoji: { fontSize: 13 },
  filterChipText: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '600', color: Colors.mutedForeground,
  },
  filterChipTextActive: { color: 'white' },
  markerList: { gap: 8 },
  markerRow: {
    backgroundColor: '#fff', borderRadius: 14, borderLeftWidth: 3,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  markerInfo: { flex: 1 },
  markerName: {
    fontFamily: Typography.families.body,
    fontSize: 14, fontWeight: '700', color: Colors.foreground,
  },
  markerOriginal: {
    fontFamily: Typography.families.body,
    fontSize: 10, color: Colors.outline, marginTop: 1,
  },
  markerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  markerValue: {
    fontFamily: Typography.families.body,
    fontSize: 13, fontWeight: '700',
  },
  markerChip: {
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7,
  },
  markerChipText: {
    fontFamily: Typography.families.body,
    fontSize: 10, fontWeight: '700',
  },

  // Risk dashboard
  riskSection: { marginBottom: 20 },
  riskRow: { flexDirection: 'row', gap: 8 },
  riskCard: {
    flex: 1, borderRadius: 18, padding: 14, borderWidth: 1,
  },
  riskIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  riskCardLabel: {
    fontFamily: Typography.families.body,
    fontSize: 10, fontWeight: '700', color: Colors.foreground,
    textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4,
  },
  riskCardLevel: {
    fontFamily: Typography.families.display,
    fontSize: 12, fontWeight: '800', marginBottom: 8,
  },
  riskBar: {
    height: 4, backgroundColor: Colors.outlineVariant, borderRadius: 2, overflow: 'hidden', marginBottom: 6,
  },
  riskBarFill: { height: 4, borderRadius: 2 },
  riskTap: {
    fontFamily: Typography.families.body,
    fontSize: 9, fontWeight: '700',
  },

  // Critical banner
  criticalBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.attention10, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.attention + '30', marginBottom: 12,
  },
  criticalTitle: {
    fontFamily: Typography.families.body,
    fontSize: 14, fontWeight: '700', color: Colors.attention,
  },
  criticalSub: {
    fontFamily: Typography.families.body,
    fontSize: 11, color: Colors.attention, opacity: 0.8,
  },
});
