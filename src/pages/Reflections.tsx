import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, Check, MessageCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getReflectionResponses, createReflectionResponse, getJournalEntries } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAI } from '@/hooks/useAI';
import { endOfDay, isWithinInterval, startOfDay } from 'date-fns';

const defaultPrompts = [
  { id: '1', category: 'Daily Mindset', prompt: 'How would you describe your overall mindset today from market open to close?' },
  { id: '2', category: 'Discipline', prompt: 'Across the full day, where did you follow your process best, and where did discipline slip?' },
  { id: '3', category: 'Emotional Pattern', prompt: 'What emotion showed up most often today, and how did it affect your decisions overall?' },
  { id: '4', category: 'Learning', prompt: 'What is the biggest lesson from today that you want to carry into tomorrow?' },
  { id: '5', category: 'Tomorrow Plan', prompt: 'What one clear intention will you set for tomorrow to improve your trading behavior?' },
];

interface AIPrompt {
  category: string;
  prompt: string;
  context: string;
}

export default function Reflections() {
  const [responses, setResponses] = useState<ReflectionRow[]>([]);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiPrompts, setAiPrompts] = useState<AIPrompt[]>([]);
  const [promptBatchVersion, setPromptBatchVersion] = useState(0);
  const [hasEntries, setHasEntries] = useState(false);
  const { toast } = useToast();
  const { loading: aiLoading, error: aiError, generateReflectionPrompts } = useAI();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [responsesResult, entriesResult] = await Promise.all([
      getReflectionResponses(),
      getJournalEntries(),
    ]);
    
    if (responsesResult.data) setResponses(responsesResult.data);
    setHasEntries((entriesResult.data?.length || 0) >= 3);
    setLoading(false);
  };

  const handleGenerateAIPrompts = async () => {
    const { data: entries, error } = await getJournalEntries();

    if (error || !entries || entries.length < 3) {
      toast({
        title: 'Not enough journal data',
        description: 'Create at least 3 journal entries to generate AI prompts.',
        variant: 'destructive',
      });
      return;
    }

    const result = await generateReflectionPrompts(entries.slice(0, 10), {
      refreshToken: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      excludePrompts: aiPrompts.map((item) => item.prompt),
    });

    if (result?.prompts?.length) {
      setAiPrompts(result.prompts);
      setPromptBatchVersion((prev) => prev + 1);
      toast({ title: 'AI prompts refreshed' });
      return;
    }

    toast({
      title: 'Unable to generate prompts',
      description: 'Please try again in a few seconds.',
      variant: 'destructive',
    });
  };

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const todaysResponses = responses.filter((item) => {
    if (!item.created_at) return false;

    const createdAt = new Date(item.created_at);
    if (Number.isNaN(createdAt.getTime())) return false;

    return isWithinInterval(createdAt, { start: todayStart, end: todayEnd });
  });

  const answeredPromptIds = todaysResponses.map(r => r.prompt_id);
  const unansweredPrompts = defaultPrompts.filter(p => !answeredPromptIds.includes(p.id));
  const answeredPrompts = defaultPrompts.filter(p => answeredPromptIds.includes(p.id));

  const handleSubmitAnswer = async (promptId: string, promptText: string, category: string) => {
    if (!response.trim()) {
      toast({ title: 'Please write a response', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await createReflectionResponse({
      prompt_id: promptId,
      prompt_text: promptText,
      category,
      response: response.trim(),
    });

    if (error) {
      toast({ title: 'Failed to save', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reflection saved!' });
      if (data) setResponses([data, ...responses]);
      setActivePrompt(null);
      setResponse('');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reflection <span className="text-gradient-gold">Prompts</span></h1>
        <p className="text-muted-foreground mt-1">Five overall daily prompts reset every new day</p>
      </div>

      {/* AI-Generated Prompts */}
      <Card className="bg-gradient-card border-primary/30 shadow-gold">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Powered Reflection Prompts
          </CardTitle>
          {hasEntries && (
            <Button variant="ghost" size="sm" onClick={handleGenerateAIPrompts} disabled={aiLoading}>
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {!hasEntries ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm">
                Create at least 3 journal entries to get personalized AI prompts
              </p>
            </div>
          ) : aiPrompts.length === 0 ? (
            <div className="text-center py-6">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-3 animate-pulse" />
              <p className="text-muted-foreground text-sm mb-4">
                Generate personalized prompts based on your journal patterns
              </p>
              <Button variant="gold" onClick={handleGenerateAIPrompts} disabled={aiLoading}>
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Prompts
                  </>
                )}
              </Button>
              {aiError && <p className="text-destructive text-sm mt-2">{aiError}</p>}
            </div>
          ) : (
            aiPrompts.map((prompt, i) => (
              <motion.div
                key={`${promptBatchVersion}-${prompt.category}-${prompt.prompt.slice(0, 40)}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg bg-primary/5 border border-primary/20"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-3 h-3 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-primary font-medium uppercase">{prompt.category}</span>
                    <p className="text-foreground mt-1">{prompt.prompt}</p>
                    <p className="text-xs text-muted-foreground mt-2 italic">{prompt.context}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Unanswered */}
      {unansweredPrompts.length > 0 && (
        <Card className="bg-gradient-card border-border">
          <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Lightbulb className="w-5 h-5" />Today's Daily Reflections</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {unansweredPrompts.map((prompt) => (
              <div key={prompt.id} className={`p-4 rounded-lg border ${activePrompt === prompt.id ? 'bg-muted border-primary/50' : 'bg-muted/30 border-border'}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div><span className="text-xs text-primary font-medium uppercase">{prompt.category}</span><p className="text-foreground mt-1">{prompt.prompt}</p></div>
                  {activePrompt !== prompt.id && <Button variant="outline" size="sm" onClick={() => setActivePrompt(prompt.id)}>Answer</Button>}
                </div>
                {activePrompt === prompt.id && (
                  <div className="space-y-3">
                    <Textarea placeholder="Write your reflection..." value={response} onChange={(e) => setResponse(e.target.value)} className="min-h-24 bg-card border-border" />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setActivePrompt(null); setResponse(''); }}>Cancel</Button>
                      <Button variant="gold" size="sm" onClick={() => handleSubmitAnswer(prompt.id, prompt.prompt, prompt.category)} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Answered */}
      {answeredPrompts.length > 0 && (
        <Card className="bg-gradient-card border-border">
          <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Check className="w-5 h-5 text-success" />Today's Completed</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {answeredPrompts.map((prompt) => {
              const answer = todaysResponses.find(r => r.prompt_id === prompt.id);
              return (
                <div key={prompt.id} className="p-4 rounded-lg bg-success/5 border border-success/20">
                  <span className="text-xs text-success font-medium uppercase">{prompt.category}</span>
                  <p className="text-foreground mt-1 mb-3">{prompt.prompt}</p>
                  <div className="p-3 rounded-lg bg-muted/30 border-l-2 border-success"><p className="text-sm text-muted-foreground italic">{answer?.response}</p></div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
