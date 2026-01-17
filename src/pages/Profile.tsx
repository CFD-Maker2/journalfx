import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Edit, Save, TrendingUp, BookOpen, Heart, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthContext } from '@/contexts/AuthContext';
import { getJournalStats } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns'

export default function Profile() {
  
  const { user, profile, updateProfile } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalMoodLogs: 0,
    totalReflections: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setName(profile?.name || '');
  }, [profile]);

  useEffect(() => {
    async function loadStats() {
      try {
        const result = await getJournalStats();
        setStats({
          totalEntries: result.totalEntries,
          totalMoodLogs: result.totalMoodLogs,
          totalReflections: result.totalReflections,
        });
      } catch (error) {
        console.error('Failed to load profile stats:', error);
        setStats({
          totalEntries: 0,
          totalMoodLogs: 0,
          totalReflections: 0,
        });
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    {
      label: 'Journal Entries',
      value: stats.totalEntries,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Mood Logs',
      value: stats.totalMoodLogs,
      icon: Heart,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Reflections',
      value: stats.totalReflections,
      icon: Shield,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Days Active',
      value: user?.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 1,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  const handleSave = async () => {
    const { error } = await updateProfile({ name });
    
    if (error) {
      toast({
        title: 'Failed to update profile',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profile updated!',
        description: 'Your changes have been saved.',
      });
      setIsEditing(false);
    }
  };

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Trader';
  const displayEmail = profile?.email || user?.email || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">
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
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                {displayName.charAt(0).toUpperCase()}
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
                  <h2 className="text-2xl font-bold text-foreground">
                    {displayName}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 mt-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {displayEmail}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Joined {user?.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : 'Recently'}
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
        {statCards.map((stat, index) => (
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

      {/* Account Info */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-xl">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Email Address</p>
              <p className="text-xs text-muted-foreground">{displayEmail}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Account Created</p>
              <p className="text-xs text-muted-foreground">
                {user?.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'Unknown'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Account Status</p>
              <p className="text-xs text-success">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
