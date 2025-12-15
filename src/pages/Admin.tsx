import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Activity, AlertTriangle, Search, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface UserWithStats {
  id: string;
  email: string | null;
  name: string | null;
  created_at: string;
  journal_count: number;
  last_active: string | null;
  role: string;
}

export default function Admin() {
  const { user } = useAuthContext();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const { data, error } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    } else {
      setIsAdmin(data);
      if (data) {
        loadUsers();
      }
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      toast({ title: 'Failed to load users', variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Get journal counts for each user
    const userStats: UserWithStats[] = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { count } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        const { data: lastEntry } = await supabase
          .from('journal_entries')
          .select('entry_date')
          .eq('user_id', profile.id)
          .order('entry_date', { ascending: false })
          .limit(1)
          .single();

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id)
          .single();

        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          created_at: profile.created_at,
          journal_count: count || 0,
          last_active: lastEntry?.entry_date || null,
          role: roleData?.role || 'user',
        };
      })
    );

    setUsers(userStats);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    // First, remove existing role
    await supabase.from('user_roles').delete().eq('user_id', userId);
    
    // Then add new role
    const { error } = await supabase.from('user_roles').insert({
      user_id: userId,
      role: newRole,
    });

    if (error) {
      toast({ title: 'Failed to update role', variant: 'destructive' });
    } else {
      toast({ title: 'Role updated successfully' });
      loadUsers();
    }
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAdmin === false) {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.last_active).length,
    totalEntries: users.reduce((acc, u) => acc + u.journal_count, 0),
    adminCount: users.filter((u) => u.role === 'admin').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Admin <span className="text-gradient-gold">Dashboard</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage users and monitor platform activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-foreground">{stats.adminCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif text-xl">User Management</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted/50 border-border"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Entries</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Active</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{u.name || 'Unnamed'}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={u.role === 'admin' ? 'default' : u.role === 'moderator' ? 'secondary' : 'outline'}
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-foreground">{u.journal_count}</td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {u.last_active
                          ? new Date(u.last_active).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRoleChange(u.id, 'admin')}>
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(u.id, 'moderator')}>
                              Make Moderator
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(u.id, 'user')}>
                              Make User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
