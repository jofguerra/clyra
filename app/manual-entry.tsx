import React, { useRef, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/ui/Button';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { useStore } from '../hooks/useStore';
import { useT } from '../hooks/useT';
import type { Biomarker } from '../services/openai';
import { isNumericValue, isPlaceholderValue } from '../constants/valueParsing';

// Manual entry copies the laboratory's assessment; it does not invent a diagnosis.
const statuses = ['normal', 'low', 'high', 'borderline'] as const;

export default function ManualEntryScreen() {
  const router = useRouter();
  const t = useT();
  const language = useStore(s => s.language);
  const setBiomarkers = useStore(s => s.setBiomarkers);
  const es = language === 'es';
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [range, setRange] = useState('');
  const [status, setStatus] = useState<Biomarker['status'] | null>(null);
  const [rows, setRows] = useState<Biomarker[]>([]);
  const [error, setError] = useState('');
  const saved = useRef(false);
  const labels = es
    ? ['Normal', 'Bajo', 'Alto', 'Limítrofe']
    : ['Normal', 'Low', 'High', 'Borderline'];

  const addResult = () => {
    if (!name.trim() || !isNumericValue(value) || isPlaceholderValue(value) || !unit.trim() || !status) {
      setError(es
        ? 'Completa el nombre, un valor numérico, la unidad y el estado indicado por el laboratorio.'
        : 'Enter a name, numeric value, unit, and the status reported by your laboratory.');
      return;
    }
    if (rows.some(row => row.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase())) {
      setError(es ? 'Este marcador ya está en el examen.' : 'This marker is already in the exam.');
      return;
    }
    setRows([...rows, { name: name.trim(), value: value.trim(), unit: unit.trim(), status,
      ...(range.trim() ? { referenceRange: range.trim() } : {}) }]);
    setName(''); setValue(''); setUnit(''); setRange(''); setStatus(null); setError('');
  };

  const saveExam = () => {
    if (!rows.length || saved.current) return;
    saved.current = true;
    setBiomarkers(rows, null, es ? 'Ingreso manual' : 'Manual entry');
    router.replace('/(tabs)/upload');
  };

  const fields = [
    { label: es ? 'Biomarcador' : 'Biomarker', value: name, set: setName, hint: 'Glucosa' },
    { label: es ? 'Valor' : 'Value', value, set: setValue, hint: '95' },
    { label: es ? 'Unidad' : 'Unit', value: unit, set: setUnit, hint: 'mg/dL' },
    { label: es ? 'Rango de referencia (opcional)' : 'Reference range (optional)', value: range, set: setRange, hint: '70 - 100' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <AppHeader showBack onBack={() => router.back()} title={t('manualEntryTitle')} />
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Text>{es
          ? 'Copia los valores y el estado de tu informe. Se guardará un examen con fecha de hoy. No reemplaza una evaluación médica.'
          : 'Copy the values and status from your report. The exam will be dated today. This does not replace medical advice.'}</Text>
        {fields.map(field => (
          <View key={field.label} style={{ gap: 6 }}>
            <Text>{field.label}</Text>
            <TextInput accessibilityLabel={field.label} value={field.value} onChangeText={field.set}
              placeholder={field.hint} style={{ padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 12 }} />
          </View>
        ))}
        <Text>{es ? 'Estado según el laboratorio' : 'Laboratory status'}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {statuses.map((item, i) => (
            <TouchableOpacity key={item} accessibilityRole="radio" accessibilityState={{ checked: status === item }}
              onPress={() => setStatus(item)} style={{ padding: 12, borderWidth: 1, borderRadius: 12,
                borderColor: status === item ? Colors.primary : Colors.border,
                backgroundColor: status === item ? Colors.primary10 : Colors.background }}>
              <Text>{labels[i]}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {error ? <Text accessibilityRole="alert" style={{ color: Colors.attention }}>{error}</Text> : null}
        <Button title={es ? 'Añadir marcador' : 'Add marker'} onPress={addResult} />
        {rows.map((row, index) => (
          <View key={row.name} style={{ gap: 8 }}>
            <Text>{row.name}: {row.value} {row.unit} · {labels[statuses.indexOf(row.status)]}</Text>
            <Button variant="ghost" title={`${es ? 'Quitar' : 'Remove'} ${row.name}`}
              onPress={() => setRows(rows.filter((_, i) => i !== index))} />
          </View>
        ))}
        <Button title={es ? 'Guardar examen' : 'Save exam'} disabled={!rows.length || !!(name || value || unit || range || status)} onPress={saveExam} />
        <Button variant="ghost" title={es ? 'Cancelar' : 'Cancel'} onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}
