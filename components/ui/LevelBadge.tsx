import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { getScoreLevel, getPointsToNextLevel, SCORE_LEVELS } from '../../constants/gamification';

const LEVEL_EMOJIS = ['🔴', '🟡', '🔵', '🟢', '⭐'];

const LEVEL_BG_COLORS: Record<string, string> = {
  attention: Colors.attention10,
  base: Colors.borderline10,
  good_shape: Colors.primary10,
  optimized: Colors.optimal10,
  elite: Colors.gold10,
};

export default function LevelBadge({ score, language }: { score: number; language: 'en' | 'es' }) {
  const level = getScoreLevel(score);
  const pointsToNext = getPointsToNextLevel(score);
  const levelIndex = SCORE_LEVELS.findIndex((l) => l.id === level.id);
  const emoji = LEVEL_EMOJIS[levelIndex] ?? '🔴';
  const bgColor = LEVEL_BG_COLORS[level.id] ?? Colors.surfaceLow;

  const isMaxLevel = levelIndex === SCORE_LEVELS.length - 1;
  const nextLevel = !isMaxLevel ? SCORE_LEVELS[levelIndex + 1] : null;

  // Progress within current level
  const levelRange = level.maxScore - level.minScore;
  const progress = levelRange > 0 ? (score - level.minScore) / levelRange : 1;

  const subText = isMaxLevel
    ? language === 'es'
      ? 'Nivel máximo alcanzado'
      : 'Max level reached'
    : language === 'es'
      ? `${pointsToNext} puntos para ${nextLevel!.name.es}`
      : `${pointsToNext} points to ${nextLevel!.name.en}`;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.row}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.levelName, { color: level.color }]}>
            {level.name[language]}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: level.color }]} />
          </View>
        </View>
      </View>
      <Text style={styles.subText}>{subText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 22,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  levelName: {
    fontFamily: Typography.families.display,
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    marginBottom: 6,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  subText: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.sm,
    color: Colors.mutedForeground,
    marginTop: 8,
  },
});
