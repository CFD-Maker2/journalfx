import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert'];
type MoodLog = Database['public']['Tables']['mood_logs']['Row'];
type MoodLogInsert = Database['public']['Tables']['mood_logs']['Insert'];
type ReflectionResponse = Database['public']['Tables']['reflection_responses']['Row'];
type ReflectionResponseInsert = Database['public']['Tables']['reflection_responses']['Insert'];

// Journal Entries
export async function getJournalEntries() {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('entry_date', { ascending: false });
  
  return { data, error };
}

export async function createJournalEntry(entry: Omit<JournalEntryInsert, 'user_id'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('journal_entries')
    .insert({ ...entry, user_id: user.id })
    .select()
    .single();
  
  return { data, error };
}

export async function updateJournalEntry(id: string, updates: Partial<JournalEntry>) {
  const { data, error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteJournalEntry(id: string) {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Mood Logs
export async function getMoodLogs() {
  const { data, error } = await supabase
    .from('mood_logs')
    .select('*')
    .order('log_date', { ascending: false });
  
  return { data, error };
}

export async function createMoodLog(log: Omit<MoodLogInsert, 'user_id'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('mood_logs')
    .insert({ ...log, user_id: user.id })
    .select()
    .single();
  
  return { data, error };
}

export async function deleteMoodLog(id: string) {
  const { error } = await supabase
    .from('mood_logs')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Reflection Responses
export async function getReflectionResponses() {
  const { data, error } = await supabase
    .from('reflection_responses')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function createReflectionResponse(response: Omit<ReflectionResponseInsert, 'user_id'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('reflection_responses')
    .insert({ ...response, user_id: user.id })
    .select()
    .single();
  
  return { data, error };
}

// Stats
export async function getJournalStats() {
  const { data: entries } = await getJournalEntries();
  const { data: moodLogs } = await getMoodLogs();
  const { data: reflections } = await getReflectionResponses();

  const totalEntries = entries?.length || 0;
  const totalMoodLogs = moodLogs?.length || 0;
  const totalReflections = reflections?.length || 0;

  // Calculate average confidence
  const avgConfidence = entries?.length
    ? entries.reduce((sum, e) => sum + e.confidence_level, 0) / entries.length
    : 0;

  // Calculate win rate
  const profitableEntries = entries?.filter(e => e.outcome === 'profit').length || 0;
  const totalWithOutcome = entries?.filter(e => e.outcome).length || 0;
  const winRate = totalWithOutcome ? (profitableEntries / totalWithOutcome) * 100 : 0;

  return {
    totalEntries,
    totalMoodLogs,
    totalReflections,
    avgConfidence: avgConfidence.toFixed(1),
    winRate: winRate.toFixed(0),
  };
}
