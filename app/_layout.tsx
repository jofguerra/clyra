import { Stack } from 'expo-router';
import { Colors } from '../constants/colors';

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="biomarker/[name]" options={{ presentation: 'card' }} />
            <Stack.Screen name="+not-found" />
        </Stack>
    );
}
