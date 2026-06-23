import { Encouragement } from '../types';

export const ENCOURAGEMENTS: Encouragement[] = [
  // PMDD context
  {
    context: 'pmdd',
    text: 'These feelings are real, but they are not permanent. You have survived every difficult cycle before this one.',
  },
  {
    context: 'pmdd',
    text: 'PMDD does not define you. You are not your symptoms. This window will pass.',
  },
  {
    context: 'pmdd',
    text: 'The intensity of what you feel right now is a symptom, not a truth. Gentleness with yourself today.',
  },
  {
    context: 'pmdd',
    text: 'You are not overreacting. PMDD is a recognised medical condition. Your experience is valid.',
  },
  {
    context: 'pmdd',
    text: 'When the PMDD window closes, so does this difficulty. You are closer to relief than you know.',
  },

  // Pain context
  {
    context: 'pain',
    text: 'Your body is working hard today. Treat yourself with the kindness you would offer a dear friend.',
  },
  {
    context: 'pain',
    text: 'Rest is not giving up. Rest is strategy. Your body is asking for something important today.',
  },
  {
    context: 'pain',
    text: 'You navigate this level of pain with courage every single day. That is extraordinary.',
  },
  {
    context: 'pain',
    text: 'Modifying plans because of pain is wisdom, not weakness. You know your body.',
  },
  {
    context: 'pain',
    text: 'Pain flares are not a setback in your journey — they are part of it. Steady on.',
  },

  // Fatigue context
  {
    context: 'fatigue',
    text: 'Rest is productive when your body needs it. You are not falling behind.',
  },
  {
    context: 'fatigue',
    text: 'Fatigue with hypermobility is real and valid. Your body works harder than most people know.',
  },
  {
    context: 'fatigue',
    text: 'Doing less today is sometimes the highest form of self-care. Permission granted.',
  },
  {
    context: 'fatigue',
    text: 'Your worth is not measured by your productivity. Rest freely.',
  },

  // Good day context
  {
    context: 'good_day',
    text: 'Celebrate today\'s energy and momentum. You earned this.',
  },
  {
    context: 'good_day',
    text: 'What a good day feels like — notice it, savour it, remember it for harder days.',
  },
  {
    context: 'good_day',
    text: 'You\'re doing beautifully. Let today fill your reserves.',
  },
  {
    context: 'good_day',
    text: 'High energy days are gifts. Enjoy it fully — without guilt for the rest days that come.',
  },

  // General morning
  {
    context: 'morning',
    text: 'Good morning. Today is a new day with its own possibilities.',
  },
  {
    context: 'morning',
    text: 'You showed up for your health today. That already counts.',
  },
  {
    context: 'morning',
    text: 'Whatever today holds, you have everything you need to meet it.',
  },

  // Exercise / physio
  {
    context: 'exercise',
    text: 'Strength is built gently, one safe rep at a time.',
  },
  {
    context: 'exercise',
    text: 'Consistency matters more than intensity. Every session counts, however short.',
  },
  {
    context: 'exercise',
    text: 'Stopping before a flare is wisdom, not failure. Protecting your joints is progress.',
  },
  {
    context: 'exercise',
    text: 'Control is more important than weight. You are building something real.',
  },
  {
    context: 'exercise',
    text: 'Your nervous system and your joints are learning. This takes time, and that is completely okay.',
  },

  // Streak milestones
  {
    context: 'streak',
    text: 'Seven days of check-ins. Every data point is a gift to your future self.',
  },
  {
    context: 'streak',
    text: '14 days! You are building a picture of your body that no one else can see yet.',
  },
  {
    context: 'streak',
    text: '30 days of showing up for yourself. That is remarkable consistency.',
  },
];

export const CHRISTIAN_ENCOURAGEMENTS: Encouragement[] = [
  {
    context: 'pmdd',
    text: 'You are held by the One who knows every wave of this season.',
    verse: 'Cast all your anxiety on him because he cares for you.',
    verseRef: '1 Peter 5:7',
    christian: true,
  },
  {
    context: 'pmdd',
    text: 'This darkness will not last. Morning is coming.',
    verse: 'Weeping may stay for the night, but rejoicing comes in the morning.',
    verseRef: 'Psalm 30:5',
    christian: true,
  },
  {
    context: 'pain',
    text: 'You are not alone in this. Grace is sufficient even for this day.',
    verse: 'My grace is sufficient for you, for my power is made perfect in weakness.',
    verseRef: '2 Corinthians 12:9',
    christian: true,
  },
  {
    context: 'pain',
    text: 'God is close to you in this pain. You are not unseen.',
    verse: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.',
    verseRef: 'Psalm 34:18',
    christian: true,
  },
  {
    context: 'fatigue',
    text: 'Rest in Him today. The load can be light.',
    verse: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    verseRef: 'Matthew 11:28',
    christian: true,
  },
  {
    context: 'fatigue',
    text: 'Strength comes from a source that does not run dry.',
    verse: 'He gives strength to the weary and increases the power of the weak.',
    verseRef: 'Isaiah 40:29',
    christian: true,
  },
  {
    context: 'good_day',
    text: 'This is a gift. Receive it with gratitude.',
    verse: 'This is the day the Lord has made; let us rejoice and be glad in it.',
    verseRef: 'Psalm 118:24',
    christian: true,
  },
  {
    context: 'morning',
    text: 'New mercies for a new morning.',
    verse: 'His mercies are new every morning; great is your faithfulness.',
    verseRef: 'Lamentations 3:23',
    christian: true,
  },
  {
    context: 'general',
    text: 'You are held by plans for hope and a future.',
    verse: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."',
    verseRef: 'Jeremiah 29:11',
    christian: true,
  },
  {
    context: 'exercise',
    text: 'Care for this body you have been given. Each gentle step matters.',
    verse: 'Do you not know that your bodies are temples of the Holy Spirit?',
    verseRef: '1 Corinthians 6:19',
    christian: true,
  },
];

export function getEncouragement(
  context: Encouragement['context'],
  christianMode: boolean,
): Encouragement {
  const pool = christianMode
    ? [...CHRISTIAN_ENCOURAGEMENTS, ...ENCOURAGEMENTS].filter(e => e.context === context)
    : ENCOURAGEMENTS.filter(e => e.context === context);

  if (pool.length === 0) {
    const general = ENCOURAGEMENTS.find(e => e.context === 'general') ?? ENCOURAGEMENTS[0];
    return general;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
