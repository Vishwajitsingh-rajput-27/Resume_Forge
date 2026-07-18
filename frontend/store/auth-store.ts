import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api, { registerAuthTokenSync } from '@/lib/api-client';
import { useResumeStore } from '@/store/resume-store';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  github?: string;
  portfolioUrl?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  usage?: {
    resumesCreated: number;
    aiGenerations: number;
    coverLettersCreated: number;
    portfoliosCreated: number;
    downloadsCount: number;
  };
}

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User & { _id?: string };
};

const normalizeUser = (user: AuthResponse['user']): User => ({
  ...user,
  id: String(user.id || user._id),
});

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  setTokens: (access: string, refresh: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      },

      clearSession: () => {
        delete api.defaults.headers.common['Authorization'];
        useResumeStore.getState().resetResume();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
          get().setTokens(data.accessToken, data.refreshToken);
          set({ user: normalizeUser(data.user), isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      loginWithGoogle: async (accessToken) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post<AuthResponse>('/auth/google', { accessToken });
          get().setTokens(data.accessToken, data.refreshToken);
          set({ user: normalizeUser(data.user), isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
          get().setTokens(data.accessToken, data.refreshToken);
          set({ user: normalizeUser(data.user), isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        get().clearSession();
      },

      // Refresh the signed-in user's latest account details.
      refreshUser: async () => {
        try {
          const { data } = await api.get('/auth/me');
          if (data.user) {
            set({ user: normalizeUser(data.user), isAuthenticated: true });
          }
        } catch {
          // Token expired — try refresh
          // The API interceptor owns token refresh and session clearing.
          // Transient server/network failures should not sign the user out.
        }
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'resumeai-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user:            state.user,
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

registerAuthTokenSync(({ accessToken, refreshToken }) => {
  if (accessToken && refreshToken) {
    useAuthStore.setState({ accessToken, refreshToken });
    return;
  }

  useAuthStore.getState().clearSession();
});
