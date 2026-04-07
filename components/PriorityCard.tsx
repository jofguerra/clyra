import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface PriorityCardProps {
  title: string;
  subtitle: string;
  impact: string;
  icon: string;
  onPress?: () => void;
}

export default function PriorityCard({ title, subtitle, impact, icon, onPress }: PriorityCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
      </View>

      <View style={styles.right}>
        <View style={styles.impactBadge}>
          <Text style={styles.impactText}>{impact}</Text>
        </View>
        <ChevronRight size={18} color={Colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    shadowColor: Colors.shadowMd,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    color: Colors.foreground,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.sm,
    color: Colors.mutedForeground,
    lineHeight: 16,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  impactBadge: {
    backgroundColor: Colors.optimal10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  impactText: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.optimal,
  },
});
