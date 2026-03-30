import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, FileText, CircleCheck, ChevronRight, Upload, Camera, Keyboard, FlaskConical } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { extractLabResultsFromPDF } from '../../services/openai';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { BODY_SYSTEMS } from '../../constants/biomarkerSystems';

type UploadState = 'list' | 'choose' | 'uploading' | 'processing' | 'done';

export default function TestsScreen() {
    const router = useRouter();
    const t = useT();
    const setBiomarkers = useStore((s) => s.setBiomarkers);
    const biomarkers = useStore((s) => s.biomarkers);
    const sessions = useStore((s) => s.sessions);
    const language = useStore((s) => s.language);

    const [state, setState] = useState<UploadState>('list');

    // ── Upload flow ──────────────────────────────────────────────────────────

    const handlePickPDF = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf'],
                copyToCacheDirectory: true,
            });
            if (result.canceled || !result.assets?.length) return;
            const file = result.assets[0];
            setState('uploading');
            setTimeout(async () => {
                try {
                    setState('processing');
                    const { biomarkers: data, testDate } = await extractLabResultsFromPDF(file.uri, file.name);
                    setBiomarkers(data, testDate, file.name ?? 'lab_results.pdf');
                    setState('done');
                } catch (err: any) {
                    Alert.alert('Error', err.message?.slice(0, 200) ?? 'Could not extract data');
                    setState('list');
                }
            }, 400);
        } catch {
            setState('list');
        }
    };

    // ── Helpers ──────────────────────────────────────────────────────────────

    function scoreColor(score: number) {
        if (score >= 80) return Colors.optimal;
        if (score >= 65) return Colors.optimal;
        if (score >= 50) return Colors.borderline;
        return Colors.attention;
    }

    function formatDate(iso: string) {
        return new Date(iso).toLocaleDateString(language === 'es' ? 'es' : 'en', {
            day: 'numeric', month: 'short', year: 'numeric',
        });
    }

    // ── Renders ──────────────────────────────────────────────────────────────

    if (state === 'uploading') return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader title={t('testsTitle')} />
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingTitle}>{t('uploading')}</Text>
                <Text style={styles.loadingSubtitle}>{t('dontClose')}</Text>
            </View>
        </SafeAreaView>
    );

    if (state === 'processing') return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader title={t('testsTitle')} />
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingTitle}>{t('processing')}</Text>
                <Text style={styles.loadingSubtitle}>{t('dontClose')}</Text>
            </View>
        </SafeAreaView>
    );

    if (state === 'done') return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader title={t('testsTitle')} />
            <View style={styles.center}>
                <View style={styles.doneIcon}>
                    <CircleCheck size={56} color={Colors.optimal} />
                </View>
                <Text style={styles.doneTitle}>{t('analysisDone')}</Text>
                <Text style={styles.doneSub}>{t('foundMarkers', { n: biomarkers.length })}</Text>
                <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => { setState('list'); router.push('/(tabs)'); }}
                    activeOpacity={0.85}
                >
                    <Text style={styles.doneBtnText}>{t('viewResults')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.doneSecondary}
                    onPress={() => setState('list')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.doneSecondaryText}>{t('uploadHistory')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

    if (state === 'choose') return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader title={t('addTest')} />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                <Text style={styles.chooseSubtitle}>{t('uploadSubtitle')}</Text>

                {/* PDF Option */}
                <TouchableOpacity style={styles.methodRow} onPress={handlePickPDF} activeOpacity={0.8}>
                    <View style={[styles.methodIcon, { backgroundColor: Colors.primary10 }]}>
                        <Upload size={22} color={Colors.primary} />
                    </View>
                    <View style={styles.methodInfo}>
                        <Text style={styles.methodTitle}>PDF / Document</Text>
                        <Text style={styles.methodDesc}>
                            {language === 'es' ? 'Sube tu PDF de laboratorio' : 'Upload your lab PDF report'}
                        </Text>
                    </View>
                    <ChevronRight size={18} color={Colors.outline} />
                </TouchableOpacity>

                {/* Photo option (coming soon) */}
                <TouchableOpacity style={[styles.methodRow, styles.methodRowDisabled]} activeOpacity={0.6}>
                    <View style={[styles.methodIcon, { backgroundColor: Colors.surfaceHigh }]}>
                        <Camera size={22} color={Colors.outline} />
                    </View>
                    <View style={styles.methodInfo}>
                        <Text style={[styles.methodTitle, { color: Colors.outline }]}>
                            {language === 'es' ? 'Foto' : 'Photo'}
                        </Text>
                        <Text style={styles.methodDesc}>
                            {language === 'es' ? 'Próximamente' : 'Coming soon'}
                        </Text>
                    </View>
                    <View style={styles.soonChip}>
                        <Text style={styles.soonChipText}>{language === 'es' ? 'Pronto' : 'Soon'}</Text>
                    </View>
                </TouchableOpacity>

                {/* Manual option (coming soon) */}
                <TouchableOpacity style={[styles.methodRow, styles.methodRowDisabled]} activeOpacity={0.6}>
                    <View style={[styles.methodIcon, { backgroundColor: Colors.surfaceHigh }]}>
                        <Keyboard size={22} color={Colors.outline} />
                    </View>
                    <View style={styles.methodInfo}>
                        <Text style={[styles.methodTitle, { color: Colors.outline }]}>
                            {language === 'es' ? 'Manual' : 'Manual Entry'}
                        </Text>
                        <Text style={styles.methodDesc}>
                            {language === 'es' ? 'Próximamente' : 'Coming soon'}
                        </Text>
                    </View>
                    <View style={styles.soonChip}>
                        <Text style={styles.soonChipText}>{language === 'es' ? 'Pronto' : 'Soon'}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setState('list')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.cancelBtnText}>{language === 'es' ? 'Cancelar' : 'Cancel'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );

    // ── Main list view ────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader title={t('testsTitle')} />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* ADD TEST button — always prominent at top */}
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => setState('choose')}
                    activeOpacity={0.85}
                >
                    <View style={styles.addBtnIcon}>
                        <Plus size={22} color="white" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.addBtnText}>{t('addTest')}</Text>
                </TouchableOpacity>

                {/* Empty state */}
                {sessions.length === 0 && (
                    <View style={styles.emptyState}>
                        <FileText size={52} color={Colors.outlineVariant} style={{ marginBottom: 16 }} />
                        <Text style={styles.emptyTitle}>{t('noTestsYet')}</Text>
                        <Text style={styles.emptySub}>{t('noTestsSub')}</Text>
                    </View>
                )}

                {/* Recommended Blood Tests */}
                <View style={styles.recSection}>
                    <Text style={styles.recHeader}>{t('recommendedTestsTitle')}</Text>
                    <Text style={styles.recSub}>{t('recommendedTestsSub')}</Text>
                    {BODY_SYSTEMS.map(sys => (
                        <View key={sys.id} style={styles.recSystemCard}>
                            <View style={styles.recSystemHeader}>
                                <Text style={styles.recSystemEmoji}>{sys.emoji}</Text>
                                <Text style={styles.recSystemName}>{sys.name[language as 'en' | 'es']}</Text>
                            </View>
                            {sys.requiredTests.map((test, i) => (
                                <View key={i} style={styles.recTestRow}>
                                    <View style={styles.recTestIcon}>
                                        <FlaskConical size={12} color={Colors.primary} />
                                    </View>
                                    <View style={styles.recTestInfo}>
                                        <Text style={styles.recTestName}>{test.name[language as 'en' | 'es']}</Text>
                                        <Text style={styles.recTestDesc}>{test.description[language as 'en' | 'es']}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Test history */}
                {sessions.length > 0 && (
                    <View style={styles.historySection}>
                        <Text style={styles.historyHeader}>{t('uploadHistory')}</Text>
                        {sessions.map((session, i) => {
                            const sc = scoreColor(session.healthScore);
                            const att = session.biomarkers.filter(b => b.status !== 'normal').length;
                            return (
                                <TouchableOpacity
                                    key={session.id}
                                    style={styles.testCard}
                                    activeOpacity={0.8}
                                    onPress={() => router.push(`/test/${session.id}` as any)}
                                >
                                    {/* Score badge */}
                                    <View style={[styles.scoreBadge, { backgroundColor: sc + '15' }]}>
                                        <Text style={[styles.scoreBadgeText, { color: sc }]}>
                                            {session.healthScore}
                                        </Text>
                                    </View>

                                    {/* Info */}
                                    <View style={styles.testInfo}>
                                        <Text style={styles.testLabel}>{session.label}</Text>
                                        <Text style={styles.testMeta}>
                                            {formatDate(session.date)} · {session.biomarkers.length} {language === 'es' ? 'marcadores' : 'markers'}
                                        </Text>
                                        {att > 0 && (
                                            <Text style={styles.testAlert}>
                                                {att} {language === 'es' ? 'fuera de rango' : 'out of range'}
                                            </Text>
                                        )}
                                    </View>

                                    {/* Arrow */}
                                    <ChevronRight size={18} color={Colors.outline} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    scroll: { flex: 1 },
    content: { padding: 20, paddingBottom: 100 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },

    // Add button
    addBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 28,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 4,
    },
    addBtnIcon: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center',
    },
    addBtnText: {
        fontFamily: Typography.families.display,
        fontSize: 16, fontWeight: '700', color: 'white',
    },

    // Method choice
    chooseSubtitle: {
        fontFamily: Typography.families.body,
        fontSize: 14, color: Colors.mutedForeground, marginBottom: 24,
    },
    methodRow: {
        backgroundColor: '#fff',
        borderRadius: 16, padding: 16,
        flexDirection: 'row', alignItems: 'center', gap: 14,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
    },
    methodRowDisabled: { opacity: 0.6 },
    methodIcon: {
        width: 44, height: 44, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    methodInfo: { flex: 1 },
    methodTitle: {
        fontFamily: Typography.families.body,
        fontSize: 15, fontWeight: '600', color: Colors.foreground, marginBottom: 2,
    },
    methodDesc: {
        fontFamily: Typography.families.body,
        fontSize: 12, color: Colors.mutedForeground,
    },
    soonChip: {
        backgroundColor: Colors.surfaceHigh, borderRadius: 8,
        paddingHorizontal: 8, paddingVertical: 3,
    },
    soonChipText: {
        fontFamily: Typography.families.body,
        fontSize: 10, fontWeight: '700', color: Colors.outline,
    },
    cancelBtn: {
        marginTop: 8, padding: 16, alignItems: 'center',
    },
    cancelBtnText: {
        fontFamily: Typography.families.body,
        fontSize: 15, color: Colors.outline, fontWeight: '600',
    },

    // Empty state
    emptyState: { alignItems: 'center', paddingTop: 40 },
    emptyTitle: {
        fontFamily: Typography.families.display,
        fontSize: 20, fontWeight: '700', color: Colors.foreground, marginBottom: 10,
    },
    emptySub: {
        fontFamily: Typography.families.body,
        fontSize: 14, color: Colors.mutedForeground,
        textAlign: 'center', lineHeight: 22,
    },

    // Recommended tests
    recSection: { marginBottom: 28 },
    recHeader: {
        fontFamily: Typography.families.display,
        fontSize: 18, fontWeight: '800', color: Colors.foreground,
        marginBottom: 4, letterSpacing: -0.3,
    },
    recSub: {
        fontFamily: Typography.families.body,
        fontSize: 13, color: Colors.mutedForeground, marginBottom: 16,
    },
    recSystemCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
    },
    recSystemHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10,
    },
    recSystemEmoji: { fontSize: 18 },
    recSystemName: {
        fontFamily: Typography.families.display,
        fontSize: 15, fontWeight: '800', color: Colors.foreground,
    },
    recTestRow: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8,
    },
    recTestIcon: {
        width: 24, height: 24, borderRadius: 7,
        backgroundColor: Colors.primary10,
        alignItems: 'center', justifyContent: 'center', marginTop: 1,
    },
    recTestInfo: { flex: 1 },
    recTestName: {
        fontFamily: Typography.families.body,
        fontSize: 13, fontWeight: '700', color: Colors.foreground, marginBottom: 1,
    },
    recTestDesc: {
        fontFamily: Typography.families.body,
        fontSize: 11, color: Colors.mutedForeground, lineHeight: 15,
    },

    // History
    historySection: {},
    historyHeader: {
        fontFamily: Typography.families.display,
        fontSize: 18, fontWeight: '800', color: Colors.foreground,
        marginBottom: 14, letterSpacing: -0.3,
    },
    testCard: {
        backgroundColor: '#fff', borderRadius: 18,
        padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
    },
    scoreBadge: {
        width: 52, height: 52, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
    },
    scoreBadgeText: {
        fontFamily: Typography.families.display,
        fontSize: 20, fontWeight: '800',
    },
    testInfo: { flex: 1 },
    testLabel: {
        fontFamily: Typography.families.body,
        fontSize: 15, fontWeight: '600', color: Colors.foreground, marginBottom: 2,
    },
    testMeta: {
        fontFamily: Typography.families.body,
        fontSize: 12, color: Colors.mutedForeground,
    },
    testAlert: {
        fontFamily: Typography.families.body,
        fontSize: 11, color: Colors.attention, fontWeight: '600', marginTop: 3,
    },

    // Loading states
    loadingTitle: {
        fontFamily: Typography.families.display,
        fontSize: 20, fontWeight: '700', color: Colors.foreground,
        marginTop: 24, marginBottom: 8, textAlign: 'center',
    },
    loadingSubtitle: {
        fontFamily: Typography.families.body,
        fontSize: 14, color: Colors.mutedForeground, textAlign: 'center',
    },

    // Done state
    doneIcon: { marginBottom: 20 },
    doneTitle: {
        fontFamily: Typography.families.display,
        fontSize: 24, fontWeight: '800', color: Colors.foreground,
        marginBottom: 10, textAlign: 'center',
    },
    doneSub: {
        fontFamily: Typography.families.body,
        fontSize: 15, color: Colors.mutedForeground,
        textAlign: 'center', marginBottom: 32,
    },
    doneBtn: {
        backgroundColor: Colors.primary, borderRadius: 18,
        paddingVertical: 16, paddingHorizontal: 40,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25, shadowRadius: 16,
        marginBottom: 12,
    },
    doneBtnText: {
        fontFamily: Typography.families.display,
        fontSize: 16, fontWeight: '700', color: 'white',
    },
    doneSecondary: { padding: 12 },
    doneSecondaryText: {
        fontFamily: Typography.families.body,
        fontSize: 14, color: Colors.primary, fontWeight: '600',
    },
});
