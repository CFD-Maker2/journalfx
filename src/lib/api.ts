const API_BASE_URL = 'http://localhost:5000/api';

type JournalEntry = any;
type JournalEntryInsert = any;
type MoodLog = any;
type MoodLogInsert = any;
type ReflectionResponse = any;
type ReflectionResponseInsert = any;

// Journal Entries
export async function getJournalEntries() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/journal`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return { data: null, error: new Error('Failed to fetch journal entries') };
  }
  const data = await response.json();
  return { data: data.entries || [], error: null };
}

export async function createJournalEntry(entry: Omit<JournalEntryInsert, 'user_id'>) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/journal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(entry),
  });
  if (!response.ok) {
    return { data: null, error: new Error('Failed to create journal entry') };
  }
  const data = await response.json();
  return { data, error: null };
}

export async function updateJournalEntry(id: string, updates: Partial<JournalEntry>) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/journal/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    return { data: null, error: new Error('Failed to update journal entry') };
  }
  const data = await response.json();
  return { data, error: null };
}

export async function deleteJournalEntry(id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/journal/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return { error: new Error('Failed to delete journal entry') };
  }
  return { error: null };
}

// Mood Logs
export async function getMoodLogs() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/mood`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return { data: null, error: new Error('Failed to fetch mood logs') };
  }
  const data = await response.json();
  return { data, error: null };
}

export async function createMoodLog(log: Omit<MoodLogInsert, 'user_id'>) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/mood`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(log),
  });
  if (!response.ok) {
    return { data: null, error: new Error('Failed to create mood log') };
  }
  const data = await response.json();
  return { data, error: null };
}

export async function deleteMoodLog(id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/mood/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return { error: new Error('Failed to delete mood log') };
  }
  return { error: null };
}

// Reflection Responses
export async function getReflectionResponses() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/reflection`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return { data: null, error: new Error('Failed to fetch reflection responses') };
  }
  const data = await response.json();
  return { data, error: null };
}

export async function createReflectionResponse(response: Omit<ReflectionResponseInsert, 'user_id'>) {
  const token = localStorage.getItem('token');
  const responseFetch = await fetch(`${API_BASE_URL}/reflection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(response),
  });
  if (!responseFetch.ok) {
    return { data: null, error: new Error('Failed to create reflection response') };
  }
  const data = await responseFetch.json();
  return { data, error: null };
}

// Stats
export async function getJournalStats() {
  try {
    const [entriesRes, moodLogsRes, reflectionsRes] = await Promise.all([
      getJournalEntries(),
      getMoodLogs(),
      getReflectionResponses(),
    ]);

    const entries = entriesRes.data || [];
    const moodLogs = moodLogsRes.data || [];
    const reflections = reflectionsRes.data || [];

    const totalEntries = entries.length;
    const totalMoodLogs = moodLogs.length;
    const totalReflections = reflections.length;

    // Calculate average confidence
    const avgConfidence = entries.length
      ? entries.reduce((sum, e) => sum + e.confidence_level, 0) / entries.length
      : 0;

    // Calculate win rate
    const profitableEntries = entries.filter(e => e.outcome === 'profit').length;
    const totalWithOutcome = entries.filter(e => e.outcome).length;
    const winRate = totalWithOutcome ? (profitableEntries / totalWithOutcome) * 100 : 0;

    return {
      totalEntries,
      totalMoodLogs,
      totalReflections,
      avgConfidence: avgConfidence.toFixed(1),
      winRate: winRate.toFixed(0),
    };
  } catch (error) {
    console.error('Failed to get journal stats:', error);
    return {
      totalEntries: 0,
      totalMoodLogs: 0,
      totalReflections: 0,
      avgConfidence: '0',
      winRate: '0',
    };
  }
}
