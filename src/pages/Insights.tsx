import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Brain, Target, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';

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
  { trait: 'Discipline', value: 78, fullMark: 100 },
  { trait: 'Patience', value: 65, fullMark: 100 },
  { trait: 'Confidence', value: 72, fullMark: 100 },
  { trait: 'Focus', value: 80, fullMark: 100 },
  { trait: 'Resilience', value: 58, fullMark: 100 },
  { trait: 'Adaptability', value: 70, fullMark: 100 },
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

export default function Insights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
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
          <CardTitle className="font-serif text-xl flex items-center gap-2">
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
            <CardTitle className="font-serif text-xl">Emotion vs Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emotionPerformanceData} layout="vertical">
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
                  />
                  <Bar dataKey="winRate" fill="hsl(43, 74%, 52%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Win rate percentage by emotional state
            </p>
          </CardContent>
        </Card>

        {/* Psychology Radar */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Psychology Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={psychologyRadarData}>
                  <PolarGrid stroke="hsl(217, 33%, 20%)" />
                  <PolarAngleAxis
                    dataKey="trait"
                    stroke="hsl(215, 20%, 55%)"
                    fontSize={12}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    stroke="hsl(215, 20%, 55%)"
                    fontSize={10}
                  />
                  <Radar
                    name="Current"
                    dataKey="value"
                    stroke="hsl(43, 74%, 52%)"
                    fill="hsl(43, 74%, 52%)"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyProgressData}>
                <XAxis dataKey="week" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 9%)',
                    border: '1px solid hsl(217, 33%, 20%)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="discipline"
                  stroke="hsl(43, 74%, 52%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(43, 74%, 52%)' }}
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(142, 76%, 36%)' }}
                />
                <Line
                  type="monotone"
                  dataKey="patience"
                  stroke="hsl(199, 89%, 48%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(199, 89%, 48%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
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
