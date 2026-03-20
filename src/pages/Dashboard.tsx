import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  TrendingUp,
  Heart,
  Brain,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { getJournalEntries, getMoodLogs, getJournalStats } from '@/lib/api';
import { EMOTIONS } from '@/types/journal';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import type { TooltipItem } from 'chart.js';
import '@/components/charts/ChartConfig';
import { chartColors, defaultOptions, pieOptions } from '@/components/charts/ChartConfig';
import { format, subDays } from 'date-fns';
import { AISummary } from '@/components/dashboard/AISummary';
import { EmotionPerformanceChart } from '@/components/dashboard/EmotionPerformanceChart';
import { WeekComparison } from '@/components/dashboard/WeekComparison';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { profile, user } = useAuthContext();
  const [stats, setStats] = useState({
    totalEntries: 0,
    avgConfidence: '0',
    winRate: '0',
    totalReflections: 0,
  });
  const [moodData, setMoodData] = useState<{ day: string; confidence: number; stress: number }[]>([]);
  const [emotionData, setEmotionData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsResult, entriesResult, moodLogsResult] = await Promise.all([
          getJournalStats(),
          getJournalEntries(),
          getMoodLogs(),
        ]);

        // Check for API errors and throw them
        if (entriesResult.error) throw entriesResult.error;
        if (moodLogsResult.error) throw moodLogsResult.error;

        setStats({
          totalEntries: statsResult.totalEntries,
          avgConfidence: statsResult.avgConfidence,
          winRate: statsResult.winRate,
          totalReflections: statsResult.totalReflections,
        });

        // Calculate mood trend for last 7 days from mood logs.
        const confidenceEmotions = new Set(['confident', 'focused', 'calm', 'excited']);
        const stressEmotions = new Set(['stressed', 'anxious', 'frustrated', 'fearful']);

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          return {
            day: format(date, 'EEE'),
            date: format(date, 'yyyy-MM-dd'),
            confidenceValues: [] as number[],
            stressValues: [] as number[],
          };
        });

        if (moodLogsResult.data) {
          moodLogsResult.data.forEach((log) => {
            const logDate = format(new Date(log.log_date), 'yyyy-MM-dd');
            const dayData = last7Days.find((d) => d.date === logDate);
            if (!dayData) {
              return;
            }

            const intensity = Number(log.intensity) || 3;

            if (confidenceEmotions.has(log.emotion)) {
              dayData.confidenceValues.push(intensity);
            }

            if (stressEmotions.has(log.emotion)) {
              dayData.stressValues.push(intensity);
            }
          });
        }

        const averageOrFallback = (values: number[], fallback: number) => {
          if (values.length === 0) return fallback;
          const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
          return Number(avg.toFixed(1));
        };

        setMoodData(
          last7Days.map(({ day, confidenceValues, stressValues }) => ({
            day,
            confidence: averageOrFallback(confidenceValues, 3),
            stress: averageOrFallback(stressValues, 2),
          })),
        );

        // Calculate emotion distribution
        const emotionCounts: Record<string, number> = {};
        if (entriesResult.data) {
          entriesResult.data.forEach((entry) => {
            emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
          });
        }

        const emotionDistribution = EMOTIONS.map((e) => ({
          name: e.label,
          value: emotionCounts[e.value] || 0,
          color: e.color,
        })).filter((e) => e.value > 0);

        setEmotionData(
          emotionDistribution.length > 0
            ? emotionDistribution
            : [{ name: 'No data', value: 1, color: 'hsl(217, 33%, 45%)' }]
        );
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Set default values on error
        setStats({
          totalEntries: 0,
          avgConfidence: '0',
          winRate: '0',
          totalReflections: 0,
        });
        setMoodData([]);
        setEmotionData([{ name: 'No data', value: 1, color: 'hsl(217, 33%, 45%)' }]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Trader';

  const statCards = [
    {
      label: 'Total Entries',
      value: stats.totalEntries,
      icon: BookOpen,
      change: 'Keep journaling!',
      positive: true,
    },
    {
      label: 'Avg Confidence',
      value: stats.avgConfidence,
      icon: TrendingUp,
      change: 'Out of 5',
      positive: parseFloat(stats.avgConfidence) >= 3,
    },
    {
      label: 'Win Rate',
      value: `${stats.winRate}%`,
      icon: Heart,
      change: 'Based on outcomes',
      positive: parseFloat(stats.winRate) >= 50,
    },
    {
      label: 'Reflections',
      value: stats.totalReflections,
      icon: Brain,
      change: 'Completed',
      positive: true,
    },
  ];

  const recentPrompts = [
    'What triggered your confidence today?',
    'How did you handle stress during volatility?',
    'What would you do differently next time?',
  ];

  // Helper function for tooltip labels
  const getIntensityLabel = (value: number): string => {
    const labels: Record<number, string> = {
      0: 'Very Low',
      1: 'Low',
      2: 'Low-Moderate',
      3: 'Moderate',
      4: 'High',
      5: 'Very High',
    };
    return labels[Math.round(value)] || 'Moderate';
  };

  // Chart.js data for mood trend - Enhanced for beginners
  const moodChartData = {
    labels: moodData.map((d) => d.day),
    datasets: [
      {
        label: 'Confidence',
        data: moodData.map((d) => d.confidence),
        borderColor: chartColors.primary,
        backgroundColor: 'transparent',
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 6,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: chartColors.primary,
        pointHoverBorderWidth: 3,
      },
      {
        label: 'Stress',
        data: moodData.map((d) => d.stress),
        borderColor: chartColors.destructive,
        backgroundColor: 'transparent',
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 6,
        pointBackgroundColor: chartColors.destructive,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: chartColors.destructive,
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const moodChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart' as const,
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: chartColors.muted,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: 500,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        titleColor: '#fff',
        titleFont: {
          size: 13,
          weight: 600,
          family: "'Inter', sans-serif",
        },
        bodyColor: '#94a3b8',
        bodyFont: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        padding: 14,
        cornerRadius: 10,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            const value = Number(context.parsed.y ?? 0);
            const label = context.dataset.label;
            const intensityLabel = getIntensityLabel(value);
            return `${label}: ${value} (${intensityLabel})`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: chartColors.muted,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: 500,
          },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        min: 0,
        max: 5,
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
          drawBorder: false,
        },
        ticks: {
          color: chartColors.muted,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          },
          padding: 12,
          stepSize: 1,
          callback: function(value: number | string) {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (numValue === 0) return '0 (Very Low)';
            if (numValue === 5) return '5 (Very High)';
            return numValue.toString();
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  // Chart.js data for emotion distribution
  const emotionChartData = {
    labels: emotionData.map((d) => d.name),
    datasets: [
      {
        data: emotionData.map((d) => d.value),
        backgroundColor: emotionData.map((d) => d.color),
        borderColor: emotionData.map((d) => d.color),
        borderWidth: 1,
      },
    ],
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, <span className="text-gradient-gold">{displayName}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your psychological overview for today
          </p>
        </div>
        <Link to="/journal">
          <Button variant="gold" size="lg">
            <BookOpen className="w-5 h-5" />
            New Entry
          </Button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.positive ? (
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-warning" />
                      )}
                      <span className={`text-xs ${stat.positive ? 'text-success' : 'text-warning'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Trend Chart - Enhanced for Beginners */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-gradient-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Weekly Mood Trend</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Tracks your emotional state during trading across the week
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <Line data={moodChartData} options={moodChartOptions} />
              </div>
              {/* Scale explanation for beginners */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted"></span>
                    0 = Very Low
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                    2-3 = Moderate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    5 = Very High
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emotion Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-xl">Emotion Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <Doughnut data={emotionChartData} options={pieOptions} />
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {emotionData.slice(0, 3).map((emotion) => (
                  <div key={emotion.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: emotion.color }}
                    ></div>
                    <span className="text-xs text-muted-foreground">{emotion.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Week & Day Comparison */}
      <motion.div variants={itemVariants}>
        <WeekComparison />
      </motion.div>

      {/* AI Summary Section */}
      <motion.div variants={itemVariants}>
        <AISummary />
      </motion.div>

      {/* Emotion-Performance Chart */}
      <motion.div variants={itemVariants}>
        <EmotionPerformanceChart />
      </motion.div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reflection Prompts */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Today's Reflections</CardTitle>
              <Link to="/reflections">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPrompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-4 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <p className="text-sm text-foreground">{prompt}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Mood Check */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-xl">Quick Mood Check</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                How are you feeling right now?
              </p>
              <div className="grid grid-cols-5 gap-2">
                {EMOTIONS.slice(0, 5).map((emotion) => (
                  <Link key={emotion.value} to="/mood">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full aspect-square rounded-xl bg-muted/50 border border-border/50 hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors"
                    >
                      <span className="text-2xl">{emotion.emoji}</span>
                      <span className="text-xs text-muted-foreground">{emotion.label}</span>
                    </motion.button>
                  </Link>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Keep it up!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Regular journaling builds self-awareness and discipline.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
