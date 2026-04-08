import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, TextInput, Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trash2, Edit3, Check, X, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore, ExamSession } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import { Biomarker } from '../../services/openai';
import { computeHealthScore } from '../../constants/biomarkerSystems';
import { translateBiomarkerValue } from '../../constants/valueTranslations';

// ─── Status helpers ────────────────────────────────────────────────────────────

function statusColor(status: string) {
  if (status === 'normal') return Colors.optimal;
  if (status === 'borderline') return Colors.borderline;
  return Colors.attention;
}

function statusBg(status: string) {
  if (status === 'normal') return Colors.optimal10;
  if (status === 'borderline') return Colors.borderline10;
  return Colors.attention10;
}

// ─── Biomarker row (editable) ─────────────────────────────────────────────────

function BiomarkerRow({
  biomarker,
  editing,
  onEdit,
  lang,
}: {
  biomarker: Biomarker;
  editing: boolean;
  onEdit: (newValue: string) => void;
  lang: string;
}) {
  const [draft, setDraft] = useState(String(biomarker.value));
  const color = statusColor(biomarker.status);
  const bg = statusBg(biomarker.status);
  const statusLabel = {
    normal: lang === 'es' ? 'Normal' : 'Normal',
    borderline: lang === 'es' ? 'Límite' : 'Borderline',
    high: lang === 'es' ? 'Alto' : 'High',
    low: lang === 'es' ? 'Bajo' : 'Low',
  }[biomarker.status] ?? '';

  return (
    <View style={[styles.bioRow, { backgroundColor: bg, borderColor: color + '30' }]}>
      <View style={styles.bioLeft}>
        <Text style={styles.bioName}>{biomarker.name}</Text>
        {biomarker.referenceRange ? (
          <Text style={styles.bioRef}>
            {lang === 'es' ? 'Ref' : 'Ref'}: {biomarker.referenceRange} {biomarker.unit}
          </Text>
        ) : null}
      </View>
      <View style={styles.bioRight}>
        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.editInput}
              value={draft}
              onChangeText={setDraft}
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
            <Text style={styles.bioUnit}>{biomarker.unit}</Text>
            <TouchableOpacity onPress={() => onEdit(draft)} style={styles.editConfirm}>
              <Check size={14} color={Colors.optimal} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[styles.bioValue, { color }]}>
              {translateBiomarkerValue(biomarker.value, lang)} {biomarker.unit}
            </Text>
            <View style={[styles.statusChip, { backgroundColor: color }]}>
              <Text style={styles.statusChipText}>{statusLabel}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function TestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useT();
  const language = useStore((s) => s.language);
  const sessions = useStore((s) => s.sessions);
  const setSessions = useStore((s) => s.setSessions);

  const session = sessions.find(s => s.id === id);
  const [editMode, setEditMode] = useState(false);
  const [localBiomarkers, setLocalBiomarkers] = useState<Biomarker[]>(session?.biomarkers ?? []);

  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={Colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('testDetail')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.notFound}>
            {language === 'es' ? 'Examen no encontrado.' : 'Test not found.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(language === 'es' ? 'es' : 'en', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

  const sc = session.healthScore >= 80 ? Colors.optimal
    : session.healthScore >= 50 ? Colors.borderline
    : Colors.attention;

  const handleEditValue = (bioName: string, newValue: string) => {
    setLocalBiomarkers(prev =>
      prev.map(b => b.name === bioName ? { ...b, value: newValue } : b)
    );
  };

  const handleSave = () => {
    const newScore = computeHealthScore(localBiomarkers);
    setSessions(sessions.map(s =>
      s.id === id
        ? { ...s, biomarkers: localBiomarkers, healthScore: newScore }
        : s
    ));
    setEditMode(false);
  };

  const handleDelete = () => {
    Alert.alert(
      t('deleteTest'),
      t('deleteTestConfirm'),
      [
        { text: language === 'es' ? 'Cancelar' : 'Cancel', style: 'cancel' },
        {
          text: language === 'es' ? 'Eliminar' : 'Delete',
          style: 'destructive',
          onPress: () => {
            setSessions(sessions.filter(s => s.id !== id));
            router.back();
          },
        },
      ]
    );
  };

  const attentionList = localBiomarkers.filter(b => b.status !== 'normal');
  const normalList = localBiomarkers.filter(b => b.status === 'normal');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('testDetail')}</Text>
        <TouchableOpacity onPress={() => editMode ? handleSave() : setEditMode(true)} style={styles.editBtn}>
          {editMode
            ? <><Check size={16} color={Colors.optimal} /><Text style={[styles.editBtnText, { color: Colors.optimal }]}>{t('saveChanges')}</Text></>
            : <><Edit3 size={16} color={Colors.primary} /><Text style={styles.editBtnText}>{t('editTest')}</Text></>
          }
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Score hero */}
        <View style={[styles.scoreCard, { borderLeftColor: sc }]}>
          <View>
            <Text style={styles.scoreDate}>{formatDate(session.date)}</Text>
            {session.fileName && (
              <Text style={styles.scoreFile}>{session.fileName}</Text>
            )}
          </View>
          <View style={[styles.scoreBubble, { backgroundColor: sc + '15' }]}>
            <Text style={[styles.scoreNum, { color: sc }]}>{session.healthScore}</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>
        </View>

        {/* Edit mode banner */}
        {editMode && (
          <View style={styles.editBanner}>
            <Edit3 size={14} color={Colors.primary} />
            <Text style={styles.editBannerText}>
              {language === 'es'
                ? 'Toca un valor para editarlo. Toca ✓ para confirmar cada cambio.'
                : 'Tap a value to edit it. Tap ✓ to confirm each change.'}
            </Text>
          </View>
        )}

        {/* Out of range */}
        {attentionList.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              {language === 'es' ? '⚠️ Fuera de Rango' : '⚠️ Out of Range'}
            </Text>
            {attentionList.map(b => (
              <BiomarkerRow
                key={b.name}
                biomarker={localBiomarkers.find(lb => lb.name === b.name) ?? b}
                editing={editMode}
                onEdit={(val) => handleEditValue(b.name, val)}
                lang={language}
              />
            ))}
          </>
        )}

        {/* Normal */}
        {normalList.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: attentionList.length > 0 ? 20 : 0 }]}>
              {language === 'es' ? '✅ En Rango Normal' : '✅ In Normal Range'}
            </Text>
            {normalList.map(b => (
              <BiomarkerRow
                key={b.name}
                biomarker={localBiomarkers.find(lb => lb.name === b.name) ?? b}
                editing={editMode}
                onEdit={(val) => handleEditValue(b.name, val)}
                lang={language}
              />
            ))}
          </>
        )}

        {/* Delete */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
          <Trash2 size={16} color={Colors.attention} />
          <Text style={styles.deleteBtnText}>{t('deleteTest')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 16, color: Colors.mutedForeground },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant + '50',
    backgroundColor: Colors.background,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceHigh,
  },
  headerTitle: {
    fontFamily: Typography.families.display,
    fontSize: 17, fontWeight: '700', color: Colors.foreground,
  },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, backgroundColor: Colors.primary10,
  },
  editBtnText: {
    fontFamily: Typography.families.body,
    fontSize: 13, fontWeight: '700', color: Colors.primary,
  },

  scoreCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4, marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  scoreDate: {
    fontFamily: Typography.families.display,
    fontSize: 16, fontWeight: '700', color: Colors.foreground,
    marginBottom: 4, textTransform: 'capitalize',
  },
  scoreFile: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.mutedForeground,
  },
  scoreBubble: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNum: {
    fontFamily: Typography.families.display,
    fontSize: 26, fontWeight: '900',
  },
  scoreLabel: {
    fontFamily: Typography.families.body,
    fontSize: 9, color: Colors.outline, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
  },

  editBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary10, borderRadius: 12,
    padding: 12, marginBottom: 16,
  },
  editBannerText: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.primary, flex: 1, lineHeight: 17,
  },

  sectionTitle: {
    fontFamily: Typography.families.display,
    fontSize: 15, fontWeight: '800', color: Colors.foreground,
    marginBottom: 10,
  },

  bioRow: {
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 8,
  },
  bioLeft: { flex: 1, gap: 2 },
  bioName: {
    fontFamily: Typography.families.body,
    fontSize: 14, fontWeight: '600', color: Colors.foreground,
  },
  bioRef: {
    fontFamily: Typography.families.body,
    fontSize: 11, color: Colors.outline,
  },
  bioRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bioValue: {
    fontFamily: Typography.families.body,
    fontSize: 14, fontWeight: '700',
  },
  bioUnit: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.outline,
  },
  statusChip: {
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
  },
  statusChipText: {
    fontFamily: Typography.families.body,
    fontSize: 10, fontWeight: '700', color: 'white',
  },

  editRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  editInput: {
    borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    fontFamily: Typography.families.body,
    fontSize: 14, fontWeight: '700', color: Colors.foreground,
    minWidth: 60, textAlign: 'right',
  },
  editConfirm: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.optimal10,
    alignItems: 'center', justifyContent: 'center',
  },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    justifyContent: 'center', marginTop: 32,
    paddingVertical: 14, borderRadius: 16,
    borderWidth: 1.5, borderColor: Colors.attention + '30',
    backgroundColor: Colors.attention10,
  },
  deleteBtnText: {
    fontFamily: Typography.families.body,
    fontSize: 14, fontWeight: '700', color: Colors.attention,
  },
});
