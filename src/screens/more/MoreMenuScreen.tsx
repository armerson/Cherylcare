import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

type Nav = NativeStackNavigationProp<MainStackParamList>;

interface MenuItem {
  label: string;
  icon: string;
  screen: keyof MainStackParamList;
  subtitle: string;
  color: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'PMDD Tracking',
    icon: '🌙',
    screen: 'PMDD',
    subtitle: 'Log emotional & cognitive symptoms',
    color: '#9B84C4',
  },
  {
    label: 'Hypermobility',
    icon: '🦴',
    screen: 'Hypermobility',
    subtitle: 'Joint pain, fatigue & instability',
    color: '#C4849B',
  },
  {
    label: 'Medications',
    icon: '💊',
    screen: 'Medications',
    subtitle: 'Supplements & medications log',
    color: '#84C4A3',
  },
  {
    label: 'Physio & Exercise',
    icon: '🏃‍♀️',
    screen: 'Physio',
    subtitle: 'Strength training & physio plans',
    color: '#C4A484',
  },
  {
    label: 'Nutrition & Lifestyle',
    icon: '🥗',
    screen: 'Nutrition',
    subtitle: 'Water, protein, sleep & more',
    color: '#84B8C4',
  },
  {
    label: 'Settings',
    icon: '⚙️',
    screen: 'Settings',
    subtitle: 'Notifications, Christian mode & profile',
    color: '#A0A0A0',
  },
];

export default function MoreMenuScreen() {
  const navigation = useNavigation<Nav>();
  const profile = useAppStore((s) => s.profile);
  const settings = useAppStore((s) => s.settings);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>More</Text>
          {profile?.displayName && (
            <Text style={styles.name}>{profile.displayName}</Text>
          )}
        </View>

        {settings?.christianMode && (
          <View style={styles.verseCard}>
            <Text style={styles.verseIcon}>✝️</Text>
            <Text style={styles.verse}>
              "She is clothed with strength and dignity; she can laugh at the days to come."
            </Text>
            <Text style={styles.verseRef}>— Proverbs 31:25</Text>
          </View>
        )}

        <View style={styles.grid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '22' }]}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>CherylCare v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ♡ for women with hEDS & PMDD</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },
  header: {
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  verseCard: {
    backgroundColor: '#FFF8F5',
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  verseIcon: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  verse: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.sm,
  },
  verseRef: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  card: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 24,
  },
  cardLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.xs,
  },
  footer: {
    marginTop: SPACING['3xl'],
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  },
  footerSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});
