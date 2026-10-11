import React, { useEffect, useRef } from 'react';
import { useMotionEnabled } from '../hooks/useMotionEnabled';
import {
  View, Image, StyleSheet, Animated, Easing, ViewStyle,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MascotPose =
  | 'default'
  | 'waving'
  | 'celebrating'
  | 'thinking'
  | 'sleeping'
  | 'sad'
  | 'pointing'
  | 'flexing'
  | 'doctor'
  | 'clipboardReading';

export type MascotAnimation =
  | 'none'
  | 'idle-breath'       // gentle scale pulse — for Default/idle on most screens
  | 'wave'              // full-body greeting using the original waving pose
  | 'bounce-in'         // entry animation: drop + settle
  | 'celebrate-bounce'  // happy bounce loop
  | 'thinking-tilt'     // slow head tilt
  | 'sleep-bob';        // soft vertical bob

// Original complete poses preserve authored limb and face placement.

// Default has a pre-composited "whole heart.png" — use that for simplicity
const DEFAULT_WHOLE = require('../Animations and Assets/Heart Mascot/Default/whole heart.png');

// Rendered from the original Illustrator artboards, preserving authored placement.
// The individual PNG parts have cropped canvases and cannot be stacked full-size.
const POSES: Record<MascotPose, any> = {
  default: DEFAULT_WHOLE,
  waving: require('../assets/mascot/waving.png'),
  celebrating: require('../assets/mascot/celebrating.png'),
  thinking: require('../assets/mascot/thinking.png'),
  sleeping: require('../assets/mascot/sleeping.png'),
  sad: require('../assets/mascot/sad.png'),
  pointing: require('../assets/mascot/pointing.png'),
  flexing: require('../assets/mascot/flexing.png'),
  doctor: require('../assets/mascot/doctor.png'),
  clipboardReading: require('../assets/mascot/clipboardReading.png'),
};

// ─── Animation presets ─────────────────────────────────────────────────────────
// These operate on the whole mascot container (transform). For per-limb
// animation (arm wave, body squash), export Lottie from the .ai source files.

function useMascotAnimation(animation: MascotAnimation) {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scale.setValue(1); rotate.setValue(0); translateY.setValue(0);
    if (animation === 'none') return;

    let loop: Animated.CompositeAnimation | null = null;

    switch (animation) {
      case 'idle-breath':
        // Gentle scale pulse — ~4s cycle, very subtle
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.03,
              duration: 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      case 'bounce-in':
        // Drop from above, settle with spring
        translateY.setValue(-40);
        scale.setValue(0.6);
        loop = Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            tension: 80,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            tension: 80,
            friction: 5,
            useNativeDriver: true,
          }),
        ]);
        break;

      case 'celebrate-bounce':
        // Happy vertical bounce — 600ms cycle with overshoot
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -12,
              duration: 300,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 300,
              easing: Easing.bounce,
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      case 'thinking-tilt':
        // Slow side-to-side tilt — 3s cycle
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(rotate, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: -1,
              duration: 1500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      case 'sleep-bob':
        // Soft vertical breathing for sleeping mascot
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -3,
              duration: 1800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 1800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      case 'wave':
        // For now, gentle body wiggle — full arm wave requires Lottie
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(rotate, {
              toValue: 1,
              duration: 400,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: -1,
              duration: 400,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: 0,
              duration: 400,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.delay(1200),
          ]),
        );
        break;
    }

    // Secondary buoyancy keeps breathing from looking like a simple zoom.
    const float = animation === 'idle-breath' ? Animated.loop(Animated.sequence([
      Animated.timing(translateY, { toValue:-3, duration:1800, easing:Easing.inOut(Easing.sin), useNativeDriver:true }),
      Animated.timing(translateY, { toValue:0, duration:2200, easing:Easing.inOut(Easing.sin), useNativeDriver:true }),
    ])) : null;
    float?.start();
    loop?.start();
    return () => { loop?.stop(); float?.stop(); };
  }, [animation, scale, rotate, translateY]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-6deg', '6deg'],
  });

  return {
    transform: [
      { translateY },
      { scale },
      { rotate: rotateInterpolate },
    ],
  };
}

// ─── Mascot component ─────────────────────────────────────────────────────────

export interface MascotProps {
  pose?: MascotPose;
  size?: number;
  animation?: MascotAnimation;
  style?: ViewStyle;
}

export default function Mascot({
  pose = 'default',
  size = 120,
  animation = 'idle-breath',
  style,
}: MascotProps) {
  const motion = useMotionEnabled();
  const animatedStyle = useMascotAnimation(motion ? animation : 'none');
  const source = POSES[pose];

  return (
    <Animated.View
      testID="mascot-motion"
      style={[{ width: size, height: size }, animatedStyle, style]}
      pointerEvents="none"
    >
        <Image
          source={source}
          style={[
            StyleSheet.absoluteFillObject,
            { width: size, height: size, resizeMode: 'contain' },
          ]}
          fadeDuration={0}
        />
    </Animated.View>
  );
}
