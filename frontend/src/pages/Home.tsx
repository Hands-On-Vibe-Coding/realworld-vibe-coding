import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Tabs,
  Grid,
  GridCol,
} from '@mantine/core';
import { useAuthStore } from '@/stores/authStore';
import { ArticleList, TagsSidebar, FeedArticleList } from '@/components/Article';

export function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>(isAuthenticated ? 'feed' : 'global');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    // When a tag is selected, switch to global feed to show filtered results
    if (tag && activeTab !== 'global') {
      setActiveTab('global');
    }
  };

  return (
    <Container size="xl">
      <Stack>
        {/* Hero Section */}
        <Card p="xl" ta="center" bg="green.6" c="white" mb="xl">
          <Title order={1} mb="md">
            RealWorld
          </Title>
          <Text size="lg">
            A place to share your knowledge.
          </Text>
        </Card>

        {/* Main Content */}
        <Grid>
          <GridCol span={{ base: 12, md: 9 }}>
            <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'global')} variant="pills">
              <Tabs.List mb="md">
                <Tabs.Tab value="global">
                  Global Feed
                </Tabs.Tab>
                {isAuthenticated && (
                  <Tabs.Tab value="feed">
                    Your Feed
                  </Tabs.Tab>
                )}
                {selectedTag && (
                  <Tabs.Tab value="global" disabled>
                    #{selectedTag}
                  </Tabs.Tab>
                )}
              </Tabs.List>

              <Tabs.Panel value="global">
                <ArticleList type="global" tag={selectedTag} />
              </Tabs.Panel>

              {isAuthenticated && (
                <Tabs.Panel value="feed">
                  <FeedArticleList />
                </Tabs.Panel>
              )}
            </Tabs>
          </GridCol>

          <GridCol span={{ base: 12, md: 3 }}>
            <TagsSidebar
              selectedTag={selectedTag}
              onTagSelect={handleTagSelect}
            />
          </GridCol>
        </Grid>
      </Stack>
    </Container>
  );
}