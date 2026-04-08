import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, Image, useWindowDimensions,
} from 'react-native';
import { FlaskConical } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import {
  BODY_SYSTEMS, BodySystem, SystemStatus,
  getSystemStatus, getSystemBiomarkers, SAMPLE_TYPE_EMOJI,
} from '../constants/biomarkerSystems';
import { Biomarker } from '../services/openai';
import { useStore } from '../hooks/useStore';
import { useT } from '../hooks/useT';

// ─── Image dimensions (484 × 970) — body-map2.png ────────────────────────────
const IMG_W = 484;
const IMG_H = 970;
const IMG_RATIO = IMG_W / IMG_H;

// Hotspot positions calibrated to body-map2 organ centers
const SYSTEM_HOTSPOTS: Record<string, { xPct: number; yPct: number }> = {
  tiroideo:      { xPct: 50,  yPct: 22 },
  hematologico:  { xPct: 35,  yPct: 31 },
  cardiovascular:{ xPct: 43,  yPct: 34 },
  vitaminas:     { xPct: 63,  yPct: 31 },
  hepatico:      { xPct: 62,  yPct: 43 },
  metabolico:    { xPct: 44,  yPct: 46 },
  renal:         { xPct: 63,  yPct: 54 },
  hormonal:      { xPct: 45,  yPct: 61 },
};

// Minimum vertical distance between labels in pixels
const MIN_LABEL_GAP = 30;

/**
 * Spread labels vertically so they don't overlap.
 * Takes an array of { id, rawTop } sorted by rawTop and returns adjusted positions.
 */
function spreadLabels(items: { id: string; rawTop: number }[]): Record<string, number> {
  const sorted = [...items].sort((a, b) => a.rawTop - b.rawTop);
  const result: Record<string, number> = {};
  let lastBottom = -Infinity;
  for (const item of sorted) {
    const adjusted = Math.max(item.rawTop, lastBottom + MIN_LABEL_GAP);
    result[item.id] = adjusted;
    lastBottom = adjusted;
  }
  return result;
}

// Which side each system label appears on
// 'left' = label column on left, 'right' = label column on right
const SIDE: Record<string, 'left' | 'right'> = {
  tiroideo:      'left',
  hematologico:  'left',
  cardiovascular:'left',
  metabolico:    'left',
  hormonal:      'left',
  vitaminas:     'right',
  hepatico:      'right',
  renal:         'right',
};

const STATUS_COLOR: Record<SystemStatus, string> = {
  normal:     Colors.optimal,
  borderline: Colors.borderline,
  attention:  Colors.attention,
  none:       '#9BAABF',
};

// ─── Pulsing ring ─────────────────────────────────────────────────────────────
const DOT_R = 8;

function PulseRing({ color }: { color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
  const opacity = anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.7, 0.3, 0] });
  return (
    <Animated.View pointerEvents="none" style={[styles.pulseRing, { borderColor: color, transform: [{ scale }], opacity }]} />
  );
}

// ─── Small dot on body (no text) ─────────────────────────────────────────────

function BodyDot({ system, status, selected, imgW, imgH, onPress }: {
  system: BodySystem; status: SystemStatus; selected: boolean;
  imgW: number; imgH: number; onPress: () => void;
}) {
  const pos = SYSTEM_HOTSPOTS[system.id];
  if (!pos) return null;
  const cx = (pos.xPct / 100) * imgW;
  const cy = (pos.yPct / 100) * imgH;
  const color = STATUS_COLOR[status];
  const shouldPulse = status === 'attention' || status === 'borderline';
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.dot, {
        left: cx - DOT_R, top: cy - DOT_R,
        width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R,
        backgroundColor: color,
        borderColor: selected ? 'white' : 'rgba(255,255,255,0.5)',
        borderWidth: selected ? 2.5 : 1.5,
        shadowColor: color, shadowOpacity: selected ? 0.8 : 0.4, shadowRadius: selected ? 8 : 3,
        elevation: selected ? 8 : 3,
        transform: [{ scale: selected ? 1.4 : 1 }],
      }]}
    >
      {shouldPulse && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <PulseRing color={color} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Side label chip ──────────────────────────────────────────────────────────

function SideLabel({ system, status, selected, yPct, imgH, side, topOverride, onPress }: {
  system: BodySystem; status: SystemStatus; selected: boolean;
  yPct: number; imgH: number; side: 'left' | 'right'; topOverride?: number; onPress: () => void;
}) {
  const language = useStore(s => s.language) as 'en' | 'es';
  const color = STATUS_COLOR[status];
  const bg = selected ? color + '25' : color + '12';
  const borderColor = selected ? color + '80' : color + '30';
  const topPos = topOverride ?? ((yPct / 100) * imgH - 14);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.sideLabel,
        side === 'left' ? styles.sideLabelLeft : styles.sideLabelRight,
        { top: topPos, backgroundColor: bg, borderColor },
        selected && styles.sideLabelSelected,
      ]}
    >
      <View style={[styles.sideDot, { backgroundColor: color }]} />
      <Text style={[styles.sideLabelText, { color: selected ? color : Colors.foreground }]}>
        {system.shortName[language]}
      </Text>
    </TouchableOpacity>
  );
}


// ─── Required test row ────────────────────────────────────────────────────────

function RequiredTestRow({ name, description, sampleType }: { name: string; description: string; sampleType?: string }) {
  return (
    <View style={styles.testRow}>
      <View style={styles.testIcon}><FlaskConical size={13} color={Colors.primary} /></View>
      <View style={styles.testText}>
        <View style={styles.testNameRow}>
          <Text style={styles.testName}>{name}</Text>
          {sampleType && (
            <View style={styles.sampleBadge}>
              <Text style={styles.sampleBadgeText}>
                {SAMPLE_TYPE_EMOJI[sampleType] ?? ''} {sampleType}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.testDesc}>{description}</Text>
      </View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BodyMap({ biomarkers, selectedSystemId, onSelectSystem }: {
  biomarkers: Biomarker[];
  selectedSystemId?: string | null;
  onSelectSystem?: (id: string | null) => void;
}) {
  const t = useT();
  const language = useStore(s => s.language) as 'en' | 'es';
  const { width: screenWidth } = useWindowDimensions();
  // Use external selected state if provided, otherwise internal
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const selectedId = selectedSystemId !== undefined ? selectedSystemId : internalSelectedId;

  const STATUS_LABEL: Record<SystemStatus, string> = {
    normal:     t('legendNormal'),
    borderline: t('legendBorderline'),
    attention:  t('legendAttention'),
    none:       t('legendNoData'),
  };

  // Body image: 52% of screen width
  const imgDisplayW = Math.round(screenWidth * 0.52);
  const imgDisplayH = Math.round(imgDisplayW / IMG_RATIO);
  // Side columns: each gets ~24% of screen width
  const colW = Math.round(screenWidth * 0.24);

  const leftSystems = BODY_SYSTEMS.filter(s => SIDE[s.id] === 'left');
  const rightSystems = BODY_SYSTEMS.filter(s => SIDE[s.id] === 'right');

  // Pre-compute spread label positions to avoid overlap
  const leftSpread = spreadLabels(
    leftSystems.map(s => ({ id: s.id, rawTop: ((SYSTEM_HOTSPOTS[s.id]?.yPct ?? 0) / 100) * imgDisplayH - 14 }))
  );
  const rightSpread = spreadLabels(
    rightSystems.map(s => ({ id: s.id, rawTop: ((SYSTEM_HOTSPOTS[s.id]?.yPct ?? 0) / 100) * imgDisplayH - 14 }))
  );

  const handleSelect = (id: string) => {
    const newId = selectedId === id ? null : id;
    if (onSelectSystem) {
      onSelectSystem(newId);
    } else {
      setInternalSelectedId(newId);
    }
  };

  return (
    <View style={styles.wrapper}>

      {/* ── Three-column layout ── */}
      <View style={[styles.mapRow, { height: imgDisplayH }]}>

        {/* Left labels */}
        <View style={[styles.sideCol, { width: colW, height: imgDisplayH }]}>
          {leftSystems.map(system => {
            const pos = SYSTEM_HOTSPOTS[system.id];
            if (!pos) return null;
            return (
              <SideLabel
                key={system.id}
                system={system}
                status={getSystemStatus(system, biomarkers)}
                selected={selectedId === system.id}
                yPct={pos.yPct}
                imgH={imgDisplayH}
                side="left"
                topOverride={leftSpread[system.id]}
                onPress={() => handleSelect(system.id)}
              />
            );
          })}
        </View>

        {/* Body image with dots */}
        <View style={[styles.imageContainer, { width: imgDisplayW, height: imgDisplayH }]}>
          <Image
            source={require('../assets/body-map2.png')}
            style={{ width: imgDisplayW, height: imgDisplayH, opacity: 0.88 }}
            resizeMode="contain"
          />
          {BODY_SYSTEMS.map(system => (
            <BodyDot
              key={system.id}
              system={system}
              status={getSystemStatus(system, biomarkers)}
              selected={selectedId === system.id}
              imgW={imgDisplayW}
              imgH={imgDisplayH}
              onPress={() => handleSelect(system.id)}
            />
          ))}
        </View>

        {/* Right labels */}
        <View style={[styles.sideCol, { width: colW, height: imgDisplayH }]}>
          {rightSystems.map(system => {
            const pos = SYSTEM_HOTSPOTS[system.id];
            if (!pos) return null;
            return (
              <SideLabel
                key={system.id}
                system={system}
                status={getSystemStatus(system, biomarkers)}
                selected={selectedId === system.id}
                yPct={pos.yPct}
                imgH={imgDisplayH}
                side="right"
                topOverride={rightSpread[system.id]}
                onPress={() => handleSelect(system.id)}
              />
            );
          })}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {(['normal', 'borderline', 'attention', 'none'] as SystemStatus[]).map(s => (
          <View key={s} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLOR[s] }]} />
            <Text style={styles.legendLabel}>{STATUS_LABEL[s]}</Text>
          </View>
        ))}
      </View>

      {biomarkers.length === 0 && (
        <Text style={styles.tapHint}>{t('tapToSeeTests')}</Text>
      )}

      {/* No-data panel: show required tests when a system has no biomarkers */}
      {selectedId && (() => {
        const sys = BODY_SYSTEMS.find(s => s.id === selectedId);
        if (!sys) return null;
        const sysBiomarkers = getSystemBiomarkers(sys, biomarkers);
        if (sysBiomarkers.length > 0) return null; // markers shown in unified list below
        const status = getSystemStatus(sys, biomarkers);
        const color = STATUS_COLOR[status];
        return (
          <View style={[styles.panel, { borderColor: color + '30' }]}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelEmoji}>{sys.emoji}</Text>
              <Text style={styles.panelTitle}>{sys.name[language]}</Text>
              <View style={[styles.statusChip, { backgroundColor: color + '20' }]}>
                <Text style={[styles.statusChipText, { color }]}>{STATUS_LABEL[status]}</Text>
              </View>
            </View>
            <Text style={styles.noDataTitle}>{t('noDataForSystem')}</Text>
            <Text style={styles.noDataSub}>{t('askForTests')}</Text>
            <View style={styles.testList}>
              {sys.requiredTests.map(req => (
                <RequiredTestRow
                  key={req.name[language]}
                  name={req.name[language]}
                  description={req.description[language]}
                  sampleType={req.sampleType}
                />
              ))}
            </View>
          </View>
        );
      })()}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: { width: '100%' },

  mapRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sideCol: {
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
  },

  // Body dot (no text, just colored indicator)
  dot: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 2 },
  },

  pulseRing: {
    position: 'absolute',
    width: DOT_R * 2, height: DOT_R * 2,
    borderRadius: DOT_R, borderWidth: 1.5,
    top: 0, left: 0,
  },

  // Side labels
  sideLabel: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 26,
  },
  sideLabelLeft: {
    right: 0,
  },
  sideLabelRight: {
    left: 0,
  },
  sideLabelSelected: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
  sideDot: {
    width: 6, height: 6, borderRadius: 3,
  },
  sideLabelText: {
    fontFamily: Typography.families.body,
    fontSize: 9, fontWeight: '700',
  },

  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendLabel: {
    fontFamily: Typography.families.body,
    fontSize: 10, color: Colors.mutedForeground, fontWeight: '500',
  },

  tapHint: {
    fontFamily: Typography.families.body,
    textAlign: 'center', fontSize: 12, color: Colors.outline,
    marginBottom: 12, fontStyle: 'italic',
  },

  // Detail panel
  panel: {
    borderRadius: 20, borderWidth: 1,
    backgroundColor: '#ffffff',
    padding: 16, marginTop: 4,
    shadowColor: '#171c1f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  panelHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 14,
  },
  panelEmoji: { fontSize: 20 },
  panelTitle: {
    fontFamily: Typography.families.body,
    flex: 1, fontSize: 16, fontWeight: '700', color: Colors.foreground,
  },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
  statusChipText: {
    fontFamily: Typography.families.body,
    fontSize: 11, fontWeight: '700',
  },

  // No data
  noDataTitle: {
    fontFamily: Typography.families.body,
    fontSize: 13, fontWeight: '600', color: Colors.foreground, marginBottom: 4,
  },
  noDataSub: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.outline, marginBottom: 12,
  },
  testList: { gap: 10 },
  testRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  testIcon: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: Colors.primary10,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  testText: { flex: 1 },
  testNameRow: {
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6, marginBottom: 2,
  },
  testName: {
    fontFamily: Typography.families.body,
    fontSize: 13, fontWeight: '700', color: Colors.foreground,
  },
  sampleBadge: {
    backgroundColor: Colors.muted,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  sampleBadgeText: {
    fontFamily: Typography.families.body,
    fontSize: 9, color: Colors.mutedForeground, textTransform: 'capitalize' as const,
  },
  testDesc: {
    fontFamily: Typography.families.body,
    fontSize: 11, color: Colors.mutedForeground, lineHeight: 16,
  },
});
