export interface AIQuote {
  quote: string;
  author: string;
  category: 'Discipline' | 'Consistency' | 'Focus' | 'Mindset';
}

export interface AIWeeklyInsight {
  headline: string;
  score: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

const QUOTES: AIQuote[] = [
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", category: "Consistency" },
  { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "Discipline" },
  { quote: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear", category: "Mindset" },
  { quote: "Flow is the state of total immersion where action and awareness merge.", author: "Mihaly Csikszentmihalyi", category: "Focus" },
  { quote: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King", category: "Discipline" },
  { quote: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma", category: "Consistency" }
];

export class AIService {
  static getRandomQuote(): AIQuote {
    const idx = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[idx];
  }

  static generateWeeklySummary(completedCount: number, streakDays: number, consistencyPct: number): AIWeeklyInsight {
    return {
      headline: `Exceptional Week! ${consistencyPct}% Consistency Maintained`,
      score: Math.min(100, Math.round(consistencyPct * 1.02)),
      strengths: [
        `Peak productivity identified during morning hours (09:00 AM - 11:00 AM)`,
        `Strong momentum with a ${streakDays}-day active goal completion streak`,
        `High efficiency in "Code" and "Health" category tasks`
      ],
      improvements: [
        `Try capping daily tasks at 5 to maintain 100% focus quality`,
        `Set tomorrow's goals earlier (around 9:30 PM) for better sleep transition`
      ],
      recommendations: [
        `Attempt a 3-day "Beast" difficulty challenge to gain +1,000 extra XP`,
        `Pair up with Group member Rahul Verma for joint morning cardio accountability`
      ]
    };
  }
}
