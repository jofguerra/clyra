import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface MissionCardProps {
  name: string;
  description: string;
  progress: number;
  xpReward: number;
  icon: string;
  onPress?: () => void;
  completed?: boolean;
}

export default function MissionCard({
  name,
  description,
  progress,
  xpReward,
  icon,
  onPress,
  completed = false,
}: MissionCardProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      {completed && <View style={styles.completedOverlay} />}

      <View style={styles.topRow}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.name, completed && styles.completedText]} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{xpReward} HP</Text>
        </View>
      </View>

      <Text style={[styles.description, completed && styles.completedText]} numberOfLines={2}>
        {description}
      </Text>

      {completed ? (
        <View style={styles.completedRow}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.completedLabel}>Completed</Text>
        </View>
      ) : (
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${clampedProgress}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{clampedProgress}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    shadowColor: Colors.shadowMd,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 105, 71, 0.04)',
    borderRadius: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  name: {
    flex: 1,
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    color: Colors.foreground,
    marginRight: 8,
  },
  xpBadge: {
    backgroundColor: Colors.purple10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  xpText: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.purple,
  },
  description: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.sm,
    color: Colors.mutedForeground,
    lineHeight: 16,
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceLow,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  progressLabel: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.mutedForeground,
    minWidth: 32,
    textAlign: 'right',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkmark: {
    fontSize: 16,
    color: Colors.optimal,
    fontWeight: '700',
  },
  completedLabel: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.optimal,
  },
  completedText: {
    opacity: 0.7,
  },
});
