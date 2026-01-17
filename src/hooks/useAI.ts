import { useState } from 'react';

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: number;
  emotions: string[];
  summary: string;
}

interface SummaryResult {
  narrative: string;
  keyInsights: string[];
  emotionPerformanceLink: string;
  recommendations: string[];
}

interface ReflectionPrompt {
  category: string;
  prompt: string;
  context: string;
}

interface ReflectionPromptsResult {
  prompts: ReflectionPrompt[];
}

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeSentiment = async (content: string): Promise<SentimentResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock data for now, will integrate Gemini later
      const mockResult: SentimentResult = {
        sentiment: 'neutral',
        confidence: 0.5,
        emotions: ['calm'],
        summary: 'Analysis not available yet.',
      };
      return mockResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze sentiment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async (entries: any[]): Promise<SummaryResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock data for now
      const mockResult: SummaryResult = {
        narrative: 'Summary not available yet.',
        keyInsights: ['Insight 1'],
        emotionPerformanceLink: 'Link not available.',
        recommendations: ['Recommendation 1'],
      };
      return mockResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateReflectionPrompts = async (entries: any[]): Promise<ReflectionPromptsResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock data for now
      const mockResult: ReflectionPromptsResult = {
        prompts: [
          {
            category: 'Performance',
            prompt: 'What patterns do you notice in your trading?',
            context: 'Based on your recent entries.',
          },
        ],
      };
      return mockResult;
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
