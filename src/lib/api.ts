import type { Emotion, MarketCondition, TradeType } from '@/types/journal';
import { getAuthToken } from '@/lib/authToken';

const API_BASE_URL = 'http://localhost:5000/api';

export type TradeOutcome = 'profit' | 'loss' | 'breakeven';

interface BaseDocument {
  id?: string;
  _id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntry extends BaseDocument {
  entry_date: string;
  emotion: Emotion;
  emotion_intensity: number;
  confidence_level: number;
  trade_type?: TradeType | null;
  market_condition?: MarketCondition | null;
  pre_trade?: string | null;
  during_trade?: string | null;
  post_trade?: string | null;
  tags?: string[];
  outcome?: TradeOutcome | null;
  profit_loss?: number | null;
  ai_insight?: string | null;
  reflection_prompt?: string | null;
  currency_pair?: string | null;
  take_profit_pips?: number | null;
  stop_loss_pips?: number | null;
}

export type JournalEntryInsert = Omit<JournalEntry, keyof BaseDocument | 'id' | '_id'>;

export interface MoodLog extends BaseDocument {
  log_date: string;
  emotion: Emotion;
  intensity: number;
  notes?: string | null;
}

export type MoodLogInsert = Omit<MoodLog, keyof BaseDocument | 'id' | '_id'>;

export interface ReflectionResponse extends BaseDocument {
  prompt_id: string;
  prompt_text: string;
  category: string;
  response: string;
}

export type ReflectionResponseInsert = Omit<ReflectionResponse, keyof BaseDocument | 'id' | '_id'>;

// Journal Entries
export async function getJournalEntries() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/journal`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return { data: null, error: new Error('Failed to fetch journal entries') };
  }
  const data = await response.json();
  return { data: data.entries || [], error: null };
}

export async function createJournalEntry(entry: Omit<JournalEntryInsert, 'user_id'>) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/journal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(entry),
  });
  if (!response.ok) {
    return { data: null, error: new Error('Failed to create journal entry') };
  }
  const data = await response.json();
  return { data, error: null };
}

export async function updateJournalEntry(id: string, updates: Partial<JournalEntry>) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/journal/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    return { data: null, error: new Error('Failed to update journal entry') };
  }
  const data = await response.json();
  return { data, error: null };
}

export async function deleteJournalEntry(id: string) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/journal/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return { error: new Error('Failed to delete journal entry') };
  }
  return { error: null };
}

// Mood Logs
export async function getMoodLogs() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/mood`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return { data: null, error: new Error('Failed to fetch mood logs') };
  }
  const data = await response.json();
  return { data, error: null };
}

export async function createMoodLog(log: Omit<MoodLogInsert, 'user_id'>) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/mood`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(log),
  });
  if (!response.ok) {
    return { data: null, error: new Error('Failed to create mood log') };
  }
  const data = await response.json();
  return { data, error: null };
}

export async function deleteMoodLog(id: string) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/mood/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return { error: new Error('Failed to delete mood log') };
  }
  return { error: null };
}

// Reflection Responses
export async function getReflectionResponses() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reflection`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return { data: null, error: new Error('Failed to fetch reflection responses') };
  }
  const data = await response.json();
  return { data, error: null };
}

export async function createReflectionResponse(response: Omit<ReflectionResponseInsert, 'user_id'>) {
  const token = getAuthToken();
  const responseFetch = await fetch(`${API_BASE_URL}/reflection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(response),
  });
  if (!responseFetch.ok) {
    return { data: null, error: new Error('Failed to create reflection response') };
  }
  const data = await responseFetch.json();
  return { data, error: null };
}

// Stats
export async function getJournalStats() {
  try {
    const [entriesRes, moodLogsRes, reflectionsRes] = await Promise.all([
      getJournalEntries(),
      getMoodLogs(),
      getReflectionResponses(),
    ]);

    const entries = entriesRes.data || [];
    const moodLogs = moodLogsRes.data || [];
    const reflections = reflectionsRes.data || [];

    const totalEntries = entries.length;
    const totalMoodLogs = moodLogs.length;
    const totalReflections = reflections.length;

    // Calculate average confidence
    const avgConfidence = entries.length
      ? entries.reduce((sum, e) => sum + e.confidence_level, 0) / entries.length
      : 0;

    // Calculate win rate
    const profitableEntries = entries.filter(e => e.outcome === 'profit').length;
    const totalWithOutcome = entries.filter(e => e.outcome).length;
    const winRate = totalWithOutcome ? (profitableEntries / totalWithOutcome) * 100 : 0;

    return {
      totalEntries,
      totalMoodLogs,
      totalReflections,
      avgConfidence: avgConfidence.toFixed(1),
      winRate: winRate.toFixed(0),
    };
  } catch (error) {
    console.error('Failed to get journal stats:', error);
    return {
      totalEntries: 0,
      totalMoodLogs: 0,
      totalReflections: 0,
      avgConfidence: '0',
      winRate: '0',
    };
  }
}
