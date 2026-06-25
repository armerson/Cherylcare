import { COLORS } from './colors';

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
    education: 'A surge in LH triggers ovulation. Oestrogen peaks, testosterone rises briefly. Many people feel their most energetic, confident, and sociable during this short window.',
  },
  luteal: {
    label: 'Luteal Phase',
    emoji: '\u{1F319}',
    color: COLORS.phaseLuteal,
    background: COLORS.phaseLutealBg,
    days: '17–28',
    shortDescription: 'Turning inward. Honour what your body needs.',
    education: 'The corpus luteum produces progesterone, which rises then falls. Energy typically decreases. For those with PMDD, emotional symptoms may intensify in the late luteal phase.',
  },
} as const;
