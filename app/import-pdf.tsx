import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, View, Platform, ActivityIndicator, Switch } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import AppHeader from '../components/AppHeader';
import Button from '../components/ui/Button';
import { Colors } from '../constants/colors';
import { useStore } from '../hooks/useStore';
import { importLocalPdf } from '../services/localPdfImport';
import { isValidLabDate, isSupportedLocalValue, type LocalLabDraft, type ReviewMarker } from '../services/localLabParser';

export default function ImportPdfScreen() {
  const router = useRouter();
  const es = useStore(s => s.language) === 'es';
  const sessions = useStore(s => s.sessions);
  const save = useStore(s => s.setBiomarkers);
  const [draft, setDraft] = useState<LocalLabDraft | null>(null);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [duplicateConfirmed, setDuplicateConfirmed] = useState(false);
  const alive = useRef(true), saved = useRef(false), picking = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const duplicate = !!file && sessions.some(s => s.fileName === file.name || (!!draft?.contentHash && s.fileHash === draft.contentHash));
  const label = (en: string, spanish: string) => es ? spanish : en;
  const errors: Record<string, string> = {
    'web-only': label('Local PDF import is available in the web app. Use manual entry on this device.', 'La importación local de PDF está disponible en la web. Usa el ingreso manual en este dispositivo.'),
    'dependency-unavailable': label('Local PDF reading is not installed in this environment yet. Use manual entry until setup is completed.', 'La lectura local de PDF aún no está instalada en este entorno. Usa el ingreso manual hasta completar la configuración.'),
    unsupported: label('This PDF does not contain a supported Raly result table. Enter results manually.', 'Este PDF no contiene una tabla de resultados Raly compatible. Ingresa los resultados manualmente.'),
    'no-results': label('No supported numeric results were found. Qualitative results are unsupported; enter numeric results manually.', 'No se encontraron resultados numéricos compatibles. Los resultados cualitativos no son compatibles; ingresa los valores numéricos manualmente.'),
    scanned: label('This PDF has no readable text. Scanned PDFs need manual entry; local OCR is unavailable.', 'Este PDF no tiene texto legible. Los PDF escaneados requieren ingreso manual; no hay OCR local.'),
    encrypted: label('Password-protected PDFs are unsupported. Select an unlocked copy.', 'Los PDF protegidos con contraseña no son compatibles. Selecciona una copia sin contraseña.'),
    size: label('Choose a PDF up to 10 MB and 30 pages.', 'Elige un PDF de hasta 10 MB y 30 páginas.'),
    invalid: label('The file could not be read as a PDF. Select a valid PDF or enter results manually.', 'No se pudo leer el archivo como PDF. Selecciona un PDF válido o ingresa los resultados manualmente.'),
  };
  const pick = async () => {
    if (picking.current) return;
    picking.current = true; setError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (!alive.current || result.canceled || !result.assets?.length) return;
      setBusy(true); setDraft(null); setConfirmed(false); setDuplicateConfirmed(false);
      const selected = result.assets[0];
      const parsed = await importLocalPdf(selected);
      if (alive.current) { setFile(selected); setDraft(parsed); }
    } catch (e) {
      if (alive.current) setError(errors[e instanceof Error ? e.message : 'invalid'] || errors.invalid);
    } finally { picking.current = false; if (alive.current) setBusy(false); }
  };
  const edit = (index: number, patch: Partial<ReviewMarker>) => {
    setDraft(d => d && { ...d, biomarkers: d.biomarkers.map((row,i) => i === index ? { ...row, ...patch } : row) });
    setConfirmed(false); setError('');
  };
  const persist = () => {
    if (!draft || !file || saved.current) return;
    const names = draft.biomarkers.map(b => b.name.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase());
    if (!draft.biomarkers.length || !isValidLabDate(draft.testDate) || new Set(names).size !== names.length || draft.biomarkers.some(b => !b.name.trim() || !isSupportedLocalValue(b.value) || !b.status)) {
      setError(label('Check the date (YYYY-MM-DD), unique names, numeric values and a status for every result.', 'Revisa la fecha (AAAA-MM-DD), nombres únicos, valores numéricos y el estado de cada resultado.')); return;
    }
    if (!confirmed || (duplicate && !duplicateConfirmed)) return;
    saved.current = true;
    save(draft.biomarkers.map(b => ({ ...b, name: b.name.trim(), value: String(b.value).trim(), unit: b.unit.trim(), status: b.status! })), new Date(Number(draft.testDate.slice(0,4)), Number(draft.testDate.slice(5,7))-1, Number(draft.testDate.slice(8,10)), 12).toISOString(), file.name, draft.contentHash);
    router.replace('/(tabs)/upload');
  };
  return <SafeAreaView style={{ flex:1, backgroundColor:Colors.background }}>
    <AppHeader showBack onBack={() => router.back()} title={label('Import PDF locally', 'Importar PDF localmente')} />
    <ScrollView contentContainerStyle={{ padding:24, gap:16 }} keyboardShouldPersistTaps="handled">
      <Text>{label('Read a Raly PDF on this device. The file is not uploaded. Only supported numeric rows are extracted; missing, qualitative or split rows may be omitted. Compare the complete PDF and enter omitted results manually. Review every result against your report before saving.', 'Lee un PDF Raly en este dispositivo. El archivo no se sube. Solo se extraen filas numéricas compatibles; pueden omitirse filas faltantes, cualitativas o divididas. Compara todo el PDF e ingresa manualmente los resultados omitidos. Revisa cada resultado con tu informe antes de guardar.')}</Text>
      {Platform.OS !== 'web' && <Text>{errors['web-only']}</Text>}
      <Button title={label('Select PDF', 'Seleccionar PDF')} onPress={pick} disabled={busy || Platform.OS !== 'web'} />
      {busy && <View><ActivityIndicator /><Text>{label('Reading PDF…', 'Leyendo PDF…')}</Text></View>}
      {error ? <Text accessibilityRole="alert" style={{ color:Colors.attention }}>{error}</Text> : null}
      {draft && <>
        <Text>{label(`${draft.biomarkers.length} results to review`, `${draft.biomarkers.length} resultados para revisar`)}</Text>
        <Text>{draft.dateSource === 'report' ? label('The date comes from REPORTE (report issued), not sample collection. Correct it if needed.', 'La fecha viene de REPORTE (emisión), no de la toma de muestra. Corrígela si hace falta.') : label('The report date is missing or ambiguous. Enter the exam date.', 'La fecha del informe falta o es ambigua. Ingresa la fecha del examen.')}</Text>
        {!!draft.skippedRows && <Text accessibilityRole="alert">{label(`${draft.skippedRows} unsupported or duplicate rows were omitted. Compare with the original and add missing results manually.`, `Se omitieron ${draft.skippedRows} filas no compatibles o duplicadas. Compara con el original y añade los resultados faltantes manualmente.`)}</Text>}
        <TextInput accessibilityLabel={label('Exam date', 'Fecha del examen')} placeholder="YYYY-MM-DD" value={draft.testDate} onChangeText={testDate => { setDraft({ ...draft, testDate }); setConfirmed(false); }} style={inputStyle} />
        <Text>{label('Status suggestions only compare simple numeric reference ranges. Missing/ambiguous ranges and comparison values require your choice. Blank units are preserved.', 'Los estados sugeridos solo comparan rangos numéricos simples. Los rangos ambiguos o faltantes y valores con comparadores requieren tu elección. Se conservan las unidades vacías.')}</Text>
        {draft.biomarkers.map((row,i) => <View key={i} style={{ padding:16, borderWidth:1, borderColor:Colors.border, borderRadius:16, gap:8 }}>
          {(['name','value','unit','referenceRange'] as const).map((key,j) => <View key={key}>
            <Text>{[label('Biomarker','Biomarcador'),label('Value','Valor'),label('Unit','Unidad'),label('Reference range','Rango de referencia')][j]}</Text>
            <TextInput accessibilityLabel={`${key} ${i+1}`} value={String(row[key] ?? '')} onChangeText={text => edit(i, { [key]: text, ...((key === 'value' || key === 'referenceRange') ? { status:null } : {}) })} style={inputStyle} />
          </View>)}
          <Text>{label('Reviewed laboratory status', 'Estado del laboratorio revisado')}: {row.status ? {normal:label('Normal','Normal'),low:label('Low','Bajo'),high:label('High','Alto'),borderline:label('Borderline','Limítrofe')}[row.status] : label('Choose a status', 'Elige un estado')}</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>{(['normal','low','high','borderline'] as const).map((status,j) => <Button key={status} variant={row.status === status ? 'primary' : 'ghost'} title={[label('Normal','Normal'),label('Low','Bajo'),label('High','Alto'),label('Borderline','Limítrofe')][j]} onPress={() => edit(i,{ status })} />)}</View>
          <Button variant="ghost" title={label(`Remove result ${i+1}`, `Quitar resultado ${i+1}`)} onPress={() => { setDraft({ ...draft, biomarkers:draft.biomarkers.filter((_,n) => n !== i) }); setConfirmed(false); }} />
        </View>)}
        {duplicate && <View style={{ gap:8 }}><Text>{label('A file with this name or matching contents was already saved. Save another exam only if this is intentional.', 'Ya se guardó un archivo con este nombre o contenido idéntico. Guarda otro examen solo si es intencional.')}</Text><Switch accessibilityLabel={label('Save duplicate exam', 'Guardar examen duplicado')} value={duplicateConfirmed} onValueChange={setDuplicateConfirmed} /></View>}
        <View style={{ gap:8 }}><Text>{label('I compared all results and the date with my report.', 'Comparé todos los resultados y la fecha con mi informe.')}</Text><Switch accessibilityLabel={label('Confirm review', 'Confirmar revisión')} value={confirmed} onValueChange={setConfirmed} /></View>
        <Button title={label('Save reviewed exam', 'Guardar examen revisado')} onPress={persist} disabled={!confirmed || (duplicate && !duplicateConfirmed) || !draft.biomarkers.length} />
      </>}
      <Button variant="ghost" title={label('Enter results manually', 'Ingresar resultados manualmente')} onPress={() => router.push('/manual-entry')} />
      <Button variant="ghost" title={label('Cancel', 'Cancelar')} onPress={() => router.back()} />
    </ScrollView>
  </SafeAreaView>;
}
const inputStyle = { padding:12, borderWidth:1, borderColor:Colors.border, borderRadius:12 };
