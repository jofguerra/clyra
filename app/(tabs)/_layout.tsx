import { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
    Heart, FlaskConical, TrendingUp, Settings, Target,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import {
    View, Text, StyleSheet, Platform, Animated, TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useT } from '../../hooks/useT';
import { useStore } from '../../hooks/useStore';
import { SPRING_PLAYFUL } from '../../constants/motion';

// ─── Custom tab bar with elevated center "Health" button ─────────────────────
//
// Order: Trends | Actions | Health (center, elevated, pink) | Tests | Settings
// The center Health button overflows the bar with a large pink circle.
// Matches the reference design — warm, app-like, iconic.

type TabConfig = {
    route: string;
    label: string;
    Icon: any;
    elevated?: boolean;
};

function BouncyIcon({
    Icon, focused, color, size = 22,
}: {
    Icon: any; focused: boolean; color: string; size?: number;
}) {
    const scale = useRef(new Animated.Value(1)).current;
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        if (focused) {
            Animated.sequence([
                Animated.spring(scale, {
                    toValue: 1.18, damping: 8, mass: 0.5, stiffness: 240, useNativeDriver: true,
                }),
                Animated.spring(scale, { toValue: 1, ...SPRING_PLAYFUL }),
            ]).start();
        }
    }, [focused]);

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Icon color={color} size={size} strokeWidth={focused ? 2.4 : 2} />
        </Animated.View>
    );
}

// Center elevated button — larger, pink, lifted
function ElevatedCenterButton({
    focused, onPress,
}: { focused: boolean; onPress: () => void }) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.92, damping: 8, mass: 0.4, stiffness: 260, useNativeDriver: true,
        }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1, damping: 7, mass: 0.4, stiffness: 180, useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.centerBtnWrap}
        >
            <Animated.View style={[styles.centerBtn, { transform: [{ scale }] }]}>
                <Heart color="#fff" size={26} strokeWidth={2.5} fill="#fff" />
            </Animated.View>
        </TouchableOpacity>
    );
}

// Full custom tab bar — renders one TabBarItem per route, center one elevated
// Desired order: progress (Trends) | activity (Actions) | index (Health) | upload (Tests) | settings
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
    const t = useT();

    const configs: TabConfig[] = [
        { route: 'progress', label: t('tabTrends'),   Icon: TrendingUp },
        { route: 'activity', label: t('tabActions'),  Icon: Target },
        { route: 'index',    label: t('tabHealth'),   Icon: Heart, elevated: true },
        { route: 'upload',   label: t('tabTests'),    Icon: FlaskConical },
        { route: 'settings', label: t('tabSettings'), Icon: Settings },
    ];

    // Map route names to state indices (expo-router order may differ)
    const indexOf = (name: string) => state.routes.findIndex(r => r.name === name);

    const handlePress = (routeName: string) => {
        const idx = indexOf(routeName);
        if (idx < 0) return;
        const isFocused = state.index === idx;
        const route = state.routes[idx];

        const event = navigation.emit({
            type: 'tabPress', target: route.key, canPreventDefault: true,
        });
        if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
        }
    };

    return (
        <View style={styles.barContainer} pointerEvents="box-none">
            <View style={styles.barBg}>
                {Platform.OS === 'ios' ? (
                    <BlurView tint="light" intensity={94} style={StyleSheet.absoluteFill} />
                ) : (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.97)' }]} />
                )}
            </View>

            <View style={styles.barRow}>
                {configs.map((cfg) => {
                    const idx = indexOf(cfg.route);
                    const focused = state.index === idx;

                    if (cfg.elevated) {
                        return (
                            <View key={cfg.route} style={styles.item}>
                                <ElevatedCenterButton
                                    focused={focused}
                                    onPress={() => handlePress(cfg.route)}
                                />
                                <Text style={[
                                    styles.label,
                                    styles.centerLabel,
                                    focused && styles.labelActive,
                                ]}>
                                    {cfg.label}
                                </Text>
                            </View>
                        );
                    }

                    const color = focused ? Colors.primary : '#9BA3AF';
                    return (
                        <TouchableOpacity
                            key={cfg.route}
                            style={styles.item}
                            activeOpacity={0.7}
                            onPress={() => handlePress(cfg.route)}
                        >
                            <BouncyIcon Icon={cfg.Icon} focused={focused} color={color} />
                            <Text style={[styles.label, focused && styles.labelActive]}>
                                {cfg.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

export default function TabLayout() {
    const updateStreak = useStore((s) => s.updateStreak);

    useEffect(() => {
        updateStreak();
    }, [updateStreak]);

    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}>

            {/* Order here dictates navigation state order, but the custom bar
                renders its own visual ordering (progress | activity | index | upload | settings). */}
            <Tabs.Screen name="index" />
            <Tabs.Screen name="activity" />
            <Tabs.Screen name="progress" />
            <Tabs.Screen name="upload" />
            <Tabs.Screen name="settings" />

            {/* Hidden */}
            <Tabs.Screen name="chat" options={{ href: null }} />
        </Tabs>
    );
}

const BAR_HEIGHT = Platform.OS === 'ios' ? 86 : 70;
const BAR_BOTTOM_PAD = Platform.OS === 'ios' ? 28 : 10;
const CENTER_BTN_SIZE = 60;

const styles = StyleSheet.create({
    barContainer: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: BAR_HEIGHT + 22, // extra room for the overflowing center button
    },
    barBg: {
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height: BAR_HEIGHT,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 8,
    },
    barRow: {
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height: BAR_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: BAR_BOTTOM_PAD,
        paddingTop: 8,
    },

    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    // Center elevated button — overflows top of bar
    centerBtnWrap: {
        width: CENTER_BTN_SIZE,
        height: CENTER_BTN_SIZE,
        marginTop: -26, // lift above bar
        marginBottom: 4,
    },
    centerBtn: {
        width: CENTER_BTN_SIZE,
        height: CENTER_BTN_SIZE,
        borderRadius: CENTER_BTN_SIZE / 2,
        backgroundColor: '#C87EA0',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#C87EA0',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 4,
        borderColor: '#fff',
    },

    label: {
        fontFamily: 'System',
        fontSize: 11,
        fontWeight: '600',
        color: '#9BA3AF',
        marginTop: 4,
        letterSpacing: 0.2,
    },
    centerLabel: {
        marginTop: 0,
    },
    labelActive: {
        color: Colors.primary,
        fontWeight: '700',
    },
});
