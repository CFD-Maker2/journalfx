import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, Check, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getReflectionResponses, createReflectionResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type ReflectionRow = Database['public']['Tables']['reflection_responses']['Row'];

const defaultPrompts = [
  { id: '1', category: 'Pre-Trade', prompt: 'What triggered your decision to enter this trade? Was it based on your strategy or an emotional impulse?' },
  { id: '2', category: 'Risk Management', prompt: 'Did you stick to your risk management rules today? If not, what led you to deviate?' },
  { id: '3', category: 'Emotional Awareness', prompt: 'How did your confidence level change throughout the trading session? What caused these shifts?' },
  { id: '4', category: 'Learning', prompt: 'What is one thing you learned about yourself as a trader today?' },
  { id: '5', category: 'Improvement', prompt: 'If you could redo one decision from today, what would it be and why?' },
];

const aiPrompts = [
  "Based on your journal patterns, you seem to perform better in the morning. What's different about your mindset then?",
  "You've mentioned FOMO in several entries. What specific situations trigger this feeling?",
  "Your confidence tends to drop after consecutive losses. What strategies could help maintain composure?",
];

export default function Reflections() {
  const [responses, setResponses] = useState<ReflectionRow[]>([]);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    const { data } = await getReflectionResponses();
    if (data) setResponses(data);
    setLoading(false);
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

      {/* AI Prompts */}
      <Card className="bg-gradient-card border-primary/30 shadow-gold">
        <CardHeader><CardTitle className="font-serif text-xl flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />AI-Powered Insights</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {aiPrompts.map((prompt, i) => (
            <div key={i} className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3"><div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"><MessageCircle className="w-3 h-3 text-primary" /></div><p className="text-sm text-foreground">{prompt}</p></div>
            </div>
          ))}
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
