import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getJournalEntries } from '@/lib/api';
import { EMOTIONS } from '@/types/journal';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

interface EmotionPerformance {
  emotion: string;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  color: string;
}

export function EmotionPerformanceChart() {
  const [data, setData] = useState<EmotionPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: entries } = await getJournalEntries();
    
    if (!entries) {
      setLoading(false);
      return;
    }

    const emotionStats: Record<string, { wins: number; losses: number; breakeven: number }> = {};

    entries.forEach((entry) => {
      if (!entry.outcome) return;
      
      if (!emotionStats[entry.emotion]) {
        emotionStats[entry.emotion] = { wins: 0, losses: 0, breakeven: 0 };
      }

      if (entry.outcome === 'profit') {
        emotionStats[entry.emotion].wins++;
      } else if (entry.outcome === 'loss') {
        emotionStats[entry.emotion].losses++;
      } else {
        emotionStats[entry.emotion].breakeven++;
      }
    });

    const chartData = Object.entries(emotionStats).map(([emotion, stats]) => {
      const total = stats.wins + stats.losses + stats.breakeven;
      const emotionInfo = EMOTIONS.find((e) => e.value === emotion);
      
      return {
        emotion: emotionInfo?.label || emotion,
        wins: stats.wins,
        losses: stats.losses,
        breakeven: stats.breakeven,
        winRate: total > 0 ? Math.round((stats.wins / total) * 100) : 0,
        color: emotionInfo?.color || 'hsl(217, 33%, 45%)',
      };
    });

    setData(chartData.sort((a, b) => b.winRate - a.winRate));
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Emotion vs Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Record trades with outcomes to see how emotions affect your performance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Emotion vs Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <YAxis
                dataKey="emotion"
                type="category"
                stroke="hsl(215, 20%, 55%)"
                fontSize={12}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222, 47%, 9%)',
                  border: '1px solid hsl(217, 33%, 20%)',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [value, name]}
              />
              <Legend />
              <Bar dataKey="wins" name="Wins" stackId="a" fill="hsl(142, 76%, 36%)" />
              <Bar dataKey="losses" name="Losses" stackId="a" fill="hsl(0, 72%, 51%)" />
              <Bar dataKey="breakeven" name="Breakeven" stackId="a" fill="hsl(43, 74%, 52%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.slice(0, 4).map((item) => (
            <div
              key={item.emotion}
              className="p-3 rounded-lg bg-muted/50 border border-border text-center"
            >
              <p className="text-xs text-muted-foreground">{item.emotion}</p>
              <p className="text-lg font-bold text-foreground">{item.winRate}%</p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
