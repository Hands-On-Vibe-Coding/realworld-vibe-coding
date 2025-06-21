import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useComments(slug: string) {
  return useQuery({
    queryKey: ['comments', slug],
    queryFn: () => api.getComments(slug),
    select: (data) => data.comments,
  });
}