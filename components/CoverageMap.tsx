import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Biomarker } from '../services/openai';
import { BODY_SYSTEMS } from '../constants/biomarkerSystems';
import { computeSystemCoverage, computeOverallCoverage } from '../constants/healthMetrics';

interface CoverageMapProps {
  biomarkers: Biomarker[];
  language: 'en' | 'es';
  onSystemPress?: (systemId: string) => void;
}

export default function CoverageMap({ biomarkers, language, onSystemPress }: CoverageMapProps) {
  const overall = computeOverallCoverage(biomarkers);

  const systemRows = BODY_SYSTEMS.map((sys) => {
    const coverage = computeSystemCoverage(biomarkers, sys);
    return {
      id: sys.id,
      emoji: sys.emoji,
      name: sys.name[language],
      percentage: coverage.percentage,
      covered: coverage.covered,
      total: coverage.total,
    };
  }).sort((a, b) => a.percentage - b.percentage);

  const overallLabel = language === 'es' ? 'Cobertura Total' : 'Overall Coverage';
  const addTestsLabel = language === 'es' ? 'Agregar análisis' : 'Add tests';

  return (
    <View style={styles.container}>
      <View style={styles.overallSection}>
        <Text style={styles.overallPercent}>{overall.percentage}%</Text>
        <Text style={styles.overallLabel}>{overallLabel}</Text>
      </View>

      <View style={styles.systemsList}>
        {systemRows.map((sys) => (
          <TouchableOpacity
            key={sys.id}
            activeOpacity={0.7}
            onPress={() => onSystemPress?.(sys.id)}
            style={styles.systemRow}
          >
            <Text style={styles.systemEmoji}>{sys.emoji}</Text>
            <View style={styles.systemInfo}>
              <View style={styles.systemHeader}>
                <Text style={styles.systemName} numberOfLines={1}>{sys.name}</Text>
                <Text style={styles.systemPercent}>{sys.percentage}%</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${sys.percentage}%`,
                      backgroundColor: sys.percentage > 0 ? Colors.primary : Colors.surfaceLow,
                    },
                  ]}
                />
              </View>
              {sys.percentage === 0 && (
                <Text style={styles.addTests}>{addTestsLabel}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  overallSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  overallPercent: {
    fontFamily: Typography.families.display,
    fontSize: Typography.sizes.display,
    fontWeight: '700',
    color: Colors.primary,
  },
  overallLabel: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.sm,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  systemsList: {
    gap: 12,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  systemEmoji: {
    fontSize: 20,
    width: 30,
    textAlign: 'center',
    marginRight: 10,
  },
  systemInfo: {
    flex: 1,
  },
  systemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  systemName: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.foreground,
    flex: 1,
    marginRight: 8,
  },
  systemPercent: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.mutedForeground,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surfaceLow,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  addTests: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.xs,
    color: Colors.outline,
    marginTop: 3,
  },
});
