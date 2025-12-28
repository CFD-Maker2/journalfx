import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, BookOpen, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getJournalEntries } from '@/lib/api';
import { EMOTIONS, Emotion } from '@/types/journal';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];

export default function Timeline() {
  const [searchQuery, setSearchQuery] = useState('');
  const [emotionFilter, setEmotionFilter] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [entries, setEntries] = useState<JournalEntryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const { data, error } = await getJournalEntries();
    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === '' ||
      entry.pre_trade?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.during_trade?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.post_trade?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEmotion = emotionFilter === 'all' || entry.emotion === emotionFilter;
    const matchesOutcome = outcomeFilter === 'all' || entry.outcome === outcomeFilter;

    return matchesSearch && matchesEmotion && matchesOutcome;
  });

  const getEmotionData = (emotion: string) => EMOTIONS.find((e) => e.value === emotion);

  const getOutcomeIcon = (outcome?: string | null) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">
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
              <Select value={emotionFilter} onValueChange={setEmotionFilter}>
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

              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
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
                            <CardTitle className="text-lg">{emotionData?.label}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(entry.entry_date), 'MMMM d, yyyy • h:mm a')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getOutcomeIcon(entry.outcome)}
                          {entry.profit_loss !== null && (
                            <span
                              className={`text-sm font-medium ${
                                Number(entry.profit_loss) > 0
                                  ? 'text-success'
                                  : Number(entry.profit_loss) < 0
                                  ? 'text-destructive'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {Number(entry.profit_loss) > 0 ? '+' : ''}
                              ${entry.profit_loss}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Trade Info */}
                      <div className="flex flex-wrap gap-2">
                        {entry.trade_type && (
                          <Badge variant="outline" className="capitalize">
                            {entry.trade_type}
                          </Badge>
                        )}
                        {entry.market_condition && (
                          <Badge variant="outline" className="capitalize">
                            {entry.market_condition}
                          </Badge>
                        )}
                        {entry.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Reflections */}
                      <div className="grid gap-3">
                        {entry.pre_trade && (
                          <div className="p-3 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-1">Before Trade</p>
                            <p className="text-sm text-foreground">{entry.pre_trade}</p>
                          </div>
                        )}
                        {entry.during_trade && (
                          <div className="p-3 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-1">During Trade</p>
                            <p className="text-sm text-foreground">{entry.during_trade}</p>
                          </div>
                        )}
                        {entry.post_trade && (
                          <div className="p-3 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-1">After Trade</p>
                            <p className="text-sm text-foreground">{entry.post_trade}</p>
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
                                  level <= entry.confidence_level ? 'bg-primary' : 'bg-border'
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
                                    level <= entry.emotion_intensity
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
