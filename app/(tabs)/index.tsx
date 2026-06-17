import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
  TouchableOpacity, Alert, Animated, Easing,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import {
  ShieldCheck, TrendingUp, TrendingDown, Minus,
  Heart, Zap, Flame, Baby, ChevronRight, Upload, FileText,
} from 'lucide-react-native';
// AppHeader removed from home — hero takes full top
import BodyMap from '../../components/BodyMap';
import { HeartMascot } from '../../components/HeartMascot';
import Mascot from '../../components/Mascot';
import LevelBadge from '../../components/ui/LevelBadge';
import MiniTrendChart from '../../components/ui/MiniTrendChart';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Motion, SPRING_PLAYFUL } from '../../constants/motion';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import {
  computeBiologicalAge, computeCardiovascularRisk, computeMetabolicRisk,
  computeInflammatoryRisk, computeOptimalPercentage, RiskLevel,
} from '../../constants/healthMetrics';
import {
  BODY_SYSTEMS, getSystemBiomarkers, getSystemStatus, SystemStatus,
} from '../../constants/biomarkerSystems';
import { getBiomarkerKnowledge } from '../../constants/biomarkerKnowledge';
import { Biomarker } from '../../services/openai';
import { shareHealthReport } from '../../services/pdfExport';
import { translateBiomarkerValue } from '../../constants/valueTranslations';
import { parseBiomarkerNumber } from '../../constants/valueParsing';

// ─── Score helpers ────────────────────────────────────────────────────────────

function scoreRingColor(score: number): string {
  if (score >= 65) return Colors.optimal;
  if (score >= 50) return Colors.borderline;
  return Colors.attention;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ScoreGauge({ score, size = 130 }: { score: number; size?: number }) {
  const strokeW = 12;
  const r = (size / 2) - strokeW;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;

  // Animated value drives BOTH the count-up number and the arc fill
  const progress = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = useState(0);
  // Settle bounce on the number when it reaches target
  const numberScale = useRef(new Animated.Value(1)).current;
  // Track the last animated score so we only re-animate when it actually changes
  const prevScore = useRef(0);

  useEffect(() => {
    if (score === prevScore.current) return;
    prevScore.current = score;

    // Update the displayed integer as the animation progresses
    const listener = progress.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });

    // Count up the score + draw the arc (900ms theatrical reveal)
    Animated.timing(progress, {
      toValue: score,
      duration: Motion.duration.theatrical,
      easing: Motion.easing.decelerate,
      useNativeDriver: false, // strokeDashoffset needs layout driver
    }).start(() => {
      // Settle bounce — the number gets a tiny pop when it lands
      Animated.sequence([
        Animated.spring(numberScale, {
          toValue: 1.08,
          ...SPRING_PLAYFUL,
        }),
        Animated.spring(numberScale, {
          toValue: 1,
          ...SPRING_PLAYFUL,
        }),
      ]).start();
    });

    return () => progress.removeListener(listener);
  }, [score]);

  // Interpolate progress (0-100) → strokeDashoffset (circumference → 0)
  const dashOffset = progress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={Colors.scoreRingStart} />
            <Stop offset="0.5" stopColor={Colors.scoreRingMid} />
            <Stop offset="1" stopColor={Colors.scoreRingEnd} />
          </LinearGradient>
        </Defs>
        {/* Background track */}
        <Circle cx={cx} cy={cx} r={r}
          stroke={Colors.pastelPinkBg} strokeWidth={strokeW}
          fill="none" />
        {/* Filled arc (animated) */}
        <AnimatedCircle cx={cx} cy={cx} r={r}
          stroke="url(#scoreGrad)" strokeWidth={strokeW}
          strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset}
          strokeLinecap="round" fill="none"
          transform={`rotate(-90 ${cx} ${cx})`} />
      </Svg>
      <Animated.View style={{ alignItems: 'center', transform: [{ scale: numberScale }] }}>
        <Text style={[styles.gaugeScore, { color: Colors.foreground }]}>{displayScore}</Text>
        <Text style={[styles.gaugeLabel, { color: Colors.outline }]}>/ 100</Text>
      </Animated.View>
    </View>
  );
}

// ─── Score Particles — magical floating dots around the gauge ────────────────
// Motion: 8 particles orbit around the gauge at different radii + speeds.
// Color matches the score ring gradient (pink → coral → pastel).
// Feels alive, not distracting — opacity pulses + slow drift.

function ScoreParticles({ score, ringSize = 96 }: { score: number; ringSize?: number }) {
  // Particles adjust based on ring size so they look good both at
  // compact strip (96px) and big hero (160px).
  const PARTICLE_COUNT = ringSize >= 140 ? 8 : 6;

  return (
    <View pointerEvents="none" style={{
      position: 'absolute',
      width: ringSize + 60, height: ringSize + 60,
      alignItems: 'center', justifyContent: 'center',
    }}>
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <OrbitParticle
          key={i}
          index={i}
          total={PARTICLE_COUNT}
          ringRadius={ringSize / 2}
        />
      ))}
    </View>
  );
}

function OrbitParticle({ index, total, ringRadius }: {
  index: number; total: number; ringRadius: number;
}) {
  const angle = useRef(new Animated.Value((index / total) * 2 * Math.PI)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  // Vary particle characteristics for organic feel
  const radius = ringRadius + 8 + (index % 3) * 6;       // 8, 14, 20px outside ring
  const speed = 6000 + (index % 4) * 2000;                // 6-12s per orbit
  const size = 3 + (index % 3);                            // 3-5px
  const pulseDelay = index * 180;
  const direction = index % 2 === 0 ? 1 : -1;              // alternate clockwise/counter
  // Clyra pastel palette — pink family to match mascot
  const COLORS = ['#F472B6', '#FB7185', '#FDA4AF', '#F9A8D4', '#FBCFE8'];
  const color = COLORS[index % COLORS.length];

  useEffect(() => {
    // Slow orbit rotation
    Animated.loop(
      Animated.timing(angle, {
        toValue: (index / total) * 2 * Math.PI + direction * 2 * Math.PI,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Opacity pulse (breathing) with stagger
    Animated.loop(
      Animated.sequence([
        Animated.delay(pulseDelay),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Translate by rotating a vector (cos*r, sin*r)
  const translateX = angle.interpolate({
    inputRange: [0, 2 * Math.PI],
    outputRange: [Math.cos(0) * radius, Math.cos(2 * Math.PI) * radius],
    extrapolate: 'extend',
  });
  const translateY = angle.interpolate({
    inputRange: [0, 2 * Math.PI],
    outputRange: [Math.sin(0) * radius, Math.sin(2 * Math.PI) * radius],
    extrapolate: 'extend',
  });
  // Simpler: use animated listener to set x,y from angle value
  // Using the approach below instead — driven by angle value
  const [pos, setPos] = useState({ x: radius, y: 0 });
  useEffect(() => {
    const id = angle.addListener(({ value }) => {
      setPos({
        x: Math.cos(value) * radius,
        y: Math.sin(value) * radius,
      });
    });
    return () => angle.removeListener(id);
  }, [radius]);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.9],
  });
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.2],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [
          { translateX: pos.x },
          { translateY: pos.y },
          { scale },
        ],
        // Soft glow around particle
        shadowColor: color,
        shadowOpacity: 0.8,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}

// ─── Health Summary Bar (horizontal gradient from green to red) ──────────────

function HealthBar({ score }: { score: number }) {
  return (
    <View style={styles.healthBar}>
      <View style={styles.healthBarTrack}>
        <View style={[styles.healthBarSegment, { flex: 1, backgroundColor: Colors.attention }]} />
        <View style={[styles.healthBarSegment, { flex: 1, backgroundColor: Colors.borderline }]} />
        <View style={[styles.healthBarSegment, { flex: 1, backgroundColor: '#A3D977' }]} />
        <View style={[styles.healthBarSegment, { flex: 1, backgroundColor: Colors.optimal }]} />
      </View>
      {/* Indicator dot */}
      <View style={[styles.healthBarDot, { left: `${Math.min(Math.max(score, 5), 95)}%` }]} />
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

// ─── Pulsing NEW/UPDATED badge ──────────────────────────────────────────────
// Micro-animation that draws the eye on new data without being annoying.
// 2-cycle pulse on mount, then steady state.
function PulsingBadge({ label, bg, textColor }: {
  label: string; bg: string; textColor: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Brief entrance: scale 0.5 → 1.15 → 1 (spring bounce)
    scale.setValue(0.5);
    Animated.spring(scale, {
      toValue: 1,
      damping: 9,
      mass: 0.6,
      stiffness: 220,
      useNativeDriver: true,
    }).start();

    // Two gentle glow pulses, then fade out to stay subtle
    const pulseLoop = Animated.sequence([
      Animated.timing(glowOpacity, { toValue: 0.8, duration: 600, easing: Motion.easing.ambient, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0.3, duration: 600, easing: Motion.easing.ambient, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0.7, duration: 600, easing: Motion.easing.ambient, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0, duration: 800, easing: Motion.easing.ambient, useNativeDriver: true }),
    ]);
    pulseLoop.start();
  }, []);

  return (
    <View style={{ position: 'relative' }}>
      {/* Ambient glow halo (secondary layer) */}
      <Animated.View
        style={{
          position: 'absolute',
          left: -3, right: -3, top: -3, bottom: -3,
          backgroundColor: bg,
          opacity: glowOpacity,
          borderRadius: 7,
        }}
      />
      {/* Primary badge */}
      <Animated.View
        style={{
          backgroundColor: bg,
          borderRadius: 4,
          paddingHorizontal: 5,
          paddingVertical: 1,
          transform: [{ scale }],
        }}
      >
        <Text style={{
          fontFamily: Typography.families.body,
          fontSize: 9, fontWeight: '800', color: textColor, letterSpacing: 0.5,
        }}>
          {label}
        </Text>
      </Animated.View>
    </View>
  );
}

// ─── Marker row ──────────────────────────────────────────────────────────────

function MarkerRow({ biomarker, language, t, onPress, badge }: {
  biomarker: Biomarker; language: string; t: ReturnType<typeof useT>; onPress: () => void;
  badge?: 'new' | 'updated' | null;
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
        <View style={styles.markerNameRow}>
          <Text style={styles.markerName}>{displayName}</Text>
          {badge === 'new' && (
            <PulsingBadge
              label="NEW"
              bg={Colors.primary}
              textColor="#fff"
            />
          )}
          {badge === 'updated' && (
            <PulsingBadge
              label={language === 'es' ? 'ACT.' : 'UPD.'}
              bg={Colors.borderline}
              textColor="#fff"
            />
          )}
        </View>
        <Text style={styles.markerOriginal}>{biomarker.name}</Text>
        {biomarker.referenceRange ? (
          <Text style={styles.markerRef}>Ref: {biomarker.referenceRange} {biomarker.unit}</Text>
        ) : null}
      </View>
      <View style={styles.markerRight}>
        <Text style={[styles.markerValue, { color }]}>{translateBiomarkerValue(biomarker.value, language)} {biomarker.unit}</Text>
        <View style={[styles.markerChip, { backgroundColor: bg }]}>
          <Text style={[styles.markerChipText, { color }]}>{statusLabel[biomarker.status] ?? biomarker.status}</Text>
        </View>
        <ChevronRight size={14} color={Colors.outline} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Hero entry animation ───────────────────────────────────────────────────
// Mascot hero scene springs up from below — "fly up to position" feel.
// Entrance: translateY from +80 to 0 + scale from 0.85 to 1 + opacity 0 to 1.
// Uses Playful spring for a warm, bouncy landing.

function HeroEntryAnimation({ children }: { children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(80)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0, tension: 60, friction: 8, useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1, tension: 50, friction: 7, useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      {children}
    </Animated.View>
  );
}

// ─── Animated entrance wrapper ──────────────────────────────────────────────

function AnimatedSection({ children, delay = 0, style }: {
  children: React.ReactNode; delay?: number; style?: any;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1, duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0, duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
}

// ─── Biomarker Highlight Cards ───────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const HIGHLIGHT_CARD_WIDTH = (SCREEN_WIDTH - 40 - 8) / 2;

function BiomarkerHighlightCard({ biomarker, language, index = 0, onPress }: {
  biomarker: Biomarker; language: string; index?: number; onPress?: () => void;
}) {
  const knowledge = getBiomarkerKnowledge(biomarker.name);
  const displayName = knowledge?.simpleName?.[language as 'en' | 'es'] ?? biomarker.name;
  const emoji = knowledge?.emoji ?? '🔬';

  // ── Cascade entrance (60ms stagger, Playful spring) ──────────────────────
  // Cards enter from below+transparent, pop in with overshoot
  const scale = useRef(new Animated.Value(Motion.transform.entrance.fromScale)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(Motion.transform.entrance.fromTranslateY)).current;

  useEffect(() => {
    const delay = index * Motion.stagger.cards;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: Motion.duration.standard,
        delay,
        easing: Motion.easing.decelerate,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay,
        ...SPRING_PLAYFUL,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        ...SPRING_PLAYFUL,
      }),
    ]).start();
  }, [index]);

  const statusConfig = {
    normal: {
      label: language === 'es' ? 'Se ve bien ✓' : 'Looks good ✓',
      color: Colors.optimal,
      bg: Colors.optimal10,
      desc: language === 'es' ? 'Tus niveles están bien' : 'Your levels look great',
    },
    borderline: {
      label: language === 'es' ? 'Un poco alto' : 'A little high',
      color: Colors.borderline,
      bg: Colors.borderline10,
      desc: language === 'es' ? 'Ligeramente fuera de rango' : 'A little higher than ideal',
    },
    high: {
      label: language === 'es' ? 'Atención' : 'Watch it',
      color: Colors.attention,
      bg: Colors.attention10,
      desc: language === 'es' ? 'Fuera del rango normal' : 'Outside normal range',
    },
    low: {
      label: language === 'es' ? 'Un poco bajo' : 'A bit low',
      color: '#E879A2',
      bg: '#E879A215',
      desc: language === 'es' ? 'Por debajo de lo ideal' : 'A bit lower than ideal',
    },
  };
  const config = statusConfig[biomarker.status as keyof typeof statusConfig] ?? statusConfig.normal;

  const body = (
    <>
      <View style={styles.highlightTop}>
        <Text style={styles.highlightEmoji}>{emoji}</Text>
        <View style={[styles.highlightBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.highlightBadgeText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      <Text style={[styles.highlightValue, { color: config.color }]}>
        {biomarker.value} <Text style={{ fontSize: 13, fontWeight: '600' }}>{biomarker.unit}</Text>
      </Text>
      <Text style={styles.highlightName} numberOfLines={1}>{displayName}</Text>
      <Text style={styles.highlightDesc} numberOfLines={2}>{config.desc}</Text>
    </>
  );

  return (
    <Animated.View
      style={[
        { width: HIGHLIGHT_CARD_WIDTH, opacity, transform: [{ scale }, { translateY }] },
      ]}
    >
      {onPress ? (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.highlightCard}>
          {body}
        </TouchableOpacity>
      ) : (
        <View style={styles.highlightCard}>{body}</View>
      )}
    </Animated.View>
  );
}

function BiomarkerHighlights({ biomarkers, language, onCardPress }: {
  biomarkers: Biomarker[];
  language: string;
  onCardPress?: (name: string) => void;
}) {
  if (biomarkers.length === 0) return null;

  const priorities = biomarkers
    .filter(b => b.status === 'high' || b.status === 'low' || b.status === 'borderline')
    .sort((a, b) => {
      const rank: Record<string, number> = { high: 0, low: 0, borderline: 1, normal: 2 };
      return (rank[a.status] ?? 2) - (rank[b.status] ?? 2);
    })
    .slice(0, 4);

  // All clear → show an affirmation card instead of hiding the section.
  if (priorities.length === 0) {
    return (
      <View style={styles.allClearCard}>
        <View style={styles.allClearLottieWrap}>
          <LottieView
            source={require('../../assets/animations/heart-mascot-celebrating.json')}
            autoPlay
            loop
            style={styles.allClearLottie}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.allClearTitle}>
            {language === 'es' ? 'Todo en rango' : 'All clear'}
          </Text>
          <Text style={styles.allClearSub}>
            {language === 'es'
              ? 'Tus marcadores lucen saludables \u2014 sigue asi.'
              : 'Your markers look healthy \u2014 keep it up.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>
        {language === 'es' ? 'Para cuidar' : 'Needs attention'}
      </Text>
      <Text style={styles.sectionSub}>
        {language === 'es'
          ? `${priorities.length} marcador${priorities.length > 1 ? 'es' : ''} fuera de rango`
          : `${priorities.length} marker${priorities.length > 1 ? 's' : ''} out of range`}
      </Text>
      <View style={styles.highlightGrid}>
        {priorities.map((b, i) => (
          <BiomarkerHighlightCard
            key={b.name}
            biomarker={b}
            language={language}
            index={i}
            onPress={onCardPress ? () => onCardPress(b.name) : undefined}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Trend Charts Grid ───────────────────────────────────────────────────────

const TREND_CHART_COLORS = [Colors.chartRed, Colors.chartBlue, Colors.chartGreen, Colors.chartAmber];

function TrendChartsGrid({ sessions, language }: {
  sessions: { date: string; biomarkers: Biomarker[] }[];
  language: string;
}) {
  // Find biomarkers that appear in 2+ sessions for trending
  const biomarkerHistory = useMemo(() => {
    const history: Record<string, { label: string; value: number }[]> = {};
    // Sessions are newest-first, reverse for chronological order
    const chronological = [...sessions].reverse();
    for (const session of chronological) {
      const label = new Date(session.date).toLocaleDateString(
        language === 'es' ? 'es' : 'en', { month: 'short' }
      );
      for (const b of session.biomarkers) {
        const val = parseBiomarkerNumber(b.value);
        if (isNaN(val)) continue;
        if (!history[b.name]) history[b.name] = [];
        history[b.name].push({ label, value: val });
      }
    }
    // Filter to biomarkers with 2+ data points, prioritize non-normal status
    return Object.entries(history)
      .filter(([, pts]) => pts.length >= 2)
      .sort(([a], [b]) => {
        // Prioritize biomarkers that are out of range in the latest session
        const latestSession = sessions[0];
        const aStatus = latestSession.biomarkers.find(m => m.name === a)?.status ?? 'normal';
        const bStatus = latestSession.biomarkers.find(m => m.name === b)?.status ?? 'normal';
        const rank: Record<string, number> = { high: 0, low: 0, borderline: 1, normal: 2 };
        return (rank[aStatus] ?? 2) - (rank[bStatus] ?? 2);
      })
      .slice(0, 4);
  }, [sessions, language]);

  if (biomarkerHistory.length < 2) return null;

  return (
    <View style={styles.trendGrid}>
      {biomarkerHistory.map(([name, data], i) => {
        const knowledge = getBiomarkerKnowledge(name);
        const displayName = knowledge?.simpleName?.[language as 'en' | 'es'] ?? name;
        return (
          <View key={name} style={styles.trendGridItem}>
            <MiniTrendChart
              title={displayName}
              data={data}
              color={TREND_CHART_COLORS[i % TREND_CHART_COLORS.length]}
            />
          </View>
        );
      })}
    </View>
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
  const recentlyUpdated = useStore(s => s.recentlyUpdatedBiomarkers);
  const recentlyAdded = useStore(s => s.recentlyAddedBiomarkers);
  const clearRecentBiomarkers = useStore(s => s.clearRecentBiomarkers);
  const hasBiomarkers = biomarkers.length > 0;
  const hasRecentChanges = recentlyUpdated.length > 0 || recentlyAdded.length > 0;

  const [activeFilter, setActiveFilter] = useState<string | null>(null);

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

  // Category filter chips — ordered: Normal → A bit low → Borderline → Attention
  const STATUS_RANK: Record<SystemStatus, number> = {
    normal: 0, low: 1, borderline: 2, attention: 3, none: 4,
  };
  const systemsWithData = BODY_SYSTEMS.filter(sys => getSystemBiomarkers(sys, biomarkers).length > 0);
  const filterTabs = [
    { id: null as string | null, label: t('filterAll'), status: null as SystemStatus | null },
    ...systemsWithData
      .map(sys => ({
        id: sys.id as string | null,
        label: sys.shortName[language],
        status: getSystemStatus(sys, biomarkers) as SystemStatus | null,
      }))
      .sort((a, b) => STATUS_RANK[a.status as SystemStatus] - STATUS_RANK[b.status as SystemStatus]),
  ];
  const CHIP_DOT_COLOR: Record<SystemStatus, string> = {
    normal: Colors.optimal,
    low: '#E879A2',
    borderline: Colors.borderline,
    attention: Colors.attention,
    none: '#9BAABF',
  };

  const filteredBiomarkers = activeFilter === null
    ? [...biomarkers].sort((a, b) => {
        const rank = { high: 0, low: 0, borderline: 1, normal: 2 };
        return (rank[a.status as keyof typeof rank] ?? 2) - (rank[b.status as keyof typeof rank] ?? 2);
      })
    : (() => {
        const sys = BODY_SYSTEMS.find(s => s.id === activeFilter);
        return sys ? getSystemBiomarkers(sys, biomarkers) : [];
      })();

  // Sync BodyMap selection → tab filter
  const handleBodyMapSelect = useCallback((systemId: string | null) => {
    setActiveFilter(systemId);
  }, []);

  // Sync tab filter → BodyMap (pass activeFilter as selectedSystemId)
  const bodyMapSystemId = activeFilter;

  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── 0. Hero — rigged scene Lottie with spring entry ── */}
        <HeroEntryAnimation>
          <View style={styles.heroSection}>
            <View style={styles.heroContainer}>
              <LottieView
                source={require('../../assets/animations/heart-hero-scene.json')}
                autoPlay
                loop
                style={styles.heroLottie}
                resizeMode="cover"
              />
            </View>
          </View>
        </HeroEntryAnimation>

        {/* ── Content area with curved top ── */}
        <View style={styles.contentArea}>

        {hasBiomarkers ? (
          <>
            {/* ── 1. Score card — matches reference: ring LEFT + text RIGHT
                Contains inline greeting. */}
            <AnimatedSection delay={100} style={styles.section}>
              <View style={styles.scoreStripCard}>
                <View style={styles.scoreStripRing}>
                  <ScoreParticles score={healthScore} />
                  <ScoreGauge score={healthScore} size={96} />
                </View>
                <View style={styles.scoreStripInfo}>
                  {userName ? (
                    <Text style={styles.scoreGreetingName}>
                      {language === 'es' ? `Hola ${userName},` : `Hi ${userName},`}
                    </Text>
                  ) : null}
                  <Text style={styles.scoreStripLabel}>
                    {language === 'es'
                      ? (healthScore >= 80 ? 'Te ves muy bien \u2728' : healthScore >= 60 ? 'Bastante bien \u2728' : 'Necesita atencion')
                      : (healthScore >= 80 ? 'Looking great \u2728' : healthScore >= 60 ? 'Mostly okay \u2728' : 'Needs attention')}
                  </Text>
                  <View style={styles.scoreStripStats}>
                    <Text style={styles.scoreStripStatText}>
                      <Text style={styles.scoreStripStatNum}>{biomarkers.length}</Text> {language === 'es' ? 'marcadores' : 'markers'}
                    </Text>
                    <Text style={styles.scoreStripStatDot}>·</Text>
                    <Text style={[styles.scoreStripStatText, { color: Colors.optimal }]}>
                      <Text style={styles.scoreStripStatNum}>{biomarkers.filter(b => b.status === 'normal').length}</Text> {language === 'es' ? 'en rango' : 'in range'}
                    </Text>
                    {scoreDelta !== null && (
                      <>
                        <Text style={styles.scoreStripStatDot}>·</Text>
                        <View style={[styles.scoreStripDelta, { backgroundColor: trendColor + '18' }]}>
                          <TrendIcon size={10} color={trendColor} />
                          <Text style={[styles.scoreStripDeltaText, { color: trendColor }]}>
                            {scoreDelta > 0 ? '+' : ''}{scoreDelta}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </AnimatedSection>

            {/* ── 2. Your biomarkers — body map + category chips + legend ── */}
            <AnimatedSection delay={200} style={styles.section}>
              <Text style={styles.bioSectionTitle}>
                {language === 'es' ? 'Tus biomarcadores \uD83D\uDC96' : 'Your biomarkers \uD83D\uDC96'}
              </Text>
              <Text style={styles.sectionSub}>
                {language === 'es'
                  ? 'Mapeados a tu cuerpo \u2014 toca un chip para saber mas'
                  : 'Mapped to your body \u2014 tap a chip to learn more'}
              </Text>

              <View style={{ alignItems: 'center' }}>
                <BodyMap
                  biomarkers={biomarkers}
                  selectedSystemId={bodyMapSystemId}
                  onSelectSystem={handleBodyMapSelect}
                />
              </View>

              {/* Category chips — pill style with status dot */}
              <View style={styles.chipWrap}>
                {filterTabs.map(tab => {
                  const isActive = activeFilter === tab.id;
                  const dotColor = tab.status ? CHIP_DOT_COLOR[tab.status] : null;
                  return (
                    <TouchableOpacity
                      key={tab.id ?? 'all'}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setActiveFilter(tab.id)}
                      activeOpacity={0.75}
                    >
                      {dotColor && <View style={[styles.chipDot, { backgroundColor: dotColor }]} />}
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Detailed biomarker cards — visible when a system chip is active */}
              {activeFilter !== null && filteredBiomarkers.length > 0 && (() => {
                const activeSystem = BODY_SYSTEMS.find(s => s.id === activeFilter);
                const systemName = activeSystem?.shortName[language] ?? '';
                return (
                  <View style={styles.systemPanel}>
                    <Text style={styles.systemPanelTitle}>
                      {language === 'es'
                        ? `Panel de ${systemName}`
                        : `${systemName} panel`}
                    </Text>
                    <Text style={styles.systemPanelSub}>
                      {language === 'es'
                        ? `${filteredBiomarkers.length} marcador${filteredBiomarkers.length === 1 ? '' : 'es'}`
                        : `${filteredBiomarkers.length} marker${filteredBiomarkers.length === 1 ? '' : 's'}`}
                    </Text>
                    <View style={styles.highlightGrid}>
                      {filteredBiomarkers.map((b, i) => (
                        <BiomarkerHighlightCard
                          key={b.name}
                          biomarker={b}
                          language={language}
                          index={i}
                          onPress={() => router.push(`/biomarker/${encodeURIComponent(b.name)}` as any)}
                        />
                      ))}
                    </View>
                  </View>
                );
              })()}
            </AnimatedSection>

            {/* ── 3. Priority Highlights — hidden when a system chip is active
                (the system detail panel above already covers those markers). */}
            {activeFilter === null && (
              <AnimatedSection delay={300} style={styles.section}>
                <BiomarkerHighlights
                  biomarkers={biomarkers}
                  language={language}
                  onCardPress={(name) => router.push(`/biomarker/${encodeURIComponent(name)}` as any)}
                />
              </AnimatedSection>
            )}

            {hasRecentChanges && (
              <View style={[styles.recentBanner, { marginHorizontal: 20 }]}>
                <Text style={styles.recentBannerText}>
                  {language === 'es'
                    ? `${recentlyAdded.length + recentlyUpdated.length} marcadores actualizados`
                    : `${recentlyAdded.length + recentlyUpdated.length} markers updated`}
                </Text>
                <TouchableOpacity onPress={clearRecentBiomarkers} activeOpacity={0.7}>
                  <Text style={styles.recentBannerDismiss}>
                    {language === 'es' ? 'Listo' : 'Dismiss'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          </>
        ) : (
          /* ── Empty state (Lottie hero above already shows the mascot scene) ── */
          <View>
            <AnimatedSection delay={150} style={styles.emptyGreetBlock}>
              <Mascot pose="waving" size={120} animation="wave" />
              <Text style={styles.mascotGreeting}>
                {language === 'es' ? '¡Hola! Soy Clyra' : 'Hi! I\'m Clyra'}
              </Text>
              <Text style={styles.mascotSub}>
                {language === 'es'
                  ? 'Sube tu primer examen y te ayudo a entenderlo ✨'
                  : "Upload your first test and I'll help you understand it ✨"}
              </Text>
            </AnimatedSection>

            <AnimatedSection delay={300} style={[styles.section, { alignItems: 'center' }]}>
              <Text style={[styles.sectionTitle, { alignSelf: 'flex-start' }]}>{t('yourBody')}</Text>
              <Text style={[styles.sectionSub, { alignSelf: 'flex-start' }]}>{t('bodyMapSubtitle')}</Text>
              <BodyMap biomarkers={[]} />
            </AnimatedSection>

            <AnimatedSection delay={450}>
              <TouchableOpacity style={styles.uploadCTA}
                onPress={() => router.push('/(tabs)/upload' as any)} activeOpacity={0.85}>
                <Upload size={20} color={Colors.primary} />
                <Text style={styles.uploadCTAText}>{t('uploadResults')}</Text>
              </TouchableOpacity>
            </AnimatedSection>
          </View>
        )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },
  content: { paddingBottom: 130 },

  // Hero scene — full-bleed, aspect matches BG_1.png (1124×842)
  heroSection: { alignItems: 'center' },
  heroContainer: {
    width: '100%',
    aspectRatio: 1124 / 842,
    position: 'relative',
  },
  heroLottie: { width: '100%', height: '100%' },
  // Mascot PNG overlay — centered slightly right of middle, above the monitor
  heroMascotOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: '8%',
    paddingLeft: '18%', // shift right so mascot doesn't overlap monitor
  },

  // Content below hero — curves up over the hero bottom
  contentArea: {
    backgroundColor: '#FFFFFF',
    marginTop: -40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: 600,
  },

  // Greeting
  greetingSection: { marginBottom: 16, alignItems: 'center', paddingHorizontal: 20, paddingTop: 24 },
  greetingName: {
    fontFamily: Typography.families.display,
    fontSize: 26, fontWeight: '800', color: Colors.foreground,
    letterSpacing: -0.5, marginBottom: 6, textAlign: 'center',
  },
  greetingSub: {
    fontFamily: Typography.families.body,
    fontSize: 14, color: Colors.mutedForeground, lineHeight: 20, textAlign: 'center',
  },

  // Summary card (reference: gradient bar + stats)
  summaryCard: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 20,
    marginBottom: 16, marginHorizontal: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 16, elevation: 2,
    alignItems: 'center',
  },
  summaryGreeting: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.mutedForeground, marginBottom: 6,
  },
  summaryStats: {
    flexDirection: 'row', alignItems: 'flex-start', marginTop: 16,
    width: '100%',
  },
  summaryStat: { flex: 1, alignItems: 'center' },
  summaryStatLabel: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '600', color: Colors.mutedForeground, marginBottom: 4,
  },
  summaryStatValue: {
    fontFamily: Typography.families.display,
    fontSize: 28, fontWeight: '900', color: Colors.foreground, letterSpacing: -1,
  },
  summaryStatUnit: {
    fontSize: 14, fontWeight: '600', color: Colors.mutedForeground,
  },
  summaryDelta: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2,
  },
  summaryDeltaText: {
    fontFamily: Typography.families.body, fontSize: 11, fontWeight: '700',
  },
  summaryStatSub: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '600', color: Colors.optimal, marginTop: 2,
  },
  summaryDivider: {
    width: 1, height: 50, backgroundColor: Colors.outlineVariant,
  },

  // Health bar (gradient green→red)
  healthBar: {
    width: '100%', height: 10, marginTop: 14, position: 'relative',
  },
  healthBarTrack: {
    flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden',
  },
  healthBarSegment: { height: 8 },
  healthBarDot: {
    position: 'absolute', top: -2, width: 14, height: 14,
    borderRadius: 7, backgroundColor: '#fff',
    borderWidth: 3, borderColor: Colors.foreground,
    marginLeft: -7,
  },

  // Score ring card (reference: circular ring + description)
  scoreRingCard: {
    backgroundColor: Colors.pastelPinkBg, borderRadius: 24, padding: 24,
    alignItems: 'center',
  },
  scoreRingLabel: {
    fontFamily: Typography.families.display,
    fontSize: 18, fontWeight: '800', color: Colors.foreground,
    marginTop: 12,
  },
  scoreRingDesc: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.mutedForeground, textAlign: 'center',
    lineHeight: 19, marginTop: 6, paddingHorizontal: 10,
  },

  // ─── Compact score strip (horizontal, hero position for Body Map) ─────
  scoreStripCard: {
    backgroundColor: Colors.pastelPinkBg,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  scoreStripRing: {
    width: 96, height: 96,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreStripInfo: {
    flex: 1,
    gap: 6,
  },
  scoreGreetingName: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.mutedForeground, fontWeight: '500',
    marginBottom: 2,
  },
  scoreStripLabel: {
    fontFamily: Typography.families.display,
    fontSize: 19, fontWeight: '800', color: Colors.foreground,
    letterSpacing: -0.3,
  },
  scoreStripStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  scoreStripStatText: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '600', color: Colors.mutedForeground,
  },
  scoreStripStatNum: {
    fontFamily: Typography.families.display,
    fontSize: 14, fontWeight: '900', color: Colors.foreground,
  },
  scoreStripStatDot: {
    color: Colors.outlineVariant,
    fontSize: 10,
  },
  scoreStripDelta: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 8,
  },
  scoreStripDeltaText: {
    fontFamily: Typography.families.body,
    fontSize: 11, fontWeight: '800',
  },

  // ─── Unified score hero card (gauge + particles + stats) ────────────────
  scoreHeroCard: {
    backgroundColor: Colors.pastelPinkBg,
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3,
  },
  scoreHeroRingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    // Extra room for orbiting particles
    paddingVertical: 8,
  },
  scoreHeroLabel: {
    fontFamily: Typography.families.display,
    fontSize: 22, fontWeight: '900', color: Colors.foreground,
    letterSpacing: -0.5,
    marginTop: 18,
  },
  scoreHeroDesc: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.mutedForeground, textAlign: 'center',
    lineHeight: 19, marginTop: 6,
    paddingHorizontal: 8,
    maxWidth: 320,
  },
  scoreHeroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 4,
  },
  scoreHeroStat: {
    alignItems: 'center',
    paddingHorizontal: 14,
    minWidth: 70,
  },
  scoreHeroStatValue: {
    fontFamily: Typography.families.display,
    fontSize: 18, fontWeight: '900', color: Colors.foreground,
    letterSpacing: -0.3,
  },
  scoreHeroStatLabel: {
    fontFamily: Typography.families.body,
    fontSize: 10, fontWeight: '600', color: Colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 0.4,
    marginTop: 2,
  },
  scoreHeroDivider: {
    width: 1, height: 28,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  scoreHeroDeltaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10,
  },
  scoreHeroDeltaText: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '800',
  },

  // Score gauge (ring)
  gaugeScore: {
    fontFamily: Typography.families.display,
    fontSize: 32, fontWeight: '900', letterSpacing: -2, lineHeight: 38,
  },
  gaugeLabel: {
    fontFamily: Typography.families.body,
    fontSize: 11, fontWeight: '600', color: Colors.mutedForeground,
  },

  // Trend charts grid
  trendGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  trendGridItem: {
    width: (SCREEN_WIDTH - 40 - 10) / 2,
  },

  // Share button (subtle secondary at bottom)
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'transparent', borderRadius: 12, paddingVertical: 14,
    marginTop: 8, marginBottom: 8, marginHorizontal: 20,
    borderWidth: 1, borderColor: Colors.outlineVariant,
  },
  shareBtnText: {
    fontFamily: Typography.families.body, fontSize: 13, fontWeight: '600', color: Colors.mutedForeground,
  },

  // Sections
  section: { marginBottom: 24, paddingHorizontal: 20 },
  sectionTitle: {
    fontFamily: Typography.families.display,
    fontSize: 20, fontWeight: '800', color: Colors.foreground,
    letterSpacing: -0.3, marginBottom: 4,
  },
  sectionSub: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.mutedForeground, marginBottom: 12,
  },
  bioSectionTitle: {
    fontFamily: Typography.families.display,
    fontSize: 22, fontWeight: '800', color: Colors.foreground,
    letterSpacing: -0.3, marginBottom: 4,
  },
  // Pill-style category chips
  chipWrap: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, justifyContent: 'center',
    marginTop: 4, marginBottom: 16, paddingHorizontal: 4,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 999, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  chipActive: {
    borderColor: Colors.primary, backgroundColor: Colors.primary10,
  },
  chipDot: {
    width: 8, height: 8, borderRadius: 4,
  },
  chipText: {
    fontFamily: Typography.families.body, fontSize: 13, fontWeight: '600',
    color: Colors.foreground,
  },
  chipTextActive: {
    color: Colors.primary, fontWeight: '700',
  },

  // "All clear" affirmation card (shown when no markers need attention)
  allClearCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.optimal10,
    borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.optimal + '30',
  },
  allClearLottieWrap: {
    width: 64, height: 64,
    alignItems: 'center', justifyContent: 'center',
  },
  allClearLottie: {
    width: 64, height: 64,
  },
  allClearTitle: {
    fontFamily: Typography.families.display,
    fontSize: 16, fontWeight: '800',
    color: Colors.optimal,
  },
  allClearSub: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.foreground,
    opacity: 0.75, marginTop: 2, lineHeight: 18,
  },

  // System detail panel (revealed when a chip is active)
  systemPanel: {
    marginTop: 4, marginBottom: 8,
  },
  systemPanelTitle: {
    fontFamily: Typography.families.display,
    fontSize: 18, fontWeight: '800',
    color: Colors.foreground, marginBottom: 2,
  },
  systemPanelSub: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.mutedForeground,
    marginBottom: 12,
  },

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
  markerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  markerName: { fontFamily: Typography.families.body, fontSize: 14, fontWeight: '700', color: Colors.foreground },
  newBadge: {
    backgroundColor: Colors.primary, borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  newBadgeText: {
    fontFamily: Typography.families.body,
    fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5,
  },
  updatedBadge: {
    backgroundColor: Colors.borderline, borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  updatedBadgeText: {
    fontFamily: Typography.families.body,
    fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5,
  },
  recentBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.primary10, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.primary + '25',
  },
  recentBannerText: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '700', color: Colors.primary,
  },
  recentBannerDismiss: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '700', color: Colors.primary, opacity: 0.7,
  },
  markerOriginal: { fontFamily: Typography.families.body, fontSize: 10, color: Colors.outline, marginTop: 1 },
  markerRef: { fontFamily: Typography.families.body, fontSize: 10, color: Colors.outline, marginTop: 1 },
  markerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  markerValue: { fontFamily: Typography.families.body, fontSize: 13, fontWeight: '700' },
  markerChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  markerChipText: { fontFamily: Typography.families.body, fontSize: 10, fontWeight: '700' },

  // Biomarker highlight cards
  highlightGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  highlightCard: {
    backgroundColor: '#ffffff', borderRadius: 18, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    marginBottom: 0,
  },
  highlightTop: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10,
  },
  highlightEmoji: { fontSize: 20 },
  highlightBadge: {
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  highlightBadgeText: {
    fontFamily: Typography.families.body, fontSize: 11, fontWeight: '800',
  },
  highlightValue: {
    fontFamily: Typography.families.display, fontSize: 22, fontWeight: '900',
    marginBottom: 4,
  },
  highlightName: {
    fontFamily: Typography.families.body, fontSize: 12, fontWeight: '700',
    color: Colors.foreground, marginBottom: 2,
  },
  highlightDesc: {
    fontFamily: Typography.families.body, fontSize: 11,
    color: Colors.mutedForeground, lineHeight: 15,
  },

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

  // Empty state greeting (Lottie hero is already the mascot)
  emptyGreetBlock: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  mascotGreeting: {
    fontFamily: Typography.families.display,
    fontSize: 24, fontWeight: '800', color: Colors.foreground,
    letterSpacing: -0.4, marginTop: 8,
  },
  mascotSub: {
    fontFamily: Typography.families.body,
    fontSize: 14, color: Colors.mutedForeground,
    textAlign: 'center', marginTop: 6,
    lineHeight: 20, maxWidth: 280,
  },

  // Empty state upload CTA
  uploadCTA: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary10, borderRadius: 18, padding: 18, marginHorizontal: 20,
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  uploadCTAText: {
    fontFamily: Typography.families.display, fontSize: 16, fontWeight: '800', color: Colors.primary,
  },
});
