import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Check, Shield } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore, HealthGoal } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import { GOALS } from '../../constants/healthGoals';

export default function GoalSelectionScreen() {
    const t = useT();
    const [selectedGoals, setSelectedGoals] = useState<Set<HealthGoal>>(new Set());
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
    const setHealthGoals = useStore((state) => state.setHealthGoals);

    const toggleGoal = (id: HealthGoal) => {
        const next = new Set(selectedGoals);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedGoals(next);
    };

    const handleContinue = () => {
        if (selectedGoals.size > 0) {
            setHealthGoals(Array.from(selectedGoals));
        }
        router.push('/onboarding/loading');
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader showBack onBack={() => router.back()} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>{t('goalsTitle')}</Text>
                <Text style={styles.subtitle}>{t('goalsSubtitle')}</Text>

                <View style={styles.grid}>
                    {GOALS.map((goal) => {
                        const isSelected = selectedGoals.has(goal.id);
                        return (
                            <TouchableOpacity
                                key={goal.id}
                                style={[
                                    styles.card,
                                    isSelected ? styles.cardSelected : styles.cardUnselected
                                ]}
                                activeOpacity={0.7}
                                onPress={() => toggleGoal(goal.id)}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={styles.emoji}>{goal.emoji}</Text>
                                    {isSelected && (
                                        <View style={styles.checkBadge}>
                                            <Check size={14} color={Colors.primaryForeground} strokeWidth={3} />
                                        </View>
                                    )}
                                </View>
                                <Text style={[
                                    styles.cardLabel,
                                    isSelected ? styles.cardLabelSelected : styles.cardLabelUnselected
                                ]}>
                                    {t(goal.labelKey)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Medical disclaimer acknowledgment */}
                <View style={styles.disclaimerBox}>
                    <View style={styles.disclaimerHeader}>
                        <Shield size={18} color={Colors.primary} />
                        <Text style={styles.disclaimerTitle}>{t('disclaimerAccept')}</Text>
                    </View>
                    <Text style={styles.disclaimerText}>{t('disclaimerOnboarding')}</Text>
                    <TouchableOpacity
                        style={styles.disclaimerToggle}
                        onPress={() => setDisclaimerAccepted(!disclaimerAccepted)}
                        activeOpacity={0.7}
                    >
                        <View style={[
                            styles.disclaimerCheck,
                            disclaimerAccepted && styles.disclaimerCheckActive,
                        ]}>
                            {disclaimerAccepted && <Check size={14} color="#fff" strokeWidth={3} />}
                        </View>
                        <Text style={styles.disclaimerLabel}>{t('disclaimerAccept')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title={selectedGoals.size > 0 ? t('continueBtn') : t('skipForNow')}
                    onPress={handleContinue}
                    size="lg"
                    variant={selectedGoals.size > 0 && disclaimerAccepted ? 'primary' : 'outline'}
                    disabled={!disclaimerAccepted}
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
    scrollContent: {
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    card: {
        width: '47%',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        marginBottom: 8,
        minHeight: 120,
        justifyContent: 'space-between',
    },
    cardUnselected: {
        backgroundColor: Colors.surface,
        borderColor: 'transparent',
    },
    cardSelected: {
        backgroundColor: Colors.primary10,
        borderColor: Colors.primary,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    emoji: {
        fontSize: 28,
    },
    checkBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardLabel: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.base,
        fontWeight: '600',
        lineHeight: 20,
    },
    cardLabelUnselected: {
        color: Colors.foreground,
    },
    cardLabelSelected: {
        color: Colors.primary,
    },
    // Disclaimer
    disclaimerBox: {
        marginTop: 32,
        backgroundColor: Colors.primary + '08',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.primary + '20',
    },
    disclaimerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    disclaimerTitle: {
        fontFamily: Typography.families.display,
        fontSize: 15,
        fontWeight: '700',
        color: Colors.foreground,
    },
    disclaimerText: {
        fontFamily: Typography.families.body,
        fontSize: 13,
        color: Colors.mutedForeground,
        lineHeight: 20,
        marginBottom: 14,
    },
    disclaimerToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    disclaimerCheck: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.outline,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disclaimerCheckActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    disclaimerLabel: {
        fontFamily: Typography.families.body,
        fontSize: 14,
        fontWeight: '600',
        color: Colors.foreground,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.border,
        backgroundColor: Colors.background,
    }
});
