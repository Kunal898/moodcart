// Deterministic Mood & Vibe Recommendation Logic for MoodCart

export const MOODS = [
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😊',
    tagline: 'Bright picks for brighter moments',
    color: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    badgeText: '#b45309',
    description: 'Feel-good essentials, vibrant vibes, and mood-lifting favorites.',
  },
  {
    id: 'relaxed',
    label: 'Relaxed',
    emoji: '🌿',
    tagline: 'Calm & soothing picks for unwinding',
    color: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    badgeText: '#047857',
    description: 'Serene ambience, mindfulness goods, and cozy comfort to slow down.',
  },
  {
    id: 'party',
    label: 'Party',
    emoji: '🎉',
    tagline: 'Everything you need to turn the energy up',
    color: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.12)',
    badgeText: '#6d28d9',
    description: 'High-energy audio, party lights, party snacks, and celebration gear.',
  },
  {
    id: 'work',
    label: 'Work',
    emoji: '💼',
    tagline: 'Stay dialed in and effortlessly productive',
    color: '#2563eb',
    badgeBg: 'rgba(37, 99, 235, 0.12)',
    badgeText: '#1d4ed8',
    description: 'Ergonomic tools, precision gear, and coffee fuel for deep focus.',
  },
];

// Complementary mood compatibility map
const MOOD_AFFINITY = {
  happy: { happy: 96, party: 88, relaxed: 82, work: 70 },
  relaxed: { relaxed: 96, happy: 84, work: 76, party: 65 },
  party: { party: 96, happy: 90, relaxed: 68, work: 62 },
  work: { work: 96, relaxed: 80, happy: 75, party: 60 },
};

/**
 * Calculates a deterministic mood match score (percentage)
 * Based on product mood, target mood, and deterministic hash of product id.
 */
export function getMoodMatchScore(productMood, targetMood = 'relaxed', productId = '') {
  if (!productMood) return 80;

  const pMood = (productMood || '').toLowerCase();
  const tMood = (targetMood || 'happy').toLowerCase();

  const baseAffinity = (MOOD_AFFINITY[tMood] && MOOD_AFFINITY[tMood][pMood]) || (pMood === tMood ? 95 : 75);

  // Deterministic variance +/- 3% based on product id
  let hash = 0;
  if (productId) {
    for (let i = 0; i < productId.length; i++) {
      hash = (hash + productId.charCodeAt(i) * (i + 1)) % 7;
    }
  }
  const variance = (hash - 3); // between -3 and +3

  return Math.min(99, Math.max(60, baseAffinity + variance));
}

/**
 * "Find Your Mood" Quiz Evaluator
 * Deterministically computes target mood, match score, and description.
 */
export function evaluateMoodQuiz(answers) {
  const { feeling, goal, budget } = answers;

  let moodScores = { happy: 0, relaxed: 0, party: 0, work: 0 };

  // Weight Feeling
  if (feeling === 'happy' || feeling === 'energetic') {
    moodScores.happy += 3;
    moodScores.party += 2;
  } else if (feeling === 'calm' || feeling === 'tired') {
    moodScores.relaxed += 4;
  } else if (feeling === 'stressed') {
    moodScores.relaxed += 3;
    moodScores.work += 1;
  } else if (feeling === 'focused') {
    moodScores.work += 4;
  }

  // Weight Goal
  if (goal === 'relax') moodScores.relaxed += 4;
  if (goal === 'celebrate') moodScores.party += 4;
  if (goal === 'focus') moodScores.work += 4;
  if (goal === 'refresh' || goal === 'treat') {
    moodScores.happy += 3;
    moodScores.relaxed += 2;
  }

  // Pick winning mood
  let bestMood = 'happy';
  let highestScore = -1;
  Object.keys(moodScores).forEach((m) => {
    if (moodScores[m] > highestScore) {
      highestScore = moodScores[m];
      bestMood = m;
    }
  });

  // Deterministic match percentage
  const matchScore = 91 + (highestScore % 7); // 91% to 97%

  // Price constraints for budget
  let priceFilter = null;
  if (budget === 'under-500') priceFilter = { maxPrice: 500 };
  else if (budget === '500-1000') priceFilter = { minPrice: 500, maxPrice: 1000 };
  else if (budget === '1000-2500') priceFilter = { minPrice: 1000, maxPrice: 2500 };
  else if (budget === '2500-plus') priceFilter = { minPrice: 2500 };

  return {
    targetMood: bestMood,
    matchScore,
    priceFilter,
    moodInfo: MOODS.find((m) => m.id === bestMood),
  };
}

/**
 * Today's Vibe (Daily Vibe)
 * Deterministic based on the current day of the week.
 */
export function getDailyVibe() {
  const day = new Date().getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const dailyVibes = [
    {
      dayName: 'Sunday',
      mood: 'relaxed',
      emoji: '🌿',
      title: 'Slow Down & Unwind',
      tagline: 'Sunday reset for body and peace of mind.',
      quote: 'Take time to recharge your soul before the week begins.',
      accentColor: '#10b981',
    },
    {
      dayName: 'Monday',
      mood: 'work',
      emoji: '⚡',
      title: 'Laser Focus & Ambition',
      tagline: 'High-octane tools to conquer your weekly goals.',
      quote: 'Great things never came from comfort zones.',
      accentColor: '#2563eb',
    },
    {
      dayName: 'Tuesday',
      mood: 'work',
      emoji: '💼',
      title: 'In The Flow',
      tagline: 'Streamlined productivity and ergonomic momentum.',
      quote: 'Efficiency is doing things right; effectiveness is doing the right things.',
      accentColor: '#3b82f6',
    },
    {
      dayName: 'Wednesday',
      mood: 'happy',
      emoji: '✨',
      title: 'Midweek Mood Boost',
      tagline: 'Joyful treats and delightful picks to power you over the hump.',
      quote: 'A little mid-week spark to brighten your rhythm.',
      accentColor: '#f59e0b',
    },
    {
      dayName: 'Thursday',
      mood: 'happy',
      emoji: '🌟',
      title: 'Anticipation & Joy',
      tagline: 'Uplifting comfort picks to keep spirits high.',
      quote: 'The weekend is in sight—keep your vibe radiant.',
      accentColor: '#eab308',
    },
    {
      dayName: 'Friday',
      mood: 'party',
      emoji: '🎉',
      title: 'Friday High Energy',
      tagline: 'Celebration mode activated: music, lights, and fun.',
      quote: 'Leave work at the door, let the good times roll.',
      accentColor: '#8b5cf6',
    },
    {
      dayName: 'Saturday',
      mood: 'party',
      emoji: '🔥',
      title: 'Weekend Euphoria',
      tagline: 'Pure party energy, get-togethers, and social picks.',
      quote: 'Make tonight unforgettable with the right ambience.',
      accentColor: '#ec4899',
    },
  ];

  return dailyVibes[day] || dailyVibes[0];
}

/**
 * Mood Journey transition recommendations
 */
export const MOOD_JOURNEY_OPTIONS = [
  {
    fromId: 'tired',
    fromLabel: '😴 Feeling Tired & Drained',
    targetMood: 'happy',
    toLabel: '⚡ Want to Feel Energized & Upbeat',
    recommendationTitle: 'Energy Resurgence Kit',
    recommendationSubtitle: 'Awaken your senses with instant audio, coffee, and mood lifters.',
  },
  {
    fromId: 'stressed',
    fromLabel: '🤯 Feeling Stressed & Overwhelmed',
    targetMood: 'relaxed',
    toLabel: '🌿 Want to Feel Calm & Centered',
    recommendationTitle: 'Deep Tranquility Collection',
    recommendationSubtitle: 'Scented ambiance, gentle posture, and calming reads to restore harmony.',
  },
  {
    fromId: 'distracted',
    fromLabel: '🌫️ Feeling Scattered & Distracted',
    targetMood: 'work',
    toLabel: '🎯 Want Deep Focus & Clarity',
    recommendationTitle: 'Peak Concentration Setup',
    recommendationSubtitle: 'Precision tactile gear and structured notebooks to dial in your mind.',
  },
  {
    fromId: 'bored',
    fromLabel: '🥱 Feeling Bored & Stagnant',
    targetMood: 'party',
    toLabel: '🎉 Want Excitement & Party Vibes',
    recommendationTitle: 'Instant Celebration Pack',
    recommendationSubtitle: 'Vibrant LED strips, rotating disco ambiance, and snack combos.',
  },
];
