import { Alert, Loader, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconMessageCircle } from '@tabler/icons-react';
import type { Comment } from '@/types';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { useAuthStore } from '@/stores/auth';

interface CommentListProps {
  comments: Comment[];
  onCreateComment: (body: string) => void;
  onDeleteComment: (commentId: number) => void;
  isLoading?: boolean;
  isCreating?: boolean;
  deletingCommentId?: number;
  error?: string;
}

export function CommentList({
  comments,
  onCreateComment,
  onDeleteComment,
  isLoading = false,
  isCreating = false,
  deletingCommentId,
  error,
}: CommentListProps) {
  const { isAuthenticated } = useAuthStore();

  if (isLoading) {
    return (
      <Stack align="center" gap="md">
        <Loader size="md" />
        <Text>Loading comments...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
        {error}
      </Alert>
    );
  }

  const handleCreateComment = (data: { body: string }) => {
    onCreateComment(data.body);
  };

  return (
    <Stack gap="lg">
      <Title order={3} size="h4">
        <IconMessageCircle size="1.2rem" style={{ marginRight: '0.5rem' }} />
        Comments ({comments.length})
      </Title>

      {isAuthenticated && (
        <CommentForm onSubmit={handleCreateComment} isSubmitting={isCreating} />
      )}

      {comments.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No comments yet. {isAuthenticated ? 'Be the first to comment!' : 'Sign in to comment.'}
        </Text>
      ) : (
        <Stack gap="md">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={onDeleteComment}
              isDeleting={deletingCommentId === comment.id}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}