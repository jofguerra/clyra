import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    ActivityIndicator,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import AppHeader from '../../components/AppHeader';
import Button from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore, HealthGoal } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import { signUp, signIn, pushLocalToCloud, pullCloudToLocal } from '../../services/sync';

type AuthMode = 'signup' | 'signin';

export default function AuthScreen() {
    const router = useRouter();
    const t = useT();
    const store = useStore();

    const [mode, setMode] = useState<AuthMode>('signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async () => {
        if (!email.trim() || !password.trim()) return;
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signup') {
                const data = await signUp(email.trim(), password);
                store.setAuthUserId(data.user?.id ?? null);
                store.setIsGuest(false);

                // Push local data to cloud after signup
                await pushLocalToCloud({
                    userName: store.userName,
                    age: store.age,
                    sex: store.sex,
                    language: store.language,
                    healthGoals: store.healthGoals,
                    testReminderDays: store.testReminderDays,
                    hasCompletedOnboarding: store.hasCompletedOnboarding,
                    xp: store.xp,
                    activeWeeks: store.activeWeeks,
                    lastActiveDate: store.lastActiveDate,
                    completedMissions: store.completedMissions,
                    sessions: store.sessions,
                    achievements: store.achievements,
                }).catch(() => {});
                await store.syncFromCloud();

                if (store.hasCompletedOnboarding) {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/onboarding/profile');
                }
            } else {
                const data = await signIn(email.trim(), password);
                store.setAuthUserId(data.user?.id ?? null);
                store.setIsGuest(false);

                // Push local data then pull merged result
                await pushLocalToCloud({
                    userName: store.userName,
                    age: store.age,
                    sex: store.sex,
                    language: store.language,
                    healthGoals: store.healthGoals,
                    testReminderDays: store.testReminderDays,
                    hasCompletedOnboarding: store.hasCompletedOnboarding,
                    xp: store.xp,
                    activeWeeks: store.activeWeeks,
                    lastActiveDate: store.lastActiveDate,
                    completedMissions: store.completedMissions,
                    sessions: store.sessions,
                    achievements: store.achievements,
                }).catch(() => {});

                // Pull cloud data
                const cloudData = await pullCloudToLocal();
                if (cloudData) {
                    store.setUserName(cloudData.userName);
                    store.setAge(cloudData.age);
                    store.setSex(cloudData.sex);
                    store.setLanguage(cloudData.language);
                    store.setHealthGoals(cloudData.healthGoals as HealthGoal[]);
                    store.setSessions(cloudData.sessions);
                    store.setHasCompletedOnboarding(cloudData.hasCompletedOnboarding);
                    if (cloudData.isPro) {
                        store.setSubscription(
                            cloudData.subscriptionPlan,
                            cloudData.subscriptionExpiresAt,
                        );
                    }

                    if (cloudData.hasCompletedOnboarding) {
                        router.replace('/(tabs)');
                    } else {
                        router.replace('/onboarding/profile');
                    }
                } else {
                    if (store.hasCompletedOnboarding) {
                        router.replace('/(tabs)');
                    } else {
                        router.replace('/onboarding/profile');
                    }
                }
            }
        } catch (err: any) {
            setError(err?.message ?? t('authError'));
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode((m) => (m === 'signup' ? 'signin' : 'signup'));
        setError(null);
    };

    const title = mode === 'signup' ? t('authSignUp') : t('authSignIn');

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader showBack onBack={() => router.back()} title={title} />
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
                <X size={24} color={Colors.foreground} />
            </TouchableOpacity>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.headline}>{t('authJoinClyra')}</Text>
                    <Text style={styles.subheadline}>{t('authSaveData')}</Text>

                    <View style={styles.form}>
                        <Text style={styles.label}>{t('authEmail')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="tu@email.com"
                            placeholderTextColor={Colors.mutedForeground}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={email}
                            onChangeText={setEmail}
                            editable={!loading}
                        />

                        <Text style={styles.label}>{t('authPassword')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={Colors.mutedForeground}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            editable={!loading}
                        />
                    </View>

                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    <Button
                        title={loading ? '' : t('authContinue')}
                        onPress={handleAuth}
                        size="lg"
                        style={styles.button}
                        disabled={loading || !email.trim() || !password.trim()}
                    />

                    {loading ? (
                        <ActivityIndicator
                            color={Colors.primary}
                            style={styles.loader}
                        />
                    ) : null}

                    <TouchableOpacity onPress={toggleMode} style={styles.toggleRow}>
                        <Text style={styles.toggleText}>
                            {mode === 'signup'
                                ? t('authHaveAccount')
                                : t('authNoAccount')}{' '}
                            <Text style={styles.toggleLink}>
                                {mode === 'signup'
                                    ? t('authSignIn')
                                    : t('authSignUp')}
                            </Text>
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    closeBtn: {
        position: 'absolute',
        top: 56,
        right: 16,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flex: { flex: 1 },
    content: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    headline: {
        fontFamily: Typography.families.display,
        fontSize: Typography.sizes.xl,
        fontWeight: '700',
        color: Colors.foreground,
        marginBottom: 8,
        textAlign: 'center',
    },
    subheadline: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.base,
        color: Colors.mutedForeground,
        textAlign: 'center',
        marginBottom: 32,
    },
    form: { gap: 16, marginBottom: 24 },
    label: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.sm,
        fontWeight: '500',
        color: Colors.foreground,
        marginBottom: -8,
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.foreground,
    },
    errorText: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.sm,
        color: Colors.attention,
        textAlign: 'center',
        marginBottom: 16,
    },
    button: { marginBottom: 16 },
    loader: { marginBottom: 8 },
    toggleRow: { alignItems: 'center', marginBottom: 24 },
    toggleText: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.sm,
        color: Colors.mutedForeground,
    },
    toggleLink: {
        color: Colors.primary,
        fontWeight: '600',
    },
});
