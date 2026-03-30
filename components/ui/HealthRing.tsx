import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface HealthRingProps {
    score: number;
    size?: number;
    strokeWidth?: number;
}

function getGrade(score: number): string {
    if (score >= 80) return 'Excelente';
    if (score >= 65) return 'Bueno';
    if (score >= 50) return 'Regular';
    return 'Atención';
}

export default function HealthRing({ score, size = 180, strokeWidth = 14 }: HealthRingProps) {
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    
    // Calculate percentage (0 to 1), health score is typically 0-100
    const percentage = Math.max(0, Math.min(100, score)) / 100;
    
    // Choose ring color based on score
    const getColor = (s: number) => {
        if (s >= 80) return Colors.optimal;
        if (s >= 60) return Colors.borderline;
        return Colors.attention;
    };
    
    const ringColor = getColor(score);
    // Rotating it -90 so the gauge starts from the top (12 o'clock) instead of right (3 o'clock)
    // Actually, full circle is fine, but if we want an arc, we can use a gauge style. Let's do partial arc (e.g. 75% circle).
    // For a 75% circle, the dash array represents 100% of circumference. We map score (0-100) to 0-75% of circumference.
    const ARC_RATIO = 0.75; 
    const dashLength = circumference * ARC_RATIO;
    const blankLength = circumference - dashLength;
    
    const scoreOffset = circumference - (percentage * dashLength);

    // Rotate the entire SVG so the opening is at the bottom (-225 degrees to start at bottom-left and arc to bottom-right)
    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={{ position: 'absolute' }}>
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={Colors.surface}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dashLength} ${blankLength}`}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    fill="none"
                    transform={`rotate(135 ${center} ${center})`}
                />
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={scoreOffset}
                    strokeLinecap="round"
                    fill="none"
                    transform={`rotate(135 ${center} ${center})`}
                />
            </Svg>
            
            <View style={styles.textContainer}>
                <Text style={[styles.scoreValue, { fontSize: size < 100 ? 28 : 56, lineHeight: size < 100 ? 32 : 64 }]}>{score}</Text>
                <Text style={[styles.scoreLabel, { color: ringColor, fontSize: size < 100 ? 8 : 10 }]}>{getGrade(score)}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    scoreValue: {
        fontFamily: Typography.families.display,
        fontSize: 56,
        fontWeight: '900',
        color: Colors.foreground,
        lineHeight: 64,
        letterSpacing: -2,
    },
    scoreLabel: {
        fontFamily: Typography.families.body,
        fontSize: 10,
        fontWeight: '700',
        color: Colors.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 2,
    }
});
