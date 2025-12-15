import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error: fnError } = await supabase.functions.invoke('analyze-journal', {
        body: { type: 'sentiment', content },
      });
      
      if (fnError) throw new Error(fnError.message);
      return data as SentimentResult;
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
      const { data, error: fnError } = await supabase.functions.invoke('analyze-journal', {
        body: { type: 'summary', entries },
      });
      
      if (fnError) throw new Error(fnError.message);
      return data as SummaryResult;
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
      const { data, error: fnError } = await supabase.functions.invoke('analyze-journal', {
        body: { type: 'reflection-prompts', entries },
      });
      
      if (fnError) throw new Error(fnError.message);
      return data as ReflectionPromptsResult;
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
