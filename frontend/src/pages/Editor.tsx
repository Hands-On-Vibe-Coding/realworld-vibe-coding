import { useForm, zodResolver } from '@mantine/form';
import { 
  Container, 
  Stack, 
  TextInput, 
  Textarea, 
  TagsInput, 
  Button, 
  Group, 
  Box, 
  Text, 
  LoadingOverlay 
} from '@mantine/core';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { articleSchema, type ArticleFormData } from '@/lib/schemas';
import { useArticle } from '@/hooks/useArticles';
import { useCreateArticle, useUpdateArticle } from '@/hooks/useArticleMutations';
import { useAuthStore } from '@/stores/authStore';
import { notifications } from '@mantine/notifications';

export function EditorPage() {
  const { slug } = useParams({ from: '/editor/$slug' }) as { slug?: string };
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isEditing = Boolean(slug);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      notifications.show({
        title: 'Authentication Required',
        message: 'Please log in to create or edit articles.',
        color: 'red',
      });
      navigate({ to: '/login' });
    }
  }, [user, navigate]);

  const { data: articleData, isLoading: isLoadingArticle } = useArticle(slug);
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const form = useForm<ArticleFormData>({
    validate: zodResolver(articleSchema),
    initialValues: {
      title: '',
      description: '',
      body: '',
      tagList: [],
    },
  });

  // Update form values when article data is loaded for editing
  useEffect(() => {
    if (isEditing && articleData?.article) {
      const article = articleData.article;
      
      // Check if current user is the author
      if (user?.username !== article.author.username) {
        notifications.show({
          title: 'Authorization Error',
          message: 'You can only edit your own articles.',
          color: 'red',
        });
        navigate({ to: `/article/${slug}` });
        return;
      }

      form.setValues({
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList,
      });
    }
  }, [isEditing, articleData, user, slug, navigate, form]);

  const handleSubmit = async (values: ArticleFormData) => {
    try {
      if (isEditing && slug) {
        const response = await updateArticle.mutateAsync({ 
          slug, 
          data: { article: values } 
        });
        navigate({ to: `/article/${response.article.slug}` });
      } else {
        const response = await createArticle.mutateAsync({ article: values });
        navigate({ to: `/article/${response.article.slug}` });
      }
    } catch (error) {
      // Error notifications are handled in mutation hooks
      console.error('Article submission failed:', error);
    }
  };

  const isLoading = createArticle.isPending || updateArticle.isPending;

  // Show loading overlay while fetching article data for editing
  if (isEditing && isLoadingArticle) {
    return (
      <Container size="md" py="xl">
        <Box pos="relative" mih={400}>
          <LoadingOverlay visible />
        </Box>
      </Container>
    );
  }

  // Don't render if user is not authenticated (will be redirected)
  if (!user) {
    return null;
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="md">
        <Text size="xl" fw={700} ta="center">
          {isEditing ? 'Edit Article' : 'Create New Article'}
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Article Title"
              placeholder="Article Title"
              required
              {...form.getInputProps('title')}
            />
            
            <TextInput
              label="What's this article about?"
              placeholder="Article Description"
              required
              {...form.getInputProps('description')}
            />
            
            <Textarea
              label="Write your article (in markdown)"
              placeholder="Article Body"
              required
              rows={12}
              {...form.getInputProps('body')}
            />
            
            <TagsInput
              label="Enter tags"
              placeholder="Enter tags"
              description="Press Enter to add a tag (maximum 10 tags)"
              maxTags={10}
              {...form.getInputProps('tagList')}
            />
            
            <Group justify="flex-end" mt="md">
              <Button
                type="submit"
                loading={isLoading}
                size="md"
              >
                {isEditing ? 'Update Article' : 'Publish Article'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}