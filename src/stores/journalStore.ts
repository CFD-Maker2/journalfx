import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JournalEntry, MoodLog, User } from '@/types/journal';

interface JournalState {
  user: User | null;
  entries: JournalEntry[];
  moodLogs: MoodLog[];
  isAuthenticated: boolean;
  
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  
  // Entry actions
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  updateEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  
  // Mood actions
  addMoodLog: (log: Omit<MoodLog, 'id'>) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      user: null,
      entries: [],
      moodLogs: [],
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Simulate login - in production, this would call an API
        if (email && password.length >= 6) {
          set({
            isAuthenticated: true,
            user: {
              id: '1',
              email,
              name: email.split('@')[0],
              createdAt: new Date(),
            },
          });
          return true;
        }
        return false;
      },

      register: async (email: string, password: string, name: string) => {
        if (email && password.length >= 6 && name) {
          set({
            isAuthenticated: true,
            user: {
              id: '1',
              email,
              name,
              createdAt: new Date(),
            },
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false, user: null });
      },

      addEntry: (entry) => {
        const newEntry: JournalEntry = {
          ...entry,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        set((state) => ({ entries: [newEntry, ...state.entries] }));
      },

      updateEntry: (id, updatedEntry) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updatedEntry } : entry
          ),
        }));
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },

      addMoodLog: (log) => {
        const newLog: MoodLog = {
          ...log,
          id: crypto.randomUUID(),
        };
        set((state) => ({ moodLogs: [newLog, ...state.moodLogs] }));
      },
    }),
    {
      name: 'trader-journal-storage',
    }
  )
);
