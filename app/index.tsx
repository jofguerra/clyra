import { Redirect } from 'expo-router';
import { useStore } from '../hooks/useStore';

export default function Index() {
    const hasCompletedOnboarding = useStore(state => state.hasCompletedOnboarding);

    if (!hasCompletedOnboarding) {
        return <Redirect href="/onboarding" />;
    }

    return <Redirect href="/(tabs)" />;
}
