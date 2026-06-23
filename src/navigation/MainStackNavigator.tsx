import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import type { MainStackParamList } from './types';

import TabNavigator from './TabNavigator';
import PMDDScreen from '../screens/pmdd/PMDDTrackingScreen';
import HypermobilityScreen from '../screens/hypermobility/HypermobilityScreen';
import MedicationsScreen from '../screens/medications/MedicationsScreen';
import PhysioScreen from '../screens/physio/PhysioScreen';
import PhysioSessionScreen from '../screens/physio/PhysioSessionScreen';
import RecoveryCheckInScreen from '../screens/physio/RecoveryCheckInScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import InsightsScreen from '../screens/insights/InsightsScreen';
import NutritionScreen from '../screens/nutrition/NutritionScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.textPrimary,
        headerShadowVisible: false,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      {/* PMDD registered under both keys for backwards compat with any deep links */}
      <Stack.Screen name="PMDD" component={PMDDScreen} options={{ title: 'PMDD Tracking' }} />
      <Stack.Screen name="PMDDTracking" component={PMDDScreen} options={{ title: 'PMDD Tracking' }} />
      <Stack.Screen name="Hypermobility" component={HypermobilityScreen} options={{ title: 'Hypermobility' }} />
      <Stack.Screen name="Medications" component={MedicationsScreen} options={{ title: 'Medications & Supplements' }} />
      <Stack.Screen name="Physio" component={PhysioScreen} options={{ title: 'Physio & Strength' }} />
      <Stack.Screen name="PhysioSession" component={PhysioSessionScreen} options={{ title: 'Session' }} />
      <Stack.Screen name="RecoveryCheckIn" component={RecoveryCheckInScreen} options={{ title: 'Recovery Check-In' }} />
      <Stack.Screen name="Nutrition" component={NutritionScreen} options={{ title: 'Nutrition & Lifestyle' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="InsightDetail" component={InsightsScreen} options={{ title: 'Insights' }} />
    </Stack.Navigator>
  );
}
