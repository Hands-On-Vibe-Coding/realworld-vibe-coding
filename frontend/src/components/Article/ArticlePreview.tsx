import {
  Card,
  Group,
  Avatar,
  Text,
  Title,
  Badge,
  ActionIcon,
  Stack,
} from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import type { Article } from '@/types';

interface ArticlePreviewProps {
  article: Article;
  onFavoriteToggle?: (slug: string, favorited: boolean) => void;
}

export function ArticlePreview({ article, onFavoriteToggle }: ArticlePreviewProps) {
  const handleFavoriteClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onFavoriteToggle?.(article.slug, article.favorited);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section inheritPadding py="xs">
        <Group justify="space-between">
          <Group>
            <Link
              to="/profile/$username"
              params={{ username: article.author.username }}
              style={{ textDecoration: 'none' }}
            >
              <Group gap="sm">
                <Avatar
                  src={article.author.image}
                  alt={article.author.username}
                  size="sm"
                  radius="xl"
                />
                <Stack gap={0}>
                  <Text fw={500} size="sm" c="green">
                    {article.author.username}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatDate(article.createdAt)}
                  </Text>
                </Stack>
              </Group>
            </Link>
          </Group>
          
          <ActionIcon
            variant="light"
            color={article.favorited ? 'red' : 'gray'}
            onClick={handleFavoriteClick}
            size="sm"
            aria-label={article.favorited ? 'Unfavorite article' : 'Favorite article'}
          >
            {article.favorited ? (
              <IconHeartFilled size={16} />
            ) : (
              <IconHeart size={16} />
            )}
          </ActionIcon>
        </Group>
      </Card.Section>

      <Link
        to="/article/$slug"
        params={{ slug: article.slug }}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Stack gap="sm">
          <Title order={3} lineClamp={2}>
            {article.title}
          </Title>
          <Text c="dimmed" size="sm" lineClamp={3}>
            {article.description}
          </Text>
        </Stack>
      </Link>

      <Card.Section inheritPadding py="xs">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            {article.tagList.map((tag) => (
              <Badge
                key={tag}
                variant="light"
                color="gray"
                size="sm"
                style={{ cursor: 'pointer' }}
              >
                {tag}
              </Badge>
            ))}
          </Group>
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              {article.favoritesCount} {article.favoritesCount === 1 ? 'like' : 'likes'}
            </Text>
          </Group>
        </Group>
      </Card.Section>
    </Card>
  );
}