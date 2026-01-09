import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getJournalEntries } from '@/lib/api';
import { EMOTIONS } from '@/types/journal';
import { Bar } from 'react-chartjs-2';
import '@/components/charts/ChartConfig';
import { chartColors, defaultOptions } from '@/components/charts/ChartConfig';

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

  // Chart.js data for stacked bar chart
  const barChartData = {
    labels: data.map((d) => d.emotion),
    datasets: [
      {
        label: 'Wins',
        data: data.map((d) => d.wins),
        backgroundColor: chartColors.success,
        stack: 'stack0',
      },
      {
        label: 'Losses',
        data: data.map((d) => d.losses),
        backgroundColor: chartColors.destructive,
        stack: 'stack0',
      },
      {
        label: 'Breakeven',
        data: data.map((d) => d.breakeven),
        backgroundColor: chartColors.primary,
        stack: 'stack0',
      },
    ],
  };

  const barChartOptions = {
    ...defaultOptions,
    indexAxis: 'y' as const,
    plugins: {
      ...defaultOptions.plugins,
      legend: {
        ...defaultOptions.plugins.legend,
        position: 'bottom' as const,
      },
    },
    scales: {
      x: {
        ...defaultOptions.scales.x,
        stacked: true,
      },
      y: {
        ...defaultOptions.scales.y,
        stacked: true,
      },
    },
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
          <CardTitle className="text-xl">Emotion vs Performance</CardTitle>
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
        <CardTitle className="text-xl">Emotion vs Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={barChartData} options={barChartOptions} />
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
