import { useSyncExternalStore } from 'react';
import { Redirect } from 'expo-router';
import { useStore } from '../hooks/useStore';

export default function Index() {
    const hasCompletedOnboarding = useStore(state => state.hasCompletedOnboarding);

    const hydrated = useSyncExternalStore(
        (callback) => useStore.persist.onFinishHydration(callback),
        () => useStore.persist.hasHydrated(),
        () => false,
    );
    if (!hydrated) return null;

    if (!hasCompletedOnboarding) {
        return <Redirect href="/onboarding" />;
    }

    return <Redirect href="/(tabs)" />;
}
