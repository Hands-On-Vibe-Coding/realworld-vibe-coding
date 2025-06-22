import {
  Stack,
  Pagination,
  Text,
  Center,
  Alert,
  SimpleGrid,
  Skeleton,
  Paper,
  Button,
} from '@mantine/core';
import { IconInfoCircle, IconUsers } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useFeed } from '@/hooks';
import { usePagination } from '@/hooks/usePagination';
import { ArticlePreview } from './ArticlePreview';

export function FeedArticleList() {
  const pageSize = 10;
  const pagination = usePagination({ pageSize });

  const { data, isLoading, error, isError } = useFeed({
    limit: pageSize,
    offset: pagination.offset,
  });

  // Update pagination when data changes
  const totalCount = data?.articlesCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleFavoriteToggle = (slug: string, favorited: boolean) => {
    // TODO: Implement favorite toggle functionality
    console.log('Toggle favorite for article:', slug, favorited);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Stack>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {Array.from({ length: pageSize }, (_, index) => (
            <Skeleton key={index} height={200} radius="md" />
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="light" color="red" title="Error" icon={<IconInfoCircle />}>
        {error instanceof Error ? error.message : 'Failed to load your feed'}
      </Alert>
    );
  }

  // Empty feed state
  if (!data?.articles || data.articles.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Center>
          <Stack align="center" gap="md">
            <IconUsers size={48} color="var(--mantine-color-gray-5)" />
            <Text size="lg" fw={500} c="dimmed">
              No articles in your feed yet.
            </Text>
            <Text c="dimmed" ta="center">
              Follow other users to see their articles in your personalized feed.
            </Text>
            <Button component={Link} to="/" variant="outline">
              Explore Global Feed
            </Button>
          </Stack>
        </Center>
      </Paper>
    );
  }

  return (
    <Stack>
      {/* Articles Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {data.articles.map((article) => (
          <ArticlePreview
            key={article.slug}
            article={article}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </SimpleGrid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Center mt="xl">
          <Pagination
            total={totalPages}
            value={pagination.currentPage}
            onChange={pagination.goToPage}
            size="sm"
          />
        </Center>
      )}

      {/* Articles count */}
      <Center>
        <Text size="sm" c="dimmed">
          Showing {data.articles.length} of {totalCount} articles in your feed
        </Text>
      </Center>
    </Stack>
  );
}