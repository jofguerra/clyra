import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Share,
  Dimensions, NativeSyntheticEvent, NativeScrollEvent, LayoutAnimation, Image,
} from 'react-native';
import Svg, { Circle, Polyline, Line, Polygon } from 'react-native-svg';
import {
  TrendingUp, TrendingDown, Minus,
  ChevronRight, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Stethoscope, Share2,
  CheckCheck, Droplets, Flame, Heart,
  Trophy, Pencil, Check, Plus,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import XPBar from '../../components/ui/XPBar';
import Mascot from '../../components/Mascot';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore, HealthGoal } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import { Biomarker } from '../../services/openai';
import { getBiomarkerKnowledge } from '../../constants/biomarkerKnowledge';
import { generateDoctorQuestions, simulateImprovement } from '../../constants/healthMetrics';
import { parseBiomarkerNumber } from '../../constants/valueParsing';
import { ACHIEVEMENTS, getScoreLevel } from '../../constants/gamification';
import { GOALS } from '../../constants/healthGoals';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 40; // full width minus padding

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

// ─── Page Indicator Dots ─────────────────────────────────────────────────────

function PageDots({ count, active }: { count: number; active: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === active && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

// ─── Horizontal paged ScrollView wrapper ─────────────────────────────────────

function PagedCards({ children, cardCount }: { children: React.ReactNode; cardCount: number }) {
  const [activePage, setActivePage] = useState(0);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
    setActivePage(Math.max(0, Math.min(page, cardCount - 1)));
  }, [cardCount]);

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + 12}
        decelerationRate="fast"
        contentContainerStyle={{ gap: 12 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
      {cardCount > 1 && <PageDots count={cardCount} active={activePage} />}
    </View>
  );
}

// ─── Score history graph (SVG) ────────────────────────────────────────────────

function ScoreGraph({ sessions, language, t }: {
  sessions: { healthScore: number; date: string }[];
  language: string;
  t: ReturnType<typeof useT>;
}) {
  // ─── With only 1 exam, show a friendly "trends unlock soon" card ─────────
  // A real line chart with a single dot + projection looks broken.
  if (sessions.length < 2) {
    const latest = sessions[0];
    const score = latest.healthScore;
    return (
      <View style={[styles.graphCard, { alignItems: 'center', paddingVertical: 24 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <View style={{
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: scoreColor(score) + '18',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{
              fontFamily: Typography.families.display,
              fontSize: 22, fontWeight: '900', color: scoreColor(score),
            }}>{score}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.graphTitle}>
              {language === 'es' ? 'Tu primer puntaje' : 'Your first score'}
            </Text>
            <Text style={{
              fontFamily: Typography.families.body,
              fontSize: 12, color: Colors.mutedForeground, marginTop: 2,
            }}>
              {formatDate(latest.date, language)}
            </Text>
          </View>
        </View>
        <View style={styles.nextTestBanner}>
          <Text style={styles.nextTestText}>
            {language === 'es'
              ? '📈 Sube otro examen para ver tendencias'
              : '📈 Upload another exam to see trends'}
          </Text>
        </View>
      </View>
    );
  }

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

// ─── Sparkline mini-charts grid ──────────────────────────────────────────────

function getBiomarkerHistory(
  sessions: { biomarkers: Biomarker[]; date: string }[],
  biomarkerName: string,
): { value: number; date: string }[] {
  const result: { value: number; date: string }[] = [];
  for (let i = sessions.length - 1; i >= 0; i--) {
    const s = sessions[i];
    const match = s.biomarkers.find(
      (b) => b.name.toLowerCase() === biomarkerName.toLowerCase(),
    );
    if (match) {
      const num = parseBiomarkerNumber(match.value);
      if (!isNaN(num)) result.push({ value: num, date: s.date });
    }
  }
  return result;
}

const SPARK_CARD_W = (SCREEN_W - 40 - 8) / 2;

function SparklineCard({ name, history, unit, status, language }: {
  name: string;
  history: { value: number; date: string }[];
  unit: string;
  status: string;
  language: string;
}) {
  const knowledge = getBiomarkerKnowledge(name);
  const displayName = knowledge?.simpleName?.[language as 'en' | 'es'] ?? name;
  const color =
    status === 'normal' ? Colors.optimal
    : status === 'borderline' ? Colors.borderline
    : Colors.attention;

  const W = 140, H = 50;
  const PAD = 6;
  const gW = W - PAD * 2;
  const gH = H - PAD * 2;

  const vals = history.map((h) => h.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const points = history
    .map((h, i) => {
      const x = PAD + (history.length > 1 ? (i / (history.length - 1)) * gW : gW / 2);
      const y = PAD + gH - ((h.value - minV) / range) * gH;
      return `${x},${y}`;
    })
    .join(' ');

  const current = history[history.length - 1];

  return (
    <View style={styles.sparkCard}>
      <Text style={styles.sparkName} numberOfLines={1}>{displayName}</Text>
      {history.length > 1 ? (
        <Svg width={W} height={H}>
          <Polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Current value dot */}
          <Circle
            cx={PAD + gW}
            cy={PAD + gH - ((current.value - minV) / range) * gH}
            r={3}
            fill={color}
          />
        </Svg>
      ) : (
        <Svg width={W} height={H}>
          <Circle cx={W / 2} cy={H / 2} r={3} fill={color} />
        </Svg>
      )}
      <View style={styles.sparkDateRow}>
        {history.length > 1 && (
          <>
            <Text style={styles.sparkDateLabel}>{formatShort(history[0].date, language)}</Text>
            <Text style={styles.sparkDateLabel}>{formatShort(history[history.length - 1].date, language)}</Text>
          </>
        )}
      </View>
      <View style={styles.sparkValueRow}>
        <View style={[styles.sparkDot, { backgroundColor: color }]} />
        <Text style={[styles.sparkValue, { color }]}>
          {current.value} {unit}
        </Text>
      </View>
    </View>
  );
}

function SparklineGrid({ sessions, language }: {
  sessions: { biomarkers: Biomarker[]; date: string }[];
  language: string;
}) {
  // Sparklines only make sense with 2+ data points. With 1, we'd just show
  // a dot which looks broken. Hide entirely until there's real trend data.
  if (sessions.length < 2) return null;

  // Collect latest biomarkers with their history count
  const latest = sessions[0];
  const candidates = latest.biomarkers
    .map((b) => {
      const hist = getBiomarkerHistory(sessions, b.name);
      const priority =
        b.status === 'high' || b.status === 'low' ? 3
        : b.status === 'borderline' ? 2
        : 1;
      return { b, hist, priority };
    })
    // Only keep biomarkers that have at least 2 data points — real trends
    .filter((c) => c.hist.length >= 2);

  candidates.sort((a, c) => c.priority - a.priority || c.hist.length - a.hist.length);

  const top4 = candidates.slice(0, 4);
  if (top4.length === 0) return null;

  return (
    <View style={styles.sparkGrid}>
      {top4.map((c) => (
        <SparklineCard
          key={c.b.name}
          name={c.b.name}
          history={c.hist}
          unit={c.b.unit}
          status={c.b.status}
          language={language}
        />
      ))}
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

// ─── Doctor Question Card (full-width paged) ─────────────────────────────────

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
    <View style={[styles.doctorCard, { width: CARD_W }]}>
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

// ─── Hexagonal Badge Frame ───────────────────────────────────────────────────

const HEX_SIZE = 72;
const HEX_IMG = 52;

function hexPoints(size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;
  return Array.from({ length: 6 })
    .map((_, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 6; // flat-top hex
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(' ');
}

function HexBadge({ image, emoji, unlocked }: {
  image?: any; emoji: string; unlocked: boolean;
}) {
  const borderColor = unlocked ? Colors.primary : Colors.outlineVariant;
  const fillColor = unlocked ? '#fff' : Colors.surfaceLow;

  return (
    <View style={[styles.hexContainer, unlocked && styles.hexGlow]}>
      <Svg width={HEX_SIZE} height={HEX_SIZE} style={styles.hexSvg}>
        <Polygon
          points={hexPoints(HEX_SIZE)}
          fill={fillColor}
          stroke={borderColor}
          strokeWidth={2}
        />
      </Svg>
      <View style={[styles.hexContent, !unlocked && { opacity: 0.3 }]}>
        {image ? (
          <Image source={image} style={styles.hexImage} resizeMode="contain" />
        ) : (
          <Text style={styles.hexEmoji}>{unlocked ? emoji : '🔒'}</Text>
        )}
      </View>
    </View>
  );
}

// ─── Expandable Hitos/Badges Section ─────────────────────────────────────────

const BADGE_IMAGES: Record<string, any> = {
  first_exam: require('../../assets/badges/first_exam.png'),
  trend_unlocked: require('../../assets/badges/trend_unlocked.png'),
  heart_green: require('../../assets/badges/heart_green.png'),
  kidneys_green: require('../../assets/badges/kidneys_green.png'),
  five_improved: require('../../assets/badges/five_improved.png'),
  full_profile: require('../../assets/badges/full_profile.png'),
  three_checkups: require('../../assets/badges/three_checkups.png'),
  bio_age_reduced: require('../../assets/badges/bio_age_reduced.png'),
  metabolic_reboot: require('../../assets/badges/metabolic_reboot.png'),
  coverage_50: require('../../assets/badges/coverage_50.png'),
  coverage_80: require('../../assets/badges/coverage_80.png'),
  elite_score: require('../../assets/badges/elite_score.png'),
};

function HitosSection({ achievements, language }: {
  achievements: string[]; language: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const unlockedAchievements = ACHIEVEMENTS.filter(a => achievements.includes(a.id));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !achievements.includes(a.id));
  const allBadges = [...unlockedAchievements, ...lockedAchievements];
  const displayBadges = expanded ? allBadges : allBadges.slice(0, 4);

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.achHeader}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Trophy size={18} color={Colors.gold} />
        <Text style={styles.sectionTitle}>{language === 'es' ? 'Hitos' : 'Milestones'}</Text>
        <Text style={styles.achCount}>
          {achievements.length}/{ACHIEVEMENTS.length}
        </Text>
        {expanded
          ? <ChevronUp size={18} color={Colors.outline} />
          : <ChevronDown size={18} color={Colors.outline} />}
      </TouchableOpacity>

      <View style={styles.badgeGrid}>
        {displayBadges.map(a => {
          const unlocked = achievements.includes(a.id);
          const badgeImage = BADGE_IMAGES[a.id];
          return (
            <View key={a.id} style={styles.badgeItem}>
              <HexBadge
                image={unlocked ? badgeImage : undefined}
                emoji={a.icon}
                unlocked={unlocked}
              />
              <Text
                style={[styles.badgeName, { color: unlocked ? Colors.foreground : Colors.outline }]}
                numberOfLines={2}
              >
                {a.name[language as 'en' | 'es']}
              </Text>
              {unlocked && (
                <Text style={styles.badgeUnlockedLabel}>
                  {language === 'es' ? '✓ Logrado' : '✓ Unlocked'}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {!expanded && allBadges.length > 4 && (
        <TouchableOpacity onPress={toggleExpand} style={styles.showMoreBtn} activeOpacity={0.7}>
          <Text style={styles.showMoreText}>
            {language === 'es'
              ? `Ver todos (${allBadges.length - 4} más)`
              : `Show all (${allBadges.length - 4} more)`}
          </Text>
          <ChevronDown size={14} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Health Plan section ─────────────────────────────────────────────────────

function HealthPlanSection({ t, language }: {
  t: ReturnType<typeof useT>; language: string;
}) {
  const healthGoals = useStore((s) => s.healthGoals);
  const setHealthGoals = useStore((s) => s.setHealthGoals);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Set<HealthGoal>>(new Set());

  const startEdit = () => {
    setDraft(new Set(healthGoals));
    setEditing(true);
  };

  const toggleGoal = (id: HealthGoal) => {
    const next = new Set(draft);
    if (next.has(id)) next.delete(id); else next.add(id);
    setDraft(next);
  };

  const save = () => {
    setHealthGoals(Array.from(draft));
    setEditing(false);
  };

  // No goals set — prompt
  if (healthGoals.length === 0 && !editing) {
    return (
      <View style={hpStyles.promptCard}>
        <Text style={hpStyles.promptText}>{t('setGoalsPrompt')}</Text>
        <TouchableOpacity style={hpStyles.addBtn} onPress={startEdit} activeOpacity={0.7}>
          <Plus size={16} color={Colors.primaryForeground} />
          <Text style={hpStyles.addBtnText}>{t('editGoals')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={hpStyles.container}>
      {/* Header */}
      <View style={hpStyles.header}>
        <Text style={hpStyles.title}>{t('yourHealthPlan')}</Text>
        {!editing ? (
          <TouchableOpacity onPress={startEdit} style={hpStyles.editBtn} activeOpacity={0.7}>
            <Pencil size={14} color={Colors.primary} />
            <Text style={hpStyles.editBtnText}>{t('editGoals')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={save} style={hpStyles.saveBtn} activeOpacity={0.7}>
            <Check size={14} color={Colors.primaryForeground} />
            <Text style={hpStyles.saveBtnText}>{t('saveGoals')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* View mode — pills */}
      {!editing && (
        <View style={hpStyles.pillRow}>
          {healthGoals.map((gId) => {
            const goal = GOALS.find((g) => g.id === gId);
            if (!goal) return null;
            return (
              <View key={gId} style={hpStyles.pill}>
                <Text style={hpStyles.pillEmoji}>{goal.emoji}</Text>
                <Text style={hpStyles.pillLabel}>{t(goal.labelKey)}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Edit mode — mini grid */}
      {editing && (
        <View style={hpStyles.grid}>
          {GOALS.map((goal) => {
            const selected = draft.has(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[hpStyles.gridItem, selected && hpStyles.gridItemSelected]}
                activeOpacity={0.7}
                onPress={() => toggleGoal(goal.id)}
              >
                <Text style={hpStyles.gridEmoji}>{goal.emoji}</Text>
                <Text style={[hpStyles.gridLabel, selected && hpStyles.gridLabelSelected]}>
                  {t(goal.labelKey)}
                </Text>
                {selected && (
                  <View style={hpStyles.gridCheck}>
                    <Check size={10} color={Colors.primaryForeground} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const hpStyles = StyleSheet.create({
  container: { marginBottom: 20 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  title: {
    fontFamily: Typography.families.display,
    fontSize: 18, fontWeight: '800', color: Colors.foreground, letterSpacing: -0.3,
  },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    backgroundColor: Colors.primary10,
  },
  editBtnText: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '700', color: Colors.primary,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  saveBtnText: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '700', color: Colors.primaryForeground,
  },
  pillRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary10, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.primary + '25',
  },
  pillEmoji: { fontSize: 16 },
  pillLabel: {
    fontFamily: Typography.families.body,
    fontSize: 13, fontWeight: '600', color: Colors.primary,
  },
  // Edit grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  gridItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surface, borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  gridItemSelected: {
    backgroundColor: Colors.primary10,
    borderColor: Colors.primary,
  },
  gridEmoji: { fontSize: 16 },
  gridLabel: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '600', color: Colors.foreground,
  },
  gridLabelSelected: { color: Colors.primary },
  gridCheck: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  // Prompt (no goals)
  promptCard: {
    backgroundColor: Colors.surface, borderRadius: 18, padding: 20, marginBottom: 20,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.primary + '15',
  },
  promptText: {
    fontFamily: Typography.families.body,
    fontSize: 14, color: Colors.mutedForeground, textAlign: 'center',
    lineHeight: 21, marginBottom: 14,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  addBtnText: {
    fontFamily: Typography.families.body,
    fontSize: 13, fontWeight: '700', color: Colors.primaryForeground,
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function TrendsScreen() {
  const router = useRouter();
  const t = useT();
  const sessions = useStore((s) => s.sessions);
  const language = useStore((s) => s.language);
  const userAge = useStore((s) => s.age);
  const achievements = useStore((s) => s.achievements);
  const healthScore = useStore((s) => s.healthScore);
  const biomarkers = useStore((s) => s.biomarkers);
  const hasSessions = sessions.length > 0;

  const latest = sessions[0];
  const previous = sessions[1];

  const deltas = hasSessions && previous
    ? computeDeltas(latest.biomarkers, previous.biomarkers)
    : [];
  const improving = deltas.filter(d => d.improved);

  // Overall score delta vs previous session
  const delta = hasSessions && previous
    ? healthScore - previous.healthScore
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Page header (matches reference) ── */}
        <View style={styles.trendsHeader}>
          <Text style={styles.trendsTitle}>
            {language === 'es' ? 'Tendencias \uD83D\uDCC8' : 'Trends \uD83D\uDCC8'}
          </Text>
          <Text style={styles.trendsSub}>
            {language === 'es' ? 'Como esta cambiando tu salud' : 'How your health is changing'}
          </Text>
        </View>

        {!hasSessions ? (
          <View style={styles.emptyState}>
            <Mascot pose="thinking" size={140} animation="thinking-tilt" />
            <Text style={[styles.emptyTitle, { marginTop: 20 }]}>{t('noDataYet')}</Text>
            <Text style={styles.emptySub}>{t('noDataSub')}</Text>
          </View>
        ) : (
          <>
            {/* ── Score history graph ── */}
            <ScoreGraph sessions={sessions} language={language} t={t} />

            {/* ── Score improved celebration banner ── */}
            {delta !== null && delta > 0 && (
              <View style={styles.celebrationBanner}>
                <Text style={styles.celebrationEmoji}>{'\uD83C\uDF89'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.celebrationTitle}>
                    {language === 'es' ? '\u00a1Tu puntaje mejoro!' : 'Score improved!'}
                  </Text>
                  <Text style={styles.celebrationSub}>
                    +{delta} {language === 'es' ? 'puntos desde el ultimo examen' : 'points since last test'}
                  </Text>
                </View>
              </View>
            )}

            {/* ── Biomarker trends — 2x2 sparkline grid (only when 2+ sessions) ── */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.bioTrendsTitle}>
                {language === 'es' ? 'Tendencias de marcadores' : 'Biomarker trends'}
              </Text>
            </View>
            <SparklineGrid sessions={sessions} language={language} />

            {/* ── Getting better (positive framing, matches reference) ── */}
            {improving.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {'\uD83D\uDCC8 '}{language === 'es' ? 'Mejorando' : 'Improving'}
                </Text>
                {improving.map(d => (
                  <TrendRow
                    key={d.b.name} delta={d} lang={language}
                    onPress={() => router.push(`/biomarker/${encodeURIComponent(d.b.name)}` as any)}
                  />
                ))}
              </View>
            )}

            {/* ── Improvement Simulation ── */}
            {(() => {
              const oor = biomarkers.filter(b => b.status !== 'normal');
              if (oor.length === 0) return null;
              const topMarkers = oor.slice(0, 3);
              const markerNames = topMarkers.map(b => b.name);
              const age = parseInt(userAge) || 40;
              const sim = simulateImprovement(biomarkers, markerNames, age);
              if (sim.scoreDelta <= 0) return null;

              return (
                <View style={styles.simCard}>
                  <Text style={styles.simTitle}>
                    {'\u2728 '}{language === 'es' ? '\u00bfY SI...?' : 'WHAT IF?'}
                  </Text>
                  <Text style={styles.simBody}>
                    {language === 'es'
                      ? `Si mejoras ${topMarkers.length} marcadores, tu puntaje podria subir de ${sim.currentScore} a ${sim.projectedScore} (+${sim.scoreDelta})`
                      : `If you improve ${topMarkers.length} markers, your score could go from ${sim.currentScore} to ${sim.projectedScore} (+${sim.scoreDelta})`}
                  </Text>
                  <View style={styles.simRings}>
                    <View style={styles.simRingWrap}>
                      <MiniRing score={sim.currentScore} size={70} />
                      <Text style={styles.simRingLabel}>
                        {language === 'es' ? 'Actual' : 'Current'}
                      </Text>
                    </View>
                    <View style={styles.simArrow}>
                      <ArrowUp size={20} color={Colors.optimal} style={{ transform: [{ rotate: '90deg' }] }} />
                    </View>
                    <View style={styles.simRingWrap}>
                      <MiniRing score={sim.projectedScore} size={70} />
                      <Text style={styles.simRingLabel}>
                        {language === 'es' ? 'Proyectado' : 'Projected'}
                      </Text>
                    </View>
                    <View style={[styles.simDeltaBadge, { backgroundColor: Colors.optimal10 }]}>
                      <Text style={[styles.simDeltaText, { color: Colors.optimal }]}>
                        +{sim.scoreDelta}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })()}

            {/* ── Doctor Questions — mascot in Doctor pose + paged cards ── */}
            {(() => {
              const questions = generateDoctorQuestions(biomarkers);
              if (questions.length === 0) return null;
              return (
                <View style={styles.section}>
                  <View style={styles.doctorHeaderRow}>
                    <Mascot pose="doctor" size={52} animation="idle-breath" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sectionTitle}>
                        {language === 'es' ? 'Pregunta a tu doctor' : 'Ask your doctor'}
                      </Text>
                      <Text style={styles.sectionSub}>
                        {language === 'es'
                          ? 'Preguntas sugeridas para tu proxima cita'
                          : 'Suggested questions for your next visit'}
                      </Text>
                    </View>
                  </View>
                  <PagedCards cardCount={questions.length}>
                    {questions.map((q, i) => (
                      <DoctorQuestionCard
                        key={i}
                        question={q.question[language as 'en' | 'es']}
                        marker={q.marker}
                        lang={language}
                      />
                    ))}
                  </PagedCards>
                </View>
              );
            })()}

            {/* ── Milestones (hex badges) ── */}
            <HitosSection achievements={achievements} language={language} />
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
  content: { padding: 20, paddingBottom: 130 },

  // ── Page header (reference style) ──
  trendsHeader: { marginBottom: 18 },
  trendsTitle: {
    fontFamily: Typography.families.display,
    fontSize: 28, fontWeight: '800', color: Colors.foreground,
    letterSpacing: -0.5,
  },
  trendsSub: {
    fontFamily: Typography.families.body,
    fontSize: 14, color: Colors.mutedForeground, marginTop: 4,
  },

  // ── Biomarker trends section header ──
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8, marginBottom: 12,
  },
  bioTrendsTitle: {
    fontFamily: Typography.families.display,
    fontSize: 20, fontWeight: '800', color: Colors.foreground,
    letterSpacing: -0.3,
  },

  // ── Doctor questions header with mascot ──
  doctorHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 14,
  },

  // Score celebration
  celebrationBanner: {
    backgroundColor: '#E4F7E8',
    borderRadius: 16, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.optimal + '40',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  celebrationEmoji: {
    fontSize: 28,
  },
  celebrationTitle: {
    fontFamily: Typography.families.display,
    fontSize: 16, fontWeight: '800', color: Colors.optimal, marginBottom: 2,
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

  // Biomarker breakdown
  breakdownRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap',
  },
  breakdownChip: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  breakdownChipText: {
    fontFamily: Typography.families.body, fontSize: 11, fontWeight: '700',
  },
  breakdownTotal: {
    fontFamily: Typography.families.body, fontSize: 11, color: Colors.mutedForeground,
  },

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

  // Doctor cards (full-width paged)
  doctorCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
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

  // Page dots
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, marginTop: 12,
  },
  dot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: Colors.outlineVariant,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 20, borderRadius: 4,
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

  // Improvement Simulation
  simCard: {
    backgroundColor: '#FCE6EE', borderRadius: 20, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: '#F3BFD1',
  },
  simTitle: {
    fontFamily: Typography.families.display,
    fontSize: 16, fontWeight: '800', color: '#C87EA0', marginBottom: 6,
    letterSpacing: 0.5,
  },
  simBody: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.mutedForeground, lineHeight: 19, marginBottom: 16,
  },
  simRings: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  simRingWrap: { alignItems: 'center', gap: 6 },
  simRingLabel: {
    fontFamily: Typography.families.body,
    fontSize: 11, color: Colors.outline, fontWeight: '600',
  },
  simArrow: { paddingBottom: 20 },
  simDeltaBadge: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    position: 'absolute', right: 0, top: 0,
  },
  simDeltaText: {
    fontFamily: Typography.families.display,
    fontSize: 16, fontWeight: '900',
  },

  emptyState: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 24 },
  emptyTitle: { fontFamily: Typography.families.display, fontSize: 22, fontWeight: '700', color: Colors.foreground, marginBottom: 12 },
  emptySub: { fontFamily: Typography.families.body, fontSize: 15, color: Colors.mutedForeground, textAlign: 'center', lineHeight: 24 },

  // Badges / Hitos (expandable hex grid)
  achHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  achCount: {
    fontFamily: Typography.families.body, fontSize: 12, color: Colors.mutedForeground, marginLeft: 'auto',
  },
  badgeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
  },
  badgeItem: {
    width: (SCREEN_W - 40 - 30) / 4,
    alignItems: 'center',
    marginBottom: 4,
  },
  // Hex badge
  hexContainer: {
    width: HEX_SIZE, height: HEX_SIZE,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 5,
  },
  hexGlow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  hexSvg: {
    position: 'absolute',
  },
  hexContent: {
    alignItems: 'center', justifyContent: 'center',
  },
  hexImage: {
    width: HEX_IMG, height: HEX_IMG, borderRadius: 6,
  },
  hexEmoji: {
    fontSize: 26,
  },
  badgeName: {
    fontFamily: Typography.families.body,
    fontSize: 10, fontWeight: '600', textAlign: 'center',
    lineHeight: 13,
  },
  badgeUnlockedLabel: {
    fontFamily: Typography.families.body,
    fontSize: 9, fontWeight: '700', color: Colors.optimal,
    marginTop: 2,
  },
  showMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, marginTop: 14, paddingVertical: 8,
  },
  showMoreText: {
    fontFamily: Typography.families.body,
    fontSize: 13, fontWeight: '700', color: Colors.primary,
  },

  // Gamification stats
  gamifHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  gamifStatsRow: { flexDirection: 'row', gap: 8 },
  gamifStatBox: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  gamifStatNum: {
    fontFamily: Typography.families.display,
    fontSize: 16, fontWeight: '800', color: Colors.primary, marginBottom: 2,
  },
  gamifStatLabel: {
    fontFamily: Typography.families.body,
    fontSize: 10, color: Colors.mutedForeground, textAlign: 'center',
  },

  // ─── Sparkline grid ──────────────────────────────────────
  sparkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  sparkCard: {
    width: (SCREEN_W - 40 - 8) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sparkName: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.foreground,
    marginBottom: 4,
  },
  sparkValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  sparkValue: {
    fontFamily: Typography.families.body,
    fontSize: 16,
    fontWeight: '800',
  },
  sparkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sparkDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sparkDateLabel: {
    fontFamily: Typography.families.body,
    fontSize: 8,
    color: Colors.outline,
  },
});
