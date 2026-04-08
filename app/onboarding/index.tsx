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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Activity, TrendingUp, Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useT } from '../../hooks/useT';

const { width } = Dimensions.get('window');

const ICON_SIZE = 56;

const slides = [
    { titleKey: 'onb1Title' as const, subKey: 'onb1Sub' as const, Icon: Activity },
    { titleKey: 'onb2Title' as const, subKey: 'onb2Sub' as const, Icon: TrendingUp },
    { titleKey: 'onb3Title' as const, subKey: 'onb3Sub' as const, Icon: Sparkles },
];

export default function WelcomeScreen() {
    const router = useRouter();
    const t = useT();
    const scrollRef = useRef<ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const tapCount = useRef(0);
    const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        setActiveIndex(index);
    };

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
                            // Force reload by navigating to root
                            router.replace('/onboarding');
                        },
                    },
                ],
            );
            return;
        }
        tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 800);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Logo at top — triple-tap to reset */}
            <TouchableOpacity activeOpacity={0.9} onPress={handleLogoTap}>
                <View style={styles.logoRow}>
                    <View style={styles.logoBox}>
                        <Activity color={Colors.primaryForeground} size={28} />
                    </View>
                    <Text style={styles.logoText}>Clyra</Text>
                </View>
            </TouchableOpacity>

            {/* Swipeable slides */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                style={styles.scrollView}
            >
                {slides.map((slide, i) => (
                    <View key={i} style={styles.slide}>
                        <View style={styles.iconCircle}>
                            <slide.Icon color={Colors.primary} size={ICON_SIZE} strokeWidth={1.5} />
                        </View>
                        <Text style={styles.slideTitle}>{t(slide.titleKey)}</Text>
                        <Text style={styles.slideSub}>{t(slide.subKey)}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* Pagination dots */}
            <View style={styles.dotsRow}>
                {slides.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i === activeIndex ? styles.dotActive : styles.dotInactive,
                        ]}
                    />
                ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Button
                    title={t('onbGetStarted')}
                    onPress={() => router.push('/onboarding/profile')}
                    size="lg"
                    style={styles.primaryButton}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    logoBox: {
        width: 40,
        height: 40,
        backgroundColor: Colors.primary,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontFamily: Typography.families.display,
        fontSize: Typography.sizes.lg,
        fontWeight: '700',
        color: Colors.foreground,
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width,
        paddingHorizontal: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.primary10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    slideTitle: {
        fontFamily: Typography.families.display,
        fontSize: Typography.sizes.huge,
        fontWeight: '700',
        color: Colors.foreground,
        textAlign: 'center',
        lineHeight: 44,
        marginBottom: 16,
    },
    slideSub: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.lg,
        color: Colors.mutedForeground,
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 8,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 16,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        width: 24,
        backgroundColor: Colors.primary,
    },
    dotInactive: {
        width: 8,
        backgroundColor: Colors.outlineVariant,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    primaryButton: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 6,
    },
});
