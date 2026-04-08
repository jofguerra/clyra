import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Calendar, Clock, TrendingUp, TrendingDown, Minus,
  CircleAlert, CircleCheck, Utensils, Dumbbell, Moon, FlaskConical,
  Sparkles, Leaf, CircleX,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import { Biomarker, getPersonalizedBiomarkerInsight } from '../../services/openai';
import {
  getBiomarkerKnowledge, getStatusMessage, getRetestStatus,
} from '../../constants/biomarkerKnowledge';
import { translateBiomarkerValue } from '../../constants/valueTranslations';

// ─── Status helpers ────────────────────────────────────────────────────────────

function buildStatusCfg(status: string, t: ReturnType<typeof useT>) {
  const configs = {
    normal:     { color: Colors.optimal,    bg: '#e8f5ee', label: t('statusNormal'),     badgeBg: Colors.optimal,    badgeText: '#fff' },
    borderline: { color: Colors.borderline, bg: '#fef9e7', label: t('statusBorderline'), badgeBg: '#f59e0b',          badgeText: '#fff' },
    high:       { color: Colors.attention,  bg: '#fde8e8', label: t('statusHigh'),       badgeBg: Colors.attention,   badgeText: '#fff' },
    low:        { color: Colors.attention,  bg: '#fde8e8', label: t('statusLow'),        badgeBg: Colors.attention,   badgeText: '#fff' },
  };
  return configs[status as keyof typeof configs] ?? configs.normal;
}

// ─── Range gradient bar ────────────────────────────────────────────────────────

function RangeBar({ status, value, referenceRange, t, language }: {
  status: string; value: string | number; referenceRange?: string;
  t: ReturnType<typeof useT>; language: string;
}) {
  const pos = { low: 0.08, normal: 0.45, borderline: 0.72, high: 0.92 }[status] ?? 0.5;
  const zones = [
    { label: t('rangeZoneLow'),        sub: '< min', color: Colors.attention },
    { label: t('rangeZoneNormal'),     sub: referenceRange ?? '—', color: Colors.optimal },
    { label: t('rangeZoneBorderline'), sub: '± range', color: Colors.borderline },
    { label: t('rangeZoneHigh'),       sub: '> max', color: Colors.attention },
  ];
  return (
    <View style={styles.rangeWrap}>
      <LinearGradient
        colors={['#ba1a1a', '#eab308', '#006947', '#eab308', '#ba1a1a']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.rangeBar}
      />
      {/* Marker */}
      <View style={[styles.markerWrap, { left: `${pos * 100}%` as any }]}>
        <View style={styles.markerBubble}><Text style={styles.markerText}>{translateBiomarkerValue(value, language)}</Text></View>
        <View style={styles.markerLine} />
      </View>
      {/* Zone labels */}
      <View style={styles.rangeLabels}>
        {zones.map(z => (
          <View key={z.label} style={styles.rangeLabelCol}>
            <Text style={[styles.zoneName, { color: z.color }]}>{z.label}</Text>
            <Text style={styles.zoneSub}>{z.sub}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── History timeline row ─────────────────────────────────────────────────────

function TimelineRow({ date, value, unit, status, isFirst, isLast, t, language, allValues }: {
  date: string; value: string | number; unit: string;
  status: string; isFirst: boolean; isLast: boolean;
  t: ReturnType<typeof useT>; language: string;
  allValues: number[];
}) {
  const configs = {
    normal:     { color: Colors.optimal,    bg: '#e8f5ee', label: t('statusNormal') },
    borderline: { color: Colors.borderline, bg: '#fef9e7', label: t('statusBorderline') },
    high:       { color: Colors.attention,  bg: '#fde8e8', label: t('statusHigh') },
    low:        { color: Colors.attention,  bg: '#fde8e8', label: t('statusLow') },
  };
  const cfg = configs[status as keyof typeof configs] ?? configs.normal;
  const timeStr = new Date(date).toLocaleDateString(language === 'es' ? 'es' : 'en', { month: 'long', year: 'numeric' });

  // Calculate proportional bar width relative to all history values
  const numericVal = parseFloat(String(value));
  const maxVal = Math.max(...allValues);
  const barPercent = !isNaN(numericVal) && maxVal > 0
    ? Math.min(Math.max((numericVal / maxVal) * 100, 15), 100)
    : 0;

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineDot, { backgroundColor: cfg.color, borderColor: cfg.color + '30' }]} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={[styles.timelineContent, isFirst && styles.timelineContentFirst]}>
        <View style={styles.timelineRow2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.timelineDate}>{timeStr}</Text>
            {isFirst && (
              <View style={styles.latestBadge}>
                <Text style={styles.latestBadgeText}>{t('latestResultBadge')}</Text>
              </View>
            )}
          </View>
          <View style={styles.timelineRight}>
            <Text style={[styles.timelineValue, { color: cfg.color }]}>
              {translateBiomarkerValue(value, language)} <Text style={styles.timelineUnit}>{unit}</Text>
            </Text>
            <View style={[styles.timelineChip, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.timelineChipText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
        </View>
        {barPercent > 0 && (
          <View style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: cfg.color,
            width: `${barPercent}%` as any,
            marginTop: 6,
          }} />
        )}
      </View>
    </View>
  );
}

// ─── Retest alert banner ──────────────────────────────────────────────────────

function RetestBanner({ lastDate, name, t, language }: {
  lastDate: string; name: string; t: ReturnType<typeof useT>; language: string;
}) {
  const info = getRetestStatus(lastDate, name);
  if (!info.isDue) return null;

  const timeLabel = info.monthsAgo < 1
    ? t('lessThan1MonthAgo')
    : t('monthsAgoText', { n: info.monthsAgo });

  const msgKey = info.isOverdue ? 'retestOverdue' : 'retestSoon';
  const color = info.isOverdue ? Colors.attention : Colors.borderline;
  const bg = info.isOverdue ? Colors.attention10 : Colors.borderline10;
  const border = color + '40';

  return (
    <View style={[styles.retestBanner, { backgroundColor: bg, borderColor: border }]}>
      <CircleAlert size={16} color={color} />
      <Text style={[styles.retestText, { color }]}>
        {t(msgKey, { time: timeLabel })}
      </Text>
    </View>
  );
}

// ─── Trend badge ──────────────────────────────────────────────────────────────

function TrendBadge({ current, previous, t }: {
  current: number; previous: number; t: ReturnType<typeof useT>;
}) {
  const delta = current - previous;
  if (Math.abs(delta) < 0.01) {
    return (
      <View style={[styles.trendBadge, { backgroundColor: Colors.surfaceHigh }]}>
        <Minus size={12} color={Colors.outline} />
        <Text style={[styles.trendText, { color: Colors.outline }]}>{t('noChangeVsLast')}</Text>
      </View>
    );
  }
  const up = delta > 0;
  const color = up ? Colors.attention : Colors.optimal;
  const bg = up ? Colors.attention10 : Colors.optimal10;
  return (
    <View style={[styles.trendBadge, { backgroundColor: bg }]}>
      {up ? <TrendingUp size={12} color={color} /> : <TrendingDown size={12} color={color} />}
      <Text style={[styles.trendText, { color }]}>
        {up ? '+' : ''}{delta.toFixed(1)} {up ? t('upVsLast') : t('downVsLast')}
      </Text>
    </View>
  );
}

// ─── Aging velocity / trend warning ──────────────────────────────────────────

type TrendDirection = 'rising' | 'declining' | 'improving_from_high' | 'improving_from_low' | null;

function detectAgingVelocity(
  history: { date: string; biomarker: Biomarker }[],
): { direction: TrendDirection; count: number } {
  if (history.length < 3) return { direction: null, count: 0 };

  // history[0] = newest, so we need chronological order (oldest first)
  const chronological = [...history].reverse();
  const values = chronological.map(h => parseFloat(String(h.biomarker.value)));
  const statuses = chronological.map(h => h.biomarker.status);

  // All values must be parseable
  if (values.some(isNaN)) return { direction: null, count: 0 };

  // Compute deltas between consecutive values
  const deltas: number[] = [];
  for (let i = 1; i < values.length; i++) {
    deltas.push(values[i] - values[i - 1]);
  }

  const allRising   = deltas.every(d => d > 0.001);
  const allDecline  = deltas.every(d => d < -0.001);

  if (!allRising && !allDecline) return { direction: null, count: 0 };

  const latestStatus = statuses[statuses.length - 1];
  const count = history.length;

  if (allRising) {
    // Was previously high/borderline and now improving → positive
    const prevHigh = statuses.slice(0, -1).some(s => s === 'high' || s === 'borderline');
    if (prevHigh && (latestStatus === 'normal' || latestStatus === 'borderline')) {
      return { direction: 'improving_from_high', count };
    }
    // Normal but rising → early warning
    return { direction: 'rising', count };
  }

  if (allDecline) {
    // Was previously low and now improving → positive
    const prevLow = statuses.slice(0, -1).some(s => s === 'low' || s === 'borderline');
    if (prevLow && (latestStatus === 'normal' || latestStatus === 'borderline')) {
      return { direction: 'improving_from_low', count };
    }
    return { direction: 'declining', count };
  }

  return { direction: null, count: 0 };
}

function AgingVelocityCard({
  history, t, language,
}: {
  history: { date: string; biomarker: Biomarker }[];
  t: ReturnType<typeof useT>;
  language: string;
}) {
  const { direction, count } = detectAgingVelocity(history);
  if (!direction) return null;

  const isPositive = direction === 'improving_from_high' || direction === 'improving_from_low';

  let msg = '';
  if (direction === 'rising')               msg = t('trendWarningUp', { n: count });
  else if (direction === 'declining')       msg = t('trendWarningDown', { n: count });
  else                                      msg = t('trendPositiveDesc', { n: count });

  const bgColor     = isPositive ? Colors.optimal10   : Colors.attention10;
  const borderColor = isPositive ? Colors.optimal      : Colors.attention;
  const titleColor  = isPositive ? Colors.optimal      : Colors.attention;
  const icon        = isPositive ? <TrendingDown size={16} color={Colors.optimal} /> : <TrendingUp size={16} color={Colors.attention} />;
  const title       = isPositive ? t('trendPositive') : t('trendWarning');

  return (
    <View style={[stylesVelocity.card, { backgroundColor: bgColor, borderColor: borderColor + '50' }]}>
      <View style={stylesVelocity.header}>
        {icon}
        <Text style={[stylesVelocity.title, { color: titleColor }]}>{title}</Text>
      </View>
      <Text style={stylesVelocity.body}>{msg}</Text>
    </View>
  );
}

const stylesVelocity = StyleSheet.create({
  card: {
    borderRadius: 14, borderWidth: 1,
    padding: 14, marginBottom: 12,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6,
  },
  title: {
    fontFamily: Typography.families.display,
    fontSize: 13, fontWeight: '800',
  },
  body: {
    fontFamily: Typography.families.body,
    fontSize: 13, lineHeight: 20, color: Colors.foreground,
  },
});

// ─── AI Insight Card ──────────────────────────────────────────────────────────

function AIInsightCard({
  biomarker, userAge, userSex, language, t,
}: {
  biomarker: Biomarker;
  userAge: string;
  userSex: 'male' | 'female' | null;
  language: 'en' | 'es';
  t: ReturnType<typeof useT>;
}) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleGetInsight = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await getPersonalizedBiomarkerInsight({
        name: biomarker.name,
        value: biomarker.value,
        unit: biomarker.unit,
        status: biomarker.status,
        referenceRange: biomarker.referenceRange,
        userAge,
        userSex,
        lang: language,
      });
      setInsight(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (insight) {
    return (
      <View style={styles.aiCard}>
        <View style={styles.aiCardHeader}>
          <View style={styles.aiIconWrap}>
            <Sparkles size={16} color={Colors.primary} />
          </View>
          <Text style={styles.aiCardTitle}>{t('aiInsightTitle')}</Text>
        </View>
        <Text style={styles.aiCardBody}>{insight}</Text>
        <TouchableOpacity onPress={() => setInsight(null)} style={styles.aiRefreshBtn}>
          <Text style={styles.aiRefreshText}>{language === 'es' ? 'Regenerar' : 'Regenerate'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.aiBtn}
      onPress={handleGetInsight}
      activeOpacity={0.8}
      disabled={loading}
    >
      {loading ? (
        <>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.aiBtnText}>{t('aiInsightLoading')}</Text>
        </>
      ) : error ? (
        <>
          <CircleX size={18} color={Colors.attention} />
          <Text style={[styles.aiBtnText, { color: Colors.attention }]}>{t('aiInsightError')}</Text>
        </>
      ) : (
        <>
          <Sparkles size={18} color={Colors.primary} />
          <Text style={styles.aiBtnText}>{t('askAI')}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function BiomarkerDetailScreen() {
  const router = useRouter();
  const t = useT();
  const { name } = useLocalSearchParams<{ name: string }>();
  const biomarkers = useStore(s => s.biomarkers);
  const sessions = useStore(s => s.sessions);
  const language = useStore(s => s.language);
  const userAge = useStore(s => s.age);
  const userSex = useStore(s => s.sex);

  const decodedName = name ? decodeURIComponent(name) : '';
  const biomarkerData = biomarkers.find(b => b.name === decodedName);
  const knowledge = getBiomarkerKnowledge(decodedName);

  if (!biomarkerData) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t('notFoundMsg')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cfg = buildStatusCfg(biomarkerData.status, t);

  const history = sessions
    .map(s => {
      const b = s.biomarkers.find(x => x.name === decodedName);
      return b ? { date: s.date, biomarker: b } : null;
    })
    .filter(Boolean) as { date: string; biomarker: Biomarker }[];

  const currentNumeric = parseFloat(String(biomarkerData.value));
  const previousNumeric = history[1] ? parseFloat(String(history[1].biomarker.value)) : null;
  const lastTestDate = history[0]?.date ?? null;

  const plainMessage = getStatusMessage(decodedName, biomarkerData.status, language);

  // Bilingual content from knowledge base
  const simpleName = knowledge?.simpleName[language];
  const whatItMeasures = knowledge?.whatItMeasures[language];
  const whyItMatters = knowledge?.whyItMatters[language];
  const foodsToEat = knowledge?.foodsToEat?.[language];
  const foodsToAvoid = knowledge?.foodsToAvoid?.[language];

  // Optimal range (functional / evidence-based, tighter than lab reference)
  const optimalRangeData = knowledge?.optimalRange;
  const optimalRange = optimalRangeData
    ? (userSex === 'male' ? optimalRangeData.male : userSex === 'female' ? optimalRangeData.female : null) ?? optimalRangeData.general ?? null
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>Clyra</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            {simpleName && (
              <Text style={styles.heroSimpleName} numberOfLines={2}>{knowledge!.emoji}  {simpleName}</Text>
            )}
            <Text style={styles.heroName}>{biomarkerData.name}</Text>
            {lastTestDate && (
              <View style={styles.lastTestRow}>
                <Calendar size={12} color={Colors.outline} />
                <Text style={styles.lastTestText}>
                  {t('lastTest')}: {new Date(lastTestDate).toLocaleDateString(language === 'es' ? 'es' : 'en', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </Text>
              </View>
            )}
            {whatItMeasures && (
              <Text style={styles.heroWhat}>{whatItMeasures}</Text>
            )}
          </View>
          <View style={styles.heroRight}>
            <Text style={[styles.heroValue, { color: cfg.color }]}>
              {translateBiomarkerValue(biomarkerData.value, language)}
            </Text>
            <Text style={styles.heroUnit}>{biomarkerData.unit}</Text>
            <View style={[styles.statusBadge, { backgroundColor: cfg.badgeBg }]}>
              <Text style={styles.statusBadgeText}>{cfg.label}</Text>
            </View>
          </View>
        </View>

        {/* ── Retest alert ── */}
        {lastTestDate && (
          <RetestBanner lastDate={lastTestDate} name={decodedName} t={t} language={language} />
        )}

        {/* ── Aging velocity / consistent trend warning ── */}
        <AgingVelocityCard history={history} t={t} language={language} />

        {/* ── Plain language message ── */}
        {plainMessage && (
          <View style={[styles.messageCard, { backgroundColor: cfg.bg, borderColor: cfg.color + '30' }]}>
            <CircleCheck size={18} color={cfg.color} style={{ marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.messageText, { color: Colors.foreground }]}>{plainMessage}</Text>
              {(biomarkerData.status === 'high' || biomarkerData.status === 'low') && (
                <Text style={[styles.messageText, { color: Colors.mutedForeground, fontSize: 12, marginTop: 6 }]}>
                  {t('disclaimerCritical')}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* ── AI Personal Insight ── */}
        <AIInsightCard
          biomarker={biomarkerData}
          userAge={userAge}
          userSex={userSex}
          language={language}
          t={t}
        />

        {/* ── Why it matters ── */}
        {whyItMatters && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('whyItMattersSection')}</Text>
            <Text style={styles.cardBody}>{whyItMatters}</Text>
          </View>
        )}

        {/* ── Range bar ── */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{t('yourPosition')}</Text>
            {previousNumeric !== null && !isNaN(currentNumeric) && !isNaN(previousNumeric) && (
              <TrendBadge current={currentNumeric} previous={previousNumeric} t={t} />
            )}
          </View>
          <RangeBar
            status={biomarkerData.status}
            value={biomarkerData.value}
            referenceRange={biomarkerData.referenceRange}
            t={t}
            language={language}
          />
          {biomarkerData.referenceRange && (
            <View style={styles.refRow}>
              <Text style={styles.refLabel}>{t('referenceRange')}</Text>
              <Text style={styles.refValue}>{biomarkerData.referenceRange} {biomarkerData.unit}</Text>
            </View>
          )}
          {optimalRange && (
            <View style={styles.refRow}>
              <Text style={[styles.refLabel, { color: Colors.primary }]}>
                {t('optimalRange')} ✦
              </Text>
              <Text style={[styles.refValue, { color: Colors.primary }]}>
                {optimalRange.min}–{optimalRange.max} {biomarkerData.unit}
              </Text>
            </View>
          )}
        </View>

        {/* ── History timeline ── */}
        {history.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{t('history')}</Text>
              <View style={styles.countBadge}>
                <Clock size={11} color={Colors.primary} />
                <Text style={styles.countText}>{t('testsCount', { n: history.length })}</Text>
              </View>
            </View>

            <View style={styles.timeline}>
              {(() => {
                const allValues = history.map(h => parseFloat(String(h.biomarker.value))).filter(n => !isNaN(n));
                return history.map(({ date, biomarker }, i) => (
                  <TimelineRow
                    key={date + i}
                    date={date}
                    value={biomarker.value}
                    unit={biomarker.unit}
                    status={biomarker.status}
                    isFirst={i === 0}
                    isLast={i === history.length - 1}
                    t={t}
                    language={language}
                    allValues={allValues}
                  />
                ));
              })()}
            </View>
          </View>
        )}

        {/* ── Foods to Eat / Avoid ── */}
        {(foodsToEat || foodsToAvoid) && (
          <View style={styles.foodRow}>
            {foodsToEat && (
              <View style={[styles.foodCard, { backgroundColor: Colors.optimal10, borderColor: Colors.optimal + '30' }]}>
                <View style={styles.foodHeader}>
                  <Leaf size={14} color={Colors.optimal} />
                  <Text style={[styles.foodTitle, { color: Colors.optimal }]}>{t('foodsToEat')}</Text>
                </View>
                <Text style={styles.foodBody}>{foodsToEat}</Text>
              </View>
            )}
            {foodsToAvoid && (
              <View style={[styles.foodCard, { backgroundColor: Colors.attention10, borderColor: Colors.attention + '30' }]}>
                <View style={styles.foodHeader}>
                  <CircleX size={14} color={Colors.attention} />
                  <Text style={[styles.foodTitle, { color: Colors.attention }]}>{t('foodsToAvoid')}</Text>
                </View>
                <Text style={styles.foodBody}>{foodsToAvoid}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Recommendations ── */}
        <Text style={styles.sectionTitle}>{t('recommendations')}</Text>
        <View style={styles.recsGrid}>
          {[
            { icon: Utensils, bg: '#eff6ff', color: Colors.primary,   titleKey: 'recNutritionTitle', bodyKey: 'recNutritionBody' },
            { icon: Dumbbell, bg: '#f0fdf4', color: Colors.optimal,   titleKey: 'recExerciseTitle',  bodyKey: 'recExerciseBody' },
            { icon: Moon,     bg: '#f5f3ff', color: '#7c3aed',        titleKey: 'recSleepTitle',     bodyKey: 'recSleepBody' },
            { icon: FlaskConical, bg: '#fff1f2', color: Colors.attention, titleKey: 'recRetestTitle', bodyKey: 'recRetestBody' },
          ].map((r, i) => {
            const Icon = r.icon;
            return (
              <View key={i} style={styles.recCard}>
                <View style={[styles.recIcon, { backgroundColor: r.bg }]}>
                  <Icon size={22} color={r.color} />
                </View>
                <Text style={styles.recTitle}>{t(r.titleKey as any)}</Text>
                <Text style={styles.recBody}>{t(r.bodyKey as any)}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.disclaimer}>{t('disclaimer')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  headerLogo: {
    fontFamily: Typography.families.display,
    fontSize: 17, fontWeight: '800', color: Colors.primary,
  },

  content: { paddingHorizontal: 16, paddingBottom: 100 },

  // Hero
  hero: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLow,
    borderRadius: 24, padding: 20, marginBottom: 12,
  },
  heroSimpleName: {
    fontFamily: Typography.families.body,
    fontSize: 11, fontWeight: '700', color: Colors.outline,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  heroName: {
    fontFamily: Typography.families.display,
    fontSize: 22, fontWeight: '800', color: Colors.foreground,
    lineHeight: 28, marginBottom: 6,
  },
  heroWhat: {
    fontFamily: Typography.families.body,
    fontSize: 11, color: Colors.mutedForeground, marginTop: 4, lineHeight: 16,
  },
  lastTestRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  lastTestText: {
    fontFamily: Typography.families.body,
    fontSize: 11, color: Colors.outline, fontWeight: '500',
  },
  heroRight: { alignItems: 'flex-end', minWidth: 120, flexShrink: 0 },
  heroValue: {
    fontFamily: Typography.families.display,
    fontSize: 30, fontWeight: '800', lineHeight: 34,
  },
  heroUnit: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.mutedForeground, fontWeight: '500', marginBottom: 8,
  },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 9999 },
  statusBadgeText: {
    fontFamily: Typography.families.body,
    fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, color: '#fff',
  },

  // Retest banner
  retestBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12,
  },
  retestText: {
    fontFamily: Typography.families.body,
    flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18,
  },

  // Plain message
  messageCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 14, borderWidth: 1,
    padding: 14, marginBottom: 12,
  },
  messageText: {
    fontFamily: Typography.families.body,
    flex: 1, fontSize: 14, lineHeight: 22, fontWeight: '500',
  },

  // AI Insight
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primary10, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.primary + '30',
  },
  aiBtnText: {
    fontFamily: Typography.families.body,
    fontSize: 14, fontWeight: '700', color: Colors.primary,
  },
  aiCard: {
    backgroundColor: '#fff',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.primary + '25',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
  },
  aiCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10,
  },
  aiIconWrap: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: Colors.primary10,
    alignItems: 'center', justifyContent: 'center',
  },
  aiCardTitle: {
    fontFamily: Typography.families.display,
    fontSize: 14, fontWeight: '800', color: Colors.primary,
  },
  aiCardBody: {
    fontFamily: Typography.families.body,
    fontSize: 14, lineHeight: 22, color: Colors.foreground,
  },
  aiRefreshBtn: { marginTop: 10, alignSelf: 'flex-end' },
  aiRefreshText: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.outline, fontWeight: '600',
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 20, padding: 20, marginBottom: 12,
    shadowColor: '#171c1f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  cardTitleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  cardTitle: {
    fontFamily: Typography.families.display,
    fontSize: 15, fontWeight: '700', color: Colors.foreground,
  },
  cardBody: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.mutedForeground, lineHeight: 21,
  },

  // Trend badge
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999,
  },
  trendText: {
    fontFamily: Typography.families.body,
    fontSize: 11, fontWeight: '600',
  },

  // Range bar
  rangeWrap: { paddingTop: 36, marginBottom: 8 },
  rangeBar: { height: 10, borderRadius: 5 },
  markerWrap: {
    position: 'absolute', top: 0,
    alignItems: 'center', transform: [{ translateX: -18 }],
  },
  markerBubble: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, marginBottom: 4,
  },
  markerText: {
    fontFamily: Typography.families.body,
    color: '#fff', fontSize: 10, fontWeight: '700',
  },
  markerLine: { width: 2, height: 26, backgroundColor: Colors.primary, borderRadius: 1 },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  rangeLabelCol: { alignItems: 'center', flex: 1 },
  zoneName: {
    fontFamily: Typography.families.body,
    fontSize: 10, fontWeight: '700', textTransform: 'uppercase',
  },
  zoneSub: {
    fontFamily: Typography.families.body,
    fontSize: 9, color: Colors.outline, marginTop: 1,
  },

  // Reference row
  refRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surfaceLow, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, marginTop: 8,
  },
  refLabel: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.outline,
  },
  refValue: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '700', color: Colors.foreground,
  },

  // Count badge
  countBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary10,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999,
  },
  countText: {
    fontFamily: Typography.families.body,
    fontSize: 11, fontWeight: '700', color: Colors.primary,
  },

  // Timeline
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', minHeight: 60 },
  timelineLeft: { width: 24, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 3, marginTop: 4, zIndex: 1 },
  timelineLine: { flex: 1, width: 2, backgroundColor: Colors.outlineVariant, marginTop: 2 },
  timelineContent: { flex: 1, paddingLeft: 12, paddingBottom: 16 },
  timelineContentFirst: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: 12, padding: 12, marginLeft: 4,
  },
  timelineRow2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  timelineDate: {
    fontFamily: Typography.families.body,
    fontSize: 13, fontWeight: '600', color: Colors.foreground, marginBottom: 4,
  },
  latestBadge: {
    backgroundColor: Colors.primary10,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start',
  },
  latestBadgeText: {
    fontFamily: Typography.families.body,
    fontSize: 9, fontWeight: '800', color: Colors.primary, letterSpacing: 0.5,
  },
  timelineRight: { alignItems: 'flex-end', gap: 4 },
  timelineValue: {
    fontFamily: Typography.families.display,
    fontSize: 16, fontWeight: '800',
  },
  timelineUnit: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '400', color: Colors.outline,
  },
  timelineChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  timelineChipText: {
    fontFamily: Typography.families.body,
    fontSize: 10, fontWeight: '700',
  },

  // Foods
  foodRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  foodCard: {
    flex: 1, borderRadius: 16, padding: 14, borderWidth: 1,
  },
  foodHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  foodTitle: {
    fontFamily: Typography.families.display,
    fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3,
  },
  foodBody: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.foreground, lineHeight: 18,
  },

  // Recommendations
  sectionTitle: {
    fontFamily: Typography.families.display,
    fontSize: 18, fontWeight: '800', color: Colors.foreground,
    marginBottom: 10, marginTop: 4,
  },
  recsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  recCard: {
    width: '47%', backgroundColor: '#fff',
    borderRadius: 20, padding: 16,
    shadowColor: '#171c1f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  recIcon: {
    width: 42, height: 42, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  recTitle: {
    fontFamily: Typography.families.body,
    fontSize: 13, fontWeight: '700', color: Colors.foreground, marginBottom: 4,
  },
  recBody: {
    fontFamily: Typography.families.body,
    fontSize: 11, color: Colors.mutedForeground, lineHeight: 16,
  },

  // Not found
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  notFoundText: {
    fontFamily: Typography.families.body,
    fontSize: 15, color: Colors.mutedForeground, textAlign: 'center',
  },

  disclaimer: {
    fontFamily: Typography.families.body,
    fontSize: 11, color: Colors.outline, textAlign: 'center',
    lineHeight: 17, paddingHorizontal: 16, marginBottom: 16,
  },
});
