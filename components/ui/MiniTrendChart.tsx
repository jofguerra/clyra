import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface DataPoint {
    label: string;   // e.g. "Oct", "Jan", "Mar"
    value: number;
}

interface MiniTrendChartProps {
    title: string;
    data: DataPoint[];
    color?: string;
    height?: number;
}

export default function MiniTrendChart({
    title,
    data,
    color = Colors.chartRed,
    height = 100,
}: MiniTrendChartProps) {
    if (data.length < 2) return null;

    const values = data.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    const padding = range * 0.15;

    const chartW = 140;
    const chartH = height - 30; // leave room for labels
    const padX = 8;
    const padY = 6;

    const scaleX = (i: number) => padX + (i / (data.length - 1)) * (chartW - padX * 2);
    const scaleY = (v: number) => padY + (1 - (v - (minVal - padding)) / (range + padding * 2)) * (chartH - padY * 2);

    const points = data.map((d, i) => `${scaleX(i)},${scaleY(d.value)}`).join(' ');

    // Y-axis labels (3 ticks)
    const yTicks = [maxVal, (minVal + maxVal) / 2, minVal];

    return (
        <View style={styles.card}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <View style={styles.chartArea}>
                {/* Y labels */}
                <View style={styles.yLabels}>
                    {yTicks.map((v, i) => (
                        <Text key={i} style={styles.yLabel}>
                            {v % 1 === 0 ? v : v.toFixed(1)}
                        </Text>
                    ))}
                </View>
                <View style={{ flex: 1 }}>
                    <Svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`}>
                        {/* Grid lines */}
                        {yTicks.map((v, i) => (
                            <Line
                                key={i}
                                x1={padX} y1={scaleY(v)}
                                x2={chartW - padX} y2={scaleY(v)}
                                stroke={Colors.outlineVariant}
                                strokeWidth={0.5}
                                strokeDasharray="3,3"
                            />
                        ))}
                        {/* Line */}
                        <Polyline
                            points={points}
                            fill="none"
                            stroke={color}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* Dots */}
                        {data.map((d, i) => (
                            <Circle
                                key={i}
                                cx={scaleX(i)}
                                cy={scaleY(d.value)}
                                r={3.5}
                                fill={color}
                                stroke="#fff"
                                strokeWidth={2}
                            />
                        ))}
                    </Svg>
                    {/* X labels */}
                    <View style={styles.xLabels}>
                        {data.map((d, i) => (
                            <Text key={i} style={[styles.xLabel, { left: `${(i / (data.length - 1)) * 100}%` }]}>
                                {d.label}
                            </Text>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    title: {
        fontFamily: Typography.families.display,
        fontSize: 13,
        fontWeight: '700',
        color: Colors.foreground,
        marginBottom: 8,
    },
    chartArea: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    yLabels: {
        justifyContent: 'space-between',
        height: 70,
        marginRight: 4,
        paddingVertical: 2,
    },
    yLabel: {
        fontFamily: Typography.families.body,
        fontSize: 9,
        color: Colors.mutedForeground,
        textAlign: 'right',
        minWidth: 30,
    },
    xLabels: {
        flexDirection: 'row',
        position: 'relative',
        height: 16,
        marginTop: 2,
    },
    xLabel: {
        fontFamily: Typography.families.body,
        fontSize: 9,
        color: Colors.mutedForeground,
        position: 'absolute',
        textAlign: 'center',
        transform: [{ translateX: -12 }],
    },
});
