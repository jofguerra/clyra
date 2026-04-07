import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface AchievementBadgeProps {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
}

export default function AchievementBadge({ id, name, icon, unlocked }: AchievementBadgeProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: unlocked ? Colors.gold10 : Colors.surfaceLow,
            opacity: unlocked ? 1 : 0.3,
          },
          unlocked && styles.glowShadow,
        ]}
      >
        <Text style={styles.icon}>{unlocked ? icon : '🔒'}</Text>
      </View>
      <Text
        style={[styles.name, { color: unlocked ? Colors.foreground : Colors.outline }]}
        numberOfLines={2}
      >
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowShadow: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: 28,
  },
  name: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
  },
});
