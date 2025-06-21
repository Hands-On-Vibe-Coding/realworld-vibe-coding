import { Container, Stack, Alert, Center, Loader } from '@mantine/core';
import { useParams } from '@tanstack/react-router';
import { IconInfoCircle } from '@tabler/icons-react';
import { useArticle } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArticleHero, 
  ArticleContent, 
  ArticleActions,
  CommentsSection 
} from '@/components/Article/ArticleDetail';

export function ArticlePage() {
  const { slug } = useParams({ from: '/article/$slug' });
  const { data: articleData, isLoading, error, isError } = useArticle(slug);
  const { user } = useAuthStore();

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
          {error instanceof Error ? error.message : 'Failed to load article'}
        </Alert>
      </Container>
    );
  }

  // Article not found
  if (!articleData?.article) {
    return (
      <Container size="md">
        <Alert variant="light" color="yellow" title="Not Found" icon={<IconInfoCircle />}>
          Article not found. It may have been deleted or moved.
        </Alert>
      </Container>
    );
  }

  const article = articleData.article;
  const isAuthor = user?.username === article.author.username;

  return (
    <Container size="md">
      <Stack gap="xl">
        <ArticleHero article={article} isAuthor={isAuthor} />
        <ArticleContent article={article} />
        <ArticleActions article={article} isAuthor={isAuthor} />
        <CommentsSection />
      </Stack>
    </Container>
  );
}