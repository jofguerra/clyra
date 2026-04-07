import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/AppHeader';
import Button from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';

export default function AuthScreen() {
    const router = useRouter();
    const setHasCompletedOnboarding = useStore((state) => state.setHasCompletedOnboarding);
    const t = useT();

    const handleLogin = () => {
        setHasCompletedOnboarding(true);
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader showBack onBack={() => router.back()} title={t('authCreateAccount')} />

            <View style={styles.content}>
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
                    />

                    <Text style={styles.label}>{t('authPassword')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor={Colors.mutedForeground}
                        secureTextEntry
                    />
                </View>

                <Button
                    title={t('authCreateAccount')}
                    onPress={handleLogin}
                    size="lg"
                    style={styles.button}
                />

                <Button
                    title={t('authHaveAccount')}
                    onPress={handleLogin}
                    variant="ghost"
                    size="md"
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { flex: 1, padding: 24, justifyContent: 'center' },
    headline: { fontFamily: Typography.families.display, fontSize: Typography.sizes.xl, fontWeight: '700', color: Colors.foreground, marginBottom: 8, textAlign: 'center' },
    subheadline: { fontFamily: Typography.families.body, fontSize: Typography.sizes.base, color: Colors.mutedForeground, textAlign: 'center', marginBottom: 32 },
    form: { gap: 16, marginBottom: 32 },
    label: { fontFamily: Typography.families.body, fontSize: Typography.sizes.sm, fontWeight: '500', color: Colors.foreground, marginBottom: -8 },
    input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16, fontSize: 16, color: Colors.foreground },
    button: { marginBottom: 16 }
});
