import { createFileRoute, redirect } from '@tanstack/react-router';
import { Group, Text, Button, Container } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';
import { ArticleList } from '../components/Article/ArticleList';
import { TagsList } from '../components/Common/TagsList';
import { useArticles } from '../hooks/useArticles';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { isAuthenticated } = useAuth();
  const [selectedTag, setSelectedTag] = useState<string>('');
  
  if (!isAuthenticated) {
    throw redirect({
      to: '/login',
    });
  }

  const { data: articlesResponse, isLoading, error } = useArticles({
    tag: selectedTag || undefined,
    limit: 10,
  });

  return (
    <Container size="xl" px="md">
      <Group align="flex-start" gap="lg" wrap="wrap">
        <div style={{ flex: '1', minWidth: '300px' }}>
          {selectedTag && (
            <Group wrap="nowrap" gap="xs" mb="md">
              <Text size="sm">Showing articles tagged:</Text>
              <Button
                variant="light"
                size="xs"
                rightSection={
                  <span
                    onClick={() => setSelectedTag('')}
                    style={{ cursor: 'pointer', marginLeft: 8 }}
                  >
                    ×
                  </span>
                }
              >
                {selectedTag}
              </Button>
            </Group>
          )}
          <ArticleList
            articles={articlesResponse?.articles || []}
            isLoading={isLoading}
            error={error?.message}
          />
        </div>
        
        <div style={{ flexBasis: '250px', flexShrink: 0 }}>
          <TagsList
            onTagClick={setSelectedTag}
            selectedTag={selectedTag}
          />
        </div>
      </Group>
    </Container>
  );
}