import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Brain, Target, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Radar, Line } from 'react-chartjs-2';
import '@/components/charts/ChartConfig';
import { chartColors, defaultOptions, radarOptions } from '@/components/charts/ChartConfig';

const emotionPerformanceData = [
  { emotion: 'Confident', winRate: 72, avgPL: 180 },
  { emotion: 'Calm', winRate: 68, avgPL: 145 },
  { emotion: 'Focused', winRate: 65, avgPL: 120 },
  { emotion: 'Neutral', winRate: 52, avgPL: 45 },
  { emotion: 'Anxious', winRate: 38, avgPL: -65 },
  { emotion: 'Stressed', winRate: 28, avgPL: -120 },
];

const weeklyProgressData = [
  { week: 'W1', discipline: 65, confidence: 58, patience: 45 },
  { week: 'W2', discipline: 68, confidence: 62, patience: 52 },
  { week: 'W3', discipline: 72, confidence: 70, patience: 58 },
  { week: 'W4', discipline: 78, confidence: 75, patience: 68 },
];

const psychologyRadarData = [
  { trait: 'Discipline', value: 78 },
  { trait: 'Patience', value: 65 },
  { trait: 'Confidence', value: 72 },
  { trait: 'Focus', value: 80 },
  { trait: 'Resilience', value: 58 },
  { trait: 'Adaptability', value: 70 },
];

const insightCards = [
  {
    title: 'Best Trading State',
    value: 'Confident + Calm',
    description: 'You achieve 72% win rate when feeling confident and calm.',
    icon: TrendingUp,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    title: 'Risk Pattern',
    value: 'Morning Sessions',
    description: 'Your risk management is 40% better during morning trading.',
    icon: Target,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Emotional Trigger',
    value: 'Consecutive Losses',
    description: 'After 2+ losses, your confidence drops significantly.',
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    title: 'Growth Area',
    value: 'Resilience',
    description: 'Focus on bouncing back faster from losing trades.',
    icon: Brain,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
];

const aiNarrativeInsights = [
  "You tend to feel anxious before trades but grow more confident after profitable outcomes. Consider implementing a pre-trade routine to start from a calmer state.",
  "Your journal entries show a pattern of improved discipline when you take breaks between trades. The data suggests a 15-minute cooldown period could benefit your decision-making.",
  "Entries tagged with 'FOMO' correlate with 78% of your losing trades. Developing a checklist before entering trades could help combat impulsive decisions.",
];

// Chart.js data for emotion vs performance (horizontal bar)
const emotionBarData = {
  labels: emotionPerformanceData.map((d) => d.emotion),
  datasets: [
    {
      label: 'Win Rate %',
      data: emotionPerformanceData.map((d) => d.winRate),
      backgroundColor: chartColors.primary,
      borderRadius: 4,
    },
  ],
};

const emotionBarOptions = {
  ...defaultOptions,
  indexAxis: 'y' as const,
  plugins: {
    ...defaultOptions.plugins,
    legend: {
      display: false,
    },
  },
};

// Chart.js data for psychology radar
const radarChartData = {
  labels: psychologyRadarData.map((d) => d.trait),
  datasets: [
    {
      label: 'Current',
      data: psychologyRadarData.map((d) => d.value),
      backgroundColor: `${chartColors.primary}4D`,
      borderColor: chartColors.primary,
      borderWidth: 2,
      pointBackgroundColor: chartColors.primary,
      pointRadius: 4,
    },
  ],
};

// Chart.js data for weekly progress
const weeklyLineData = {
  labels: weeklyProgressData.map((d) => d.week),
  datasets: [
    {
      label: 'Discipline',
      data: weeklyProgressData.map((d) => d.discipline),
      borderColor: chartColors.primary,
      backgroundColor: chartColors.primary,
      tension: 0.4,
      pointRadius: 6,
      pointBackgroundColor: chartColors.primary,
    },
    {
      label: 'Confidence',
      data: weeklyProgressData.map((d) => d.confidence),
      borderColor: chartColors.success,
      backgroundColor: chartColors.success,
      tension: 0.4,
      pointRadius: 6,
      pointBackgroundColor: chartColors.success,
    },
    {
      label: 'Patience',
      data: weeklyProgressData.map((d) => d.patience),
      borderColor: chartColors.accent,
      backgroundColor: chartColors.accent,
      tension: 0.4,
      pointRadius: 6,
      pointBackgroundColor: chartColors.accent,
    },
  ],
};

const weeklyLineOptions = {
  ...defaultOptions,
  scales: {
    ...defaultOptions.scales,
    y: {
      ...defaultOptions.scales.y,
      min: 0,
      max: 100,
    },
  },
};

export default function Insights() {
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

      {/* AI Narrative Insights */}
      <Card className="bg-gradient-card border-primary/30 shadow-gold">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiNarrativeInsights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">{index + 1}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{insight}</p>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion vs Performance */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-xl">Emotion vs Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <Bar data={emotionBarData} options={emotionBarOptions} />
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
              <Radar data={radarChartData} options={radarOptions} />
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
            <Line data={weeklyLineData} options={weeklyLineOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gradient-gold">24</p>
              <p className="text-sm text-muted-foreground mt-1">Journal Entries</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">68%</p>
              <p className="text-sm text-muted-foreground mt-1">Avg Win Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">+18%</p>
              <p className="text-sm text-muted-foreground mt-1">Discipline Growth</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">12</p>
              <p className="text-sm text-muted-foreground mt-1">Reflections Done</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
