export const COLORS = {
  // Primary brand palette
  primary: '#C4849B',          // Soft rose/mauve — main brand colour
  primaryLight: '#FDEEF3',     // Light rose — backgrounds, alerts
  primaryDark: '#9A5F76',      // Dark rose — pressed states

  // Secondary palette
  secondary: '#9B84C4',        // Warm lavender — accent
  secondaryLight: '#EEE8F9',   // Light lavender — phase card backgrounds
  secondaryDark: '#6B5A8E',

  // Accent
  accent: '#84C4A3',           // Sage green — positive states, good days
  accentLight: '#EDF7F1',      // Light sage — encouragement card background
  accentDark: '#5A9478',

  // Cycle phase colours
  phaseMenustrual: '#E8A0B4',  // Rose — menstrual phase
  phaseMenstrualBg: '#FDF0F4',
  phaseFollicular: '#A8D0A8',  // Spring green — follicular phase
  phaseFollicularBg: '#EEF8EE',
  phaseOvulatory: '#F0C878',   // Golden — ovulatory phase
  phaseOvulatoryBg: '#FEF9ED',
  phaseLuteal: '#B8A0D8',      // Lavender — luteal phase
  phaseLutealBg: '#F2EDF9',

  // Semantic colours
  success: '#52B788',
  successLight: '#D8F3E8',
  warning: '#E9B44C',
  warningLight: '#FEF4DA',
  error: '#E05C5C',
  errorLight: '#FDEAEA',
  info: '#5C9EE0',
  infoLight: '#EAF2FD',

  // Neutrals
  background: '#FFF8F5',       // Warm off-white — screen background
  surface: '#FFFFFF',          // Card surface
  surfaceAlt: '#F5EFE9',       // Slightly warm grey — alt surface
  border: '#E8DDD5',
  borderLight: '#F0E8E2',      // Subtle divider lines inside cards
  divider: '#F0E8E2',

  // Text
  textPrimary: '#2D1B3D',      // Deep plum — headings, primary text
  textSecondary: '#7A6585',    // Muted plum — secondary text
  textTertiary: '#A899B0',     // Light muted — placeholder, disabled
  textInverse: '#FFFFFF',

  // PMDD alert
  pmddAlert: '#FFF0D0',
  pmddAlertBorder: '#F0B040',
  pmddActive: '#FFE0E0',
  pmddActiveBorder: '#E06060',
} as const;

export type ColorKey = keyof typeof COLORS;
