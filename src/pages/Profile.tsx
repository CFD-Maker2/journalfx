import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Edit, Save, TrendingUp, BookOpen, Heart, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useJournalStore } from '@/stores/journalStore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function Profile() {
  const { user, entries, moodLogs } = useJournalStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const { toast } = useToast();

  const stats = [
    {
      label: 'Journal Entries',
      value: entries.length || 24,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Mood Logs',
      value: moodLogs.length || 48,
      icon: Heart,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Day Streak',
      value: 7,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Reflections',
      value: 12,
      icon: Shield,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  const handleSave = () => {
    toast({
      title: 'Profile updated!',
      description: 'Your changes have been saved.',
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Your <span className="text-gradient-gold">Profile</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and view your progress
        </p>
      </div>

      {/* Profile Card */}
      <Card className="bg-gradient-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                {user?.name?.charAt(0) || 'T'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-muted border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-muted border-border"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="gold" onClick={handleSave}>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-serif font-bold text-foreground">
                    {user?.name || 'Trader'}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 mt-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user?.email || 'trader@example.com'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Joined {format(user?.createdAt || new Date(), 'MMMM yyyy')}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-card border-border">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Logged mood', detail: 'Feeling confident', time: '2 hours ago' },
              { action: 'Created journal entry', detail: 'EURUSD swing trade', time: '5 hours ago' },
              { action: 'Completed reflection', detail: 'Risk management prompt', time: '1 day ago' },
              { action: 'Logged mood', detail: 'Feeling calm', time: '1 day ago' },
              { action: 'Created journal entry', detail: 'GBPUSD day trade', time: '2 days ago' },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive daily reflection reminders</p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Export Data</p>
              <p className="text-xs text-muted-foreground">Download all your journal entries</p>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-destructive">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently remove your account</p>
            </div>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
