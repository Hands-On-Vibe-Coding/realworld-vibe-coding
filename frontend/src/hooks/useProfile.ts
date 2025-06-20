import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export function useProfile(username: string) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => apiClient.getProfile(username),
    enabled: !!username,
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (username: string) => apiClient.followUser(username),
    onSuccess: (data) => {
      // Update the profile query cache
      queryClient.setQueryData(['profile', data.profile.username], data);
      // Invalidate articles queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (username: string) => apiClient.unfollowUser(username),
    onSuccess: (data) => {
      // Update the profile query cache
      queryClient.setQueryData(['profile', data.profile.username], data);
      // Invalidate articles queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}