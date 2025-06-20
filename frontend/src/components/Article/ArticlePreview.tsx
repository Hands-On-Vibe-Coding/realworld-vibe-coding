import { Card, Group, Avatar, Text, Title, Badge, ActionIcon, Stack } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import type { Article } from '../../types/api';
import { useFavoriteArticle, useUnfavoriteArticle } from '../../hooks/useArticles';
import { useAuth } from '../../hooks/useAuth';

interface ArticlePreviewProps {
  article: Article;
}

export function ArticlePreview({ article }: ArticlePreviewProps) {
  const { isAuthenticated } = useAuth();
  const favoriteMutation = useFavoriteArticle();
  const unfavoriteMutation = useUnfavoriteArticle();

  const handleFavoriteClick = () => {
    if (!isAuthenticated) return;
    
    if (article.favorited) {
      unfavoriteMutation.mutate(article.slug);
    } else {
      favoriteMutation.mutate(article.slug);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card 
      withBorder 
      shadow="sm" 
      padding="lg"
      component="article"
      role="article"
      aria-labelledby={`article-title-${article.slug}`}
    >
      <Stack gap="md">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
            <Avatar
              src={article.author?.image}
              alt={`${article.author?.username}'s avatar`}
              size="sm"
            >
              {article.author?.username?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Text fw={500} truncate>{article.author?.username}</Text>
              <Text size="sm" c="dimmed">{formatDate(article.createdAt)}</Text>
            </div>
          </Group>
          
          {isAuthenticated && (
            <ActionIcon
              variant={article.favorited ? 'filled' : 'outline'}
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                handleFavoriteClick();
              }}
              loading={favoriteMutation.isPending || unfavoriteMutation.isPending}
              aria-label={article.favorited ? 'Unlike article' : 'Like article'}
              style={{ flexShrink: 0 }}
            >
              {article.favorited ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
            </ActionIcon>
          )}
        </Group>

        <Link 
          to="/article/$slug" 
          params={{ slug: article.slug } as any} 
          style={{ textDecoration: 'none', color: 'inherit' }}
          aria-label={`Read article: ${article.title}`}
        >
          <Title order={3} mb="xs" id={`article-title-${article.slug}`}>{article.title}</Title>
          <Text c="dimmed" lineClamp={2}>{article.description}</Text>
        </Link>

        <Stack gap="sm">
          {article.tagList && article.tagList.length > 0 && (
            <Group gap="xs" wrap="wrap">
              {article.tagList.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="light" size="sm">
                  {tag}
                </Badge>
              ))}
              {article.tagList.length > 5 && (
                <Badge variant="outline" size="sm" c="dimmed">
                  +{article.tagList.length - 5} more
                </Badge>
              )}
            </Group>
          )}
          
          <Group justify="space-between" align="center" wrap="nowrap">
            <Text 
              component={Link}
              to="/article/$slug"
              params={{ slug: article.slug } as any}
              size="sm" 
              c="blue" 
              style={{ textDecoration: 'none' }}
              aria-label={`Read full article: ${article.title}`}
            >
              Read more...
            </Text>
            
            {article.favoritesCount > 0 && (
              <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                {article.favoritesCount} {article.favoritesCount === 1 ? 'like' : 'likes'}
              </Text>
            )}
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}