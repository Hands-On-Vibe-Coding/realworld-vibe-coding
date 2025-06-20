import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateArticle } from '../../hooks/useArticles';

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  body: z.string().min(1, 'Body is required'),
  tagList: z.string().optional(),
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
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Write Article</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <input
            {...register('title')}
            type="text"
            placeholder="Article Title"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('description')}
            type="text"
            placeholder="What's this article about?"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <textarea
            {...register('body')}
            placeholder="Write your article (in markdown)"
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          />
          {errors.body && (
            <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('tagList')}
            type="text"
            placeholder="Enter tags (comma separated)"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Separate tags with commas (e.g., "react, javascript, web development")
          </p>
        </div>

        {createMutation.error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {createMutation.error.message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Publishing...' : 'Publish Article'}
          </button>
        </div>
      </form>
    </div>
  );
}