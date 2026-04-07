import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

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

    return (
        <TouchableOpacity
            style={[
                styles.base,
                styles[size],
                { backgroundColor, borderColor, borderWidth: variant === 'outline' ? 1 : 0 },
                disabled && styles.disabled,
                style
            ]}
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
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
        </TouchableOpacity>
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
    }
});
