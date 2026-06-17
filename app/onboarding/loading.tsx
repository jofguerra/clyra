import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import { TranslationKey } from '../../constants/i18n';
import Mascot from '../../components/Mascot';

const FACT_KEYS: TranslationKey[] = [
    'loadingFact1',
    'loadingFact2',
    'loadingFact3',
    'loadingFact4',
];

const NAVIGATE_DELAY = 3000;
const FACT_INTERVAL = 1500;

export default function LoadingScreen() {
    const router = useRouter();
    const t = useT();
    const setHasCompletedOnboarding = useStore((state) => state.setHasCompletedOnboarding);
    const [factIndex, setFactIndex] = useState(0);
    const [fadeAnim] = useState(() => new Animated.Value(1));

    // Cycle through factoids
    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out, change, fade in
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setFactIndex((prev) => (prev + 1) % FACT_KEYS.length);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        }, FACT_INTERVAL);
        return () => clearInterval(interval);
    }, [fadeAnim]);

    // Navigate after delay
    useEffect(() => {
        const timeout = setTimeout(() => {
            setHasCompletedOnboarding(true);
            router.replace('/(tabs)');
        }, NAVIGATE_DELAY);
        return () => clearTimeout(timeout);
    }, [setHasCompletedOnboarding, router]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.mascotWrap}>
                    <Mascot pose="thinking" size={180} animation="thinking-tilt" />
                </View>

                <Text style={styles.title}>{t('loadingSettingUp')}</Text>

                <Animated.Text style={[styles.fact, { opacity: fadeAnim }]}>
                    {t(FACT_KEYS[factIndex])}
                </Animated.Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconWrap: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: Colors.primary10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    mascotWrap: {
        marginBottom: 24,
    },
    title: {
        fontFamily: Typography.families.display,
        fontSize: Typography.sizes.xl,
        fontWeight: '700',
        color: Colors.foreground,
        textAlign: 'center',
        marginBottom: 24,
    },
    fact: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.base,
        color: Colors.mutedForeground,
        textAlign: 'center',
        lineHeight: 24,
        minHeight: 48,
        paddingHorizontal: 16,
    },
});
