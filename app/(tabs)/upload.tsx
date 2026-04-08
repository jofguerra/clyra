import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, FileText, CircleCheck, ChevronRight, Upload, Camera, Keyboard, FlaskConical, Check, Search, Sparkles, CheckCircle, Image } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { extractLabResultsFromPDF, extractLabResultsFromImage } from '../../services/openai';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import type { TranslationKey } from '../../constants/i18n';
import { BODY_SYSTEMS, getSystemBiomarkers, SAMPLE_TYPE_EMOJI } from '../../constants/biomarkerSystems';
import CoverageMap from '../../components/CoverageMap';

type UploadState = 'list' | 'choose' | 'uploading' | 'processing' | 'done';

const ANALYSIS_STEPS = [
    { key: 'uploadStep1' as const, delay: 0, Icon: FileText },
    { key: 'uploadStep2' as const, delay: 3000, Icon: Search },
    { key: 'uploadStep3' as const, delay: 8000, Icon: Sparkles },
    { key: 'uploadStep4' as const, delay: 15000, Icon: CheckCircle },
];

function AnalysisProgress({ t }: { t: (k: TranslationKey) => string }) {
    const [stepIndex, setStepIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const dotAnim = useRef(new Animated.Value(0)).current;

    // Cycle through steps on timers
    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];
        ANALYSIS_STEPS.forEach((step, i) => {
            if (i === 0) return;
            timers.push(
                setTimeout(() => {
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        setStepIndex(i);
                        Animated.timing(fadeAnim, {
                            toValue: 1,
                            duration: 300,
                            useNativeDriver: true,
                        }).start();
                    });
                }, step.delay),
            );
        });
        return () => timers.forEach(clearTimeout);
    }, []);

    // Pulsing dots animation
    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(dotAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, []);

    const currentStep = ANALYSIS_STEPS[stepIndex];
    const CurrentIcon = currentStep.Icon;

    return (
        <View style={analysisStyles.container}>
            <Animated.View style={[analysisStyles.content, { opacity: fadeAnim }]}>
                <View style={analysisStyles.iconCircle}>
                    <CurrentIcon size={32} color={Colors.primary} />
                </View>
                <Text style={analysisStyles.stepText}>{t(currentStep.key)}</Text>
            </Animated.View>

            {/* Progress dots */}
            <View style={analysisStyles.dotsRow}>
                {ANALYSIS_STEPS.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            analysisStyles.dot,
                            i <= stepIndex ? analysisStyles.dotActive : analysisStyles.dotInactive,
                        ]}
                    />
                ))}
            </View>

            {/* Pulsing indicator */}
            <Animated.View style={{ opacity: Animated.add(0.4, Animated.multiply(dotAnim, 0.6)) }}>
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 24 }} />
            </Animated.View>

            <Text style={analysisStyles.subtitle}>{t('dontClose')}</Text>
        </View>
    );
}

const analysisStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    content: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.primary10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    stepText: {
        fontFamily: Typography.families.display,
        fontSize: 20,
        fontWeight: '700',
        color: Colors.foreground,
        textAlign: 'center',
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 28,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        backgroundColor: Colors.primary,
    },
    dotInactive: {
        backgroundColor: Colors.outlineVariant,
    },
    subtitle: {
        fontFamily: Typography.families.body,
        fontSize: 14,
        color: Colors.mutedForeground,
        textAlign: 'center',
        marginTop: 16,
    },
});

export default function TestsScreen() {
    const router = useRouter();
    const t = useT();
    const setBiomarkers = useStore((s) => s.setBiomarkers);
    const biomarkers = useStore((s) => s.biomarkers);
    const sessions = useStore((s) => s.sessions);
    const language = useStore((s) => s.language);
    const isPro = useStore((s) => s.isPro);
    const isGuest = useStore((s) => s.isGuest);

    const [state, setState] = useState<UploadState>('list');
    const [lastUploadCount, setLastUploadCount] = useState(0);

    // ── Upload flow ──────────────────────────────────────────────────────────

    const handleUpload = () => {
        // First test is free, subsequent tests require Pro
        if (sessions.length >= 1 && !isPro) {
            Alert.alert(
                t('proRequired'),
                t('proUploadLimit'),
                [
                    { text: t('subGoPro'), onPress: () => router.push('/subscription' as any) },
                    { text: language === 'es' ? 'Cancelar' : 'Cancel', style: 'cancel' },
                ],
            );
            return;
        }
        setState('choose');
    };

    const processFile = async (file: DocumentPicker.DocumentPickerAsset) => {
        const fileHash = `${file.name}:${file.size}`;
        setState('uploading');
        setTimeout(async () => {
            try {
                setState('processing');
                const { biomarkers: data, testDate } = await extractLabResultsFromPDF(file.uri, file.name);
                setBiomarkers(data, testDate, file.name ?? 'lab_results.pdf', fileHash);
                setLastUploadCount(data.length);
                setState('done');
            } catch (err: any) {
                Alert.alert('Error', err.message?.slice(0, 200) ?? 'Could not extract data');
                setState('list');
            }
        }, 400);
    };

    const handlePickPDF = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf'],
                copyToCacheDirectory: true,
            });
            if (result.canceled || !result.assets?.length) return;
            const file = result.assets[0];
            const fileHash = `${file.name}:${file.size}`;

            if (sessions.some(s => s.fileHash === fileHash || s.fileName === file.name)) {
                Alert.alert(
                    t('duplicateFileTitle'),
                    t('duplicateFileMsg'),
                    [
                        { text: language === 'es' ? 'Cancelar' : 'Cancel', style: 'cancel' },
                        { text: t('uploadAnyway'), onPress: () => processFile(file) },
                    ],
                );
                return;
            }

            processFile(file);
        } catch {
            setState('list');
        }
    };

    const processImage = async (uri: string, fileName: string) => {
        setState('uploading');
        setTimeout(async () => {
            try {
                setState('processing');
                const { biomarkers: data, testDate } = await extractLabResultsFromImage(uri);

                // Duplicate check for images: same date + similar biomarker count
                if (testDate) {
                    const duplicate = sessions.find(s => {
                        const sameDate = s.date.startsWith(testDate);
                        const similarCount = Math.abs(s.biomarkers.length - data.length) <= 3;
                        return sameDate && similarCount;
                    });
                    if (duplicate) {
                        Alert.alert(
                            t('duplicateFileTitle'),
                            t('duplicateFileMsg'),
                            [
                                { text: language === 'es' ? 'Cancelar' : 'Cancel', style: 'cancel', onPress: () => setState('list') },
                                {
                                    text: t('uploadAnyway'), onPress: () => {
                                        setBiomarkers(data, testDate, fileName);
                                        setLastUploadCount(data.length);
                                        setState('done');
                                    }
                                },
                            ],
                        );
                        return;
                    }
                }

                setBiomarkers(data, testDate, fileName);
                setLastUploadCount(data.length);
                setState('done');
            } catch (err: any) {
                Alert.alert('Error', err.message?.slice(0, 200) ?? 'Could not extract data from image');
                setState('list');
            }
        }, 400);
    };

    const handleTakePhoto = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert(
                    language === 'es' ? 'Permiso requerido' : 'Permission Required',
                    language === 'es' ? 'Necesitamos acceso a la cámara para tomar fotos.' : 'We need camera access to take photos.',
                );
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.9,
            });
            if (result.canceled || !result.assets?.length) return;
            const asset = result.assets[0];
            processImage(asset.uri, asset.fileName ?? 'lab_photo.jpg');
        } catch {
            setState('list');
        }
    };

    const handlePickGallery = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert(
                    language === 'es' ? 'Permiso requerido' : 'Permission Required',
                    language === 'es' ? 'Necesitamos acceso a tus fotos.' : 'We need access to your photos.',
                );
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.9,
            });
            if (result.canceled || !result.assets?.length) return;
            const asset = result.assets[0];
            processImage(asset.uri, asset.fileName ?? 'lab_gallery.jpg');
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

    if (state === 'uploading' || state === 'processing') return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader title={t('testsTitle')} />
            <AnalysisProgress t={t} />
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
                <Text style={styles.doneSub}>{t('foundMarkers', { n: lastUploadCount })}</Text>
                <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => { setState('list'); router.push('/(tabs)'); }}
                    activeOpacity={0.85}
                >
                    <Text style={styles.doneBtnText}>{t('viewResults')}</Text>
                </TouchableOpacity>

                {isGuest && sessions.length === 1 && (
                    <View style={styles.signupPromptCard}>
                        <Text style={styles.signupPromptText}>{t('createAccountPrompt')}</Text>
                        <TouchableOpacity
                            style={styles.signupPromptBtn}
                            onPress={() => { setState('list'); router.push('/onboarding/auth'); }}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.signupPromptBtnText}>{t('authCreateAccount')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );

    if (state === 'choose') return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader title={t('addTest')} />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                <Text style={styles.chooseSubtitle}>{t('uploadSubtitle')}</Text>

                {/* Take a Photo */}
                <TouchableOpacity style={styles.methodRow} onPress={handleTakePhoto} activeOpacity={0.8}>
                    <View style={[styles.methodIcon, { backgroundColor: Colors.primary10 }]}>
                        <Camera size={22} color={Colors.primary} />
                    </View>
                    <View style={styles.methodInfo}>
                        <Text style={styles.methodTitle}>{t('uploadPhoto')}</Text>
                        <Text style={styles.methodDesc}>
                            {language === 'es' ? 'Toma una foto de tus resultados' : 'Take a photo of your lab results'}
                        </Text>
                    </View>
                    <ChevronRight size={18} color={Colors.outline} />
                </TouchableOpacity>

                {/* Choose from Gallery */}
                <TouchableOpacity style={styles.methodRow} onPress={handlePickGallery} activeOpacity={0.8}>
                    <View style={[styles.methodIcon, { backgroundColor: Colors.primary10 }]}>
                        <Image size={22} color={Colors.primary} />
                    </View>
                    <View style={styles.methodInfo}>
                        <Text style={styles.methodTitle}>{t('uploadGallery')}</Text>
                        <Text style={styles.methodDesc}>
                            {language === 'es' ? 'Selecciona una imagen de tu galería' : 'Pick an image from your gallery'}
                        </Text>
                    </View>
                    <ChevronRight size={18} color={Colors.outline} />
                </TouchableOpacity>

                {/* PDF Option */}
                <TouchableOpacity style={styles.methodRow} onPress={handlePickPDF} activeOpacity={0.8}>
                    <View style={[styles.methodIcon, { backgroundColor: Colors.primary10 }]}>
                        <Upload size={22} color={Colors.primary} />
                    </View>
                    <View style={styles.methodInfo}>
                        <Text style={styles.methodTitle}>{t('uploadPDF')}</Text>
                        <Text style={styles.methodDesc}>
                            {language === 'es' ? 'Sube tu PDF de laboratorio' : 'Upload your lab PDF report'}
                        </Text>
                    </View>
                    <ChevronRight size={18} color={Colors.outline} />
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

                {/* ── Test History ── */}
                {sessions.length > 0 ? (
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
                                    <View style={[styles.scoreBadge, { backgroundColor: sc + '15' }]}>
                                        <Text style={[styles.scoreBadgeText, { color: sc }]}>
                                            {session.healthScore}
                                        </Text>
                                    </View>
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
                                    <ChevronRight size={18} color={Colors.outline} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <FileText size={52} color={Colors.outlineVariant} style={{ marginBottom: 16 }} />
                        <Text style={styles.emptyTitle}>{t('noTestsYet')}</Text>
                        <Text style={styles.emptySub}>{t('noTestsSub')}</Text>
                    </View>
                )}

                {/* ── Add New Test ── */}
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={handleUpload}
                    activeOpacity={0.85}
                >
                    <View style={styles.addBtnIcon}>
                        <Plus size={22} color="white" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.addBtnText}>{t('addTest')}</Text>
                </TouchableOpacity>

                {/* ── Health Coverage ── */}
                {biomarkers.length > 0 && (
                    <View style={styles.coverageSection}>
                        <Text style={styles.recHeader}>{t('coverageLabel')}</Text>
                        <Text style={styles.recSub}>{t('coverageSub')}</Text>
                        <CoverageMap biomarkers={biomarkers} language={language} />
                    </View>
                )}

                {/* ── Recommended Blood Tests (with checkmarks) ── */}
                <View style={styles.recSection}>
                    <Text style={styles.recHeader}>{t('recommendedTestsTitle')}</Text>
                    <Text style={styles.recSub}>{t('recommendedTestsSub')}</Text>
                    {BODY_SYSTEMS.map(sys => {
                        const hasBiomarkers = getSystemBiomarkers(sys, biomarkers).length > 0;
                        return (
                            <View key={sys.id} style={styles.recSystemCard}>
                                <View style={styles.recSystemHeader}>
                                    <Text style={styles.recSystemEmoji}>{sys.emoji}</Text>
                                    <Text style={styles.recSystemName}>{sys.name[language as 'en' | 'es']}</Text>
                                    {hasBiomarkers && (
                                        <View style={styles.systemCheckBadge}>
                                            <Check size={12} color={Colors.optimal} strokeWidth={3} />
                                        </View>
                                    )}
                                </View>
                                {sys.requiredTests.map((test, i) => {
                                    const testHasData = biomarkers.some(b =>
                                        test.name.en.toLowerCase().includes(b.name.toLowerCase().split(' ')[0]) ||
                                        b.name.toLowerCase().includes(test.name.en.toLowerCase().split(' ')[0])
                                    );
                                    return (
                                        <View key={i} style={[styles.recTestRow, testHasData && styles.recTestRowDone]}>
                                            <View style={[styles.recTestIcon, testHasData && { backgroundColor: Colors.optimal10 }]}>
                                                {testHasData
                                                    ? <Check size={12} color={Colors.optimal} strokeWidth={3} />
                                                    : <FlaskConical size={12} color={Colors.primary} />}
                                            </View>
                                            <View style={styles.recTestInfo}>
                                                <View style={styles.recTestNameRow}>
                                                    <Text style={[styles.recTestName, testHasData && { color: Colors.optimal }]}>
                                                        {test.name[language as 'en' | 'es']}
                                                    </Text>
                                                    {test.sampleType && (
                                                        <View style={styles.sampleBadge}>
                                                            <Text style={styles.sampleBadgeText}>
                                                                {SAMPLE_TYPE_EMOJI[test.sampleType] ?? ''} {test.sampleType}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={styles.recTestDesc}>{test.description[language as 'en' | 'es']}</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })}
                </View>
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

    // Coverage section
    coverageSection: { marginBottom: 28 },

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
    systemCheckBadge: {
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: Colors.optimal10,
        alignItems: 'center', justifyContent: 'center', marginLeft: 'auto',
    },
    recTestRow: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8,
    },
    recTestRowDone: { opacity: 0.7 },
    recTestIcon: {
        width: 24, height: 24, borderRadius: 7,
        backgroundColor: Colors.primary10,
        alignItems: 'center', justifyContent: 'center', marginTop: 1,
    },
    recTestInfo: { flex: 1 },
    recTestNameRow: {
        flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6, marginBottom: 1,
    },
    recTestName: {
        fontFamily: Typography.families.body,
        fontSize: 13, fontWeight: '700', color: Colors.foreground,
    },
    sampleBadge: {
        backgroundColor: Colors.muted,
        borderRadius: 6,
        paddingHorizontal: 5,
        paddingVertical: 1,
    },
    sampleBadgeText: {
        fontFamily: Typography.families.body,
        fontSize: 9, color: Colors.mutedForeground, textTransform: 'capitalize' as const,
    },
    recTestDesc: {
        fontFamily: Typography.families.body,
        fontSize: 11, color: Colors.mutedForeground, lineHeight: 15,
    },

    // History
    historySection: { marginBottom: 20 },
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
    signupPromptCard: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 20,
        marginTop: 20,
        alignItems: 'center',
        maxWidth: 320,
    },
    signupPromptText: {
        fontFamily: Typography.families.body,
        fontSize: 14,
        color: Colors.mutedForeground,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 14,
    },
    signupPromptBtn: {
        backgroundColor: Colors.primary10,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    signupPromptBtnText: {
        fontFamily: Typography.families.body,
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
    },
});
