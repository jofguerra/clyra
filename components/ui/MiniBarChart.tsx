import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface MiniBarChartProps {
    values: number[];
    height?: number;
    color?: string;
}

export default function MiniBarChart({ values, height = 48, color = Colors.primary }: MiniBarChartProps) {
    if (!values || values.length === 0) return null;

    const maxValue = Math.max(...values, 1); // avoid div by 0

    return (
        <View style={[styles.container, { height }]}>
            {values.map((val, index) => {
                const barHeight = (val / maxValue) * height;
                return (
                    <View
                        key={index}
                        style={[
                            styles.bar,
                            {
                                height: Math.max(barHeight, 4), // min height
                                backgroundColor: color,
                                opacity: index === values.length - 1 ? 1 : 0.4, // highlight last bar
                            }
                        ]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        width: '100%',
        gap: 4,
    },
    bar: {
        flex: 1,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
});
