import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { getXPLevel } from '../../constants/gamification';

export default function XPBar({ xp, language }: { xp: number; language: 'en' | 'es' }) {
  const info = getXPLevel(xp);
  const progressPercent = Math.round(info.progress * 100);

  const label =
    language === 'es'
      ? `Nivel de Salud ${info.level} · ${info.currentXP}/${info.nextLevelXP} PS`
      : `Health Level ${info.level} · ${info.currentXP}/${info.nextLevelXP} HP`;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.purple,
    flexShrink: 0,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surfaceLow,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.purple,
  },
});
