import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProfile(username: string) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.getProfile(username),
    select: (data) => data.profile,
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => api.followUser(username),
    onSuccess: (data) => {
      const profile = data.profile;
      queryClient.setQueryData(['profile', profile.username], data);
      queryClient.invalidateQueries({ queryKey: ['profile', profile.username] });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => api.unfollowUser(username),
    onSuccess: (data) => {
      const profile = data.profile;
      queryClient.setQueryData(['profile', profile.username], data);
      queryClient.invalidateQueries({ queryKey: ['profile', profile.username] });
    },
  });
}