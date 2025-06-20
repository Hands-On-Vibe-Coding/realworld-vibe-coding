import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse } from '@/types';
import { api } from '@/lib/api';
import { notifications } from '@mantine/notifications';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: UserResponse, token: string) => void;
  logout: () => void;
  updateUser: (user: UserResponse) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user: UserResponse, token: string) => {
        api.setToken(token);
        
        // Set up token expiration callback
        api.setTokenExpiredCallback(() => {
          get().logout();
        });
        
        set({
          user,
          token,
          isAuthenticated: true,
        });
        
        notifications.show({
          title: 'Welcome back!',
          message: `Hello ${user.username}! You have successfully logged in.`,
          color: 'green',
        });
      },

      logout: () => {
        const currentUser = get().user;
        api.setToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        
        notifications.show({
          title: 'Logged out',
          message: currentUser ? `Goodbye ${currentUser.username}!` : 'You have been logged out.',
          color: 'blue',
        });
      },

      updateUser: (user: UserResponse) => {
        set({ user });
        
        notifications.show({
          title: 'Profile updated',
          message: 'Your profile has been successfully updated.',
          color: 'green',
        });
      },

      setToken: (token: string | null) => {
        api.setToken(token);
        set({
          token,
          isAuthenticated: !!token,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initialize: async () => {
        const { token, logout } = get();
        if (!token) return;

        // Set up token expiration callback
        api.setTokenExpiredCallback(() => {
          logout();
        });

        try {
          set({ isLoading: true });
          const response = await api.getCurrentUser();
          set({
            user: response.user,
            isAuthenticated: true,
          });
        } catch (error) {
          // If token is invalid, clear auth state
          console.error('Failed to initialize auth:', error);
          logout();
        } finally {
          set({ isLoading: false });
        }
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
          // Set up token expiration callback after rehydration
          api.setTokenExpiredCallback(() => {
            state.logout();
          });
        }
      },
    }
  )
);