import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, Shield, Lock, Sparkles, BookOpen } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <LinearGradient
            colors={[Colors.surface, Colors.background]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <View style={styles.logoWrapper}>
                        <View style={styles.logoBox}>
                            <Activity color={Colors.primaryForeground} size={48} />
                        </View>
                    </View>

                    <Text style={styles.headline}>
                        Entiende Tu Sangre. Optimiza Tu Salud.
                    </Text>
                    <Text style={styles.subheadline}>
                        Sube tus resultados de análisis de sangre y obtén información impulsada por IA, orientación personalizada y seguimiento de tu progreso.
                    </Text>

                    <View style={styles.trustRow}>
                        <View style={styles.trustItem}>
                            <Shield color={Colors.primary} size={20} />
                            <Text style={styles.trustText}>Seguro</Text>
                        </View>
                        <View style={styles.trustItem}>
                            <Lock color={Colors.primary} size={20} />
                            <Text style={styles.trustText}>Privado</Text>
                        </View>
                        <View style={styles.trustItem}>
                            <Sparkles color={Colors.primary} size={20} />
                            <Text style={styles.trustText}>Personal</Text>
                        </View>
                        <View style={styles.trustItem}>
                            <BookOpen color={Colors.primary} size={20} />
                            <Text style={styles.trustText}>Educativo</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Comenzar"
                        onPress={() => router.push('/onboarding/profile')}
                        size="lg"
                        style={styles.primaryButton}
                    />
                    <Button
                        title="Ver Demo"
                        onPress={() => router.push('/(tabs)')}
                        variant="outline"
                        size="lg"
                    />
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        marginBottom: 40,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 32,
        elevation: 8,
    },
    logoBox: {
        width: 96,
        height: 96,
        backgroundColor: Colors.primary,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headline: {
        fontFamily: Typography.families.display,
        fontSize: Typography.sizes.huge,
        fontWeight: '700',
        color: Colors.foreground,
        textAlign: 'center',
        lineHeight: 52,
        marginBottom: 16,
    },
    subheadline: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.lg,
        color: Colors.mutedForeground,
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: 48,
        paddingHorizontal: 16,
    },
    trustRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 16,
    },
    trustItem: {
        alignItems: 'center',
        gap: 8,
    },
    trustText: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.sm,
        color: Colors.mutedForeground,
        fontWeight: '500',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        gap: 16,
    },
    primaryButton: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 6,
    }
});
