import { Avatar, Button, Paper, Stack, Text, Title } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import type { Profile } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { FollowButton } from './FollowButton';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const { isAuthenticated } = useAuthStore();

  return (
    <Paper p="xl" withBorder>
      <Stack align="center" gap="md">
        <Avatar
          src={profile.image}
          alt={profile.username}
          size={100}
          radius="xl"
        />
        
        <Stack align="center" gap="xs">
          <Title order={2}>{profile.username}</Title>
          {profile.bio && (
            <Text c="dimmed" ta="center" size="lg">
              {profile.bio}
            </Text>
          )}
        </Stack>

        {isAuthenticated && (
          <>
            {isOwnProfile ? (
              <Button
                component={Link}
                to="/settings"
                variant="outline"
                leftSection={<IconSettings size={16} />}
              >
                Edit Profile Settings
              </Button>
            ) : (
              <FollowButton profile={profile} />
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
}