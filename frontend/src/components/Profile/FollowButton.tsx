import { Button } from '@mantine/core';
import { IconUserMinus, IconUserPlus } from '@tabler/icons-react';
import type { Profile } from '@/types';
import { useFollowUser, useUnfollowUser } from '@/hooks';
import { useAuthStore } from '@/stores/auth';

interface FollowButtonProps {
  profile: Profile;
}

export function FollowButton({ profile }: FollowButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  if (!isAuthenticated) {
    return null;
  }

  const handleClick = () => {
    if (profile.following) {
      unfollowUser.mutate(profile.username);
    } else {
      followUser.mutate(profile.username);
    }
  };

  const isLoading = followUser.isPending || unfollowUser.isPending;

  return (
    <Button
      variant={profile.following ? 'filled' : 'outline'}
      color={profile.following ? 'gray' : 'blue'}
      onClick={handleClick}
      loading={isLoading}
      leftSection={
        profile.following ? (
          <IconUserMinus size={16} />
        ) : (
          <IconUserPlus size={16} />
        )
      }
    >
      {profile.following ? 'Unfollow' : 'Follow'} {profile.username}
    </Button>
  );
}