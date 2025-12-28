import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAI } from '@/hooks/useAI';
import { getJournalEntries } from '@/lib/api';

interface SummaryData {
  narrative: string;
  keyInsights: string[];
  emotionPerformanceLink: string;
  recommendations: string[];
}

export function AISummary() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [hasEntries, setHasEntries] = useState(false);
  const { loading, error, generateSummary } = useAI();

  useEffect(() => {
    checkEntries();
  }, []);

  const checkEntries = async () => {
    const { data } = await getJournalEntries();
    setHasEntries((data?.length || 0) >= 3);
  };

  const handleGenerateSummary = async () => {
    const { data: entries } = await getJournalEntries();
    if (entries && entries.length >= 3) {
      const result = await generateSummary(entries.slice(0, 20));
      if (result) {
        setSummary(result);
      }
    }
  };

  if (!hasEntries) {
    return (
      <Card className="bg-gradient-card border-primary/30 shadow-gold">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Create at least 3 journal entries to unlock AI-powered insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="bg-gradient-card border-primary/30 shadow-gold">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground mb-4">
              Generate personalized insights based on your journal entries using AI
            </p>
            <Button variant="gold" onClick={handleGenerateSummary} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Summary
                </>
              )}
            </Button>
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-gradient-card border-primary/30 shadow-gold">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleGenerateSummary} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Narrative */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {summary.narrative}
            </p>
          </div>

          {/* Emotion-Performance Link */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Emotion-Performance Link</h4>
                <p className="text-sm text-muted-foreground">{summary.emotionPerformanceLink}</p>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              Key Insights
            </h4>
            <ul className="space-y-2">
              {summary.keyInsights.map((insight, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-primary">•</span>
                  {insight}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Recommendations</h4>
            <div className="grid gap-2">
              {summary.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-success/5 border border-success/20 text-sm text-foreground"
                >
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
