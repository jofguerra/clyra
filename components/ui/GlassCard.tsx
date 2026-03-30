import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/colors';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    padding?: number;
    intensity?: number;
}

export default function GlassCard({ children, style, padding = 16, intensity = 80 }: GlassCardProps) {
    return (
        <View style={[styles.container, style]}>
            <BlurView intensity={intensity} tint="light" style={[StyleSheet.absoluteFill, styles.blur]} />
            <View style={[styles.content, { padding }]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderColor: 'rgba(255,255,255,0.4)',
        borderWidth: 1,
        shadowColor: '#1A1E27',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 2,
        marginBottom: 16,
    },
    blur: {
        borderRadius: 16,
    },
    content: {
        flex: 1,
    },
});
