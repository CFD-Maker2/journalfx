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
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { AISummary } from '@/components/dashboard/AISummary';
import { EmotionPerformanceChart } from '@/components/dashboard/EmotionPerformanceChart';

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
      const [statsResult, entriesResult, moodLogsResult] = await Promise.all([
        getJournalStats(),
        getJournalEntries(),
        getMoodLogs(),
      ]);

      setStats({
        totalEntries: statsResult.totalEntries,
        avgConfidence: statsResult.avgConfidence,
        winRate: statsResult.winRate,
        totalReflections: statsResult.totalReflections,
      });

      // Calculate mood trend for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          day: format(date, 'EEE'),
          date: format(date, 'yyyy-MM-dd'),
          confidence: 3,
          stress: 2,
        };
      });

      if (entriesResult.data) {
        entriesResult.data.forEach((entry) => {
          const entryDate = format(new Date(entry.entry_date), 'yyyy-MM-dd');
          const dayData = last7Days.find((d) => d.date === entryDate);
          if (dayData) {
            dayData.confidence = entry.confidence_level;
            const stressEmotions = ['stressed', 'anxious', 'frustrated', 'fearful'];
            dayData.stress = stressEmotions.includes(entry.emotion) ? entry.emotion_intensity : 1;
          }
        });
      }

      setMoodData(last7Days.map(({ day, confidence, stress }) => ({ day, confidence, stress })));

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

      setLoading(false);
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
          <h1 className="text-3xl font-serif font-bold text-foreground">
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
        {/* Mood Trend Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Weekly Mood Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moodData}>
                    <defs>
                      <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(43, 74%, 52%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(43, 74%, 52%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      stroke="hsl(215, 20%, 55%)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(215, 20%, 55%)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 5]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222, 47%, 9%)',
                        border: '1px solid hsl(217, 33%, 20%)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="confidence"
                      stroke="hsl(43, 74%, 52%)"
                      fillOpacity={1}
                      fill="url(#colorConfidence)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="stress"
                      stroke="hsl(0, 72%, 51%)"
                      fillOpacity={1}
                      fill="url(#colorStress)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">Confidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span className="text-sm text-muted-foreground">Stress</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emotion Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-card border-border h-full">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Emotion Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emotionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {emotionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222, 47%, 9%)',
                        border: '1px solid hsl(217, 33%, 20%)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
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
              <CardTitle className="font-serif text-xl">Today's Reflections</CardTitle>
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
              <CardTitle className="font-serif text-xl">Quick Mood Check</CardTitle>
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
