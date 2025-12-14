import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, BookOpen, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJournalStore } from '@/stores/journalStore';
import { EMOTIONS, JournalEntry, Emotion } from '@/types/journal';
import { format } from 'date-fns';

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    emotion: 'confident',
    emotionIntensity: 4,
    confidenceLevel: 5,
    tradeType: 'swing',
    marketCondition: 'trending',
    preTrade: 'Clear setup on EURUSD, confluence with daily support.',
    duringTrade: 'Stayed patient, followed the plan.',
    postTrade: 'Great execution, happy with the discipline shown.',
    tags: ['EURUSD', 'Discipline', 'Trend'],
    outcome: 'profit',
    profitLoss: 245,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: '2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48),
    emotion: 'anxious',
    emotionIntensity: 3,
    confidenceLevel: 2,
    tradeType: 'day',
    marketCondition: 'volatile',
    preTrade: 'News event coming up, unsure about direction.',
    duringTrade: 'Felt FOMO, almost revenge traded.',
    postTrade: 'Should have stayed out of the market.',
    tags: ['GBPUSD', 'FOMO', 'News'],
    outcome: 'loss',
    profitLoss: -120,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: '3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72),
    emotion: 'calm',
    emotionIntensity: 4,
    confidenceLevel: 4,
    tradeType: 'scalp',
    marketCondition: 'ranging',
    preTrade: 'Market in consolidation, looking for range trades.',
    duringTrade: 'Multiple small wins, staying focused.',
    postTrade: 'Consistent execution of the strategy.',
    tags: ['USDJPY', 'Range', 'Scalping'],
    outcome: 'profit',
    profitLoss: 85,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
];

export default function Timeline() {
  const [searchQuery, setSearchQuery] = useState('');
  const [emotionFilter, setEmotionFilter] = useState<Emotion | 'all'>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'profit' | 'loss' | 'breakeven'>('all');

  const { entries } = useJournalStore();
  const allEntries = [...entries, ...mockEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredEntries = allEntries.filter((entry) => {
    const matchesSearch =
      searchQuery === '' ||
      entry.preTrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.duringTrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.postTrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEmotion = emotionFilter === 'all' || entry.emotion === emotionFilter;
    const matchesOutcome = outcomeFilter === 'all' || entry.outcome === outcomeFilter;

    return matchesSearch && matchesEmotion && matchesOutcome;
  });

  const getEmotionData = (emotion: Emotion) => EMOTIONS.find((e) => e.value === emotion);

  const getOutcomeIcon = (outcome?: 'profit' | 'loss' | 'breakeven') => {
    switch (outcome) {
      case 'profit':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'loss':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      case 'breakeven':
        return <Minus className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Journal <span className="text-gradient-gold">Timeline</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Review your trading journey and psychological growth
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search entries, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-border"
              />
            </div>
            <div className="flex gap-3">
              <Select value={emotionFilter} onValueChange={(v) => setEmotionFilter(v as Emotion | 'all')}>
                <SelectTrigger className="w-36 bg-muted border-border">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Emotion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Emotions</SelectItem>
                  {EMOTIONS.map((emotion) => (
                    <SelectItem key={emotion.value} value={emotion.value}>
                      {emotion.emoji} {emotion.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={outcomeFilter} onValueChange={(v) => setOutcomeFilter(v as typeof outcomeFilter)}>
                <SelectTrigger className="w-36 bg-muted border-border">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outcomes</SelectItem>
                  <SelectItem value="profit">Profit</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                  <SelectItem value="breakeven">Breakeven</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block" />

        <div className="space-y-6">
          {filteredEntries.length === 0 ? (
            <Card className="bg-gradient-card border-border">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No entries found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || emotionFilter !== 'all' || outcomeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Start journaling to see your entries here'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEntries.map((entry, index) => {
              const emotionData = getEmotionData(entry.emotion);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative md:pl-16"
                >
                  {/* Timeline Dot */}
                  <div
                    className="absolute left-4 top-6 w-5 h-5 rounded-full border-4 border-background hidden md:flex items-center justify-center"
                    style={{ backgroundColor: emotionData?.color }}
                  />

                  <Card className="bg-gradient-card border-border hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                            style={{ backgroundColor: `${emotionData?.color}20` }}
                          >
                            {emotionData?.emoji}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-serif">{emotionData?.label}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(entry.date), 'MMMM d, yyyy • h:mm a')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getOutcomeIcon(entry.outcome)}
                          {entry.profitLoss !== undefined && (
                            <span
                              className={`text-sm font-medium ${
                                entry.profitLoss > 0
                                  ? 'text-success'
                                  : entry.profitLoss < 0
                                  ? 'text-destructive'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {entry.profitLoss > 0 ? '+' : ''}
                              ${entry.profitLoss}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Trade Info */}
                      <div className="flex flex-wrap gap-2">
                        {entry.tradeType && (
                          <Badge variant="outline" className="capitalize">
                            {entry.tradeType}
                          </Badge>
                        )}
                        {entry.marketCondition && (
                          <Badge variant="outline" className="capitalize">
                            {entry.marketCondition}
                          </Badge>
                        )}
                        {entry.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Reflections */}
                      <div className="grid gap-3">
                        {entry.preTrade && (
                          <div className="p-3 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-1">Before Trade</p>
                            <p className="text-sm text-foreground">{entry.preTrade}</p>
                          </div>
                        )}
                        {entry.duringTrade && (
                          <div className="p-3 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-1">During Trade</p>
                            <p className="text-sm text-foreground">{entry.duringTrade}</p>
                          </div>
                        )}
                        {entry.postTrade && (
                          <div className="p-3 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-1">After Trade</p>
                            <p className="text-sm text-foreground">{entry.postTrade}</p>
                          </div>
                        )}
                      </div>

                      {/* Confidence & Intensity */}
                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Confidence:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`w-2 h-2 rounded-full ${
                                  level <= entry.confidenceLevel ? 'bg-primary' : 'bg-border'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Intensity:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    level <= entry.emotionIntensity
                                      ? emotionData?.color
                                      : 'hsl(217, 33%, 20%)',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
