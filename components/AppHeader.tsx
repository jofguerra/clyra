import { useRouter } from 'expo-router';
import { useStore } from '../hooks/useStore';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Activity, ChevronLeft } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface AppHeaderProps {
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
    rightElement?: React.ReactNode;
}

export default function AppHeader({ title, showBack, onBack, rightElement }: AppHeaderProps) {
    const router = useRouter();
    const handleBack = () => {
        if (router.canGoBack()) {
            if (onBack) onBack(); else router.back();
        } else {
            router.replace(useStore.getState().hasCompletedOnboarding ? '/(tabs)' : '/onboarding');
        }
    };

    return (
        <BlurView intensity={80} tint="light" style={styles.container}>
            <View style={styles.content}>
                <View style={styles.leftContainer}>
                    {showBack ? (
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back" onPress={handleBack} style={styles.iconButton}>
                            <ChevronLeft color={Colors.foreground} size={24} />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.logoContainer}>
                            <Activity color={Colors.primaryForeground} size={16} />
                        </View>
                    )}
                    {!showBack && <Text style={styles.logoText}>Clyra</Text>}
                </View>

                {title && (
                    <View style={styles.titleContainer}>
                        <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    </View>
                )}

                <View style={styles.rightContainer}>
                    {rightElement}
                </View>
            </View>
        </BlurView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    content: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    leftContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 1,
    },
    rightContainer: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 1,
    },
    titleContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 0,
        paddingHorizontal: 60,
    },
    title: {
        fontFamily: Typography.families.body,
        fontWeight: '600',
        fontSize: Typography.sizes.md,
        color: Colors.foreground,
    },
    logoContainer: {
        backgroundColor: Colors.primary,
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    logoText: {
        fontFamily: Typography.families.display,
        fontWeight: '700',
        fontSize: Typography.sizes.lg,
        color: Colors.foreground,
    },
    iconButton: {
        padding: 10,
        minWidth: 44,
        minHeight: 44,
        marginLeft: -4,
    },
});
