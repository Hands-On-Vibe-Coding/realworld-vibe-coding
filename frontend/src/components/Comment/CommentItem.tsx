import { Avatar, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { formatDistanceToNow } from 'date-fns';
import type { Comment } from '@/types';
import { useAuthStore } from '@/stores/auth';

interface CommentItemProps {
  comment: Comment;
  onDelete: (commentId: number) => void;
  isDeleting?: boolean;
}

export function CommentItem({ comment, onDelete, isDeleting = false }: CommentItemProps) {
  const { user } = useAuthStore();
  const canDelete = user?.username === comment.author.username;

  const handleDelete = () => {
    modals.openConfirmModal({
      title: 'Delete Comment',
      children: 'Are you sure you want to delete this comment? This action cannot be undone.',
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => onDelete(comment.id),
    });
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="sm">
            <Avatar
              src={comment.author.image}
              alt={comment.author.username}
              size="sm"
              radius="xl"
            />
            <Stack gap={4}>
              <Text size="sm" fw={500}>
                {comment.author.username}
              </Text>
              <Text size="xs" c="dimmed">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </Text>
            </Stack>
          </Group>
          {canDelete && (
            <Button
              size="xs"
              variant="subtle"
              color="red"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Delete
            </Button>
          )}
        </Group>
        <Text>{comment.body}</Text>
      </Stack>
    </Paper>
  );
}