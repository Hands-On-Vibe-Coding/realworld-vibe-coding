import { Stack, Loader, Center, Text, Alert } from '@mantine/core';
import type { Article } from '../../types/api';
import { ArticlePreview } from './ArticlePreview';

interface ArticleListProps {
  articles: Article[];
  isLoading?: boolean;
  error?: string;
}

export function ArticleList({ articles, isLoading, error }: ArticleListProps) {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="md" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error">
        {error}
      </Alert>
    );
  }

  if (articles.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">No articles yet.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      {articles.map((article) => (
        <ArticlePreview 
          key={article.slug} 
          article={article}
        />
      ))}
    </Stack>
  );
}