import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Brain, Target, AlertTriangle, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Radar, Line } from 'react-chartjs-2';
import type { ScriptableContext } from 'chart.js';
import '@/components/charts/ChartConfig';
import { chartColors, radarOptions, lineOptions, horizontalBarOptions, createGradient } from '@/components/charts/ChartConfig';
import { getJournalEntries, getMoodLogs, getReflectionResponses } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAI, type SummaryResult } from '@/hooks/useAI';
import { format, startOfWeek } from 'date-fns';

export default function Insights() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [reflectionCount, setReflectionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<SummaryResult | null>(null);
  const { loading: aiLoading, error: aiError, generateSummary } = useAI();

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

  const handleGenerateAiSummary = async () => {
    if (entries.length < 3) {
      return;
    }

    const result = await generateSummary(entries.slice(0, 30));
    if (result) {
      setAiSummary(result);
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

  // Weekly progress from mood logs using calendar week starts to avoid cross-month collisions.
  const weeklyData = moodLogs.reduce((acc, log) => {
    const weekStart = startOfWeek(new Date(log.log_date), { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');

    if (!acc[weekKey]) {
      acc[weekKey] = {
        label: format(weekStart, 'MMM d'),
        intensities: [],
      };
    }

    acc[weekKey].intensities.push(Number(log.intensity) || 0);
    return acc;
  }, {} as Record<string, { label: string; intensities: number[] }>);

  const weeklyKeys = Object.keys(weeklyData)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-4);

  const weeklyLabels = weeklyKeys.length > 0
    ? weeklyKeys.map((key) => weeklyData[key].label)
    : ['W1', 'W2', 'W3', 'W4'];

  const weeklyLineData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'Avg Mood Intensity',
        data: weeklyKeys.length > 0
          ? weeklyKeys.map((weekKey) => {
              const intensities = weeklyData[weekKey].intensities;
              return Math.round(intensities.reduce((a, b) => a + b, 0) / intensities.length * 10);
            })
          : [0, 0, 0, 0],
        borderColor: chartColors.primary,
        backgroundColor: (context: ScriptableContext<'line'>) => {
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

      {/* Gemini Summary */}
      {entries.length >= 3 && (
        <Card className="bg-gradient-card border-primary/30 shadow-gold">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Gemini Insight Summary
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleGenerateAiSummary} disabled={aiLoading}>
              <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {!aiSummary ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm mb-4">
                  Generate an AI summary based on your journal, mood logs, and reflections.
                </p>
                <Button variant="gold" onClick={handleGenerateAiSummary} disabled={aiLoading}>
                  {aiLoading ? 'Analyzing...' : 'Generate AI Summary'}
                </Button>
                {aiError && <p className="text-destructive text-sm mt-2">{aiError}</p>}
              </div>
            ) : (
              <>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">{aiSummary.narrative}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Key Insights</h4>
                    <ul className="space-y-2">
                      {aiSummary.keyInsights.map((insight, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {aiSummary.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-success">•</span>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-medium text-foreground mb-1">Emotion-Performance Link</h4>
                  <p className="text-sm text-muted-foreground">{aiSummary.emotionPerformanceLink}</p>
                </div>

                {aiError && <p className="text-destructive text-sm">{aiError}</p>}
              </>
            )}
          </CardContent>
        </Card>
      )}

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
