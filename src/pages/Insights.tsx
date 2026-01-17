import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Brain, Target, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Radar, Line } from 'react-chartjs-2';
import '@/components/charts/ChartConfig';
import { chartColors, radarOptions, lineOptions, horizontalBarOptions, createGradient } from '@/components/charts/ChartConfig';
import { getJournalEntries, getMoodLogs, getReflectionResponses } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Insights() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [reflectionCount, setReflectionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const lineChartRef = useRef<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesRes, moodRes, reflectionsRes] = await Promise.all([
        getJournalEntries(),
        getMoodLogs(),
        getReflectionResponses(),
      ]);

      // Check for API errors and throw them
      if (entriesRes.error) throw entriesRes.error;
      if (moodRes.error) throw moodRes.error;
      if (reflectionsRes.error) throw reflectionsRes.error;

      setEntries(entriesRes.data || []);
      setMoodLogs(moodRes.data || []);
      setReflectionCount(reflectionsRes.data?.length || 0);
    } catch (error) {
      console.error('Failed to load insights data:', error);
      setEntries([]);
      setMoodLogs([]);
      setReflectionCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Calculate emotion performance from real data
  const emotionPerformance = entries.reduce((acc, entry) => {
    const emotion = entry.emotion;
    if (!acc[emotion]) {
      acc[emotion] = { wins: 0, total: 0, totalPL: 0 };
    }
    if (entry.outcome) {
      acc[emotion].total++;
      if (entry.outcome === 'profit') acc[emotion].wins++;
      acc[emotion].totalPL += entry.profit_loss || 0;
    }
    return acc;
  }, {} as Record<string, { wins: number; total: number; totalPL: number }>);

  const emotionBarData = {
    labels: Object.keys(emotionPerformance),
    datasets: [
      {
        label: 'Win Rate %',
        data: Object.values(emotionPerformance).map((e) =>
          e.total > 0 ? Math.round((e.wins / e.total) * 100) : 0
        ),
        backgroundColor: `rgba(${chartColors.primaryRgb}, 0.85)`,
        hoverBackgroundColor: chartColors.primary,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  // Calculate psychology traits from real data
  const calculateTraits = () => {
    if (entries.length === 0) {
      return {
        Discipline: 0,
        Patience: 0,
        Confidence: 0,
        Focus: 0,
        Resilience: 0,
        Adaptability: 0,
      };
    }

    // Discipline: based on consistent journaling
    const discipline = Math.min(100, entries.length * 5);

    // Confidence: average confidence level
    const avgConfidence = entries.reduce((sum, e) => sum + e.confidence_level, 0) / entries.length;
    const confidence = Math.round(avgConfidence * 10);

    // Patience: based on reflection responses
    const patience = Math.min(100, reflectionCount * 10);

    // Focus: based on entries with focused emotion
    const focusedEntries = entries.filter((e) => e.emotion === 'focused').length;
    const focus = entries.length > 0 ? Math.round((focusedEntries / entries.length) * 100) : 0;

    // Resilience: recovering after losses
    const losses = entries.filter((e) => e.outcome === 'loss').length;
    const totalTrades = entries.filter((e) => e.outcome).length;
    const resilience = totalTrades > 0 ? Math.round(((totalTrades - losses) / totalTrades) * 100) : 50;

    // Adaptability: variety of emotions handled
    const uniqueEmotions = new Set(entries.map((e) => e.emotion)).size;
    const adaptability = Math.min(100, uniqueEmotions * 15);

    return { Discipline: discipline, Patience: patience, Confidence: confidence, Focus: focus, Resilience: resilience, Adaptability: adaptability };
  };

  const traits = calculateTraits();

  const radarChartData = {
    labels: Object.keys(traits),
    datasets: [
      {
        label: 'Current',
        data: Object.values(traits),
        backgroundColor: `rgba(${chartColors.primaryRgb}, 0.12)`,
        borderColor: chartColors.primary,
        borderWidth: 2.5,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: chartColors.primary,
        fill: true,
      },
    ],
  };

  const radarChartOptions = {
    ...radarOptions,
    scales: {
      ...radarOptions.scales,
      r: {
        ...radarOptions.scales.r,
        angleLines: {
          color: 'rgba(255, 255, 255, 0.05)',
          lineWidth: 1,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          circular: true,
          lineWidth: 1,
        },
        pointLabels: {
          color: chartColors.muted,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: 500,
          },
          padding: 16,
        },
        ticks: {
          display: false,
        },
      },
    },
  };

  // Weekly progress from mood logs (group by week)
  const weeklyData = moodLogs.reduce((acc, log) => {
    const date = new Date(log.log_date);
    const weekNum = Math.ceil((date.getDate()) / 7);
    const weekKey = `W${weekNum}`;
    if (!acc[weekKey]) {
      acc[weekKey] = { intensities: [], count: 0 };
    }
    acc[weekKey].intensities.push(log.intensity);
    acc[weekKey].count++;
    return acc;
  }, {} as Record<string, { intensities: number[]; count: number }>);

  const weeklyLabels = Object.keys(weeklyData).slice(0, 4);
  const weeklyLineData = {
    labels: weeklyLabels.length > 0 ? weeklyLabels : ['W1', 'W2', 'W3', 'W4'],
    datasets: [
      {
        label: 'Avg Mood Intensity',
        data: weeklyLabels.length > 0
          ? weeklyLabels.map((week) => {
              const intensities = weeklyData[week].intensities;
              return Math.round(intensities.reduce((a, b) => a + b, 0) / intensities.length * 10);
            })
          : [0, 0, 0, 0],
        borderColor: chartColors.primary,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          if (ctx) {
            return createGradient(ctx, chartColors.primaryRgb, 280);
          }
          return `rgba(${chartColors.primaryRgb}, 0.1)`;
        },
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: chartColors.primary,
        pointHoverBorderWidth: 2,
        borderWidth: 2.5,
      },
    ],
  };

  const weeklyLineOptions = {
    ...lineOptions,
    scales: {
      ...lineOptions.scales,
      y: {
        ...lineOptions.scales.y,
        min: 0,
        max: 100,
      },
    },
  };

  const emotionBarOptions = {
    ...horizontalBarOptions,
    plugins: {
      ...horizontalBarOptions.plugins,
      legend: {
        display: false,
      },
    },
  };

  // Calculate real stats
  const totalEntries = entries.length;
  const profitableEntries = entries.filter((e) => e.outcome === 'profit').length;
  const totalWithOutcome = entries.filter((e) => e.outcome).length;
  const winRate = totalWithOutcome > 0 ? Math.round((profitableEntries / totalWithOutcome) * 100) : 0;

  // Find best emotional state
  const bestEmotion = Object.entries(emotionPerformance)
    .filter(([_, stats]) => stats.total >= 1)
    .sort((a, b) => (b[1].wins / b[1].total) - (a[1].wins / a[1].total))[0];

  // Calculate growth (comparing first half to second half of entries)
  const halfIndex = Math.floor(entries.length / 2);
  const firstHalf = entries.slice(halfIndex);
  const secondHalf = entries.slice(0, halfIndex);
  const firstHalfWinRate = firstHalf.filter((e) => e.outcome === 'profit').length / (firstHalf.filter((e) => e.outcome).length || 1);
  const secondHalfWinRate = secondHalf.filter((e) => e.outcome === 'profit').length / (secondHalf.filter((e) => e.outcome).length || 1);
  const growth = entries.length >= 4 ? Math.round((secondHalfWinRate - firstHalfWinRate) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show empty state if no data
  if (entries.length === 0 && moodLogs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Performance <span className="text-gradient-gold">Insights</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-enhanced analysis of your trading psychology and patterns
          </p>
        </div>

        <Card className="bg-gradient-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Data Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start logging your journal entries and moods to see personalized insights and performance analytics.
            </p>
            <div className="flex gap-4">
              <Link to="/journal">
                <Button className="bg-gradient-gold text-primary-foreground">
                  Create Journal Entry
                </Button>
              </Link>
              <Link to="/mood">
                <Button variant="outline">Log Your Mood</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const insightCards = [
    {
      title: 'Best Trading State',
      value: bestEmotion ? bestEmotion[0].charAt(0).toUpperCase() + bestEmotion[0].slice(1) : 'N/A',
      description: bestEmotion
        ? `You achieve ${Math.round((bestEmotion[1].wins / bestEmotion[1].total) * 100)}% win rate when feeling ${bestEmotion[0]}.`
        : 'Log more trades to see patterns.',
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Total Entries',
      value: totalEntries.toString(),
      description: 'Journal entries recorded for analysis.',
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Win Rate',
      value: `${winRate}%`,
      description: totalWithOutcome > 0 ? `Based on ${totalWithOutcome} trades with outcomes.` : 'No trade outcomes recorded yet.',
      icon: AlertTriangle,
      color: winRate >= 50 ? 'text-success' : 'text-warning',
      bgColor: winRate >= 50 ? 'bg-success/10' : 'bg-warning/10',
    },
    {
      title: 'Growth Trend',
      value: growth >= 0 ? `+${growth}%` : `${growth}%`,
      description: entries.length >= 4 ? 'Comparing recent vs earlier performance.' : 'Need more entries to track growth.',
      icon: Brain,
      color: growth >= 0 ? 'text-success' : 'text-destructive',
      bgColor: growth >= 0 ? 'bg-success/10' : 'bg-destructive/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Performance <span className="text-gradient-gold">Insights</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          AI-enhanced analysis of your trading psychology and patterns
        </p>
      </div>

      {/* Key Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insightCards.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-card border-border h-full">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-lg ${insight.bgColor} flex items-center justify-center mb-3`}>
                  <insight.icon className={`w-5 h-5 ${insight.color}`} />
                </div>
                <p className="text-sm text-muted-foreground">{insight.title}</p>
                <p className="text-lg font-semibold text-foreground mt-1">{insight.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{insight.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion vs Performance */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-xl">Emotion vs Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {Object.keys(emotionPerformance).length > 0 ? (
                <Bar data={emotionBarData} options={emotionBarOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Log trades with outcomes to see emotion performance
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Win rate percentage by emotional state
            </p>
          </CardContent>
        </Card>

        {/* Psychology Radar */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-xl">Psychology Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <Radar data={radarChartData} options={radarChartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-xl">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {moodLogs.length > 0 ? (
              <Line data={weeklyLineData} options={weeklyLineOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Log your moods to track weekly progress
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gradient-gold">{totalEntries}</p>
              <p className="text-sm text-muted-foreground mt-1">Journal Entries</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{winRate}%</p>
              <p className="text-sm text-muted-foreground mt-1">Win Rate</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                {growth >= 0 ? '+' : ''}{growth}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">Growth</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">{reflectionCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Reflections Done</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
