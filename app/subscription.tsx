import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  X, Check, Shield, Crown, Sparkles, TrendingUp,
  MessageCircle, Target,
} from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useStore } from '../hooks/useStore';
import { useT } from '../hooks/useT';

const MONTHLY_PRICE = '$7.99';
const ANNUAL_PRICE = '$49.99';
const ANNUAL_MONTHLY = '$4.17';
const SAVE_PERCENT = 48;

type Plan = 'monthly' | 'annual';

export default function SubscriptionScreen() {
  const router = useRouter();
  const t = useT();
  const language = useStore((s) => s.language);
  const isPro = useStore((s) => s.isPro);
  const setSubscription = useStore((s) => s.setSubscription);
  const [selectedPlan, setSelectedPlan] = useState<Plan>('annual');
  const [loading, setLoading] = useState(false);

  const features = [
    { icon: Sparkles, text: t('subFeature1') },
    { icon: TrendingUp, text: t('subFeature2') },
    { icon: MessageCircle, text: t('subFeature3') },
    { icon: Shield, text: t('subFeature4') },
    { icon: Target, text: t('subFeature5') },
  ];

  const handleSubscribe = async () => {
    setLoading(true);

    // TODO: Replace with actual IAP logic (expo-in-app-purchases or react-native-purchases)
    // For now, simulate a successful purchase
    setTimeout(() => {
      const expiresAt = new Date();
      if (selectedPlan === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }
      setSubscription(selectedPlan, expiresAt.toISOString());
      setLoading(false);
      Alert.alert(
        language === 'es' ? 'Bienvenido a Pro!' : 'Welcome to Pro!',
        language === 'es'
          ? 'Ahora tienes acceso completo a todas las funciones.'
          : 'You now have full access to all features.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    }, 1500);
  };

  const handleRestore = () => {
    // TODO: Implement actual restore logic
    Alert.alert(
      t('subRestore'),
      language === 'es'
        ? 'No se encontraron compras anteriores.'
        : 'No previous purchases found.',
    );
  };

  if (isPro) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={22} color={Colors.foreground} />
          </TouchableOpacity>
        </View>
        <View style={styles.proActive}>
          <Crown size={48} color={Colors.gold} />
          <Text style={styles.proActiveTitle}>{t('subAlreadyPro')}</Text>
          <Text style={styles.proActiveSub}>
            {language === 'es'
              ? 'Tienes acceso completo a todas las funciones de Clyra.'
              : 'You have full access to all Clyra features.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Close button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={22} color={Colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Crown size={44} color={Colors.gold} />
          </View>
          <Text style={styles.headline}>{t('subHeadline')}</Text>
          <Text style={styles.subtitle}>{t('subSubtitle')}</Text>
        </View>

        {/* Feature list */}
        <View style={styles.featureList}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureCheck}>
                <Check size={16} color={Colors.optimal} strokeWidth={3} />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Plan cards */}
        <View style={styles.planRow}>
          {/* Monthly */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={[
              styles.planRadio,
              selectedPlan === 'monthly' && styles.planRadioSelected,
            ]}>
              {selectedPlan === 'monthly' && (
                <View style={styles.planRadioDot} />
              )}
            </View>
            <Text style={styles.planLabel}>{t('subMonthly')}</Text>
            <Text style={styles.planPrice}>
              {MONTHLY_PRICE}
              <Text style={styles.planPer}>{t('subPerMonth')}</Text>
            </Text>
            <Text style={styles.planSub}>{t('subBilledMonthly')}</Text>
          </TouchableOpacity>

          {/* Annual */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'annual' && styles.planCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setSelectedPlan('annual')}
          >
            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>{t('subBestValue')}</Text>
            </View>
            <View style={[
              styles.planRadio,
              selectedPlan === 'annual' && styles.planRadioSelected,
            ]}>
              {selectedPlan === 'annual' && (
                <View style={styles.planRadioDot} />
              )}
            </View>
            <Text style={styles.planLabel}>{t('subAnnual')}</Text>
            <Text style={[styles.planPrice, { color: Colors.primary }]}>
              {ANNUAL_PRICE}
              <Text style={styles.planPer}>{t('subPerYear')}</Text>
            </Text>
            <Text style={[styles.planSub, { color: Colors.primary }]}>
              {ANNUAL_MONTHLY}{t('subPerMonth')} — {t('subSavePercent', { n: SAVE_PERCENT })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subscribe button */}
        <TouchableOpacity
          style={[styles.subscribeBtn, loading && { opacity: 0.7 }]}
          activeOpacity={0.85}
          onPress={handleSubscribe}
          disabled={loading}
        >
          <Text style={styles.subscribeBtnText}>
            {loading
              ? (language === 'es' ? 'Procesando...' : 'Processing...')
              : t('subStartTrial')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.trialNote}>
          {t('subTrialNote', { price: selectedPlan === 'monthly' ? `${MONTHLY_PRICE}/mo` : `${ANNUAL_PRICE}/yr` })}
        </Text>

        {/* Guarantee */}
        <View style={styles.guaranteeRow}>
          <Shield size={14} color={Colors.outline} />
          <Text style={styles.guaranteeText}>{t('subCancelAnytime')}</Text>
        </View>

        {/* Links */}
        <View style={styles.linksRow}>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.linkText}>{t('subRestore')}</Text>
          </TouchableOpacity>
          <Text style={styles.linkDot}>·</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>{t('subTerms')}</Text>
          </TouchableOpacity>
          <Text style={styles.linkDot}>·</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>{t('subPrivacy')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingHorizontal: 16, paddingTop: 8,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceHigh,
  },
  content: { padding: 24, paddingBottom: 60 },

  // Hero
  heroSection: { alignItems: 'center', marginBottom: 32 },
  heroIcon: {
    width: 88, height: 88, borderRadius: 24,
    backgroundColor: Colors.gold + '15',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  headline: {
    fontFamily: Typography.families.display,
    fontSize: 28, fontWeight: '800', color: Colors.foreground,
    textAlign: 'center', letterSpacing: -0.5, marginBottom: 10,
  },
  subtitle: {
    fontFamily: Typography.families.body,
    fontSize: 15, color: Colors.mutedForeground,
    textAlign: 'center', lineHeight: 22, paddingHorizontal: 16,
  },

  // Features
  featureList: { gap: 14, marginBottom: 32 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureCheck: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.optimal10,
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: {
    fontFamily: Typography.families.body,
    fontSize: 14, fontWeight: '600', color: Colors.foreground,
    flex: 1,
  },

  // Plan cards
  planRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  planCard: {
    flex: 1, borderRadius: 18, padding: 16,
    borderWidth: 2, borderColor: Colors.border,
    backgroundColor: '#fff', alignItems: 'center',
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  planRadio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.outline,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  planRadioSelected: { borderColor: Colors.primary },
  planRadioDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  planLabel: {
    fontFamily: Typography.families.body,
    fontSize: 14, fontWeight: '700', color: Colors.foreground,
    marginBottom: 4,
  },
  planPrice: {
    fontFamily: Typography.families.display,
    fontSize: 22, fontWeight: '900', color: Colors.foreground,
    marginBottom: 4,
  },
  planPer: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '500', color: Colors.outline,
  },
  planSub: {
    fontFamily: Typography.families.body,
    fontSize: 11, fontWeight: '600', color: Colors.mutedForeground,
    textAlign: 'center',
  },
  bestBadge: {
    position: 'absolute', top: -10,
    backgroundColor: Colors.primary, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  bestBadgeText: {
    fontFamily: Typography.families.body,
    fontSize: 9, fontWeight: '800', color: '#fff',
    letterSpacing: 0.5,
  },

  // Subscribe button
  subscribeBtn: {
    backgroundColor: Colors.primary, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 4,
    marginBottom: 10,
  },
  subscribeBtnText: {
    fontFamily: Typography.families.display,
    fontSize: 17, fontWeight: '800', color: '#fff',
  },
  trialNote: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.mutedForeground,
    textAlign: 'center', marginBottom: 20,
  },

  // Guarantee
  guaranteeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginBottom: 20,
  },
  guaranteeText: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.outline,
  },

  // Links
  linksRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
  },
  linkText: {
    fontFamily: Typography.families.body,
    fontSize: 11, color: Colors.outline, textDecorationLine: 'underline',
  },
  linkDot: { fontSize: 11, color: Colors.outline },

  // Already pro
  proActive: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  proActiveTitle: {
    fontFamily: Typography.families.display,
    fontSize: 22, fontWeight: '800', color: Colors.foreground,
    marginTop: 16, marginBottom: 8,
  },
  proActiveSub: {
    fontFamily: Typography.families.body,
    fontSize: 15, color: Colors.mutedForeground,
    textAlign: 'center', lineHeight: 22,
  },
});
