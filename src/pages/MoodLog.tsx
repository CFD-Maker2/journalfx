import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useJournalStore } from '@/stores/journalStore';
import { EMOTIONS, Emotion } from '@/types/journal';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const mockMoodHistory = [
  { id: '1', date: new Date(Date.now() - 1000 * 60 * 60 * 2), emotion: 'confident' as Emotion, intensity: 4, notes: 'Feeling good after morning analysis' },
  { id: '2', date: new Date(Date.now() - 1000 * 60 * 60 * 5), emotion: 'anxious' as Emotion, intensity: 3, notes: 'Market volatility increasing' },
  { id: '3', date: new Date(Date.now() - 1000 * 60 * 60 * 24), emotion: 'calm' as Emotion, intensity: 4, notes: 'Relaxed weekend trading prep' },
  { id: '4', date: new Date(Date.now() - 1000 * 60 * 60 * 26), emotion: 'focused' as Emotion, intensity: 5, notes: 'Deep work session on strategy' },
  { id: '5', date: new Date(Date.now() - 1000 * 60 * 60 * 48), emotion: 'stressed' as Emotion, intensity: 4, notes: 'Multiple positions open' },
];

export default function MoodLog() {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState([3]);
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { addMoodLog, moodLogs } = useJournalStore();
  const { toast } = useToast();

  const allMoodLogs = [...moodLogs, ...mockMoodHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleSubmit = () => {
    if (!selectedEmotion) {
      toast({
        title: 'Please select an emotion',
        variant: 'destructive',
      });
      return;
    }

    addMoodLog({
      date: new Date(),
      emotion: selectedEmotion,
      intensity: intensity[0],
      notes: notes || undefined,
    });

    toast({
      title: 'Mood logged!',
      description: 'Your current mood has been recorded.',
    });

    setSelectedEmotion(null);
    setIntensity([3]);
    setNotes('');
    setShowForm(false);
  };

  const getEmotionData = (emotion: Emotion) => EMOTIONS.find((e) => e.value === emotion);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Mood <span className="text-gradient-gold">Log</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your emotional state throughout your trading sessions
          </p>
        </div>
        <Button variant="gold" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-5 h-5" />
          Log Mood
        </Button>
      </div>

      {/* Quick Mood Selection */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                How are you feeling?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
                {EMOTIONS.map((emotion) => (
                  <motion.button
                    key={emotion.value}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedEmotion(emotion.value)}
                    className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      selectedEmotion === emotion.value
                        ? 'border-primary bg-primary/10 shadow-gold'
                        : 'border-border bg-muted/30 hover:border-muted-foreground/50'
                    }`}
                  >
                    <span className="text-2xl">{emotion.emoji}</span>
                    <span className="text-xs text-muted-foreground">{emotion.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Intensity Level</label>
                <Slider
                  value={intensity}
                  onValueChange={setIntensity}
                  min={1}
                  max={5}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Intense</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notes (optional)</label>
                <Textarea
                  placeholder="What's on your mind? Any triggers or thoughts?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-20 bg-muted border-border resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button variant="gold" onClick={handleSubmit}>
                  Save Mood
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Mood History */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Mood History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allMoodLogs.map((log, index) => {
              const emotionData = getEmotionData(log.emotion);
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${emotionData?.color}20` }}
                  >
                    {emotionData?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-medium text-foreground">{emotionData?.label}</h4>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {format(new Date(log.date), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">Intensity:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                level <= log.intensity
                                  ? emotionData?.color
                                  : 'hsl(217, 33%, 20%)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    {log.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
