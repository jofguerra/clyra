import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Colors } from '../constants/colors';
import { supabase } from '../services/supabase';
import { useStore } from '../hooks/useStore';
import { useSyncEffect } from '../hooks/useSync';

export default function RootLayout() {
    useSyncEffect();
    const router = useRouter();
    const segments = useSegments();
    const setAuthUserId = useStore((s) => s.setAuthUserId);
    const setIsGuest = useStore((s) => s.setIsGuest);
    const authUserId = useStore((s) => s.authUserId);
    const hasCompletedOnboarding = useStore((s) => s.hasCompletedOnboarding);

    useEffect(() => {
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
    }, [setAuthUserId, setIsGuest]);

    // Navigate based on auth + onboarding state
    useEffect(() => {
        const inOnboarding = segments[0] === 'onboarding';

        if (authUserId && hasCompletedOnboarding && inOnboarding) {
            router.replace('/(tabs)');
        } else if (authUserId && !hasCompletedOnboarding && !inOnboarding) {
            router.replace('/onboarding/profile');
        }
    }, [authUserId, hasCompletedOnboarding, segments, router]);

    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="biomarker/[name]" options={{ presentation: 'card' }} />
            <Stack.Screen name="subscription" options={{ presentation: 'modal' }} />
            <Stack.Screen name="+not-found" />
        </Stack>
    );
}
