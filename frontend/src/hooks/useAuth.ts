import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import type { RegisterRequest, LoginRequest, UpdateUserRequest } from '../types/api';

export function useAuth() {
  const { user, isAuthenticated, setUser, setLoading, logout: logoutStore } = useAuthStore();
  const queryClient = useQueryClient();

  // Get current user query
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
    enabled: isAuthenticated && !!localStorage.getItem('token'),
    retry: false,
    staleTime: Infinity,
  });

  // Update user in store when query succeeds
  React.useEffect(() => {
    if (currentUser?.user) {
      setUser(currentUser.user);
    }
  }, [currentUser, setUser]);

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => apiClient.register(data),
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['currentUser'], data);
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
    onSettled: () => setLoading(false),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => apiClient.login(data),
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['currentUser'], data);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
    onSettled: () => setLoading(false),
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => apiClient.updateUser(data),
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['currentUser'], data);
    },
    onError: (error) => {
      console.error('Update failed:', error);
    },
    onSettled: () => setLoading(false),
  });

  // Logout function
  const logout = () => {
    apiClient.logout();
    logoutStore();
    queryClient.removeQueries({ queryKey: ['currentUser'] });
    queryClient.clear();
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoadingUser || registerMutation.isPending || loginMutation.isPending || updateUserMutation.isPending,
    
    // Actions
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    updateUser: updateUserMutation.mutate,
    logout,
    
    // Mutation states
    registerError: registerMutation.error,
    loginError: loginMutation.error,
    updateError: updateUserMutation.error,
    
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isUpdating: updateUserMutation.isPending,
  };
}