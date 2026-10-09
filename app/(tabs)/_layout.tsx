import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Heart, FlaskConical, TrendingUp, Settings, Target } from 'lucide-react-native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useT } from '../../hooks/useT';
import { useStore } from '../../hooks/useStore';

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const items = [
    { route: 'progress', label: t('tabTrends'), Icon: TrendingUp },
    { route: 'activity', label: t('tabActions'), Icon: Target },
    { route: 'index', label: t('tabHealth'), Icon: Heart },
    { route: 'upload', label: t('tabTests'), Icon: FlaskConical },
    { route: 'settings', label: t('tabSettings'), Icon: Settings },
  ];
  return <View style={[styles.dock, { bottom: Math.max(12, insets.bottom) }]}>
    {items.map(({route, label, Icon}) => {
      const target = state.routes.find(r => r.name === route);
      const focused = state.routes[state.index]?.name === route;
      return <TouchableOpacity key={route} accessibilityRole="tab" accessibilityLabel={label}
        accessibilityState={{ selected: focused }} aria-selected={focused} activeOpacity={0.75}
        style={styles.item} onPress={() => {
          if (!target) return;
          const event = navigation.emit({ type:'tabPress', target:target.key, canPreventDefault:true });
          if (!focused && !event.defaultPrevented) navigation.navigate(target.name);
        }}>
        <View style={[styles.icon, focused && styles.activeIcon]}>
          <Icon size={21} strokeWidth={focused ? 2.2 : 1.8} color={focused ? Colors.primary : '#626E82'} />
        </View>
        <Text style={[styles.label, focused && styles.activeLabel]}>{label}</Text>
      </TouchableOpacity>;
    })}
  </View>;
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


const styles = StyleSheet.create({
  dock: { position:'absolute', left:12, right:12, flexDirection:'row', padding:6,
    borderRadius:26, backgroundColor:'#FFFFFF', borderWidth:1, borderColor:'#E8EBF0',
    shadowColor:'#273044', shadowOpacity:0.09, shadowRadius:20, shadowOffset:{width:0,height:6}, elevation:6 },
  item: { flex:1, minHeight:58, alignItems:'center', justifyContent:'center', gap:4 },
  icon: { width:40, height:30, alignItems:'center', justifyContent:'center', borderRadius:12 },
  activeIcon: { backgroundColor:Colors.primary10 },
  label: { fontFamily:Typography.families.body, fontSize:10, color:'#626E82', fontWeight:'500' },
  activeLabel: { color:Colors.primary, fontWeight:'700' },
});
