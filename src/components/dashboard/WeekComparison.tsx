import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getJournalEntries, getMoodLogs } from '@/lib/api';
import type { JournalEntry } from '@/lib/api';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface ComparisonData {
  label: string;
  current: number;
  previous: number;
  unit?: string;
}

interface PeriodStats {
  entries: number;
  avgConfidence: number;
  avgIntensity: number;
  wins: number;
  losses: number;
}

const calculateStats = (entries: JournalEntry[]): PeriodStats => {
  if (entries.length === 0) {
    return { entries: 0, avgConfidence: 0, avgIntensity: 0, wins: 0, losses: 0 };
  }

  const avgConfidence = entries.reduce((sum, e) => sum + e.confidence_level, 0) / entries.length;
  const avgIntensity = entries.reduce((sum, e) => sum + e.emotion_intensity, 0) / entries.length;
  const wins = entries.filter(e => e.outcome === 'profit').length;
  const losses = entries.filter(e => e.outcome === 'loss').length;

  return {
    entries: entries.length,
    avgConfidence: Math.round(avgConfidence * 10) / 10,
    avgIntensity: Math.round(avgIntensity * 10) / 10,
    wins,
    losses,
  };
};

const ComparisonItem = ({ data }: { data: ComparisonData }) => {
  const diff = data.current - data.previous;
  const percentChange = data.previous > 0 ? ((diff / data.previous) * 100) : (data.current > 0 ? 100 : 0);
  const isPositive = diff > 0;
  const isNeutral = diff === 0;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-1">{data.label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            {data.current}{data.unit || ''}
          </span>
          <span className="text-xs text-muted-foreground">
            vs {data.previous}{data.unit || ''}
          </span>
        </div>
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
        isNeutral 
          ? 'bg-muted text-muted-foreground' 
          : isPositive 
            ? 'bg-success/10 text-success' 
            : 'bg-destructive/10 text-destructive'
      }`}>
        {isNeutral ? (
          <Minus className="w-3 h-3" />
        ) : isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span>
          {isNeutral ? '0%' : `${isPositive ? '+' : ''}${Math.round(percentChange)}%`}
        </span>
      </div>
    </div>
  );
};

export function WeekComparison() {
  const [weeklyData, setWeeklyData] = useState<ComparisonData[]>([]);
  const [dailyData, setDailyData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComparison() {
      try {
        const [entriesResult] = await Promise.all([
          getJournalEntries(),
        ]);

        const entries = entriesResult.data || [];
        const today = new Date();

        // Weekly comparison
        const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
        const thisWeekEnd = endOfWeek(today, { weekStartsOn: 1 });
        const lastWeekStart = subDays(thisWeekStart, 7);
        const lastWeekEnd = subDays(thisWeekEnd, 7);

        const thisWeekEntries = entries.filter(e => 
          isWithinInterval(new Date(e.entry_date), { start: thisWeekStart, end: thisWeekEnd })
        );
        const lastWeekEntries = entries.filter(e => 
          isWithinInterval(new Date(e.entry_date), { start: lastWeekStart, end: lastWeekEnd })
        );

        const thisWeekStats = calculateStats(thisWeekEntries);
        const lastWeekStats = calculateStats(lastWeekEntries);

        setWeeklyData([
          { label: 'Journal Entries', current: thisWeekStats.entries, previous: lastWeekStats.entries },
          { label: 'Avg Confidence', current: thisWeekStats.avgConfidence, previous: lastWeekStats.avgConfidence },
          { label: 'Winning Trades', current: thisWeekStats.wins, previous: lastWeekStats.wins },
          { label: 'Losing Trades', current: thisWeekStats.losses, previous: lastWeekStats.losses },
        ]);

        // Daily comparison (today vs yesterday)
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);
        const yesterdayStart = startOfDay(subDays(today, 1));
        const yesterdayEnd = endOfDay(subDays(today, 1));

        const todayEntries = entries.filter(e => 
          isWithinInterval(new Date(e.entry_date), { start: todayStart, end: todayEnd })
        );
        const yesterdayEntries = entries.filter(e => 
          isWithinInterval(new Date(e.entry_date), { start: yesterdayStart, end: yesterdayEnd })
        );

        const todayStats = calculateStats(todayEntries);
        const yesterdayStats = calculateStats(yesterdayEntries);

        setDailyData([
          { label: 'Entries Today', current: todayStats.entries, previous: yesterdayStats.entries },
          { label: 'Confidence Level', current: todayStats.avgConfidence, previous: yesterdayStats.avgConfidence },
          { label: 'Emotion Intensity', current: todayStats.avgIntensity, previous: yesterdayStats.avgIntensity },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error loading comparison data:', error);
        setLoading(false);
      }
    }

    loadComparison();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Performance Comparison
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track your progress: this week vs last week, today vs yesterday
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Comparison */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Weekly</h3>
                <p className="text-xs text-muted-foreground">This week vs Last week</p>
              </div>
            </div>
            <div className="space-y-2">
              {weeklyData.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ComparisonItem data={item} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Daily Comparison */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Daily</h3>
                <p className="text-xs text-muted-foreground">Today vs Yesterday</p>
              </div>
            </div>
            <div className="space-y-2">
              {dailyData.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <ComparisonItem data={item} />
                </motion.div>
              ))}
            </div>
            
            {/* Summary insight */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20"
            >
              <p className="text-xs text-muted-foreground">
                💡 <span className="text-foreground font-medium">Pro Tip:</span> Consistent journaling helps identify patterns in your trading psychology.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
