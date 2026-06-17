import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Home } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useStore } from '../hooks/useStore';
import Mascot from '../components/Mascot';

export default function NotFoundScreen() {
  const router = useRouter();
  const language = useStore(s => s.language);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Mascot pose="sad" size={140} animation="idle-breath" />
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>
          {language === 'es' ? '!Ups! Pagina no encontrada' : "Oops! Page not found"}
        </Text>
        <Text style={styles.body}>
          {language === 'es'
            ? 'La pantalla que buscas no existe o fue movida. Volvamos al inicio.'
            : "The screen you're looking for doesn't exist or has been moved. Let's head home."}
        </Text>
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.8}
          onPress={() => router.replace('/(tabs)')}
        >
          <Home size={18} color="#fff" />
          <Text style={styles.btnText}>
            {language === 'es' ? 'Ir al inicio' : 'Go home'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 32,
  },
  code: {
    fontFamily: Typography.families.display,
    fontSize: 40, fontWeight: '900', color: Colors.outline,
    marginTop: 8, marginBottom: 4, letterSpacing: 2,
  },
  title: {
    fontFamily: Typography.families.display,
    fontSize: 22, fontWeight: '800', color: Colors.foreground,
    marginBottom: 10,
  },
  body: {
    fontFamily: Typography.families.body,
    fontSize: 15, color: Colors.mutedForeground,
    textAlign: 'center', lineHeight: 22, marginBottom: 28,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: {
    fontFamily: Typography.families.body,
    fontSize: 16, fontWeight: '700', color: '#fff',
  },
});
