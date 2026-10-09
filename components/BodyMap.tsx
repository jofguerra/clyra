import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../constants/colors';
import { BODY_SYSTEMS, getSystemStatus, getSystemBiomarkers, getSampleTypeLabel, type SystemStatus } from '../constants/biomarkerSystems';
import type { Biomarker } from '../services/openai';
import { useStore } from '../hooks/useStore';

// Centers on the original 484×970 illustration. Systems such as vitamins,
// metabolism and blood are distributed, so their dots are schematic guides.
const POSITIONS: Record<string, [number, number]> = {
  cardiovascular: [52, 32], hepatico: [41, 39], metabolico: [49, 45],
  renal: [61, 48], tiroideo: [50, 20], hematologico: [25, 31],
  vitaminas: [77, 31], hormonal: [49, 58],
};
export const BODY_STATUS_COLORS: Record<SystemStatus, string> = {
  normal: Colors.optimal, low: '#9C4EAB', borderline: '#946600', attention: Colors.attention, none: '#68778A',
};

export default function BodyMap({ biomarkers, selectedSystemId, onSelectSystem }: {
  biomarkers: Biomarker[]; selectedSystemId?: string | null; onSelectSystem?: (id: string | null) => void;
}) {
  const es = useStore(s => s.language) === 'es';
  const language = es ? 'es' : 'en';
  const [internal, setInternal] = useState<string | null>(null);
  const selected = selectedSystemId === undefined ? internal : selectedSystemId;
  const select = (id: string | null) => onSelectSystem ? onSelectSystem(id) : setInternal(id);
  const labels: Record<SystemStatus, string> = {
    normal: es ? 'En rango' : 'In range', low: es ? 'Bajo' : 'Low',
    borderline: es ? 'Limítrofe' : 'Borderline', attention: es ? 'Alto' : 'High', none: es ? 'Sin datos' : 'No data',
  };
  const rows = BODY_SYSTEMS.map(system => ({ system, status: getSystemStatus(system, biomarkers), markers: getSystemBiomarkers(system, biomarkers) }));
  const selectedRow = rows.find(row => row.system.id === selected);
  const withData = rows.filter(row => row.markers.length).length;
  return <View style={styles.wrapper} testID="body-map">
    <View style={styles.mapCard}>
      <View style={styles.heading}>
        <Text style={styles.headingTitle}>{es ? 'Mapa de resultados' : 'Results map'}</Text>
        <Text style={styles.count}>{withData}/8 {es ? 'con datos' : 'with data'}</Text>
      </View>
      <View style={styles.figure} accessibilityLabel={es ? 'Ilustración orientativa de los sistemas del cuerpo. Selecciona un sistema debajo.' : 'Schematic body systems. Select a system below.'}>
        <Image source={require('../assets/body-map2.png')} style={styles.image} resizeMode="contain" />
        {rows.map(({ system, status }, index) => {
          const [x, y] = POSITIONS[system.id];
          const active = selected === system.id;
          return <TouchableOpacity key={system.id} testID={`body-dot-${system.id}`} accessibilityRole="button" accessibilityLabel={`${es ? 'Ver' : 'View'} ${system.name[language]}`} aria-pressed={active} onPress={() => select(active ? null : system.id)} style={[styles.dot, {
            left: x / 100 * 160 - 10, top: y / 100 * 320 - 10,
            backgroundColor: BODY_STATUS_COLORS[status], opacity: selected && !active ? 0.4 : 1,
            transform: [{ scale: active ? 1.2 : 1 }], borderWidth: active ? 3 : 2,
          }]}><Text style={styles.dotText}>{index + 1}</Text></TouchableOpacity>;
        })}
      </View>
      <Text style={styles.caption}>{es ? 'Los puntos representan resultados disponibles, no el estado completo de un órgano.' : 'Dots represent available results, not the overall health of an organ.'}</Text>
    </View>
    <Text style={styles.hint}>{es ? 'Selecciona un sistema para ver sus marcadores' : 'Select a system to see its markers'}</Text>
    <View style={styles.grid}>
      {rows.map(({ system, status, markers }, index) => <TouchableOpacity key={system.id}
        testID={`body-system-${system.id}`} accessibilityRole="button"
        accessibilityLabel={`${system.name[language]}, ${labels[status]}, ${markers.length} ${es ? 'marcadores' : 'markers'}`}
        accessibilityState={{ selected: selected === system.id }} aria-pressed={selected === system.id} onPress={() => select(selected === system.id ? null : system.id)}
        style={[styles.tile, selected === system.id && styles.selected]}>
        <View style={styles.tileHeading}>
          <View style={[styles.number, { backgroundColor: BODY_STATUS_COLORS[status] }]}><Text style={styles.dotText}>{index + 1}</Text></View>
          <Text style={styles.name}>{system.shortName[language]}</Text>
        </View>
        <Text style={[styles.status, { color: BODY_STATUS_COLORS[status] }]}>{labels[status]}{markers.length ? ` · ${markers.length}` : ''}</Text>
      </TouchableOpacity>)}
    </View>
    {selectedRow && <View style={styles.detail}>
      <Text style={styles.headingTitle}>{selectedRow.system.name[language]}</Text>
      {selectedRow.markers.length ? <Text style={styles.detailText}>{selectedRow.markers.filter(b => b.status === 'normal').length} {es ? 'en rango' : 'in range'} · {selectedRow.markers.filter(b => b.status !== 'normal').length} {es ? 'fuera de rango o limítrofes' : 'out of range or borderline'}</Text> : <>
        <Text style={styles.detailText}>{es ? 'Aún no hay resultados de este sistema. Estos son ejemplos de análisis para conversar con tu médico.' : 'No results for this system yet. These are examples of tests to discuss with your clinician.'}</Text>
        {selectedRow.system.requiredTests.map(test => <Text key={test.name.en} style={styles.detailText}>• {test.name[language]}{test.sampleType ? ` · ${getSampleTypeLabel(test.sampleType, language)}` : ''}</Text>)}
      </>}
      <TouchableOpacity accessibilityRole="button" onPress={() => select(null)} style={styles.clear}><Text style={styles.clearText}>{es ? 'Ver todos los sistemas' : 'Show all systems'}</Text></TouchableOpacity>
    </View>}
  </View>;
}
const styles = StyleSheet.create({
  wrapper: { width: '100%', gap: 12 },
  mapCard: { backgroundColor: '#EEF1F5', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#E7EBF1' },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  headingTitle: { fontSize: 15, fontWeight: '700', color: Colors.foreground },
  count: { fontSize: 12, color: '#4E6071', backgroundColor: '#FFF', borderRadius: 12, padding: 7 },
  figure: { width: 160, height: 320, alignSelf: 'center', marginVertical: 12 },
  image: { width: 160, height: 320 },
  dot: { position: 'absolute', width: 20, height: 20, borderRadius: 10, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  dotText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  caption: { fontSize: 12, lineHeight: 18, color: '#4E6071', textAlign: 'center' },
  hint: { fontSize: 13, color: Colors.mutedForeground, lineHeight: 19 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  tile: { width: '48%', minHeight: 78, padding: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E9EF', borderRadius: 18, gap: 8 },
  selected: { borderColor: Colors.primary, backgroundColor: Colors.primary10, borderWidth: 2, padding: 9 },
  tileHeading: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  number: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.foreground },
  status: { fontSize: 12, fontWeight: '600' },
  detail: { borderRadius: 18, padding: 16, gap: 9, backgroundColor: '#EEF1F5' },
  detailText: { fontSize: 13, lineHeight: 20, color: '#4E6071' },
  clear: { minHeight: 44, justifyContent: 'center' }, clearText: { color: '#96335B', fontWeight: '700', fontSize: 13 },
});
