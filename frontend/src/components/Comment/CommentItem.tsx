import { useDeleteComment } from '../../hooks/useComments';
import { useAuthStore } from '../../stores/authStore';
import type { Comment } from '../../types/api';

interface CommentItemProps {
  comment: Comment;
  slug: string;
}

export function CommentItem({ comment, slug }: CommentItemProps) {
  const { user } = useAuthStore();
  const deleteComment = useDeleteComment(slug);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment.mutateAsync(comment.id);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  const isAuthor = user && user.username === comment.author.username;
  const commentDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white border rounded-lg">
      <div className="p-4">
        <p className="text-gray-800 leading-relaxed">{comment.body}</p>
      </div>
      <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={comment.author.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + comment.author.username}
            alt={comment.author.username}
            className="w-6 h-6 rounded-full"
          />
          <a
            href={`#/profile/${comment.author.username}`}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            {comment.author.username}
          </a>
          <span className="text-sm text-gray-500">{commentDate}</span>
        </div>
        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={deleteComment.isPending}
            className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
          >
            {deleteComment.isPending ? 'Deleting...' : '🗑'}
          </button>
        )}
      </div>
    </div>
  );
}