import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CloudOff } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { useT } from '../hooks/useT';

export default function LocalModeNotice({ message }: { message?: string }) {
  const t = useT();
  return (
    <View style={styles.card}>
      <CloudOff size={20} color={Colors.primary} style={{ marginTop: 2 }} />
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={styles.title}>{t('localMode')}</Text>
        <Text style={styles.body}>{message ?? t('localAIUnavailable')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 18,
    backgroundColor: Colors.pastelPinkBg, borderWidth: 1, borderColor: Colors.primary15, marginBottom: 20 },
  title: { fontSize: 14, fontWeight: '700', color: Colors.foreground },
  body: { fontSize: 13, lineHeight: 20, color: Colors.mutedForeground },
});
