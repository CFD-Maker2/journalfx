export type Emotion = 
  | 'confident'
  | 'anxious'
  | 'calm'
  | 'stressed'
  | 'excited'
  | 'fearful'
  | 'focused'
  | 'frustrated'
  | 'neutral';

export type TradeType = 'long' | 'short' | 'scalp' | 'swing' | 'day';

export type MarketCondition = 'trending' | 'ranging' | 'volatile' | 'calm';

export interface JournalEntry {
  id: string;
  date: Date;
  emotion: Emotion;
  emotionIntensity: number; // 1-5
  confidenceLevel: number; // 1-5
  tradeType?: TradeType;
  marketCondition?: MarketCondition;
  preTrade: string;
  duringTrade: string;
  postTrade: string;
  tags: string[];
  outcome?: 'profit' | 'loss' | 'breakeven';
  profitLoss?: number;
  aiInsight?: string;
  reflectionPrompt?: string;
  createdAt: Date;
}

export interface MoodLog {
  id: string;
  date: Date;
  emotion: Emotion;
  intensity: number;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export const EMOTIONS: { value: Emotion; label: string; emoji: string; color: string }[] = [
  { value: 'confident', label: 'Confident', emoji: '💪', color: 'hsl(142 76% 36%)' },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'hsl(38 92% 50%)' },
  { value: 'calm', label: 'Calm', emoji: '😌', color: 'hsl(199 89% 48%)' },
  { value: 'stressed', label: 'Stressed', emoji: '😤', color: 'hsl(0 72% 51%)' },
  { value: 'excited', label: 'Excited', emoji: '🤩', color: 'hsl(43 74% 52%)' },
  { value: 'fearful', label: 'Fearful', emoji: '😨', color: 'hsl(270 60% 50%)' },
  { value: 'focused', label: 'Focused', emoji: '🎯', color: 'hsl(199 89% 48%)' },
  { value: 'frustrated', label: 'Frustrated', emoji: '😤', color: 'hsl(0 72% 51%)' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'hsl(217 33% 45%)' },
];
