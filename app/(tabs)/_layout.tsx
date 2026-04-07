import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Heart, FlaskConical, TrendingUp, Settings, Target } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useT } from '../../hooks/useT';
import { useStore } from '../../hooks/useStore';

export default function TabLayout() {
    const t = useT();
    const updateStreak = useStore((s) => s.updateStreak);

    useEffect(() => {
        updateStreak();
    }, [updateStreak]);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: '#9ba3af',
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 0.3,
                    textTransform: 'uppercase',
                    marginTop: 2,
                },
                tabBarStyle: styles.tabBar,
                tabBarBackground: () => (
                    Platform.OS === 'ios' ? (
                        <BlurView tint="light" intensity={90} style={StyleSheet.absoluteFill} />
                    ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.97)' }]} />
                    )
                ),
                tabBarActiveBackgroundColor: 'transparent',
            }}>

            {/* Tab 1: Health — clean dashboard */}
            <Tabs.Screen
                name="index"
                options={{
                    title: t('tabHealth'),
                    tabBarIcon: ({ color, focused }) => (
                        <Heart
                            color={focused ? Colors.primary : '#9ba3af'}
                            size={23}
                            fill={focused ? Colors.primary : 'transparent'}
                        />
                    ),
                }}
            />

            {/* Tab 2: Activity — gamification, priorities, missions */}
            <Tabs.Screen
                name="activity"
                options={{
                    title: t('tabActions'),
                    tabBarIcon: ({ color, focused }) => (
                        <Target
                            color={focused ? Colors.primary : '#9ba3af'}
                            size={23}
                        />
                    ),
                }}
            />

            {/* Tab 3: Trends — progress & what's improving/declining */}
            <Tabs.Screen
                name="progress"
                options={{
                    title: t('tabTrends'),
                    tabBarIcon: ({ color, focused }) => (
                        <TrendingUp
                            color={focused ? Colors.primary : '#9ba3af'}
                            size={23}
                        />
                    ),
                }}
            />

            {/* Tab 4: Tests — upload + history + edit */}
            <Tabs.Screen
                name="upload"
                options={{
                    title: t('tabTests'),
                    tabBarIcon: ({ color, focused }) => (
                        <FlaskConical
                            color={focused ? Colors.primary : '#9ba3af'}
                            size={23}
                            fill={focused ? Colors.primary + '20' : 'transparent'}
                        />
                    ),
                }}
            />

            {/* Tab 5: Settings */}
            <Tabs.Screen
                name="settings"
                options={{
                    title: t('tabSettings'),
                    tabBarIcon: ({ color, focused }) => (
                        <Settings
                            color={focused ? Colors.primary : '#9ba3af'}
                            size={23}
                        />
                    ),
                }}
            />

            {/* Hidden */}
            <Tabs.Screen name="chat" options={{ href: null }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        borderTopWidth: 0,
        elevation: 0,
        height: Platform.OS === 'ios' ? 82 : 66,
        paddingBottom: Platform.OS === 'ios' ? 26 : 10,
        paddingTop: 8,
        backgroundColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
    },
});
