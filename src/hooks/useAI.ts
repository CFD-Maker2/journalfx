import { useState } from 'react';
import type { JournalEntry } from '@/lib/api';
import { getAuthToken } from '@/lib/authToken';

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: number;
  emotions: string[];
  summary: string;
}

export interface SummaryResult {
  narrative: string;
  keyInsights: string[];
  emotionPerformanceLink: string;
  recommendations: string[];
}

export interface ReflectionPrompt {
  category: string;
  prompt: string;
  context: string;
}

export interface ReflectionPromptsResult {
  prompts: ReflectionPrompt[];
}

interface ReflectionPromptOptions {
  refreshToken?: string;
  excludePrompts?: string[];
}

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = 'http://localhost:5000/api';

  const callAIEndpoint = async <T>(path: string, payload: Record<string, unknown>) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('You must be logged in to use AI features.');
    }

    const response = await fetch(`${API_BASE_URL}/ai/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = 'AI request failed';
      try {
        const errorBody = await response.json();
        message = errorBody?.error || message;
      } catch {
        // Ignore JSON parse errors and keep fallback message.
      }

      throw new Error(message);
    }

    return response.json() as Promise<T>;
  };

  const analyzeSentiment = async (content: string): Promise<SentimentResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await callAIEndpoint<SentimentResult>('sentiment', { content });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze sentiment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async (entries: JournalEntry[]): Promise<SummaryResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const requestedLimit = Math.min(Math.max(entries.length || 3, 3), 30);
      const result = await callAIEndpoint<SummaryResult>('summary', { limit: requestedLimit });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateReflectionPrompts = async (
    entries: JournalEntry[],
    options: ReflectionPromptOptions = {},
  ): Promise<ReflectionPromptsResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const requestedLimit = Math.min(Math.max(entries.length || 3, 3), 15);
      const result = await callAIEndpoint<ReflectionPromptsResult>('reflection-prompts', {
        limit: requestedLimit,
        refreshToken: options.refreshToken || `${Date.now()}`,
        excludePrompts: Array.isArray(options.excludePrompts) ? options.excludePrompts.slice(0, 10) : [],
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompts');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    analyzeSentiment,
    generateSummary,
    generateReflectionPrompts,
  };
}
