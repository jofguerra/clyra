import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Platform, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import Button from '../../components/ui/Button';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';

export default function ProfileScreen() {
    const router = useRouter();
    const t = useT();
    const setUserName = useStore((state) => state.setUserName);
    const setAge = useStore((state) => state.setAge);
    const setSex = useStore((state) => state.setSex);
    const [name, setName] = useState('');
    const [ageInput, setAgeInput] = useState('');
    const [sex, setSexLocal] = useState<'male' | 'female' | null>(null);

    const handleContinue = () => {
        if (!name.trim()) return;
        setUserName(name.trim());
        setAge(ageInput);
        setSex(sex);
        router.push('/onboarding/goals');
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader showBack onBack={() => router.back()} />
            <KeyboardAwareScrollView
                contentContainerStyle={styles.formContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid
                extraScrollHeight={Platform.OS === 'ios' ? 24 : 40}
            >
                    <Text style={styles.title}>{t('profileTitle')}</Text>
                    <Text style={styles.subtitle}>{t('profileSubtitle')}</Text>

                    <Text style={styles.label}>{t('nameLabel')}</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder={t('namePlaceholder')}
                        placeholderTextColor={Colors.mutedForeground}
                        returnKeyType="next"
                    />

                    <Text style={[styles.label, { marginTop: 24 }]}>{t('ageLabel')}</Text>
                    <TextInput
                        style={styles.input}
                        value={ageInput}
                        onChangeText={setAgeInput}
                        keyboardType="numeric"
                        placeholder={t('agePlaceholder')}
                        placeholderTextColor={Colors.mutedForeground}
                        maxLength={3}
                        returnKeyType="done"
                    />

                    <Text style={[styles.label, { marginTop: 24 }]}>{t('sexLabel')}</Text>
                    <View style={styles.row}>
                        <TouchableOpacity
                            style={[styles.sexButton, sex === 'male' && styles.sexButtonActive]}
                            onPress={() => setSexLocal('male')}
                        >
                            <Text style={[styles.sexText, sex === 'male' && styles.sexTextActive]}>{t('sexMale')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.sexButton, sex === 'female' && styles.sexButtonActive]}
                            onPress={() => setSexLocal('female')}
                        >
                            <Text style={[styles.sexText, sex === 'female' && styles.sexTextActive]}>{t('sexFemale')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Button
                            title={t('continueBtn')}
                            onPress={handleContinue}
                            disabled={!name.trim() || !ageInput || !sex}
                            size="lg"
                        />
                    </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    formContainer: {
        padding: 24,
        paddingBottom: 40,
    },
    title: {
        fontFamily: Typography.families.display,
        fontSize: Typography.sizes.xl,
        fontWeight: '700',
        color: Colors.foreground,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.base,
        color: Colors.mutedForeground,
        marginBottom: 32,
        lineHeight: 22,
    },
    label: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.sm,
        fontWeight: '600',
        color: Colors.foreground,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 16,
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.base,
        color: Colors.foreground,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    sexButton: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    sexButtonActive: {
        backgroundColor: Colors.primary10,
        borderColor: Colors.primary,
    },
    sexText: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.base,
        fontWeight: '600',
        color: Colors.foreground,
    },
    sexTextActive: {
        color: Colors.primary,
    },
    footer: {
        marginTop: 32,
    }
});
