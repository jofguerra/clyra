import React, { useRef } from 'react';
import {
    Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, Animated,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { SPRING_PLAYFUL } from '../../constants/motion';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

// ─── Playful button with squash-stretch press animation ─────────────────────
// Motion:
//   Press in  → scale 0.96 (compresses, ease-out, 100ms)
//   Release   → scale 1.04 → 1 (spring-bounce overshoot)
// Gives kinetic "I pressed something" feedback. Pure native driver = 60fps.
export default function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    style,
    textStyle,
    icon,
}: ButtonProps) {

    const scale = useRef(new Animated.Value(1)).current;

    let backgroundColor = Colors.primary;
    let borderColor = 'transparent';
    let textColor = Colors.primaryForeground;

    if (variant === 'outline') {
        backgroundColor = 'transparent';
        borderColor = Colors.border;
        textColor = Colors.foreground;
    } else if (variant === 'ghost') {
        backgroundColor = 'transparent';
        textColor = Colors.primary;
    } else if (variant === 'destructive') {
        backgroundColor = Colors.attention;
        textColor = Colors.primaryForeground;
    }

    if (disabled) {
        backgroundColor = variant === 'primary' ? Colors.muted : 'transparent';
        textColor = Colors.mutedForeground;
        borderColor = variant === 'outline' ? Colors.border : 'transparent';
    }

    const handlePressIn = () => {
        Animated.timing(scale, {
            toValue: 0.96,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        // Spring back with a tiny overshoot to 1.04, then settle to 1
        Animated.sequence([
            Animated.spring(scale, {
                toValue: 1.04,
                damping: 10,
                mass: 0.6,
                stiffness: 240,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                ...SPRING_PLAYFUL,
            }),
        ]).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
                style={({ pressed }) => [
                    styles.base,
                    styles[size],
                    { backgroundColor, borderColor, borderWidth: variant === 'outline' ? 1 : 0 },
                    disabled && styles.disabled,
                    pressed && { opacity: 0.9 },
                    style,
                ]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color={textColor} />
                ) : (
                    <>
                        {icon && <React.Fragment>{icon}</React.Fragment>}
                        <Text style={[styles.text, { color: textColor }, textStyle]}>
                            {title}
                        </Text>
                    </>
                )}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        gap: 8,
    },
    sm: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    md: {
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    lg: {
        paddingVertical: 18,
        paddingHorizontal: 32,
    },
    text: {
        fontFamily: Typography.families.body,
        fontWeight: '600',
        fontSize: Typography.sizes.base,
    },
    disabled: {
        opacity: 0.7,
    },
});
