// Clyra — Heart Mascot (single-PNG + RN Animated)
// ─────────────────────────────────────────────────────────────────────────────
// Uses the pre-rendered kawaii heart PNG (whole heart.png). Animated via React
// Native Animated with three independent motion loops for organic feel.
//
// Why single PNG instead of rigged Lottie:
//   • No risky position guessing (artist-drawn, perfectly proportioned)
//   • Interactive (tap → happy hop)
//   • Lighter runtime (no Lottie parser needed)
//   • 60fps via useNativeDriver
//
// Motion Personality: Playful + Calm
//   Primary   — Breathing (scale 1 ↔ 1.04, 2s sine loop)
//   Secondary — Floating (±6px translateY, 2.2s — offset phase from breathing)
//   Ambient   — Wiggle tilt (-3° → +3° → 0) every ~5s
//   Interactive — Tap hop (-16px + scale 1.06 with spring overshoot)

import React, { useEffect, useRef } from 'react';
import {
    View, Image, StyleSheet, Animated, Easing, TouchableWithoutFeedback,
} from 'react-native';

export type MascotVariant = 'idle' | 'excited' | 'wave';

interface HeartMascotProps {
    size?: number;
    variant?: MascotVariant;
    onPress?: () => void;
    style?: any;
}

export function HeartMascot({
    size = 180,
    variant = 'idle',
    onPress,
    style,
}: HeartMascotProps) {
    const breathe = useRef(new Animated.Value(0)).current;
    const float   = useRef(new Animated.Value(0)).current;
    const wiggle  = useRef(new Animated.Value(0)).current;
    const hop     = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const breathingLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(breathe, {
                    toValue: 1,
                    duration: variant === 'excited' ? 900 : 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(breathe, {
                    toValue: 0,
                    duration: variant === 'excited' ? 900 : 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ]),
        );
        const floatingLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(float, {
                    toValue: 1,
                    duration: 2200,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(float, {
                    toValue: 0,
                    duration: 2200,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ]),
        );
        const wiggleLoop = Animated.loop(
            Animated.sequence([
                Animated.delay(variant === 'excited' ? 2500 : 5000),
                Animated.timing(wiggle, {
                    toValue: -1,
                    duration: 180,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(wiggle, {
                    toValue: 1,
                    duration: 260,
                    easing: Easing.inOut(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(wiggle, {
                    toValue: 0,
                    duration: 240,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
        );

        breathingLoop.start();
        floatingLoop.start();
        wiggleLoop.start();

        return () => {
            breathingLoop.stop();
            floatingLoop.stop();
            wiggleLoop.stop();
        };
    }, [variant]);

    const handlePressIn = () => {
        if (!onPress) return;
        Animated.sequence([
            Animated.timing(hop, {
                toValue: 1,
                duration: 140,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(hop, {
                toValue: 0,
                damping: 10,
                mass: 0.6,
                stiffness: 240,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const scale = breathe.interpolate({
        inputRange: [0, 1],
        outputRange: variant === 'excited' ? [0.98, 1.06] : [1, 1.04],
    });
    const translateY = Animated.add(
        float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }),
        hop.interpolate({ inputRange: [0, 1], outputRange: [0, -16] }),
    );
    const rotate = wiggle.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: variant === 'wave' ? ['-8deg', '0deg', '6deg'] : ['-3deg', '0deg', '3deg'],
    });

    const width = size;
    // Aspect ratio of whole heart.png ≈ 1081 / 938 = 1.152
    const height = size * (938 / 1081);

    const MascotView = (
        <Animated.View
            style={[
                styles.wrap,
                { width, height },
                { transform: [{ translateY }, { scale }, { rotate }] },
                style,
            ]}
        >
            <Image
                source={require('../assets/animations/images/HeartMascot.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
            />
        </Animated.View>
    );

    if (onPress) {
        return (
            <TouchableWithoutFeedback onPress={onPress} onPressIn={handlePressIn}>
                {MascotView}
            </TouchableWithoutFeedback>
        );
    }
    return MascotView;
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
