import { Stack } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="goals" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="loading" options={{ gestureEnabled: false }} />
        </Stack>
    );
}
