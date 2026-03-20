import { useState, useEffect, useCallback } from 'react';
import { clearAuthToken, getAuthToken, setAuthToken } from '@/lib/authToken';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface User {
  id: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000/api';
  const AUTH_REQUEST_TIMEOUT_MS = 4000;

  const readJsonSafe = useCallback(async (response: Response) => {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }, []);

  const extractApiErrorMessage = useCallback((payload: unknown, fallback: string) => {
    if (!payload || typeof payload !== 'object') {
      return fallback;
    }

    const data = payload as {
      error?: unknown;
      message?: unknown;
      errors?: Array<{ msg?: unknown; message?: unknown }>;
    };

    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }

    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      if (typeof first?.msg === 'string' && first.msg.trim()) {
        return first.msg;
      }
      if (typeof first?.message === 'string' && first.message.trim()) {
        return first.message;
      }
    }

    return fallback;
  }, []);

  const fetchWithTimeout = useCallback(async (url: string, init?: RequestInit) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);

    try {
      return await fetch(url, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setUser({ id: data.id, email: data.email });
        return;
      }

      // Remove stale/invalid sessions so login page can render immediately.
      clearAuthToken();
      setUser(null);
      setProfile(null);
    } catch {
      clearAuthToken();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [fetchWithTimeout]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await readJsonSafe(response);

      if (response.ok) {
        const data = payload as { token: string; user: { id: string; email: string } };
        setAuthToken(data.token);
        setUser({ id: data.user.id, email: data.user.email });
        fetchProfile();
        return { error: null };
      }

      return {
        error: new Error(extractApiErrorMessage(payload, 'Login failed. Please try again.')),
      };
    } catch {
      return {
        error: new Error('Unable to connect to the server. Please try again.'),
      };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const payload = await readJsonSafe(response);

      if (response.ok) {
        const data = payload as { token: string; user: { id: string; email: string } };
        setAuthToken(data.token);
        setUser({ id: data.user.id, email: data.user.email });
        fetchProfile();
        return { error: null };
      }

      return {
        error: new Error(extractApiErrorMessage(payload, 'Registration failed. Please try again.')),
      };
    } catch {
      return {
        error: new Error('Unable to connect to the server. Please try again.'),
      };
    }
  };

  const signOut = async () => {
    clearAuthToken();
    setUser(null);
    setProfile(null);
    return { error: null };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    const token = getAuthToken();

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const payload = await readJsonSafe(response);

      if (response.ok) {
        setProfile(payload as Profile);
        return { error: null };
      }

      return {
        error: new Error(extractApiErrorMessage(payload, 'Failed to update profile.')),
      };
    } catch {
      return {
        error: new Error('Unable to connect to the server. Please try again.'),
      };
    }
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };
}
