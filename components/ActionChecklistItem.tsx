import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface ActionChecklistItemProps {
    label: string;
    initialDone: boolean;
}

export default function ActionChecklistItem({ label, initialDone }: ActionChecklistItemProps) {
    const [done, setDone] = useState(initialDone);

    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.7}
            onPress={() => setDone(!done)}
        >
            <View style={[styles.checkbox, done && styles.checkboxDone]}>
                {done && <Check size={14} color={Colors.primaryForeground} strokeWidth={3} />}
            </View>
            <Text style={[styles.label, done && styles.labelDone]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.mutedForeground,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxDone: {
        backgroundColor: Colors.optimal,
        borderColor: Colors.optimal,
    },
    label: {
        flex: 1,
        fontFamily: Typography.families.body,
        fontSize: Typography.sizes.base,
        color: Colors.foreground,
        lineHeight: 22,
    },
    labelDone: {
        color: Colors.mutedForeground,
        textDecorationLine: 'line-through',
    }
});
