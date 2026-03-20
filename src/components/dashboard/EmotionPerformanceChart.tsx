import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getJournalEntries } from '@/lib/api';
import { EMOTIONS } from '@/types/journal';
import { Bar } from 'react-chartjs-2';
import '@/components/charts/ChartConfig';
import { chartColors, horizontalBarOptions, createGradient } from '@/components/charts/ChartConfig';

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

  // Enhanced Chart.js data for stacked bar chart with gradients
  const barChartData = {
    labels: data.map((d) => d.emotion),
    datasets: [
      {
        label: 'Wins',
        data: data.map((d) => d.wins),
        backgroundColor: `rgba(${chartColors.successRgb}, 0.85)`,
        hoverBackgroundColor: chartColors.success,
        borderRadius: 4,
        stack: 'stack0',
      },
      {
        label: 'Losses',
        data: data.map((d) => d.losses),
        backgroundColor: `rgba(${chartColors.destructiveRgb}, 0.85)`,
        hoverBackgroundColor: chartColors.destructive,
        borderRadius: 4,
        stack: 'stack0',
      },
      {
        label: 'Breakeven',
        data: data.map((d) => d.breakeven),
        backgroundColor: `rgba(${chartColors.primaryRgb}, 0.85)`,
        hoverBackgroundColor: chartColors.primary,
        borderRadius: 4,
        stack: 'stack0',
      },
    ],
  };

  const barChartOptions = {
    ...horizontalBarOptions,
    plugins: {
      ...horizontalBarOptions.plugins,
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: chartColors.muted,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
    },
    scales: {
      x: {
        ...horizontalBarOptions.scales.x,
        stacked: true,
      },
      y: {
        ...horizontalBarOptions.scales.y,
        stacked: true,
        grid: {
          display: false,
        },
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
          {data.slice(0, 4).map((item, index) => (
            <div
              key={item.emotion}
              className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center backdrop-blur-sm transition-all duration-300 hover:bg-muted/50 hover:border-primary/30"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="text-xs text-muted-foreground font-medium">{item.emotion}</p>
              <p className="text-xl font-bold text-gradient-gold mt-1">{item.winRate}%</p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
