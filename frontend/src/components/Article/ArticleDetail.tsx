import {
  Paper,
  Title,
  Text,
  Group,
  Avatar,
  Button,
  Badge,
  Stack,
  Divider,
  TypographyStylesProvider,
  Skeleton,
} from '@mantine/core';
import { 
  IconHeart, 
  IconHeartFilled, 
  IconUserPlus, 
  IconEdit, 
  IconTrash,
  IconUserMinus 
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import type { Article } from '@/types';
import { useDeleteArticle, useComments, useCreateComment, useDeleteComment } from '@/hooks';
import { CommentList } from '@/components/Comment';

interface ArticleHeroProps {
  article: Article;
  isAuthor: boolean;
}

export function ArticleHero({ article, isAuthor }: ArticleHeroProps) {
  const deleteArticleMutation = useDeleteArticle();

  const handleDeleteArticle = async () => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      await deleteArticleMutation.mutateAsync(article.slug);
      // Redirect to home page after successful deletion
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete article:', error);
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
    <Paper p="xl" withBorder bg="green.0">
      <Stack gap="md">
        <Title order={1} c="green.8">
          {article.title}
        </Title>
        
        {article.description && (
          <Text size="lg" c="green.7">
            {article.description}
          </Text>
        )}

        <Group justify="space-between" align="flex-start">
          <Link
            to="/profile/$username"
            params={{ username: article.author.username }}
            style={{ textDecoration: 'none' }}
          >
            <Group gap="sm">
              <Avatar
                src={article.author.image}
                alt={article.author.username}
                size="md"
                radius="xl"
              />
              <Stack gap={0}>
                <Text fw={500} c="green.8">
                  {article.author.username}
                </Text>
                <Text size="sm" c="green.6">
                  {formatDate(article.createdAt)}
                </Text>
              </Stack>
            </Group>
          </Link>

          <Group gap="sm">
            {isAuthor ? (
              <>
                <Link to="/editor/$slug" params={{ slug: article.slug }}>
                  <Button 
                    variant="outline" 
                    color="gray"
                    leftSection={<IconEdit size={16} />}
                  >
                    Edit Article
                  </Button>
                </Link>
                <Button
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={handleDeleteArticle}
                  loading={deleteArticleMutation.isPending}
                >
                  Delete Article
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  color="gray"
                  leftSection={
                    article.author.following ? (
                      <IconUserMinus size={16} />
                    ) : (
                      <IconUserPlus size={16} />
                    )
                  }
                >
                  {article.author.following ? 'Unfollow' : 'Follow'} {article.author.username}
                </Button>
                <Button
                  color={article.favorited ? 'red' : 'gray'}
                  variant={article.favorited ? 'filled' : 'outline'}
                  leftSection={
                    article.favorited ? (
                      <IconHeartFilled size={16} />
                    ) : (
                      <IconHeart size={16} />
                    )
                  }
                >
                  {article.favorited ? 'Unfavorite' : 'Favorite'} Article ({article.favoritesCount})
                </Button>
              </>
            )}
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
}

interface ArticleContentProps {
  article: Article;
}

export function ArticleContent({ article }: ArticleContentProps) {
  return (
    <Paper p="xl" withBorder>
      <TypographyStylesProvider>
        <div
          style={{ lineHeight: 1.6, fontSize: '16px' }}
          dangerouslySetInnerHTML={{ 
            __html: article.body.replace(/\n/g, '<br />') 
          }}
        />
      </TypographyStylesProvider>
      
      {article.tagList.length > 0 && (
        <>
          <Divider my="xl" />
          <Group gap="xs">
            {article.tagList.map((tag) => (
              <Link
                key={tag}
                to="/"
                search={{ tag }}
                style={{ textDecoration: 'none' }}
              >
                <Badge
                  variant="light"
                  color="gray"
                  size="md"
                  style={{ cursor: 'pointer' }}
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </Group>
        </>
      )}
    </Paper>
  );
}

interface ArticleActionsProps {
  article: Article;
  isAuthor: boolean;
}

export function ArticleActions({ article, isAuthor }: ArticleActionsProps) {
  if (isAuthor) {
    return null; // Actions are already shown in hero for authors
  }

  return (
    <Paper p="md" withBorder>
      <Group justify="center" gap="sm">
        <Button
          variant="outline"
          color="gray"
          leftSection={
            article.author.following ? (
              <IconUserMinus size={16} />
            ) : (
              <IconUserPlus size={16} />
            )
          }
        >
          {article.author.following ? 'Unfollow' : 'Follow'} {article.author.username}
        </Button>
        
        <Button
          color={article.favorited ? 'red' : 'gray'}
          variant={article.favorited ? 'filled' : 'outline'}
          leftSection={
            article.favorited ? (
              <IconHeartFilled size={16} />
            ) : (
              <IconHeart size={16} />
            )
          }
        >
          {article.favorited ? 'Unfavorite' : 'Favorite'} Article ({article.favoritesCount})
        </Button>
      </Group>
    </Paper>
  );
}

interface CommentsSectionProps {
  article: Article;
}

export function CommentsSection({ article }: CommentsSectionProps) {
  const {
    data: comments = [],
    isLoading,
    error,
  } = useComments(article.slug);

  const createCommentMutation = useCreateComment(article.slug);
  const deleteCommentMutation = useDeleteComment(article.slug);

  const handleCreateComment = (body: string) => {
    createCommentMutation.mutate(body);
  };

  const handleDeleteComment = (commentId: number) => {
    deleteCommentMutation.mutate(commentId);
  };

  return (
    <Paper p="xl" withBorder>
      <CommentList
        comments={comments}
        onCreateComment={handleCreateComment}
        onDeleteComment={handleDeleteComment}
        isLoading={isLoading}
        isCreating={createCommentMutation.isPending}
        deletingCommentId={deleteCommentMutation.variables}
        error={error?.message}
      />
    </Paper>
  );
}