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
import { useJournalStore } from '@/stores/journalStore';
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

const mockMoodData = [
  { day: 'Mon', confidence: 4, stress: 2 },
  { day: 'Tue', confidence: 3, stress: 3 },
  { day: 'Wed', confidence: 5, stress: 1 },
  { day: 'Thu', confidence: 4, stress: 2 },
  { day: 'Fri', confidence: 3, stress: 4 },
  { day: 'Sat', confidence: 4, stress: 2 },
  { day: 'Sun', confidence: 5, stress: 1 },
];

const mockEmotionData = [
  { name: 'Confident', value: 35, color: 'hsl(142, 76%, 36%)' },
  { name: 'Calm', value: 25, color: 'hsl(199, 89%, 48%)' },
  { name: 'Anxious', value: 20, color: 'hsl(38, 92%, 50%)' },
  { name: 'Focused', value: 15, color: 'hsl(43, 74%, 52%)' },
  { name: 'Stressed', value: 5, color: 'hsl(0, 72%, 51%)' },
];

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
  const { user, entries } = useJournalStore();

  const stats = [
    {
      label: 'Total Entries',
      value: entries.length || 12,
      icon: BookOpen,
      change: '+3 this week',
      positive: true,
    },
    {
      label: 'Avg Confidence',
      value: '4.2',
      icon: TrendingUp,
      change: '+0.5 vs last week',
      positive: true,
    },
    {
      label: 'Mood Score',
      value: '78%',
      icon: Heart,
      change: 'Positive trend',
      positive: true,
    },
    {
      label: 'Reflections',
      value: '8',
      icon: Brain,
      change: '2 pending',
      positive: false,
    },
  ];

  const recentPrompts = [
    'What triggered your confidence today?',
    'How did you handle stress during volatility?',
    'What would you do differently next time?',
  ];

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
            Welcome back, <span className="text-gradient-gold">{user?.name || 'Trader'}</span>
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
        {stats.map((stat, index) => (
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
                  <AreaChart data={mockMoodData}>
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
                      data={mockEmotionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {mockEmotionData.map((entry, index) => (
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
                {mockEmotionData.slice(0, 3).map((emotion) => (
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
                  <span className="text-sm font-medium text-foreground">Streak: 7 days</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  You've been consistently journaling. Keep it up!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
