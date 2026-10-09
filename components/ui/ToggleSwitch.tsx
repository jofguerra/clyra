import React from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface ToggleSwitchProps {
    value: boolean;
    disabled?: boolean;
    onValueChange: (val: boolean) => void;
}

export default function ToggleSwitch({ value, onValueChange, disabled = false }: ToggleSwitchProps) {
    const [animatedValue] = React.useState(new Animated.Value(value ? 1 : 0));

    React.useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [value, animatedValue]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 18],
    });

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [Colors.muted, Colors.primary],
    });

    return (
        <TouchableOpacity
            accessibilityRole="switch"
            accessibilityState={{ checked: value, disabled }}
            disabled={disabled}
            style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center', opacity: disabled ? 0.45 : 1 }}
            activeOpacity={0.8}
            onPress={() => onValueChange(!value)}
        >
            <Animated.View style={[styles.track, { backgroundColor }]}>
                <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    track: {
        width: 40,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        padding: 2,
    },
    thumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
});
