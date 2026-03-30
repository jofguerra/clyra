import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Shield, Eye, Lock, Bell, Trash2, Download, Globe, Target, Check } from 'lucide-react-native';
import AppHeader from '../../components/AppHeader';
import GlassCard from '../../components/ui/GlassCard';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import Button from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore, HealthGoal } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import { TranslationKey } from '../../constants/i18n';

type GoalDef = { id: HealthGoal; emoji: string; labelKey: TranslationKey };
const GOAL_DEFS: GoalDef[] = [
  { id: 'mood',            emoji: '☀️', labelKey: 'goalMood' },
  { id: 'metabolism',      emoji: '🔥', labelKey: 'goalMetabolism' },
  { id: 'performance',     emoji: '💪', labelKey: 'goalPerformance' },
  { id: 'testosterone',    emoji: '🧬', labelKey: 'goalTestosterone' },
  { id: 'female_hormones', emoji: '🌸', labelKey: 'goalFemaleHormones' },
  { id: 'longevity',       emoji: '🧠', labelKey: 'goalLongevity' },
  { id: 'preventative',    emoji: '🛡️', labelKey: 'goalPreventative' },
];

export default function SettingsScreen() {
    const [dataVisible, setDataVisible] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const clearAllData = useStore((state) => state.clearAllData);
    const sessions = useStore((state) => state.sessions);
    const userName = useStore((state) => state.userName);
    const language = useStore((state) => state.language);
    const setLanguage = useStore((state) => state.setLanguage);
    const healthGoals = useStore((state) => state.healthGoals);
    const setHealthGoals = useStore((state) => state.setHealthGoals);
    const t = useT();

    const handleExport = () => {
        if (sessions.length === 0) {
            Alert.alert(t('noDataToExport'), t('noDataToExportMsg'));
            return;
        }
        const latest = sessions[0];
        Alert.alert(t('exportedTitle'), t('exportedMsg', { n: latest.biomarkers.length }));
    };

    const handleDelete = () => {
        Alert.alert(
            t('deleteTitle'),
            t('deleteAllMsg'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('deleteBtn'), style: 'destructive',
                    onPress: () => {
                        clearAllData();
                        Alert.alert(t('deletedTitle'), t('deletedMsg'));
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader title={t('settingsAndPrivacy')} />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile info */}
                {userName ? (
                    <View style={styles.profileRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View>
                            <Text style={styles.profileName}>{userName}</Text>
                            <Text style={styles.profileMeta}>{t('examsStored', { n: sessions.length })}</Text>
                        </View>
                    </View>
                ) : null}

                {/* Language Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Globe size={20} color={Colors.foreground} />
                        <Text style={styles.sectionTitle}>{t('language')}</Text>
                    </View>
                    <View style={styles.langRow}>
                        <TouchableOpacity
                            style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
                            activeOpacity={0.8}
                            onPress={() => setLanguage('en')}
                        >
                            <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>
                                🇺🇸  {t('english')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.langBtn, language === 'es' && styles.langBtnActive]}
                            activeOpacity={0.8}
                            onPress={() => setLanguage('es')}
                        >
                            <Text style={[styles.langBtnText, language === 'es' && styles.langBtnTextActive]}>
                                🇪🇸  {t('spanish')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Health Goals Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Target size={20} color={Colors.foreground} />
                        <Text style={styles.sectionTitle}>{t('goalsTitle')}</Text>
                    </View>
                    <View style={styles.goalsGrid}>
                        {GOAL_DEFS.map(goal => {
                            const isSelected = healthGoals.includes(goal.id);
                            return (
                                <TouchableOpacity
                                    key={goal.id}
                                    style={[styles.goalChip, isSelected && styles.goalChipActive]}
                                    onPress={() => {
                                        const next = isSelected
                                            ? healthGoals.filter(g => g !== goal.id)
                                            : [...healthGoals, goal.id];
                                        setHealthGoals(next);
                                    }}
                                    activeOpacity={0.75}
                                >
                                    <Text style={styles.goalChipEmoji}>{goal.emoji}</Text>
                                    <Text style={[styles.goalChipText, isSelected && styles.goalChipTextActive]}>
                                        {t(goal.labelKey)}
                                    </Text>
                                    {isSelected && <Check size={12} color={Colors.primary} strokeWidth={3} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Privacy Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Shield size={20} color={Colors.foreground} />
                        <Text style={styles.sectionTitle}>{t('privacyControls')}</Text>
                    </View>

                    <GlassCard padding={0} style={styles.settingsCard}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingIconContainer}>
                                <Eye size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.settingContent}>
                                <Text style={styles.settingTitle}>{t('dataVisibility')}</Text>
                                <Text style={styles.settingDesc}>{t('dataVisibilityDesc')}</Text>
                            </View>
                            <ToggleSwitch value={dataVisible} onValueChange={setDataVisible} />
                        </View>

                        <View style={styles.settingRow}>
                            <View style={styles.settingIconContainer}>
                                <Lock size={20} color={Colors.foreground} />
                            </View>
                            <View style={styles.settingContent}>
                                <Text style={styles.settingTitle}>{t('encryptionLabel')}</Text>
                                <Text style={styles.settingDesc}>{t('encryptionDesc')}</Text>
                            </View>
                            <View style={styles.badgeLock}>
                                <Text style={styles.badgeLockText}>{t('activeLabel')}</Text>
                            </View>
                        </View>

                        <View style={[styles.settingRow, styles.settingRowLast]}>
                            <View style={styles.settingIconContainer}>
                                <Bell size={20} color={notifications ? Colors.primary : Colors.foreground} />
                            </View>
                            <View style={styles.settingContent}>
                                <Text style={styles.settingTitle}>{t('notificationsLabel')}</Text>
                                <Text style={styles.settingDesc}>{t('notificationsDesc')}</Text>
                            </View>
                            <ToggleSwitch value={notifications} onValueChange={setNotifications} />
                        </View>
                    </GlassCard>
                </View>

                {/* Data Management Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Trash2 size={20} color={Colors.foreground} />
                        <Text style={styles.sectionTitle}>{t('dataManagement')}</Text>
                    </View>

                    <View style={styles.dataActions}>
                        <View style={styles.dataActionRow}>
                            <View style={styles.dataActionContent}>
                                <Text style={styles.settingTitle}>{t('exportData')}</Text>
                                <Text style={styles.settingDesc}>{t('exportDataDesc')}</Text>
                            </View>
                            <Button
                                title={t('exportBtn')}
                                variant="outline"
                                size="sm"
                                onPress={handleExport}
                                icon={<Download size={16} color={Colors.foreground} />}
                            />
                        </View>

                        <View style={styles.dataActionDivider} />

                        <View style={styles.dataActionRow}>
                            <View style={styles.dataActionContent}>
                                <Text style={[styles.settingTitle, { color: Colors.attention }]}>{t('clearData')}</Text>
                                <Text style={styles.settingDesc}>{t('clearDataDesc')}</Text>
                            </View>
                            <Button
                                title={t('deleteBtn')}
                                variant="destructive"
                                size="sm"
                                onPress={handleDelete}
                            />
                        </View>
                    </View>
                </View>

                <Text style={styles.footerDisclaimer}>{t('settingsDisclaimer')}</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    langRow: { flexDirection: 'row', gap: 12 },

    // Goals grid
    goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    goalChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
        backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    },
    goalChipActive: {
        backgroundColor: Colors.primary10, borderColor: Colors.primary + '60',
    },
    goalChipEmoji: { fontSize: 14 },
    goalChipText: {
        fontFamily: Typography.families.body,
        fontSize: 12, fontWeight: '600', color: Colors.foreground,
    },
    goalChipTextActive: { color: Colors.primary },
    langBtn: {
        flex: 1, paddingVertical: 14, paddingHorizontal: 16,
        borderRadius: 16, borderWidth: 2, borderColor: Colors.border,
        backgroundColor: Colors.surface, alignItems: 'center',
    },
    langBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary10 },
    langBtnText: {
        fontFamily: Typography.families.body,
        fontSize: 14, fontWeight: '600', color: Colors.mutedForeground,
    },
    langBtnTextActive: { color: Colors.primary },
    profileRow: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: Colors.surface, borderRadius: 16,
        borderWidth: 1, borderColor: Colors.border,
        padding: 16, marginBottom: 32,
    },
    avatar: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: Colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: {
        fontFamily: Typography.families.display,
        fontSize: Typography.sizes.xl, fontWeight: '700', color: 'white',
    },
    profileName: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.md, fontWeight: '700', color: Colors.foreground,
    },
    profileMeta: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.xs, color: Colors.mutedForeground, marginTop: 2,
    },
    safeArea: { flex: 1, backgroundColor: Colors.background },
    container: { flex: 1 },
    contentContainer: { padding: 16, paddingBottom: 40 },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionTitle: {
        fontFamily: Typography.families.display,
        fontSize: Typography.sizes.lg, fontWeight: '700', color: Colors.foreground,
    },
    settingsCard: { marginBottom: 0 },
    settingRow: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
    },
    settingRowLast: { borderBottomWidth: 0 },
    settingIconContainer: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.secondary,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    settingContent: { flex: 1, marginRight: 16 },
    settingTitle: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.foreground, marginBottom: 4,
    },
    settingDesc: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.xs, color: Colors.mutedForeground, lineHeight: 16,
    },
    badgeLock: { backgroundColor: Colors.muted, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeLockText: {
        fontFamily: Typography.families.body,
        fontSize: 10, fontWeight: '700', color: Colors.mutedForeground,
    },
    dataActions: {
        backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: Colors.border,
    },
    dataActionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dataActionContent: { flex: 1, marginRight: 16 },
    dataActionDivider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginVertical: 16 },
    footerDisclaimer: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.xs, color: Colors.mutedForeground,
        textAlign: 'center', lineHeight: 18, marginTop: 16,
    },
});
