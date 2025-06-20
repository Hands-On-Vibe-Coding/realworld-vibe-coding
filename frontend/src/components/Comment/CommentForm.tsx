import { useState } from 'react';
import { useCreateComment } from '../../hooks/useComments';
import { useAuthStore } from '../../stores/authStore';

interface CommentFormProps {
  slug: string;
}

export function CommentForm({ slug }: CommentFormProps) {
  const [body, setBody] = useState('');
  const { user } = useAuthStore();
  const createComment = useCreateComment(slug);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!body.trim()) return;

    try {
      await createComment.mutateAsync({
        comment: { body: body.trim() }
      });
      setBody(''); // Clear form on success
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border text-center">
        <p className="text-gray-600">
          <a href="#" className="text-blue-600 hover:underline">Sign in</a>
          {' '}or{' '}
          <a href="#" className="text-blue-600 hover:underline">sign up</a>
          {' '}to add comments on this article.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg">
      <div className="p-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment..."
          className="w-full min-h-[100px] border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={createComment.isPending}
        />
      </div>
      <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={user.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username}
            alt={user.username}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm text-gray-600">{user.username}</span>
        </div>
        <button
          type="submit"
          disabled={!body.trim() || createComment.isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createComment.isPending ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}