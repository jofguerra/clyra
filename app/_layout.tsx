import { View, Platform } from 'react-native';
import { WEB_APP_MAX_WIDTH } from '../hooks/useAppWidth';
import { useEffect, useSyncExternalStore } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Colors } from '../constants/colors';
import { supabase } from '../services/supabase';
import { useStore } from '../hooks/useStore';
import { useSyncEffect } from '../hooks/useSync';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AchievementUnlockModal } from '../components/AchievementUnlockModal';

export default function RootLayout() {
    const hydrated = useSyncExternalStore(
        (callback) => useStore.persist.onFinishHydration(callback),
        () => useStore.persist.hasHydrated(),
        () => false,
    );
    useSyncEffect();
    const router = useRouter();
    const segments = useSegments();
    const setAuthUserId = useStore((s) => s.setAuthUserId);
    const setIsGuest = useStore((s) => s.setIsGuest);
    const authUserId = useStore((s) => s.authUserId);
    const hasCompletedOnboarding = useStore((s) => s.hasCompletedOnboarding);

    useEffect(() => {
        if (!hydrated || !supabase) return;
        // Check existing session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setAuthUserId(session.user.id);
                setIsGuest(false);
            }
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session?.user) {
                    setAuthUserId(session.user.id);
                    setIsGuest(false);
                } else {
                    setAuthUserId(null);
                }
            },
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [hydrated, setAuthUserId, setIsGuest]);

    // Navigate based on auth + onboarding state
    useEffect(() => {
        if (!hydrated || !supabase) return;
        const inOnboarding = segments[0] === 'onboarding';

        if (authUserId && hasCompletedOnboarding && inOnboarding) {
            router.replace('/(tabs)');
        } else if (authUserId && !hasCompletedOnboarding && !inOnboarding) {
            router.replace('/onboarding/profile');
        }
    }, [hydrated, authUserId, hasCompletedOnboarding, segments, router]);

    if (!hydrated) return null;

    return (
        <View style={{ flex: 1, backgroundColor: '#F3EDF1' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? WEB_APP_MAX_WIDTH : undefined, alignSelf: 'center', overflow: 'hidden' }}>
        <ErrorBoundary>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="biomarker/[name]" options={{ presentation: 'card' }} />
                <Stack.Screen name="subscription" options={{ presentation: 'modal' }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            {/* Global achievement celebration — appears on any screen after new unlock */}
            <AchievementUnlockModal />
        </ErrorBoundary>
        </View>
        </View>
    );
}
