import { Card, Title, Group, Badge, Skeleton, Alert, Text } from '@mantine/core';
import { useTags } from '../../hooks/useArticles';

interface TagsListProps {
  onTagClick?: (tag: string) => void;
  selectedTag?: string;
}

export function TagsList({ onTagClick, selectedTag }: TagsListProps) {
  const { data: tagsResponse, isLoading, error } = useTags();

  if (isLoading) {
    return (
      <Card withBorder padding="md">
        <Skeleton height={16} width={100} mb="sm" />
        <Group gap="xs">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height={24} width={60} radius="xl" />
          ))}
        </Group>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert color="red">
        Failed to load tags
      </Alert>
    );
  }

  const tags = tagsResponse?.tags || [];

  if (tags.length === 0) {
    return (
      <Card withBorder padding="md">
        <Text size="sm" c="dimmed">No tags yet</Text>
      </Card>
    );
  }

  return (
    <Card withBorder padding="md">
      <Title order={4} size="sm" mb="sm">Popular Tags</Title>
      <Group gap="xs">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? 'filled' : 'light'}
            style={{ cursor: 'pointer' }}
            onClick={() => onTagClick?.(tag)}
          >
            {tag}
          </Badge>
        ))}
      </Group>
    </Card>
  );
}