import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, RefreshCw, Check, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const reflectionPrompts = [
  {
    id: '1',
    category: 'Pre-Trade',
    prompt: 'What triggered your decision to enter this trade? Was it based on your strategy or an emotional impulse?',
    answered: false,
  },
  {
    id: '2',
    category: 'Risk Management',
    prompt: 'Did you stick to your risk management rules today? If not, what led you to deviate?',
    answered: false,
  },
  {
    id: '3',
    category: 'Emotional Awareness',
    prompt: 'How did your confidence level change throughout the trading session? What caused these shifts?',
    answered: true,
    answer: 'My confidence was high in the morning but dropped after the first loss. I noticed I became more hesitant to take valid setups.',
  },
  {
    id: '4',
    category: 'Learning',
    prompt: 'What is one thing you learned about yourself as a trader today?',
    answered: false,
  },
  {
    id: '5',
    category: 'Improvement',
    prompt: 'If you could redo one decision from today, what would it be and why?',
    answered: false,
  },
  {
    id: '6',
    category: 'Mindset',
    prompt: 'How did you handle moments of uncertainty or doubt during your trades?',
    answered: true,
    answer: 'I took a short break when I felt overwhelmed. It helped me regain clarity before making my next decision.',
  },
];

const aiGeneratedPrompts = [
  "Based on your recent entries, you seem to perform better in the morning. What's different about your mindset at that time?",
  "You've mentioned FOMO in several entries. What specific situations trigger this feeling for you?",
  "Your confidence tends to drop after consecutive losses. What strategies could help you maintain composure?",
];

export default function Reflections() {
  const [prompts, setPrompts] = useState(reflectionPrompts);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const { toast } = useToast();

  const handleSubmitAnswer = (promptId: string) => {
    if (!response.trim()) {
      toast({
        title: 'Please write a response',
        variant: 'destructive',
      });
      return;
    }

    setPrompts(
      prompts.map((p) =>
        p.id === promptId ? { ...p, answered: true, answer: response } : p
      )
    );

    toast({
      title: 'Reflection saved!',
      description: 'Your thoughtful response has been recorded.',
    });

    setActivePrompt(null);
    setResponse('');
  };

  const unansweredPrompts = prompts.filter((p) => !p.answered);
  const answeredPrompts = prompts.filter((p) => p.answered);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Reflection <span className="text-gradient-gold">Prompts</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Deepen your self-awareness with guided reflection questions
        </p>
      </div>

      {/* AI Generated Prompts */}
      <Card className="bg-gradient-card border-primary/30 shadow-gold">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Based on your journal entries, here are personalized reflection prompts:
          </p>
          <div className="space-y-3">
            {aiGeneratedPrompts.map((prompt, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-primary/5 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => setActivePrompt(`ai-${index}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageCircle className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">{prompt}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unanswered Prompts */}
      {unansweredPrompts.length > 0 && (
        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-xl flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Pending Reflections
            </CardTitle>
            <Button variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              New Prompts
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {unansweredPrompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border transition-all ${
                  activePrompt === prompt.id
                    ? 'bg-muted border-primary/50'
                    : 'bg-muted/30 border-border hover:border-muted-foreground/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-xs text-primary font-medium uppercase tracking-wide">
                      {prompt.category}
                    </span>
                    <p className="text-foreground mt-1">{prompt.prompt}</p>
                  </div>
                  {activePrompt !== prompt.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivePrompt(prompt.id)}
                    >
                      Answer
                    </Button>
                  )}
                </div>

                {activePrompt === prompt.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <Textarea
                      placeholder="Write your reflection here..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      className="min-h-24 bg-card border-border resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActivePrompt(null);
                          setResponse('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => handleSubmitAnswer(prompt.id)}
                      >
                        Save Reflection
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Answered Prompts */}
      {answeredPrompts.length > 0 && (
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="font-serif text-xl flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              Completed Reflections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {answeredPrompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg bg-success/5 border border-success/20"
              >
                <span className="text-xs text-success font-medium uppercase tracking-wide">
                  {prompt.category}
                </span>
                <p className="text-foreground mt-1 mb-3">{prompt.prompt}</p>
                <div className="p-3 rounded-lg bg-muted/30 border-l-2 border-success">
                  <p className="text-sm text-muted-foreground italic">{prompt.answer}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
