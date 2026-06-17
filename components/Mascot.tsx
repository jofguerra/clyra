import React, { useEffect, useRef } from 'react';
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
  | 'wave'              // rotating arm (future — needs individual layer animation)
  | 'bounce-in'         // entry animation: drop + settle
  | 'celebrate-bounce'  // happy bounce loop
  | 'thinking-tilt'     // slow head tilt
  | 'sleep-bob';        // soft vertical bob

// ─── Pose → parts manifest ─────────────────────────────────────────────────────
// Each pose is stacked bottom → top. Legs behind body, arms in front, face on top.

// Default has a pre-composited "whole heart.png" — use that for simplicity
const DEFAULT_WHOLE = require('../Animations and Assets/Heart Mascot/Default/whole heart.png');

const POSES: Record<MascotPose, any[]> = {
  default: [DEFAULT_WHOLE],

  waving: [
    require('../Animations and Assets/Heart Mascot/Waving/leg 1.png'),
    require('../Animations and Assets/Heart Mascot/Waving/leg 2.png'),
    require('../Animations and Assets/Heart Mascot/Waving/body.png'),
    require('../Animations and Assets/Heart Mascot/Waving/arm 1.png'),
    require('../Animations and Assets/Heart Mascot/Waving/arm 2.png'),
    require('../Animations and Assets/Heart Mascot/Waving/eyes.png'),
    require('../Animations and Assets/Heart Mascot/Waving/mouth.png'),
  ],

  celebrating: [
    require('../Animations and Assets/Heart Mascot/Celebrating/leg 1.png'),
    require('../Animations and Assets/Heart Mascot/Celebrating/leg 2.png'),
    require('../Animations and Assets/Heart Mascot/Celebrating/body.png'),
    require('../Animations and Assets/Heart Mascot/Celebrating/arm 1.png'),
    require('../Animations and Assets/Heart Mascot/Celebrating/arm 2.png'),
    require('../Animations and Assets/Heart Mascot/Celebrating/eyes.png'),
    require('../Animations and Assets/Heart Mascot/Celebrating/mouth.png'),
    require('../Animations and Assets/Heart Mascot/Celebrating/confetti.png'),
  ],

  thinking: [
    require('../Animations and Assets/Heart Mascot/Thinking/leg 1.png'),
    require('../Animations and Assets/Heart Mascot/Thinking/leg 2.png'),
    require('../Animations and Assets/Heart Mascot/Thinking/body.png'),
    require('../Animations and Assets/Heart Mascot/Thinking/arm 1.png'),
    require('../Animations and Assets/Heart Mascot/Thinking/arm 2.png'),
    require('../Animations and Assets/Heart Mascot/Thinking/eyes.png'),
    require('../Animations and Assets/Heart Mascot/Thinking/mouth.png'),
  ],

  sleeping: [
    require('../Animations and Assets/Heart Mascot/Sleeping/pillow.png'),
    require('../Animations and Assets/Heart Mascot/Sleeping/body.png'),
    require('../Animations and Assets/Heart Mascot/Sleeping/hand 1.png'),
    require('../Animations and Assets/Heart Mascot/Sleeping/hand 2.png'),
    require('../Animations and Assets/Heart Mascot/Sleeping/eyes.png'),
    require('../Animations and Assets/Heart Mascot/Sleeping/mouth.png'),
  ],

  sad: [
    require('../Animations and Assets/Heart Mascot/Sad/leg 1.png'),
    require('../Animations and Assets/Heart Mascot/Sad/leg 2.png'),
    require('../Animations and Assets/Heart Mascot/Sad/body.png'),
    require('../Animations and Assets/Heart Mascot/Sad/arm 1.png'),
    require('../Animations and Assets/Heart Mascot/Sad/arm 2.png'),
    require('../Animations and Assets/Heart Mascot/Sad/eyes.png'),
    require('../Animations and Assets/Heart Mascot/Sad/mouth.png'),
  ],

  pointing: [
    require('../Animations and Assets/Heart Mascot/Pointing/leg 1.png'),
    require('../Animations and Assets/Heart Mascot/Pointing/leg 2.png'),
    require('../Animations and Assets/Heart Mascot/Pointing/body.png'),
    require('../Animations and Assets/Heart Mascot/Pointing/arm 1.png'),
    require('../Animations and Assets/Heart Mascot/Pointing/arm 2.png'),
    require('../Animations and Assets/Heart Mascot/Pointing/eyes.png'),
    require('../Animations and Assets/Heart Mascot/Pointing/mouth.png'),
  ],

  flexing: [
    require('../Animations and Assets/Heart Mascot/Flexing/leg 1.png'),
    require('../Animations and Assets/Heart Mascot/Flexing/leg 2.png'),
    require('../Animations and Assets/Heart Mascot/Flexing/body.png'),
    require('../Animations and Assets/Heart Mascot/Flexing/arm 1.png'),
    require('../Animations and Assets/Heart Mascot/Flexing/arm 2.png'),
    require('../Animations and Assets/Heart Mascot/Flexing/eyes.png'),
    require('../Animations and Assets/Heart Mascot/Flexing/mouth.png'),
  ],

  doctor: [
    require('../Animations and Assets/Heart Mascot/Doctor/leg 1.png'),
    require('../Animations and Assets/Heart Mascot/Doctor/leg 2.png'),
    require('../Animations and Assets/Heart Mascot/Doctor/body.png'),
    require('../Animations and Assets/Heart Mascot/Doctor/arm 1.png'),
    require('../Animations and Assets/Heart Mascot/Doctor/arm 2.png'),
    require('../Animations and Assets/Heart Mascot/Doctor/uniform.png'),
    require('../Animations and Assets/Heart Mascot/Doctor/eyes.png'),
  ],

  clipboardReading: [
    require('../Animations and Assets/Heart Mascot/Clipboard-Reading/leg 1.png'),
    require('../Animations and Assets/Heart Mascot/Clipboard-Reading/leg 2.png'),
    require('../Animations and Assets/Heart Mascot/Clipboard-Reading/body.png'),
    require('../Animations and Assets/Heart Mascot/Clipboard-Reading/clipboard.png'),
    require('../Animations and Assets/Heart Mascot/Clipboard-Reading/magnifying lens.png'),
    require('../Animations and Assets/Heart Mascot/Clipboard-Reading/eyes.png'),
    require('../Animations and Assets/Heart Mascot/Clipboard-Reading/mouth.png'),
  ],
};

// ─── Animation presets ─────────────────────────────────────────────────────────
// These operate on the whole mascot container (transform). For per-limb
// animation (arm wave, body squash), export Lottie from the .ai source files.

function useMascotAnimation(animation: MascotAnimation) {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
        Animated.parallel([
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
        ]).start();
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

    loop?.start();
    return () => loop?.stop();
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
  const animatedStyle = useMascotAnimation(animation);
  const parts = POSES[pose];

  return (
    <Animated.View
      style={[{ width: size, height: size }, animatedStyle, style]}
      pointerEvents="none"
    >
      {parts.map((src, i) => (
        <Image
          key={i}
          source={src}
          style={[
            StyleSheet.absoluteFillObject,
            { width: size, height: size, resizeMode: 'contain' },
          ]}
          fadeDuration={0}
        />
      ))}
    </Animated.View>
  );
}
