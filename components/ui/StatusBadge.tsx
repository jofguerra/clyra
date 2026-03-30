import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

export type BiomarkerStatus = 'Optimal' | 'Borderline' | 'Attention';

interface StatusBadgeProps {
    status: BiomarkerStatus;
    label?: string; // in case we want to override the default text (e.g., translated Spanish tag)
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
    let backgroundColor = Colors.optimal10;
    let textColor = Colors.optimal;
    let defaultLabel = 'Óptimo';

    if (status === 'Borderline') {
        backgroundColor = Colors.borderline10;
        textColor = Colors.borderline;
        defaultLabel = 'Límite';
    } else if (status === 'Attention') {
        backgroundColor = Colors.attention10;
        textColor = Colors.attention;
        defaultLabel = 'Atención';
    }

    return (
        <View style={[styles.badge, { backgroundColor }]}>
            <Text style={[styles.text, { color: textColor }]}>
                {label || defaultLabel}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9999,
        alignSelf: 'flex-start',
    },
    text: {
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.sm,
        fontWeight: '600',
    },
});
