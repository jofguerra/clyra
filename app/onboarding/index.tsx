import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    ScrollView,
    NativeSyntheticEvent,
    NativeScrollEvent,
    TouchableOpacity,
    Alert,
    Animated,
    Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Mascot from '../../components/Mascot';
import { Typography } from '../../constants/typography';
import { useStore } from '../../hooks/useStore';

const { width } = Dimensions.get('window');

/**
 * Onboarding — 4-slide intro that introduces the mascot and app purpose.
 *
 * Design reference: each slide has:
 *  - Pastel gradient background (pink, mint, blue, peach)
 *  - Heart mascot centered (Doctor pose, breathing)
 *  - Small white rounded bubble with emoji lower-right of mascot
 *  - Big bold title + subtitle
 *  - Pagination (pill active + circular inactive)
 *  - "Next" button (rose), last slide: "Let's go!"
 *  - "Skip" text below (hidden on last slide)
 */

// Each slide matches one visual/emotional beat
// Background uses two-stop gradient for a soft wash
const SLIDES: {
    titleEn: string; subEn: string;
    titleEs: string; subEs: string;
    emoji: string;
    bg: [string, string];
}[] = [
    {
        titleEn: "I'm Clyra!",
        subEn: 'Your cute health buddy ',
        titleEs: '¡Soy Clyra!',
        subEs: 'Tu amiguita de salud ',
        emoji: '\uD83D\uDC96', // sparkle heart 💖
        bg: ['#FDE2EC', '#F9D1E0'],
    },
    {
        titleEn: 'Upload blood tests',
        subEn: 'Understand them in simple, friendly words',
        titleEs: 'Sube tus examenes',
        subEs: 'Los explico en palabras simples y amigables',
        emoji: '\uD83D\uDD2C', // microscope 🔬
        bg: ['#E4F7E8', '#D5EFE4'],
    },
    {
        titleEn: 'Track your health',
        subEn: 'See changes over time and know what kind of doctor could help',
        titleEs: 'Sigue tu salud',
        subEs: 'Ve cambios con el tiempo y sabras que doctor te puede ayudar',
        emoji: '\uD83D\uDCCA', // bar chart 📊
        bg: ['#E2ECFA', '#D7E6F5'],
    },
    {
        titleEn: "Let's start!",
        subEn: 'Your health journey begins here ',
        titleEs: '¡Vamos!',
        subEs: 'Tu viaje de salud comienza aqui ',
        emoji: '\uD83C\uDF89', // party popper 🎉
        bg: ['#FCE9D7', '#FADAC2'],
    },
];

export default function WelcomeScreen() {
    const router = useRouter();
    const language = useStore((s) => s.language);
    const scrollRef = useRef<ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const tapCount = useRef(0);
    const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fade the whole screen content on slide change (subtle warmth)
    const bgAnim = useRef(new Animated.Value(0)).current;

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        if (index !== activeIndex) {
            setActiveIndex(index);
            Animated.timing(bgAnim, {
                toValue: index,
                duration: 400,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: false,
            }).start();
        }
    };

    const goNext = () => {
        if (activeIndex < SLIDES.length - 1) {
            scrollRef.current?.scrollTo({ x: width * (activeIndex + 1), animated: true });
        } else {
            router.push('/onboarding/profile');
        }
    };

    const goSkip = () => router.push('/onboarding/profile');

    // Triple-tap anywhere on logo to reset (dev helper)
    const handleLogoTap = () => {
        tapCount.current += 1;
        if (tapTimer.current) clearTimeout(tapTimer.current);
        if (tapCount.current >= 3) {
            tapCount.current = 0;
            Alert.alert(
                'Reset App Data',
                'This will erase all data and restart the app. Are you sure?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Reset',
                        style: 'destructive',
                        onPress: async () => {
                            await AsyncStorage.clear();
                            router.replace('/onboarding');
                        },
                    },
                ],
            );
            return;
        }
        tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 800);
    };

    // Interpolate background color across slides
    const bgColor = bgAnim.interpolate({
        inputRange: SLIDES.map((_, i) => i),
        outputRange: SLIDES.map(s => s.bg[0]),
    });

    const isLast = activeIndex === SLIDES.length - 1;

    return (
        <Animated.View style={[styles.root, { backgroundColor: bgColor }]}>
            <LinearGradient
                colors={SLIDES[activeIndex].bg}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />
            <SafeAreaView style={styles.safe}>
                {/* Swipeable slides */}
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    style={styles.scrollView}
                >
                    {SLIDES.map((slide, i) => {
                        const title = language === 'es' ? slide.titleEs : slide.titleEn;
                        const sub = language === 'es' ? slide.subEs : slide.subEn;
                        return (
                            <View key={i} style={styles.slide}>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={handleLogoTap}
                                    style={styles.mascotStage}
                                >
                                    <Mascot
                                        pose="doctor"
                                        size={200}
                                        animation={i === activeIndex ? 'idle-breath' : 'none'}
                                    />
                                    {/* Emoji bubble — positioned lower-right of mascot */}
                                    <View style={styles.emojiBubble}>
                                        <Text style={styles.emojiText}>{slide.emoji}</Text>
                                    </View>
                                </TouchableOpacity>

                                <Text style={styles.title}>{title}</Text>
                                <Text style={styles.sub}>
                                    {sub}
                                    {slide.emoji === '\uD83D\uDC96' && ' \uD83D\uDC96'}
                                    {slide.emoji === '\uD83C\uDF89' && ' \u2728'}
                                </Text>
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Pagination pill + dots */}
                <View style={styles.dotsRow}>
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                i === activeIndex ? styles.dotActive : styles.dotInactive,
                            ]}
                        />
                    ))}
                </View>

                {/* CTA button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        activeOpacity={0.85}
                        onPress={goNext}
                    >
                        <Text style={styles.primaryBtnText}>
                            {isLast
                                ? (language === 'es' ? '¡Vamos!' : "Let's go!")
                                : (language === 'es' ? 'Siguiente' : 'Next')}
                        </Text>
                        <ChevronRight color="#fff" size={20} />
                    </TouchableOpacity>

                    {!isLast && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={goSkip}
                            style={styles.skipBtn}
                        >
                            <Text style={styles.skipText}>
                                {language === 'es' ? 'Saltar' : 'Skip'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    safe: { flex: 1 },
    scrollView: { flex: 1 },

    slide: {
        width,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },

    // Mascot + emoji bubble stage
    mascotStage: {
        width: 280, height: 280,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emojiBubble: {
        position: 'absolute',
        bottom: 30,
        right: 40,
        width: 62,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 10,
        elevation: 4,
    },
    emojiText: {
        fontSize: 34,
        lineHeight: 42,
    },

    title: {
        fontFamily: Typography.families.display,
        fontSize: 32,
        fontWeight: '800',
        color: '#1A2332',
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: 14,
    },
    sub: {
        fontFamily: Typography.families.body,
        fontSize: 16,
        color: '#4A5461',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 8,
        maxWidth: 320,
    },

    // Pagination
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 28,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        width: 28,
        backgroundColor: '#C87EA0', // rose/pink pill
    },
    dotInactive: {
        width: 8,
        backgroundColor: '#D8C5CE',
        opacity: 0.6,
    },

    // Footer
    footer: {
        paddingHorizontal: 48,
        paddingBottom: 40,
        alignItems: 'center',
    },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#C87EA0',
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 32,
        minWidth: 220,
        shadowColor: '#C87EA0',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.32,
        shadowRadius: 14,
        elevation: 5,
    },
    primaryBtnText: {
        fontFamily: Typography.families.display,
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.2,
    },
    skipBtn: {
        marginTop: 14,
        paddingVertical: 6,
        paddingHorizontal: 20,
    },
    skipText: {
        fontFamily: Typography.families.body,
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
});
