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
    (set, get) => {
      // Set up token expiration callback once when store is created
      api.setTokenExpiredCallback(() => {
        get().logout();
      });

      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,

        login: (user: UserResponse, token: string) => {
          console.log('🔐 AuthStore login called:', { 
            username: user.username, 
            email: user.email,
            tokenLength: token.length 
          });
          
          api.setToken(token);
          console.log('🔑 Token set in API client');
          
          set({
            user,
            token,
            isAuthenticated: true,
          });
          console.log('💾 Auth state updated in store');
          
          notifications.show({
            title: 'Welcome back!',
            message: `Hello ${user.username}! You have successfully logged in.`,
            color: 'green',
          });
          console.log('🎉 Login success notification shown');
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
          const state = get();
          if (!state.token) return;

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
            get().logout();
          } finally {
            set({ isLoading: false });
          }
        },
      };
    },
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Auth store rehydrating from localStorage:', {
          hasToken: !!state?.token,
          hasUser: !!state?.user,
          isAuthenticated: state?.isAuthenticated
        });
        
        if (state?.token) {
          api.setToken(state.token);
          console.log('🔑 Token restored to API client');
        }
      },
    }
  )
);