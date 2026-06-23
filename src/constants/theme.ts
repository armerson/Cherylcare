import { COLORS } from './colors';

export const TYPOGRAPHY = {
  // Font families (Expo Google Fonts or system fonts)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },

  // Font sizes
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#2D1B3D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#2D1B3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2D1B3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export const CYCLE_PHASE_CONFIG = {
  menstrual: {
    label: 'Menstrual Phase',
    emoji: '\u{1F338}',
    color: COLORS.phaseMenustrual,
    background: COLORS.phaseMenstrualBg,
    days: '1–5',
    shortDescription: 'Rest and restore. Your body is doing important work.',
    education: 'During menstruation, the uterine lining sheds. Oestrogen and progesterone are at their lowest. Fatigue is common and rest is genuinely restorative. Gentle movement, warmth, and iron-rich foods can help.',
  },
  follicular: {
    label: 'Follicular Phase',
    emoji: '\u{1F33F}',
    color: COLORS.phaseFollicular,
    background: COLORS.phaseFollicularBg,
    days: '6–13',
    shortDescription: 'Energy rising. A great time for new beginnings.',
    education: 'Oestrogen rises as follicles develop in the ovaries. Most people notice increasing energy, improved mood, and better focus during this phase. Ideal for starting new projects, exercise, and social activity.',
  },
  ovulatory: {
    label: 'Ovulatory Phase',
    emoji: '✨',
    color: COLORS.phaseOvulatory,
    background: COLORS.phaseOvulatoryBg,
    days: '13–16',
    shortDescription: 'Peak energy. You may feel your best right now.',
    education: 'A surge in LH triggers ovulation. Oestrogen peaks, testosterone rises briefly. Many people feel their most energetic, confident, and sociable during this short window. A great time for important conversations and challenges.',
  },
  luteal: {
    label: 'Luteal Phase',
    emoji: '\u{1F319}',
    color: COLORS.phaseLuteal,
    background: COLORS.phaseLutealBg,
    days: '17–28',
    shortDescription: 'Turning inward. Honour what your body needs.',
    education: 'The corpus luteum produces progesterone, which rises then falls. Energy typically decreases. For those with PMDD, emotional symptoms may intensify in the late luteal phase. Nourishing food, sleep, and gentle movement are particularly valuable now.',
  },
} as const;
