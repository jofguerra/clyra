import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

export type TrendDirection = 'up' | 'down' | 'stable';

interface TrendIconProps {
    trend: TrendDirection;
    size?: number;
    color?: string;
}

export default function TrendIcon({ trend, size = 16, color }: TrendIconProps) {
    let iconColor = color;

    if (!iconColor) {
        if (trend === 'up') iconColor = Colors.borderline; // default up color if not specified
        if (trend === 'down') iconColor = Colors.optimal;
        if (trend === 'stable') iconColor = Colors.mutedForeground;
    }

    if (trend === 'up') return <ArrowUpRight size={size} color={iconColor} />;
    if (trend === 'down') return <ArrowDownRight size={size} color={iconColor} />;
    return <Minus size={size} color={iconColor} />;
}
