import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Crown, Lock } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useStore } from '../hooks/useStore';
import { useT } from '../hooks/useT';

interface ProGateProps {
  children?: React.ReactNode;
  feature?: string;
}

/**
 * Wraps content that requires Pro. If user is free, shows upgrade prompt instead.
 * Usage: <ProGate feature="AI Chat">{...premium content...}</ProGate>
 */
export default function ProGate({ children, feature }: ProGateProps) {
  const isPro = useStore(s => s.isPro);
  const router = useRouter();
  const t = useT();

  if (isPro) return <>{children}</>;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Lock size={24} color={Colors.primary} />
      </View>
      <Text style={styles.title}>{t('proRequired')}</Text>
      {feature && <Text style={styles.feature}>{feature}</Text>}
      <Text style={styles.sub}>{t('proRequiredSub')}</Text>
      <TouchableOpacity
        style={styles.upgradeBtn}
        onPress={() => router.push('/subscription' as any)}
        activeOpacity={0.85}
      >
        <Crown size={16} color="#fff" />
        <Text style={styles.upgradeBtnText}>{t('subGoPro')}</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Inline banner version — smaller, used inside existing screens
 */
export function ProBanner({ message }: { message?: string }) {
  const isPro = useStore(s => s.isPro);
  const router = useRouter();
  const t = useT();

  if (isPro) return null;

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={() => router.push('/subscription' as any)}
      activeOpacity={0.85}
    >
      <Crown size={16} color={Colors.gold} />
      <Text style={styles.bannerText}>{message ?? t('subUnlockWith')}</Text>
      <Text style={styles.bannerCTA}>{t('subGoPro')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', padding: 32, gap: 8,
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: Colors.primary10,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  title: {
    fontFamily: Typography.families.display,
    fontSize: 18, fontWeight: '800', color: Colors.foreground,
  },
  feature: {
    fontFamily: Typography.families.body,
    fontSize: 14, fontWeight: '600', color: Colors.primary,
  },
  sub: {
    fontFamily: Typography.families.body,
    fontSize: 13, color: Colors.mutedForeground, textAlign: 'center',
  },
  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
  },
  upgradeBtnText: {
    fontFamily: Typography.families.display,
    fontSize: 15, fontWeight: '800', color: '#fff',
  },
  // Banner
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.gold + '12', borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: Colors.gold + '25',
    marginBottom: 16,
  },
  bannerText: {
    fontFamily: Typography.families.body,
    fontSize: 13, fontWeight: '600', color: Colors.foreground, flex: 1,
  },
  bannerCTA: {
    fontFamily: Typography.families.display,
    fontSize: 12, fontWeight: '800', color: Colors.primary,
  },
});
