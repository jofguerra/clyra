// Achievement Unlock Celebration Modal
// ─────────────────────────────────────────────────────────────────────────────
// Fires when a user unlocks a new achievement (badge). Variable-reward loop
// keeps users coming back after each exam.
//
// Motion Design (Playful archetype):
//   • Emotional intent: Joy + pride
//   • Narrative: darkness → badge flies in → celebration → tap to dismiss
//   • Three layers:
//       Primary  — hex badge scales + translates from below (spring bounce)
//       Secondary — title/subtitle fade+slide-up after badge lands
//       Ambient   — glow pulse around badge, backdrop fade

import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, Animated, Modal, TouchableWithoutFeedback,
    Dimensions, Image,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Svg, { Polygon } from 'react-native-svg';
import { useSegments } from 'expo-router';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Motion, SPRING_PLAYFUL } from '../constants/motion';
import { ACHIEVEMENTS } from '../constants/gamification';
import { useStore } from '../hooks/useStore';

const { width: SCREEN_W } = Dimensions.get('window');

const BADGE_IMAGES: Record<string, any> = {
    first_exam: require('../assets/badges/first_exam.png'),
    trend_unlocked: require('../assets/badges/trend_unlocked.png'),
    heart_green: require('../assets/badges/heart_green.png'),
    kidneys_green: require('../assets/badges/kidneys_green.png'),
    five_improved: require('../assets/badges/five_improved.png'),
    full_profile: require('../assets/badges/full_profile.png'),
    three_checkups: require('../assets/badges/three_checkups.png'),
    bio_age_reduced: require('../assets/badges/bio_age_reduced.png'),
    metabolic_reboot: require('../assets/badges/metabolic_reboot.png'),
    coverage_50: require('../assets/badges/coverage_50.png'),
    coverage_80: require('../assets/badges/coverage_80.png'),
    elite_score: require('../assets/badges/elite_score.png'),
};

const HEX = 160;
const HEX_IMG = 110;

function hexPoints(size: number): string {
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 2;
    return Array.from({ length: 6 })
        .map((_, i) => {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        })
        .join(' ');
}

export function AchievementUnlockModal() {
    const queue = useStore((s) => s.pendingUnlockedAchievements);
    const dequeue = useStore((s) => s.dequeueUnlockedAchievement);
    const language = useStore((s) => s.language) as 'en' | 'es';
    const segments = useSegments();

    // ─── Timing rule ──────────────────────────────────────────────────────
    // Don't show the modal during the upload flow (user is celebrating their
    // "Analysis complete" screen; badges would compete for attention).
    // Wait until they're on Home/Trends/Actions/Settings — THEN pop the reward.
    //
    // We also delay 400ms after the route settles so it doesn't flicker in
    // during a transition animation.
    const currentTab = (segments as string[])[1] ?? '';
    const onUploadTab = currentTab === 'upload';

    const [canShow, setCanShow] = useState(false);
    useEffect(() => {
        if (onUploadTab) {
            setCanShow(false);
            return;
        }
        // Give the tab transition time to finish before celebrating
        const timer = setTimeout(() => setCanShow(true), 400);
        return () => clearTimeout(timer);
    }, [onUploadTab]);

    const visible = queue.length > 0 && canShow;
    const currentId = queue[0];
    const achievement = ACHIEVEMENTS.find((a) => a.id === currentId);

    // Animated values
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const badgeScale = useRef(new Animated.Value(0)).current;
    const badgeY = useRef(new Animated.Value(80)).current; // slide up from below
    const glowOpacity = useRef(new Animated.Value(0)).current;
    const glowScale = useRef(new Animated.Value(0.8)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleY = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        if (!visible) return;

        // Reset values for fresh entrance
        backdropOpacity.setValue(0);
        badgeScale.setValue(0);
        badgeY.setValue(80);
        glowOpacity.setValue(0);
        glowScale.setValue(0.8);
        titleOpacity.setValue(0);
        titleY.setValue(16);

        // Choreographed entrance
        Animated.sequence([
            // 1. Backdrop fades in (ambient)
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: Motion.duration.quick,
                easing: Motion.easing.decelerate,
                useNativeDriver: true,
            }),
            // 2. Badge flies in from below with spring bounce (primary)
            Animated.parallel([
                Animated.spring(badgeScale, {
                    toValue: 1,
                    damping: 10,
                    mass: 0.8,
                    stiffness: 160,
                    useNativeDriver: true,
                }),
                Animated.spring(badgeY, {
                    toValue: 0,
                    damping: 12,
                    mass: 0.8,
                    stiffness: 180,
                    useNativeDriver: true,
                }),
            ]),
            // 3. Title + description fade up (secondary)
            Animated.parallel([
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: Motion.duration.standard,
                    easing: Motion.easing.decelerate,
                    useNativeDriver: true,
                }),
                Animated.spring(titleY, {
                    toValue: 0,
                    ...SPRING_PLAYFUL,
                }),
            ]),
        ]).start();

        // Ambient glow — starts with the badge, loops while visible
        Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(glowOpacity, {
                        toValue: 0.6,
                        duration: 1400,
                        easing: Motion.easing.ambient,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowScale, {
                        toValue: 1.15,
                        duration: 1400,
                        easing: Motion.easing.ambient,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(glowOpacity, {
                        toValue: 0.2,
                        duration: 1400,
                        easing: Motion.easing.ambient,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowScale, {
                        toValue: 0.9,
                        duration: 1400,
                        easing: Motion.easing.ambient,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        ).start();
    }, [visible, currentId]);

    const handleDismiss = () => {
        // Exit animation, then dequeue (next one in queue will trigger new entrance)
        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: Motion.duration.quick,
                easing: Motion.easing.exit,
                useNativeDriver: true,
            }),
            Animated.timing(badgeScale, {
                toValue: 0.7,
                duration: Motion.duration.quick,
                easing: Motion.easing.exit,
                useNativeDriver: true,
            }),
            Animated.timing(titleOpacity, {
                toValue: 0,
                duration: Motion.duration.micro,
                useNativeDriver: true,
            }),
        ]).start(() => {
            dequeue();
        });
    };

    if (!visible || !achievement) return null;

    const badgeImage = BADGE_IMAGES[achievement.id];
    const queueCount = queue.length;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={handleDismiss}
            statusBarTranslucent
        >
            <TouchableWithoutFeedback onPress={handleDismiss}>
                <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                    <TouchableWithoutFeedback>
                        <View style={styles.content}>
                            {/* Ambient glow ring behind the badge */}
                            <Animated.View
                                style={[
                                    styles.glow,
                                    {
                                        opacity: glowOpacity,
                                        transform: [{ scale: glowScale }],
                                    },
                                ]}
                            />

                            {/* Confetti burst — fires once when modal appears */}
                            <View style={styles.confettiWrap} pointerEvents="none">
                                <LottieView
                                    key={currentId /* reset animation for each badge */}
                                    source={require('../assets/animations/confetti-burst.json')}
                                    autoPlay
                                    loop={false}
                                    style={styles.confetti}
                                    resizeMode="cover"
                                />
                            </View>

                            {/* Hex badge (primary) */}
                            <Animated.View
                                style={[
                                    styles.badgeWrap,
                                    {
                                        transform: [
                                            { translateY: badgeY },
                                            { scale: badgeScale },
                                        ],
                                    },
                                ]}
                            >
                                <Svg width={HEX} height={HEX} style={StyleSheet.absoluteFill}>
                                    <Polygon
                                        points={hexPoints(HEX)}
                                        fill="#ffffff"
                                        stroke={Colors.primary}
                                        strokeWidth={3}
                                    />
                                </Svg>
                                {badgeImage ? (
                                    <Image
                                        source={badgeImage}
                                        style={styles.badgeImage}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Text style={styles.badgeEmoji}>{achievement.icon ?? '🏆'}</Text>
                                )}
                            </Animated.View>

                            {/* Title + description (secondary) */}
                            <Animated.View
                                style={{
                                    opacity: titleOpacity,
                                    transform: [{ translateY: titleY }],
                                    alignItems: 'center',
                                    marginTop: 32,
                                }}
                            >
                                <Text style={styles.unlockedLabel}>
                                    {language === 'es' ? '✨ DESBLOQUEADO' : '✨ UNLOCKED'}
                                </Text>
                                <Text style={styles.title}>{achievement.name[language]}</Text>
                                <Text style={styles.description}>
                                    {achievement.description[language]}
                                </Text>
                            </Animated.View>

                            {/* Tap-to-dismiss hint */}
                            <Animated.Text style={[styles.dismissHint, { opacity: titleOpacity }]}>
                                {queueCount > 1
                                    ? language === 'es'
                                        ? `Toca para continuar (${queueCount - 1} más)`
                                        : `Tap to continue (${queueCount - 1} more)`
                                    : language === 'es'
                                      ? 'Toca para continuar'
                                      : 'Tap to continue'}
                            </Animated.Text>
                        </View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 32,
        width: SCREEN_W,
    },
    glow: {
        position: 'absolute',
        width: HEX * 1.5,
        height: HEX * 1.5,
        borderRadius: HEX * 0.75,
        backgroundColor: Colors.primary,
        top: '50%',
        marginTop: -(HEX * 1.5) / 2 - 60, // center on the badge (badge sits above title)
        shadowColor: Colors.primary,
        shadowOpacity: 0.8,
        shadowRadius: 40,
        shadowOffset: { width: 0, height: 0 },
    },
    confettiWrap: {
        position: 'absolute',
        width: 400,
        height: 400,
        top: '50%',
        marginTop: -260, // center on the hex badge (badge sits above title)
    },
    confetti: {
        width: '100%',
        height: '100%',
    },
    badgeWrap: {
        width: HEX,
        height: HEX,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeImage: {
        width: HEX_IMG,
        height: HEX_IMG,
        borderRadius: 12,
    },
    badgeEmoji: {
        fontSize: 64,
    },
    unlockedLabel: {
        fontFamily: Typography.families.body,
        fontSize: 12,
        fontWeight: '800',
        color: Colors.primary,
        letterSpacing: 2,
        marginBottom: 12,
    },
    title: {
        fontFamily: Typography.families.display,
        fontSize: 26,
        fontWeight: '900',
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: -0.3,
        marginBottom: 10,
    },
    description: {
        fontFamily: Typography.families.body,
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 300,
    },
    dismissHint: {
        fontFamily: Typography.families.body,
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 48,
    },
});
