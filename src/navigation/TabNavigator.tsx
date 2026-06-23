import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import type { TabParamList } from './types';
import { COLORS } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import DailyCheckInScreen from '../screens/check-in/DailyCheckInScreen';
import CycleTrackingScreen from '../screens/cycle/CycleTrackingScreen';
import InsightsScreen from '../screens/insights/InsightsScreen';
import MoreMenuScreen from '../screens/more/MoreMenuScreen';

const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabNavigator() {
  const { unreadInsights } = useAppStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="\u{1F3E0}" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CheckIn"
        component={DailyCheckInScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="✔️" label="Check In" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Cycle"
        component={CycleTrackingScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="\u{1F534}" label="Cycle" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <TabIcon emoji="\u{1F4CA}" label="Insights" focused={focused} />
              {unreadInsights > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadInsights}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreMenuScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⋯" label="More" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 8,
  },
  tabIcon: {
    alignItems: 'center',
    gap: 2,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
