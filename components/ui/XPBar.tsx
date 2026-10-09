import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getXPLevel } from '../../constants/gamification';

export default function XPBar({ xp, language }: { xp: number; language: 'en' | 'es' }) {
  const info = getXPLevel(xp), es = language === 'es';
  const percent = Math.round(info.progress * 100);
  return <View style={styles.card} testID="activity-points">
    <View style={styles.header}>
      <Text style={styles.eyebrow}>{es ? 'TU CONSTANCIA' : 'YOUR CONSISTENCY'}</Text>
      <View style={styles.badge}><Text style={styles.badgeText}>{es ? 'Nivel' : 'Level'} {info.level}</Text></View>
    </View>
    <View style={styles.totalRow}><Text style={styles.total}>{info.totalXP.toLocaleString(language)}</Text><Text style={styles.unit}>XP</Text></View>
    <Text style={styles.description}>{es ? 'Puntos por tus acciones y registros. No miden tu salud.' : 'Points for your actions and records. They do not measure your health.'}</Text>
    <View accessible accessibilityRole="progressbar" accessibilityLabel={es ? 'Avance de nivel' : 'Level progress'} accessibilityValue={{ min: 0, max: 100, now: percent }} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} style={styles.track}>
      <View style={[styles.fill, { width: `${percent}%` }]} />
    </View>
    <View style={styles.footer}>
      <Text style={styles.remaining}>{info.isMaxLevel ? (es ? 'Nivel máximo alcanzado' : 'Maximum level reached') : (es ? `${info.remainingXP} XP para el nivel ${info.level + 1}` : `${info.remainingXP} XP to level ${info.level + 1}`)}</Text>
      <Text style={styles.percent}>{percent}%</Text>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: '#352E47', borderWidth: 1, borderColor: '#453B58', borderRadius: 24, padding: 20, gap: 12, marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  eyebrow: { fontSize: 11, letterSpacing: 1.2, color: '#D4C9E2', fontWeight: '700' },
  badge: { backgroundColor: '#51445F', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  badgeText: { color: '#F4DBE7', fontWeight: '700', fontSize: 13 },
  totalRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  total: { fontSize: 44, fontWeight: '700', letterSpacing: -1.5, color: '#FFFFFF' }, unit: { fontSize: 15, fontWeight: '700', color: '#D4C9E2' },
  description: { fontSize: 13, lineHeight: 20, color: '#D4C9E2' },
  track: { height: 10, backgroundColor: '#554B65', borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#ECA7C1', borderRadius: 5 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' },
  remaining: { flex: 1, fontSize: 12, color: '#F1E8F8', fontWeight: '600', lineHeight: 18 },
  percent: { fontSize: 12, color: '#F1E8F8', fontWeight: '700' },
});
