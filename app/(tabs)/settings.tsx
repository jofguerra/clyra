import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Eye, Lock, Bell, Trash2, Download, Globe, Crown, FileText, RefreshCw, User, ExternalLink, Heart, Sparkles, Droplet, Calendar, ChevronRight, Info, RotateCcw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import AppHeader from '../../components/AppHeader';
import GlassCard from '../../components/ui/GlassCard';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import Button from '../../components/ui/Button';
import Mascot from '../../components/Mascot';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import { shareHealthReport } from '../../services/pdfExport';
import { supabase } from '../../services/supabase';
import { APP_VERSION, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL, SUPPORT_EMAIL } from '../../constants/appConfig';


// ── Theme palette (from reference) ────────────────────────────────────────────
const THEMES = [
    { id: 'pink',     nameEn: 'Pink Cloud',      nameEs: 'Nube Rosada',   color: '#F8C4D9' },
    { id: 'mint',     nameEn: 'Mint Calm',       nameEs: 'Menta Calma',   color: '#C4E6D5' },
    { id: 'lavender', nameEn: 'Lavender Glow',   nameEs: 'Lavanda Glow',  color: '#D4C4E8' },
    { id: 'peach',    nameEn: 'Peach Sunshine',  nameEs: 'Durazno Sol',   color: '#F8D2B8' },
];

export default function SettingsScreen() {
    const router = useRouter();
    const [dataVisible, setDataVisible] = useState(true);
    const [notifications, setNotifications] = useState(true);

    // Health Preferences (local for now — ready to persist to store)
    const [prefSimpleExplanations, setPrefSimpleExplanations] = useState(true);
    const [prefDoctorSuggestions, setPrefDoctorSuggestions] = useState(true);
    const [prefFollowupReminders, setPrefFollowupReminders] = useState(true);
    const [prefTrendTracking, setPrefTrendTracking] = useState(true);

    // Notification prefs
    const [notifExamReminders, setNotifExamReminders] = useState(true);
    const [notifHydration, setNotifHydration] = useState(false);
    const [notifWeeklySummary, setNotifWeeklySummary] = useState(true);

    // App theme
    const [appTheme, setAppTheme] = useState<'pink' | 'mint' | 'lavender' | 'peach'>('pink');
    const clearAllData = useStore((state) => state.clearAllData);
    const sessions = useStore((state) => state.sessions);
    const userName = useStore((state) => state.userName);
    const language = useStore((state) => state.language);
    const setLanguage = useStore((state) => state.setLanguage);
    const isPro = useStore((state) => state.isPro);
    const subscriptionPlan = useStore((state) => state.subscriptionPlan);
    const subscriptionExpiresAt = useStore((state) => state.subscriptionExpiresAt);
    const subscriptionCancelled = useStore((state) => state.subscriptionCancelled);
    const setSubscriptionCancelled = useStore((state) => state.setSubscriptionCancelled);
    const age = useStore((state) => state.age);
    const sex = useStore((state) => state.sex);
    const biomarkers = useStore((state) => state.biomarkers);
    const healthScore = useStore((state) => state.healthScore);
    const [sharingReport, setSharingReport] = useState(false);
    const isGuest = useStore((state) => state.isGuest);
    const authUserId = useStore((state) => state.authUserId);
    const signOutUser = useStore((state) => state.signOutUser);
    const lastSyncedAt = useStore((state) => state.lastSyncedAt);
    const syncToCloud = useStore((state) => state.syncToCloud);
    const [isSyncing, setIsSyncing] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const t = useT();

    useEffect(() => {
        if (!isGuest && authUserId) {
            supabase.auth.getUser().then(({ data }) => {
                setUserEmail(data.user?.email ?? null);
            }).catch(() => setUserEmail(null));
        } else {
            setUserEmail(null);
        }
    }, [isGuest, authUserId]);

    const handleSignOut = () => {
        Alert.alert(
            t('signOutBtn'),
            t('signOutConfirm'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('signOutBtn'),
                    style: 'destructive',
                    onPress: async () => {
                        await signOutUser();
                    },
                },
            ]
        );
    };

    const handleSyncNow = async () => {
        setIsSyncing(true);
        try {
            await syncToCloud();
        } finally {
            setIsSyncing(false);
        }
    };

    const formatSyncTime = (iso: string | null): string => {
        if (!iso) return t('neverSynced');
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60_000);
        if (mins < 1) return t('syncSuccess');
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

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

    // ── Full reset: wipe AsyncStorage + navigate back to onboarding ──
    // Use this when the user wants to "start from scratch" — erases sessions,
    // onboarding state, XP, achievements, and routes to the welcome slides.
    const handleResetApp = () => {
        Alert.alert(
            language === 'es' ? 'Empezar desde cero' : 'Start from scratch',
            language === 'es'
                ? 'Esto borrara todos tus datos y te llevara a la pantalla de bienvenida. \u00bfContinuar?'
                : 'This will erase all your data and take you back to the welcome screen. Continue?',
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: language === 'es' ? 'Reiniciar' : 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        clearAllData();
                        router.replace('/onboarding');
                    },
                },
            ],
        );
    };

    const formattedExpiry = subscriptionExpiresAt
        ? new Date(subscriptionExpiresAt).toLocaleDateString(language === 'es' ? 'es' : 'en', {
            day: 'numeric', month: 'long', year: 'numeric',
          })
        : '';

    const handleCancelSubscription = () => {
        Alert.alert(
            t('cancelConfirmTitle'),
            t('cancelConfirmMsg', { date: formattedExpiry }),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('cancelSubscription'),
                    style: 'destructive',
                    onPress: () => setSubscriptionCancelled(true),
                },
            ]
        );
    };

    const handleReactivate = () => {
        setSubscriptionCancelled(false);
    };

    const handleShareWithDoctor = async () => {
        if (biomarkers.length === 0) {
            Alert.alert(t('noDataToShare'), t('noDataToShareMsg'));
            return;
        }
        setSharingReport(true);
        try {
            await shareHealthReport({
                userName,
                age,
                sex,
                language,
                healthScore,
                biomarkers,
            });
        } catch (err) {
            console.warn('[Clyra] PDF share error:', err);
        } finally {
            setSharingReport(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
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

                {/* Account Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <User size={20} color={Colors.foreground} />
                        <Text style={styles.sectionTitle}>{t('accountSection')}</Text>
                    </View>
                    {isGuest ? (
                        <View style={styles.dataActions}>
                            <Button
                                title={t('authCreateAccount')}
                                size="lg"
                                onPress={() => router.push('/onboarding/auth')}
                                style={{ marginBottom: 12 }}
                            />
                            <Button
                                title={t('authSignIn')}
                                variant="outline"
                                size="lg"
                                onPress={() => router.push('/onboarding/auth')}
                            />
                        </View>
                    ) : (
                        <View style={styles.dataActions}>
                            {userEmail && (
                                <Text style={styles.settingDesc}>
                                    {t('signedInAs')} {userEmail}
                                </Text>
                            )}
                            <View style={styles.dataActionDivider} />
                            <Button
                                title={t('signOutBtn')}
                                variant="destructive"
                                size="sm"
                                onPress={handleSignOut}
                            />
                        </View>
                    )}
                </View>

                {/* Sync Status (authenticated users only) */}
                {!isGuest && (
                    <View style={styles.syncRow}>
                        <RefreshCw size={16} color={Colors.mutedForeground} />
                        <Text style={styles.syncText}>
                            {t('lastSynced')}: {formatSyncTime(lastSyncedAt)}
                        </Text>
                        <TouchableOpacity
                            style={styles.syncBtn}
                            activeOpacity={0.7}
                            onPress={handleSyncNow}
                            disabled={isSyncing}
                        >
                            <Text style={styles.syncBtnText}>
                                {isSyncing ? t('syncing') : t('syncNow')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Subscription */}
                {isPro ? (
                    <View style={styles.proBanner}>
                        <Crown size={18} color={Colors.gold} />
                        <Text style={styles.proBannerText}>{t('subAlreadyPro')}</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.goProBanner}
                        activeOpacity={0.85}
                        onPress={() => router.push('/subscription' as any)}
                    >
                        <Crown size={20} color={Colors.gold} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.goProTitle}>{t('subGoPro')}</Text>
                            <Text style={styles.goProSub}>{t('subSubtitle')}</Text>
                        </View>
                        <View style={styles.goProBtn}>
                            <Text style={styles.goProBtnText}>{t('subGoPro')}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Manage Subscription */}
                {isPro && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Crown size={20} color={Colors.gold} />
                            <Text style={styles.sectionTitle}>{t('manageSubscription')}</Text>
                        </View>

                        <View style={styles.dataActions}>
                            <View style={styles.dataActionRow}>
                                <View style={styles.dataActionContent}>
                                    <Text style={styles.settingTitle}>{t('currentPlan')}</Text>
                                    <Text style={styles.settingDesc}>
                                        {subscriptionPlan === 'annual' ? t('subAnnual') : t('subMonthly')}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.dataActionDivider} />

                            {subscriptionCancelled ? (
                                <>
                                    <View style={{ marginBottom: 12 }}>
                                        <Text style={[styles.settingTitle, { color: Colors.attention }]}>
                                            {t('subscriptionCancelled')}
                                        </Text>
                                        <Text style={styles.settingDesc}>
                                            {t('cancelledMsg', { date: formattedExpiry })}
                                        </Text>
                                    </View>
                                    <Button
                                        title={t('reactivate')}
                                        variant="outline"
                                        size="sm"
                                        onPress={handleReactivate}
                                    />
                                </>
                            ) : (
                                <>
                                    <View style={{ marginBottom: 12 }}>
                                        <Text style={styles.settingDesc}>
                                            {t('renewsOn', { date: formattedExpiry })}
                                        </Text>
                                    </View>
                                    <Button
                                        title={t('cancelSubscription')}
                                        variant="destructive"
                                        size="sm"
                                        onPress={handleCancelSubscription}
                                    />
                                </>
                            )}

                            <View style={styles.dataActionDivider} />

                            <Text style={styles.storeNote}>{t('manageViaStore')}</Text>
                        </View>
                    </View>
                )}

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

                {/* ── Health Preferences ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Heart size={20} color={'#E879A2'} />
                        <Text style={styles.sectionTitle}>
                            {language === 'es' ? 'Preferencias de Salud' : 'Health Preferences'}
                        </Text>
                    </View>

                    <GlassCard padding={0} style={styles.settingsCard}>
                        <View style={styles.prefRow}>
                            <Text style={styles.prefLabel}>
                                {language === 'es' ? 'Explicaciones simples' : 'Simple explanations'}
                            </Text>
                            <ToggleSwitch value={prefSimpleExplanations} onValueChange={setPrefSimpleExplanations} />
                        </View>
                        <View style={styles.prefRow}>
                            <Text style={styles.prefLabel}>
                                {language === 'es' ? 'Sugerencias de doctor' : 'Doctor suggestions'}
                            </Text>
                            <ToggleSwitch value={prefDoctorSuggestions} onValueChange={setPrefDoctorSuggestions} />
                        </View>
                        <View style={styles.prefRow}>
                            <Text style={styles.prefLabel}>
                                {language === 'es' ? 'Recordatorios de seguimiento' : 'Follow-up reminders'}
                            </Text>
                            <ToggleSwitch value={prefFollowupReminders} onValueChange={setPrefFollowupReminders} />
                        </View>
                        <View style={[styles.prefRow, styles.prefRowLast]}>
                            <Text style={styles.prefLabel}>
                                {language === 'es' ? 'Seguimiento de tendencias' : 'Trend tracking'}
                            </Text>
                            <ToggleSwitch value={prefTrendTracking} onValueChange={setPrefTrendTracking} />
                        </View>
                    </GlassCard>
                </View>

                {/* ── Notifications ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Bell size={20} color={'#C87EA0'} />
                        <Text style={styles.sectionTitle}>
                            {language === 'es' ? 'Notificaciones' : 'Notifications'}
                        </Text>
                    </View>

                    <GlassCard padding={0} style={styles.settingsCard}>
                        <View style={styles.prefRow}>
                            <View style={styles.prefLabelRow}>
                                <Calendar size={16} color={Colors.primary} />
                                <Text style={styles.prefLabel}>
                                    {language === 'es' ? 'Recordatorio de examenes' : 'Exam reminders'}
                                </Text>
                            </View>
                            <ToggleSwitch value={notifExamReminders} onValueChange={setNotifExamReminders} />
                        </View>
                        <View style={styles.prefRow}>
                            <View style={styles.prefLabelRow}>
                                <Droplet size={16} color={Colors.primary} />
                                <Text style={styles.prefLabel}>
                                    {language === 'es' ? 'Recordatorio de hidratacion' : 'Hydration reminders'}
                                </Text>
                            </View>
                            <ToggleSwitch value={notifHydration} onValueChange={setNotifHydration} />
                        </View>
                        <View style={[styles.prefRow, styles.prefRowLast]}>
                            <View style={styles.prefLabelRow}>
                                <Sparkles size={16} color={Colors.primary} />
                                <Text style={styles.prefLabel}>
                                    {language === 'es' ? 'Resumen semanal' : 'Weekly health summary'}
                                </Text>
                            </View>
                            <ToggleSwitch value={notifWeeklySummary} onValueChange={setNotifWeeklySummary} />
                        </View>
                    </GlassCard>
                </View>

                {/* ── App Theme ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Sparkles size={20} color={'#D4A0C0'} />
                        <Text style={styles.sectionTitle}>
                            {language === 'es' ? 'Tema de la App' : 'App Theme'}
                        </Text>
                    </View>

                    <View style={styles.themeGrid}>
                        {THEMES.map(theme => {
                            const selected = appTheme === theme.id;
                            return (
                                <TouchableOpacity
                                    key={theme.id}
                                    style={[styles.themeCard, selected && styles.themeCardSelected]}
                                    activeOpacity={0.85}
                                    onPress={() => setAppTheme(theme.id as any)}
                                >
                                    <View style={[styles.themeSwatch, { backgroundColor: theme.color }]} />
                                    <Text style={styles.themeName}>
                                        {language === 'es' ? theme.nameEs : theme.nameEn}
                                    </Text>
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
                                <Text style={styles.settingTitle}>{t('shareWithDoctor')}</Text>
                                <Text style={styles.settingDesc}>
                                    {language === 'es'
                                        ? 'Genera un PDF profesional con tus resultados'
                                        : 'Generate a professional PDF with your results'}
                                </Text>
                            </View>
                            <Button
                                title={sharingReport ? t('generatingReport') : t('shareWithDoctor')}
                                variant="outline"
                                size="sm"
                                onPress={handleShareWithDoctor}
                                icon={<FileText size={16} color={Colors.primary} />}
                            />
                        </View>

                        <View style={styles.dataActionDivider} />

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

                        <View style={styles.dataActionDivider} />

                        {/* Reset App — wipes everything and returns to onboarding */}
                        <View style={styles.dataActionRow}>
                            <View style={styles.dataActionContent}>
                                <Text style={styles.settingTitle}>
                                    {language === 'es' ? 'Empezar desde cero' : 'Start from scratch'}
                                </Text>
                                <Text style={styles.settingDesc}>
                                    {language === 'es'
                                        ? 'Reinicia la app y vuelve a la bienvenida'
                                        : 'Reset the app and go back to welcome'}
                                </Text>
                            </View>
                            <Button
                                title={language === 'es' ? 'Reiniciar' : 'Reset'}
                                variant="outline"
                                size="sm"
                                onPress={handleResetApp}
                                icon={<RotateCcw size={14} color={Colors.primary} />}
                            />
                        </View>
                    </View>
                </View>

                {/* ── Legal (card-style list per reference) ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Info size={20} color={'#D4A0C0'} />
                        <Text style={styles.sectionTitle}>
                            {language === 'es' ? 'Legal' : 'Legal'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.legalCard}
                        activeOpacity={0.7}
                        onPress={() => Alert.alert(
                            language === 'es' ? 'Uso educativo' : 'Educational use only',
                            language === 'es'
                                ? 'Esta app es solo para fines educativos e informativos. No reemplaza consejo medico profesional.'
                                : 'This app is for educational and informational purposes only. It does not replace professional medical advice.',
                        )}
                    >
                        <Text style={styles.legalCardText}>
                            {language === 'es' ? 'Uso educativo unicamente' : 'Educational use only'}
                        </Text>
                        <ChevronRight size={16} color={Colors.outline} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.legalCard}
                        activeOpacity={0.7}
                        onPress={() => Alert.alert(
                            language === 'es' ? 'No es un diagnostico' : 'Not a diagnosis',
                            language === 'es'
                                ? 'Los resultados y recomendaciones no constituyen un diagnostico medico. Consulta siempre a tu profesional de salud.'
                                : 'Results and recommendations do not constitute a medical diagnosis. Always consult your healthcare professional.',
                        )}
                    >
                        <Text style={styles.legalCardText}>
                            {language === 'es' ? 'No es un diagnostico' : 'Not a diagnosis'}
                        </Text>
                        <ChevronRight size={16} color={Colors.outline} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.legalCard}
                        activeOpacity={0.7}
                        onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
                    >
                        <Text style={styles.legalCardText}>
                            {language === 'es' ? 'Politica de Privacidad' : 'Privacy Policy'}
                        </Text>
                        <ExternalLink size={14} color={Colors.outline} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.legalCard}
                        activeOpacity={0.7}
                        onPress={() => Linking.openURL(TERMS_OF_SERVICE_URL)}
                    >
                        <Text style={styles.legalCardText}>
                            {language === 'es' ? 'Terminos de Servicio' : 'Terms of Service'}
                        </Text>
                        <ExternalLink size={14} color={Colors.outline} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.legalCard}
                        activeOpacity={0.7}
                        onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
                    >
                        <Text style={styles.legalCardText}>
                            {language === 'es' ? 'Soporte' : 'Support'}
                        </Text>
                        <ExternalLink size={14} color={Colors.outline} />
                    </TouchableOpacity>
                </View>

                {/* ── Mascot encouragement footer ── */}
                <View style={styles.mascotFooter}>
                    <Mascot pose="celebrating" size={96} animation="idle-breath" />
                    <Text style={styles.mascotFooterText}>
                        {language === 'es' ? '¡Tu puedes! \uD83D\uDC96' : "You've got this! \uD83D\uDC96"}
                    </Text>
                </View>

                <Text style={styles.versionText}>Clyra v{APP_VERSION}</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    langRow: { flexDirection: 'row', gap: 12 },

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
    syncRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: Colors.surface, borderRadius: 12,
        borderWidth: 1, borderColor: Colors.border,
        padding: 12, marginBottom: 16,
    },
    syncText: {
        flex: 1,
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.xs, color: Colors.mutedForeground,
    },
    syncBtn: {
        backgroundColor: Colors.primary10, borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 6,
    },
    syncBtnText: {
        fontFamily: Typography.families.body,
        fontSize: 12, fontWeight: '700', color: Colors.primary,
    },
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
    contentContainer: { padding: 16, paddingBottom: 130 },
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
    // Subscription
    proBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: Colors.gold + '15', borderRadius: 14,
        padding: 14, marginBottom: 24,
        borderWidth: 1, borderColor: Colors.gold + '30',
    },
    proBannerText: {
        fontFamily: Typography.families.body,
        fontSize: 14, fontWeight: '700', color: Colors.gold,
    },
    goProBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#fff', borderRadius: 18, padding: 16,
        marginBottom: 24,
        borderWidth: 1.5, borderColor: Colors.gold + '40',
        shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12, shadowRadius: 12, elevation: 3,
    },
    goProTitle: {
        fontFamily: Typography.families.display,
        fontSize: 16, fontWeight: '800', color: Colors.foreground,
        marginBottom: 2,
    },
    goProSub: {
        fontFamily: Typography.families.body,
        fontSize: 11, color: Colors.mutedForeground, lineHeight: 15,
    },
    goProBtn: {
        backgroundColor: Colors.gold, borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 8,
    },
    goProBtnText: {
        fontFamily: Typography.families.body,
        fontSize: 12, fontWeight: '800', color: '#fff',
    },

    storeNote: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.xs,
        color: Colors.mutedForeground,
        lineHeight: 16,
        fontStyle: 'italic',
    },

    legalSection: {
        marginBottom: 16,
    },
    legalRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingVertical: 14, paddingHorizontal: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    legalText: {
        flex: 1,
        fontFamily: Typography.families.body,
        fontSize: 14, color: Colors.mutedForeground,
    },

    // ── Health preferences / notifications rows ──
    prefRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border + '60',
    },
    prefRowLast: { borderBottomWidth: 0 },
    prefLabel: {
        fontFamily: Typography.families.body,
        fontSize: 15, fontWeight: '600', color: Colors.foreground,
        flexShrink: 1,
    },
    prefLabelRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        flex: 1,
    },

    // ── App theme picker ──
    themeGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    },
    themeCard: {
        width: '47.5%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderWidth: 2, borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    },
    themeCardSelected: {
        borderColor: '#C87EA0',
    },
    themeSwatch: {
        width: 28, height: 28, borderRadius: 14,
    },
    themeName: {
        fontFamily: Typography.families.body,
        fontSize: 13, fontWeight: '600', color: Colors.foreground,
        flexShrink: 1,
    },

    // ── Legal card list (reference style) ──
    legalCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 14,
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        borderWidth: 1, borderColor: Colors.border,
    },
    legalCardText: {
        fontFamily: Typography.families.body,
        fontSize: 14, fontWeight: '500', color: Colors.foreground,
        flex: 1,
    },

    // ── Mascot footer "You've got this!" ──
    mascotFooter: {
        alignItems: 'center',
        marginTop: 24, marginBottom: 8,
        gap: 8,
    },
    mascotFooterText: {
        fontFamily: Typography.families.body,
        fontSize: 14, fontWeight: '600', color: '#C87EA0',
    },

    footerDisclaimer: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.xs, color: Colors.mutedForeground,
        textAlign: 'center', lineHeight: 18, marginTop: 16,
    },
    versionText: {
        fontFamily: Typography.families.body,
        fontSize: 11, color: Colors.outline,
        textAlign: 'center', marginTop: 8, marginBottom: 8,
    },
});
