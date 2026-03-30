import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import TrendIcon, { TrendDirection } from './ui/TrendIcon';
import StatusBadge, { BiomarkerStatus } from './ui/StatusBadge';
import GlassCard from './ui/GlassCard';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface BiomarkerCardProps {
    name: string;
    value: string;
    status: BiomarkerStatus;
    trend: TrendDirection;
    referenceRange: string;
}

export default function BiomarkerCard({ name, value, status, trend, referenceRange }: BiomarkerCardProps) {
    const router = useRouter();

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/biomarker/${encodeURIComponent(name)}` as any)}
            style={styles.touchable}
        >
            <GlassCard padding={16} intensity={90} style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <TrendIcon trend={trend} size={16} />
                </View>

                <View style={styles.valueContainer}>
                    <Text style={styles.value} numberOfLines={1}>{value}</Text>
                </View>

                <View style={styles.footer}>
                    <StatusBadge status={status} />
                    <Text style={styles.reference}>Ref: {referenceRange}</Text>
                </View>
            </GlassCard>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    touchable: {
        width: '48%', // roughly 2 columns with gap
        marginBottom: 16,
    },
    card: {
        height: 130,
        justifyContent: 'space-between',
        marginBottom: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.sm,
        color: Colors.mutedForeground,
        fontWeight: '500',
        flex: 1,
        marginRight: 4,
    },
    valueContainer: {
        paddingVertical: 12,
    },
    value: {
        fontFamily: Typography.families.display,
        fontSize: Typography.sizes.xl,
        fontWeight: '700',
        color: Colors.foreground,
    },
    footer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 6,
    },
    reference: {
        fontFamily: Typography.families.body,
        fontSize: 10,
        color: Colors.mutedForeground,
    }
});
