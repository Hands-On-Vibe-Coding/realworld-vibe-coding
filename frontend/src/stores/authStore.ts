import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (user: UserResponse, token: string) => void;
  logout: () => void;
  updateUser: (user: UserResponse) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user: UserResponse, token: string) => {
        api.setToken(token);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        api.setToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (user: UserResponse) => {
        set({ user });
      },

      setToken: (token: string | null) => {
        api.setToken(token);
        set({
          token,
          isAuthenticated: !!token,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.setToken(state.token);
        }
      },
    }
  )
);