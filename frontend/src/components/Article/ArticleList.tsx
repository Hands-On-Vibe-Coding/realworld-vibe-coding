import {
  Stack,
  Pagination,
  Text,
  Center,
  Alert,
  SimpleGrid,
  Skeleton,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useArticles, useFeed } from '@/hooks';
import { usePagination } from '@/hooks/usePagination';
import { ArticlePreview } from './ArticlePreview';
import type { ArticleParams } from '@/types';

interface ArticleListProps {
  type: 'global' | 'feed';
  tag?: string | null;
  author?: string;
  favorited?: string;
}

export function ArticleList({ type, tag, author, favorited }: ArticleListProps) {
  const pageSize = 10;
  const pagination = usePagination({ pageSize });

  // Build query parameters
  const queryParams: ArticleParams = {
    limit: pageSize,
    offset: pagination.offset,
    ...(tag && { tag }),
    ...(author && { author }),
    ...(favorited && { favorited }),
  };

  // Use hooks conditionally but in a valid way
  const feedQuery = useFeed({ limit: pageSize, offset: pagination.offset });
  const articlesQuery = useArticles(queryParams);

  // Select the appropriate query result
  const query = type === 'feed' ? feedQuery : articlesQuery;
  const { data, isLoading, error, isError } = query;

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
        {error instanceof Error ? error.message : 'Failed to load articles'}
      </Alert>
    );
  }

  // Empty state
  if (!data?.articles || data.articles.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center">
          <Text size="lg" c="dimmed">
            {type === 'feed' 
              ? 'No articles in your feed yet.' 
              : tag 
                ? `No articles found with tag "${tag}".`
                : author
                  ? `No articles found by "${author}".`
                  : favorited
                    ? `No articles favorited by "${favorited}".`
                    : 'No articles found.'
            }
          </Text>
          <Text size="sm" c="dimmed">
            {type === 'feed' 
              ? 'Follow some users to see their articles here.'
              : 'Try adjusting your filters or check back later.'
            }
          </Text>
        </Stack>
      </Center>
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
          Showing {data.articles.length} of {totalCount} articles
        </Text>
      </Center>
    </Stack>
  );
}