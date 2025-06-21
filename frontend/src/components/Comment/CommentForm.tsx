import { Button, Stack, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { zodResolver } from 'mantine-form-zod-resolver';

const commentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => void;
  isSubmitting?: boolean;
}

export function CommentForm({ onSubmit, isSubmitting = false }: CommentFormProps) {
  const form = useForm<CommentFormData>({
    initialValues: {
      body: '',
    },
    validate: zodResolver(commentSchema),
  });

  const handleSubmit = (values: CommentFormData) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Textarea
          placeholder="Write a comment..."
          autosize
          minRows={3}
          maxRows={8}
          {...form.getInputProps('body')}
        />
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!form.values.body.trim()}
        >
          Post Comment
        </Button>
      </Stack>
    </form>
  );
}