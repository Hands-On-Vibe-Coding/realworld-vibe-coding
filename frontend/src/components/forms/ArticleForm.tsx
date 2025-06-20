import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, Title, TextInput, Textarea, Button, Stack, Alert, Group } from '@mantine/core';
import { useCreateArticle } from '../../hooks/useArticles';

const articleSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters'),
  body: z.string()
    .min(10, 'Article body must be at least 10 characters')
    .max(10000, 'Article body must be less than 10,000 characters'),
  tagList: z.string()
    .optional()
    .refine((tags) => {
      if (!tags) return true;
      const tagArray = tags.split(',').map(tag => tag.trim());
      return tagArray.length <= 10;
    }, 'Maximum 10 tags allowed')
    .refine((tags) => {
      if (!tags) return true;
      const tagArray = tags.split(',').map(tag => tag.trim());
      return tagArray.every(tag => tag.length <= 20);
    }, 'Each tag must be less than 20 characters'),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  onSuccess?: () => void;
}

export function ArticleForm({ onSuccess }: ArticleFormProps) {
  const createMutation = useCreateArticle();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
  });

  const onSubmit = (data: ArticleFormData) => {
    const tagList = data.tagList 
      ? data.tagList.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];

    createMutation.mutate({
      article: {
        title: data.title,
        description: data.description,
        body: data.body,
        tagList,
      },
    }, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  return (
    <Card withBorder shadow="sm" padding="xl" maw={800} mx="auto" role="main">
      <Title order={2} ta="center" mb="xl" id="article-form-title">Write Article</Title>
      
      <form onSubmit={handleSubmit(onSubmit)} aria-labelledby="article-form-title">
        <Stack gap="lg">
          <TextInput
            {...register('title')}
            label="Article Title"
            placeholder="Enter a compelling title for your article"
            size="lg"
            error={errors.title?.message}
            required
            maxLength={100}
            aria-describedby={errors.title ? 'title-error' : 'title-hint'}
            data-autofocus
            description="Keep it concise and engaging (max 100 characters)"
          />

          <TextInput
            {...register('description')}
            label="Description"
            placeholder="What's this article about? (brief summary)"
            error={errors.description?.message}
            required
            maxLength={200}
            aria-describedby={errors.description ? 'description-error' : 'description-hint'}
            description="A short description that appears in article previews (max 200 characters)"
          />

          <Textarea
            {...register('body')}
            label="Article Content"
            placeholder="Write your article content here (Markdown supported)"
            minRows={12}
            autosize
            error={errors.body?.message}
            required
            maxLength={10000}
            aria-describedby={errors.body ? 'body-error' : 'body-hint'}
            description="Write your full article content. Markdown formatting is supported (10-10,000 characters)"
          />

          <div>
            <TextInput
              {...register('tagList')}
              label="Tags (Optional)"
              placeholder="react, javascript, web development"
              error={errors.tagList?.message}
              aria-describedby={errors.tagList ? 'tags-error' : 'tags-hint'}
              description="Add up to 10 tags to help readers find your article. Separate with commas (max 20 characters per tag)"
            />
          </div>

          {createMutation.error && (
            <Alert 
              color="red" 
              title="Publication Error"
              role="alert"
              aria-live="polite"
            >
              {createMutation.error.message}
            </Alert>
          )}

          <Group justify="flex-end" gap="md">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={createMutation.isPending}
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending}
              color="green"
              size="md"
              aria-describedby={createMutation.error ? 'publish-error' : undefined}
            >
              {createMutation.isPending ? 'Publishing...' : 'Publish Article'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}