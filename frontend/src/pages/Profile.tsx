import { useState } from 'react';
import { Alert, Center, Container, Loader, Stack, Tabs } from '@mantine/core';
import { useParams } from '@tanstack/react-router';
import { IconInfoCircle } from '@tabler/icons-react';
import { useProfile } from '@/hooks';
import { useAuthStore } from '@/stores/auth';
import { ProfileHeader } from '@/components/Profile';
import { ArticleList } from '@/components/Article';

export function ProfilePage() {
  const { username } = useParams({ from: '/profile/$username' });
  const { user: currentUser } = useAuthStore();
  const { data: profile, isLoading, error, isError } = useProfile(username!);
  
  const [activeTab, setActiveTab] = useState<string | null>('articles');
  const isOwnProfile = currentUser?.username === username;

  // Loading state
  if (isLoading) {
    return (
      <Container size="md">
        <Center py="xl">
          <Stack align="center">
            <Loader size="lg" />
          </Stack>
        </Center>
      </Container>
    );
  }

  // Error state
  if (isError) {
    return (
      <Container size="md">
        <Alert variant="light" color="red" title="Error" icon={<IconInfoCircle />}>
          {error instanceof Error ? error.message : 'Failed to load profile'}
        </Alert>
      </Container>
    );
  }

  // Profile not found
  if (!profile) {
    return (
      <Container size="md">
        <Alert variant="light" color="yellow" title="Not Found" icon={<IconInfoCircle />}>
          Profile not found. This user may not exist or may have been deleted.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md">
      <Stack gap="xl">
        <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
        
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="articles">
              {isOwnProfile ? 'My Articles' : 'Articles'}
            </Tabs.Tab>
            <Tabs.Tab value="favorited">
              {isOwnProfile ? 'Favorited Articles' : 'Favorited'}
            </Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="articles" pt="md">
            <ArticleList type="global" author={username} />
          </Tabs.Panel>
          
          <Tabs.Panel value="favorited" pt="md">
            <ArticleList type="global" favorited={username} />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}