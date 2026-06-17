import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Mascot, { MascotPose, MascotAnimation } from './Mascot';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

export interface MascotBubbleProps {
  pose?: MascotPose;
  animation?: MascotAnimation;
  size?: number;
  message: string;
  subMessage?: string;
  /** 'row' = mascot left, bubble right | 'stacked' = mascot on top, bubble below */
  layout?: 'row' | 'stacked';
  style?: ViewStyle;
}

/**
 * Mascot + speech bubble combo — use for empty states, guidance, and
 * friendly callouts. Works in both horizontal and stacked orientation.
 */
export default function MascotBubble({
  pose = 'default',
  animation = 'idle-breath',
  size = 96,
  message,
  subMessage,
  layout = 'stacked',
  style,
}: MascotBubbleProps) {
  const isRow = layout === 'row';

  return (
    <View style={[isRow ? styles.rowContainer : styles.stackedContainer, style]}>
      <Mascot pose={pose} animation={animation} size={size} />

      <View style={[
        styles.bubble,
        isRow ? styles.bubbleRow : styles.bubbleStacked,
      ]}>
        {/* Speech-bubble tail */}
        <View style={[
          styles.tail,
          isRow ? styles.tailRow : styles.tailStacked,
        ]} />
        <Text style={styles.message}>{message}</Text>
        {subMessage ? (
          <Text style={styles.subMessage}>{subMessage}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stackedContainer: {
    alignItems: 'center',
    gap: 14,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  bubble: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    maxWidth: 280,
  },
  bubbleStacked: {
    alignItems: 'center',
  },
  bubbleRow: {
    flex: 1,
  },

  // Tail pointing at mascot
  tail: {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: Colors.border,
    transform: [{ rotate: '45deg' }],
  },
  tailStacked: {
    top: -8,
    alignSelf: 'center',
  },
  tailRow: {
    left: -8,
    top: '50%',
    marginTop: -7,
  },

  message: {
    fontFamily: Typography.families.body,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.foreground,
    lineHeight: 22,
    textAlign: 'center',
  },
  subMessage: {
    fontFamily: Typography.families.body,
    fontSize: 13,
    color: Colors.mutedForeground,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 4,
  },
});
