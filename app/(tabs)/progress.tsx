import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Share,
} from 'react-native';
import Svg, { Circle, Polyline, Line } from 'react-native-svg';
import {
  TrendingUp, TrendingDown, Minus,
  ChevronRight, ArrowUp, ArrowDown, Stethoscope, Share2,
  CheckCheck, Leaf, Dumbbell, Droplets, Flame, Heart,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import { Biomarker } from '../../services/openai';
import { getBiomarkerKnowledge } from '../../constants/biomarkerKnowledge';
import { generateDoctorQuestions } from '../../constants/healthMetrics';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 65) return Colors.optimal;
  if (score >= 50) return Colors.borderline;
  return Colors.attention;
}

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(lang === 'es' ? 'es' : 'en', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatShort(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(lang === 'es' ? 'es' : 'en', {
    month: 'short', year: '2-digit',
  });
}

// ─── Score history graph (SVG) ────────────────────────────────────────────────

function ScoreGraph({ sessions, language, t }: {
  sessions: { healthScore: number; date: string }[];
  language: string;
  t: ReturnType<typeof useT>;
}) {
  const W = 320, H = 110;
  const PAD = { top: 16, bottom: 28, left: 10, right: 10 };
  const gW = W - PAD.left - PAD.right;
  const gH = H - PAD.top - PAD.bottom;

  // Add projected "next test" point 3 months after last session
  const lastDate = new Date(sessions[0].date);
  const nextDate = new Date(lastDate);
  nextDate.setMonth(nextDate.getMonth() + 3);
  const nextScore = sessions[0].healthScore; // projected flat

  const allSessions = [...sessions].reverse(); // oldest first
  const totalPoints = allSessions.length + 1; // +1 for projected point

  const xFor = (i: number) => PAD.left + (i / (totalPoints - 1)) * gW;
  const yFor = (score: number) => PAD.top + gH - ((score / 100) * gH);

  const polyPoints = allSessions
    .map((s, i) => `${xFor(i)},${yFor(s.healthScore)}`)
    .join(' ');

  const lastX = xFor(allSessions.length - 1);
  const lastY = yFor(allSessions[allSessions.length - 1].healthScore);
  const projX = xFor(totalPoints - 1);
  const projY = yFor(nextScore);

  return (
    <View style={styles.graphCard}>
      <View style={styles.graphTitleRow}>
        <Text style={styles.graphTitle}>{t('scoreHistory')}</Text>
        <View style={styles.projLegend}>
          <View style={styles.projDash} />
          <Text style={styles.projLegendText}>{t('projectedNext')}</Text>
        </View>
      </View>

      <Svg width={W} height={H} style={{ alignSelf: 'center' }}>
        {/* Horizontal grid lines at 25, 50, 75, 100 */}
        {[25, 50, 75, 100].map(val => {
          const y = yFor(val);
          return (
            <Line key={val} x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
              stroke={Colors.outlineVariant} strokeWidth={0.5} strokeDasharray="3,4" />
          );
        })}

        {/* Main score line */}
        {allSessions.length > 1 && (
          <Polyline
            points={polyPoints}
            fill="none"
            stroke={Colors.primary}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Projected dashed line */}
        <Line
          x1={lastX} y1={lastY} x2={projX} y2={projY}
          stroke={Colors.primary}
          strokeWidth={1.5}
          strokeDasharray="4,4"
          opacity={0.5}
        />

        {/* Data point dots */}
        {allSessions.map((s, i) => {
          const cx = xFor(i);
          const cy = yFor(s.healthScore);
          const color = scoreColor(s.healthScore);
          const isLatest = i === allSessions.length - 1;
          return (
            <React.Fragment key={i}>
              {isLatest && <Circle cx={cx} cy={cy} r={8} fill={color} opacity={0.15} />}
              <Circle cx={cx} cy={cy} r={isLatest ? 5 : 3.5}
                fill={isLatest ? color : '#fff'}
                stroke={color} strokeWidth={isLatest ? 0 : 2} />
            </React.Fragment>
          );
        })}

        {/* Projected point */}
        <Circle cx={projX} cy={projY} r={3.5} fill="none"
          stroke={Colors.primary} strokeWidth={1.5} strokeDasharray="2,1" opacity={0.5} />
      </Svg>

      {/* Date labels */}
      <View style={[styles.dateRow, { width: W, paddingHorizontal: PAD.left }]}>
        {allSessions.map((s, i) => (
          <Text key={i} style={[styles.dateLabel, { left: xFor(i) - 16 }]}>
            {formatShort(s.date, language)}
          </Text>
        ))}
        <Text style={[styles.dateLabel, styles.dateLabelProj, { left: projX - 16 }]}>
          {formatShort(nextDate.toISOString(), language)}
        </Text>
      </View>

      <View style={styles.nextTestBanner}>
        <Text style={styles.nextTestText}>
          📅 {t('nextTestIn', { n: 3 })}
        </Text>
      </View>
    </View>
  );
}

// ─── Trend delta between two sessions ────────────────────────────────────────

interface BiomarkerDelta {
  b: Biomarker; prev: Biomarker;
  improved: boolean; worsened: boolean; valueChanged: boolean;
}

function getStatusRank(status: string): number {
  return { normal: 3, borderline: 2, high: 1, low: 1 }[status] ?? 2;
}

function computeDeltas(current: Biomarker[], previous: Biomarker[]): BiomarkerDelta[] {
  const deltas: BiomarkerDelta[] = [];
  for (const b of current) {
    const prev = previous.find(p => p.name.toLowerCase() === b.name.toLowerCase());
    if (!prev) continue;
    const rankNow = getStatusRank(b.status);
    const rankPrev = getStatusRank(prev.status);
    const improved = rankNow > rankPrev;
    const worsened = rankNow < rankPrev;
    const valueChanged = String(b.value) !== String(prev.value);
    if (improved || worsened || (valueChanged && b.status !== 'normal')) {
      deltas.push({ b, prev, improved, worsened, valueChanged });
    }
  }
  return deltas;
}

// ─── Trend row ────────────────────────────────────────────────────────────────

function TrendRow({ delta, lang, onPress }: {
  delta: BiomarkerDelta; lang: string; onPress: () => void;
}) {
  const { b, prev, improved, worsened } = delta;
  const knowledge = getBiomarkerKnowledge(b.name);
  const color = improved ? Colors.optimal : worsened ? Colors.attention : Colors.borderline;
  const bg = improved ? Colors.optimal10 : worsened ? Colors.attention10 : Colors.borderline10;
  const Icon = improved ? ArrowUp : ArrowDown;
  const statusLabel = (s: string) => ({
    normal: lang === 'es' ? 'Normal' : 'Normal',
    borderline: lang === 'es' ? 'Límite' : 'Borderline',
    high: lang === 'es' ? 'Alto' : 'High',
    low: lang === 'es' ? 'Bajo' : 'Low',
  }[s] ?? s);
  const displayName = knowledge?.simpleName?.[lang as 'en' | 'es'] ?? b.name;

  return (
    <TouchableOpacity
      style={[styles.trendRow, { backgroundColor: bg, borderColor: color + '30' }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[styles.trendIcon, { backgroundColor: color + '20' }]}>
        <Icon size={16} color={color} />
      </View>
      <View style={styles.trendInfo}>
        <Text style={styles.trendName}>{displayName}</Text>
        <Text style={[styles.trendChange, { color }]}>
          {statusLabel(prev.status)} → {statusLabel(b.status)}
        </Text>
      </View>
      <View style={styles.trendRight}>
        <Text style={[styles.trendValue, { color }]}>{b.value} {b.unit}</Text>
        <ChevronRight size={14} color={Colors.outline} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Doctor Question Card ─────────────────────────────────────────────────────

const DOCTOR_ICONS: Record<string, any> = {
  glucose: Droplets,
  cholesterol: Heart,
  ldl: Heart,
  hdl: Heart,
  triglycerides: Flame,
  default: Stethoscope,
};

function getDoctorIcon(markerName: string) {
  const lower = markerName.toLowerCase();
  for (const [key, icon] of Object.entries(DOCTOR_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return DOCTOR_ICONS.default;
}

function DoctorQuestionCard({ question, marker, lang }: {
  question: string; marker: string; lang: string;
}) {
  const [shared, setShared] = useState(false);
  const Icon = getDoctorIcon(marker);

  const handleShare = async () => {
    try {
      await Share.share({ message: question });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {}
  };

  return (
    <View style={styles.doctorCard}>
      <View style={styles.doctorCardHeader}>
        <View style={styles.doctorIconWrap}>
          <Icon size={16} color={Colors.primary} />
        </View>
        <View style={styles.doctorMarkerChip}>
          <Text style={styles.doctorMarkerText}>{marker}</Text>
        </View>
      </View>
      <Text style={styles.doctorQuestion}>❝ {question} ❞</Text>
      <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.7}>
        {shared
          ? <CheckCheck size={14} color={Colors.optimal} />
          : <Share2 size={14} color={Colors.primary} />}
        <Text style={[styles.shareBtnText, { color: shared ? Colors.optimal : Colors.primary }]}>
          {shared
            ? (lang === 'es' ? '¡Compartido!' : 'Shared!')
            : (lang === 'es' ? 'Compartir' : 'Share with doctor')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Action Card (what to eat / do per marker) ───────────────────────────────

function ActionCard({ biomarker, language, t }: {
  biomarker: Biomarker; language: string; t: ReturnType<typeof useT>;
}) {
  const knowledge = getBiomarkerKnowledge(biomarker.name);
  const displayName = knowledge?.simpleName?.[language as 'en' | 'es'] ?? biomarker.name;
  const foodsToEat = knowledge?.foodsToEat?.[language as 'en' | 'es'];
  const foodsToAvoid = knowledge?.foodsToAvoid?.[language as 'en' | 'es'];
  const router = useRouter();

  if (!foodsToEat && !foodsToAvoid) return null;

  const color = biomarker.status === 'borderline' ? Colors.borderline : Colors.attention;
  const statusLabel = {
    borderline: language === 'es' ? 'Límite' : 'Borderline',
    high: language === 'es' ? 'Alto' : 'High',
    low: language === 'es' ? 'Bajo' : 'Low',
  }[biomarker.status] ?? '';

  return (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={() => router.push(`/biomarker/${encodeURIComponent(biomarker.name)}` as any)}
      activeOpacity={0.88}
    >
      {/* Header */}
      <View style={styles.actionCardHeader}>
        <Text style={styles.actionMarkerName}>{knowledge?.emoji ?? '🔬'} {displayName}</Text>
        <View style={[styles.actionBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.actionBadgeText, { color }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Value bar */}
      <View style={styles.actionValueRow}>
        <Text style={[styles.actionValue, { color }]}>
          {biomarker.value} {biomarker.unit}
        </Text>
        {biomarker.referenceRange && (
          <Text style={styles.actionRef}>
            {language === 'es' ? 'Ref: ' : 'Ref: '}{biomarker.referenceRange} {biomarker.unit}
          </Text>
        )}
      </View>

      {/* Foods to eat */}
      {foodsToEat && (
        <View style={styles.actionRow}>
          <View style={[styles.actionIconWrap, { backgroundColor: Colors.optimal10 }]}>
            <Leaf size={14} color={Colors.optimal} />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={[styles.actionLabel, { color: Colors.optimal }]}>{t('eatMore')}</Text>
            <Text style={styles.actionBody}>{foodsToEat}</Text>
          </View>
        </View>
      )}

      {/* Foods to avoid */}
      {foodsToAvoid && (
        <View style={styles.actionRow}>
          <View style={[styles.actionIconWrap, { backgroundColor: Colors.attention10 }]}>
            <Text style={styles.actionReduceEmoji}>🚫</Text>
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={[styles.actionLabel, { color: Colors.attention }]}>{t('reduceIntake')}</Text>
            <Text style={styles.actionBody}>{foodsToAvoid}</Text>
          </View>
        </View>
      )}

      {/* Exercise nudge */}
      <View style={styles.actionRow}>
        <View style={[styles.actionIconWrap, { backgroundColor: Colors.primary10 }]}>
          <Dumbbell size={14} color={Colors.primary} />
        </View>
        <View style={styles.actionTextWrap}>
          <Text style={[styles.actionLabel, { color: Colors.primary }]}>{t('doThis')}</Text>
          <Text style={styles.actionBody}>{t('recExerciseBody')}</Text>
        </View>
      </View>

      <Text style={styles.actionTapHint}>
        {language === 'es' ? 'Toca para más detalles →' : 'Tap for full details →'}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Mini ring ────────────────────────────────────────────────────────────────

function MiniRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size / 2) - 7;
  const c = 2 * Math.PI * r;
  const filled = c - (score / 100) * c;
  const cx = size / 2;
  const color = scoreColor(score);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={cx} cy={cx} r={r} stroke={Colors.surfaceHigh} strokeWidth={7} fill="none"
          transform={`rotate(-90 ${cx} ${cx})`} />
        <Circle cx={cx} cy={cx} r={r} stroke={color} strokeWidth={7}
          strokeDasharray={`${c}`} strokeDashoffset={filled}
          strokeLinecap="round" fill="none"
          transform={`rotate(-90 ${cx} ${cx})`} />
      </Svg>
      <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.foreground, fontFamily: Typography.families.display }}>
        {score}
      </Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function TrendsScreen() {
  const router = useRouter();
  const t = useT();
  const sessions = useStore((s) => s.sessions);
  const language = useStore((s) => s.language);
  const hasSessions = sessions.length > 0;

  const latest = sessions[0];
  const previous = sessions[1];

  const deltas = hasSessions && previous
    ? computeDeltas(latest.biomarkers, previous.biomarkers)
    : [];
  const improving = deltas.filter(d => d.improved);
  const worsening = deltas.filter(d => d.worsened);

  const delta = hasSessions && previous
    ? latest.healthScore - previous.healthScore
    : null;
  const TrendIcon = delta === null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor = delta === null ? Colors.outline : delta > 0 ? Colors.optimal : delta < 0 ? Colors.attention : Colors.outline;

  // Out-of-range markers for action cards
  const outOfRange = hasSessions
    ? latest.biomarkers.filter(b => b.status !== 'normal')
    : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title={t('trendsTitle')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {!hasSessions ? (
          <View style={styles.emptyState}>
            <TrendingUp size={52} color={Colors.primary} style={{ marginBottom: 20 }} />
            <Text style={styles.emptyTitle}>{t('noDataYet')}</Text>
            <Text style={styles.emptySub}>{t('noDataSub')}</Text>
          </View>
        ) : (
          <>
            {/* ── Score history graph ── */}
            <ScoreGraph sessions={sessions} language={language} t={t} />

            {/* ── Score improved celebration banner ── */}
            {delta !== null && delta > 0 && (
              <View style={styles.celebrationBanner}>
                <Text style={styles.celebrationTitle}>{t('scoreImproved')}</Text>
                <Text style={styles.celebrationSub}>{t('scoreImprovedBy', { n: delta })}</Text>
              </View>
            )}

            {/* ── Current score card ── */}
            <View style={[styles.scoreCard, { borderLeftColor: scoreColor(latest.healthScore) }]}>
              <View style={styles.scoreCardLeft}>
                <Text style={styles.scoreCardLabel}>{t('currentScore').toUpperCase()}</Text>
                <Text style={[styles.scoreCardValue, { color: Colors.primary }]}>{latest.healthScore}</Text>
                <View style={styles.trendTag}>
                  <TrendIcon size={13} color={trendColor} />
                  <Text style={[styles.trendTagText, { color: trendColor }]}>
                    {delta !== null
                      ? `${delta > 0 ? '+' : ''}${delta} ${t('vsLastTest')}`
                      : t('onlyOneTest')}
                  </Text>
                </View>
              </View>
              <MiniRing score={latest.healthScore} size={80} />
            </View>

            {/* ── Getting better ── */}
            {improving.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('improvingSection')}</Text>
                {improving.map(d => (
                  <TrendRow
                    key={d.b.name} delta={d} lang={language}
                    onPress={() => router.push(`/biomarker/${encodeURIComponent(d.b.name)}` as any)}
                  />
                ))}
              </View>
            )}

            {/* ── Needs attention ── */}
            {worsening.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('decliningSection')}</Text>
                {worsening.map(d => (
                  <TrendRow
                    key={d.b.name} delta={d} lang={language}
                    onPress={() => router.push(`/biomarker/${encodeURIComponent(d.b.name)}` as any)}
                  />
                ))}
              </View>
            )}

            {/* ── Only one test prompt ── */}
            {!previous && (
              <View style={styles.onlyOneCard}>
                <TrendingUp size={20} color={Colors.primary} />
                <Text style={styles.onlyOneText}>{t('onlyOneTest')}</Text>
              </View>
            )}

            {/* ── Doctor Questions ── */}
            {(() => {
              const questions = generateDoctorQuestions(latest.biomarkers);
              if (questions.length === 0) return null;
              return (
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Stethoscope size={20} color={Colors.primary} />
                    <View>
                      <Text style={styles.sectionTitle}>{t('doctorQuestions')}</Text>
                      <Text style={styles.sectionSub}>{t('doctorQuestionsSubtitle')}</Text>
                    </View>
                  </View>
                  {questions.map((q, i) => (
                    <DoctorQuestionCard
                      key={i}
                      question={q.question[language as 'en' | 'es']}
                      marker={q.marker}
                      lang={language}
                    />
                  ))}
                </View>
              );
            })()}

            {/* ── ACTIONS ── */}
            {outOfRange.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Dumbbell size={20} color={Colors.primary} />
                  <View>
                    <Text style={styles.sectionTitle}>{t('actionsTitle')}</Text>
                    <Text style={styles.sectionSub}>{t('actionsSub')}</Text>
                  </View>
                </View>
                {outOfRange.slice(0, 4).map(b => (
                  <ActionCard key={b.name} biomarker={b} language={language} t={t} />
                ))}
                {outOfRange.length === 0 && (
                  <Text style={styles.noActionsText}>{t('noActionsYet')}</Text>
                )}
              </View>
            )}

            {/* ── Test history ── */}
            {sessions.length > 1 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {language === 'es' ? '🗂 Historial' : '🗂 History'}
                </Text>
                {sessions.map((s, i) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.historyRow}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/test/${s.id}` as any)}
                  >
                    <View style={[styles.historyScore, { backgroundColor: scoreColor(s.healthScore) + '15' }]}>
                      <Text style={[styles.historyScoreText, { color: scoreColor(s.healthScore) }]}>
                        {s.healthScore}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyLabel}>{s.label}</Text>
                      <Text style={styles.historyMeta}>
                        {formatDate(s.date, language)} · {s.biomarkers.length} {t('markers').toLowerCase()}
                      </Text>
                    </View>
                    {i === 0 && (
                      <View style={styles.latestBadge}>
                        <Text style={styles.latestBadgeText}>
                          {language === 'es' ? 'Último' : 'Latest'}
                        </Text>
                      </View>
                    )}
                    <ChevronRight size={16} color={Colors.outline} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
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

  // Score celebration
  celebrationBanner: {
    backgroundColor: Colors.optimal10,
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.optimal + '40',
    alignItems: 'center',
  },
  celebrationTitle: {
    fontFamily: Typography.families.display,
    fontSize: 18, fontWeight: '800', color: Colors.optimal, marginBottom: 2,
  },
  celebrationSub: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.foreground,
  },

  // Graph
  graphCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  graphTitleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  graphTitle: {
    fontFamily: Typography.families.display,
    fontSize: 15, fontWeight: '800', color: Colors.foreground,
  },
  projLegend: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  projDash: {
    width: 18, height: 2, borderRadius: 1,
    borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.primary, opacity: 0.5,
  },
  projLegendText: {
    fontFamily: Typography.families.body,
    fontSize: 10, color: Colors.mutedForeground,
  },
  dateRow: { flexDirection: 'row', height: 20, position: 'relative', marginTop: 2 },
  dateLabel: {
    position: 'absolute',
    fontFamily: Typography.families.body,
    fontSize: 9, color: Colors.outline, width: 32, textAlign: 'center',
  },
  dateLabelProj: { color: Colors.primary, opacity: 0.6 },
  nextTestBanner: {
    marginTop: 10, backgroundColor: Colors.primary10, borderRadius: 10,
    padding: 8, alignItems: 'center',
  },
  nextTestText: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.primary, fontWeight: '600',
  },

  // Score card
  scoreCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderLeftWidth: 4, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  scoreCardLeft: { flex: 1 },
  scoreCardLabel: {
    fontFamily: Typography.families.body,
    fontSize: 10, fontWeight: '700', color: Colors.secondary,
    letterSpacing: 1, marginBottom: 4,
  },
  scoreCardValue: {
    fontFamily: Typography.families.display,
    fontSize: 48, fontWeight: '900', letterSpacing: -2, lineHeight: 52,
  },
  trendTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  trendTagText: { fontFamily: Typography.families.body, fontSize: 12, fontWeight: '600' },

  // Sections
  section: { marginBottom: 28 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  sectionTitle: {
    fontFamily: Typography.families.display,
    fontSize: 18, fontWeight: '800', color: Colors.foreground,
    letterSpacing: -0.3, marginBottom: 4,
  },
  sectionSub: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.mutedForeground, marginBottom: 0,
  },

  // Trend row
  trendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8,
  },
  trendIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  trendInfo: { flex: 1 },
  trendName: { fontFamily: Typography.families.body, fontSize: 14, fontWeight: '600', color: Colors.foreground, marginBottom: 2 },
  trendChange: { fontFamily: Typography.families.body, fontSize: 11, fontWeight: '600' },
  trendRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trendValue: { fontFamily: Typography.families.body, fontSize: 13, fontWeight: '700' },

  // Doctor cards
  doctorCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 10,
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  doctorCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10,
  },
  doctorIconWrap: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: Colors.primary10,
    alignItems: 'center', justifyContent: 'center',
  },
  doctorMarkerChip: {
    backgroundColor: Colors.primary10, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  doctorMarkerText: {
    fontFamily: Typography.families.body,
    fontSize: 11, fontWeight: '700', color: Colors.primary,
  },
  doctorQuestion: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.foreground, lineHeight: 21,
    fontStyle: 'italic', marginBottom: 12,
  },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end' },
  shareBtnText: { fontFamily: Typography.families.body, fontSize: 12, fontWeight: '700' },

  // Action cards
  actionCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  actionCardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6,
  },
  actionMarkerName: {
    fontFamily: Typography.families.display,
    fontSize: 16, fontWeight: '800', color: Colors.foreground,
  },
  actionBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  actionBadgeText: {
    fontFamily: Typography.families.body,
    fontSize: 10, fontWeight: '700',
  },
  actionValueRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingBottom: 12, marginBottom: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  actionValue: {
    fontFamily: Typography.families.display,
    fontSize: 22, fontWeight: '800',
  },
  actionRef: {
    fontFamily: Typography.families.body,
    fontSize: 11, color: Colors.outline,
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 10,
  },
  actionIconWrap: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  actionReduceEmoji: { fontSize: 14 },
  actionTextWrap: { flex: 1 },
  actionLabel: {
    fontFamily: Typography.families.body,
    fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2,
  },
  actionBody: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.foreground, lineHeight: 18,
  },
  actionTapHint: {
    fontFamily: Typography.families.body,
    fontSize: 10, color: Colors.outline, textAlign: 'right', marginTop: 10,
  },
  noActionsText: {
    fontFamily: Typography.families.body,
    fontSize: 14, color: Colors.mutedForeground, textAlign: 'center', padding: 20,
  },

  // History
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  historyScore: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  historyScoreText: { fontFamily: Typography.families.display, fontSize: 18, fontWeight: '800' },
  historyLabel: { fontFamily: Typography.families.body, fontSize: 14, fontWeight: '600', color: Colors.foreground, marginBottom: 2 },
  historyMeta: { fontFamily: Typography.families.body, fontSize: 12, color: Colors.mutedForeground },
  latestBadge: { backgroundColor: Colors.primary10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  latestBadgeText: { fontFamily: Typography.families.body, fontSize: 10, fontWeight: '700', color: Colors.primary },

  onlyOneCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primary10, borderRadius: 14,
    padding: 14, marginBottom: 24,
  },
  onlyOneText: { fontFamily: Typography.families.body, fontSize: 13, color: Colors.primary, flex: 1, lineHeight: 18 },

  emptyState: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 24 },
  emptyTitle: { fontFamily: Typography.families.display, fontSize: 22, fontWeight: '700', color: Colors.foreground, marginBottom: 12 },
  emptySub: { fontFamily: Typography.families.body, fontSize: 15, color: Colors.mutedForeground, textAlign: 'center', lineHeight: 24 },
});
