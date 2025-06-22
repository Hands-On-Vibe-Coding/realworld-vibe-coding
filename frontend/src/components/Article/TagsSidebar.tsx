import {
  Paper,
  Text,
  Group,
  Badge,
  Stack,
  Skeleton,
  Alert,
  ActionIcon,
} from '@mantine/core';
import { IconTag, IconX, IconInfoCircle } from '@tabler/icons-react';
import { useTags } from '@/hooks';

interface TagsSidebarProps {
  selectedTag?: string | null;
  onTagSelect: (tag: string | null) => void;
}

export function TagsSidebar({ selectedTag, onTagSelect }: TagsSidebarProps) {
  const { data: tagsData, isLoading, error, isError } = useTags();

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      onTagSelect(null); // Deselect if already selected
    } else {
      onTagSelect(tag);
    }
  };

  const clearSelection = () => {
    onTagSelect(null);
  };

  return (
    <Paper p="md" withBorder data-testid="popular-tags">
      <Group mb="md" justify="space-between">
        <Group gap="xs">
          <IconTag size={16} />
          <Text fw={500}>Popular Tags</Text>
        </Group>
        {selectedTag && (
          <ActionIcon
            variant="light"
            color="gray"
            size="sm"
            onClick={clearSelection}
            title="Clear tag filter"
          >
            <IconX size={12} />
          </ActionIcon>
        )}
      </Group>

      {isLoading && (
        <Stack gap="xs">
          {Array.from({ length: 10 }, (_, index) => (
            <Skeleton key={index} height={24} radius="sm" />
          ))}
        </Stack>
      )}

      {isError && (
        <Alert variant="light" color="red" icon={<IconInfoCircle />}>
          <Text size="sm">
            {error instanceof Error ? error.message : 'Failed to load tags'}
          </Text>
        </Alert>
      )}

      {tagsData && (
        <>
          {selectedTag && (
            <Group mb="sm">
              <Text size="sm" c="dimmed">
                Filtered by:
              </Text>
              <Badge
                variant="filled"
                color="blue"
                leftSection={<IconTag size={12} />}
              >
                {selectedTag}
              </Badge>
            </Group>
          )}
          
          <Group gap="xs">
            {tagsData.tags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? 'filled' : 'light'}
                color={selectedTag === tag ? 'blue' : 'gray'}
                style={{ cursor: 'pointer' }}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Badge>
            ))}
          </Group>

          {tagsData.tags.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No tags available yet.
            </Text>
          )}
        </>
      )}
    </Paper>
  );
}