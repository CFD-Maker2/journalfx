import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, Check, MessageCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getReflectionResponses, createReflectionResponse, getJournalEntries } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAI } from '@/hooks/useAI';
import { Database } from '@/integrations/supabase/types';

type ReflectionRow = Database['public']['Tables']['reflection_responses']['Row'];

const defaultPrompts = [
  { id: '1', category: 'Pre-Trade', prompt: 'What triggered your decision to enter this trade? Was it based on your strategy or an emotional impulse?' },
  { id: '2', category: 'Risk Management', prompt: 'Did you stick to your risk management rules today? If not, what led you to deviate?' },
  { id: '3', category: 'Emotional Awareness', prompt: 'How did your confidence level change throughout the trading session? What caused these shifts?' },
  { id: '4', category: 'Learning', prompt: 'What is one thing you learned about yourself as a trader today?' },
  { id: '5', category: 'Improvement', prompt: 'If you could redo one decision from today, what would it be and why?' },
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
    const { data: entries } = await getJournalEntries();
    if (entries && entries.length >= 3) {
      const result = await generateReflectionPrompts(entries.slice(0, 10));
      if (result?.prompts) {
        setAiPrompts(result.prompts);
      }
    }
  };

  const answeredPromptIds = responses.map(r => r.prompt_id);
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
        <h1 className="text-3xl font-serif font-bold text-foreground">Reflection <span className="text-gradient-gold">Prompts</span></h1>
        <p className="text-muted-foreground mt-1">Deepen your self-awareness with guided reflection questions</p>
      </div>

      {/* AI-Generated Prompts */}
      <Card className="bg-gradient-card border-primary/30 shadow-gold">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-serif text-xl flex items-center gap-2">
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
                key={i}
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
          <CardHeader><CardTitle className="font-serif text-xl flex items-center gap-2"><Lightbulb className="w-5 h-5" />Pending Reflections</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="font-serif text-xl flex items-center gap-2"><Check className="w-5 h-5 text-success" />Completed</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {answeredPrompts.map((prompt) => {
              const answer = responses.find(r => r.prompt_id === prompt.id);
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
