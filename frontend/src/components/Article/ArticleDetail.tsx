import { useArticle } from '../../hooks/useArticles';
import { CommentList } from '../Comment/CommentList';
import { useAuthStore } from '../../stores/authStore';

interface ArticleDetailProps {
  slug: string;
}

export function ArticleDetail({ slug }: ArticleDetailProps) {
  const { data, isLoading, error } = useArticle(slug);
  const { user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Article not found</p>
        </div>
      </div>
    );
  }

  const { article } = data;
  const articleDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const isAuthor = user && user.username === article.author.username;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Article Header */}
      <div className="bg-gray-900 text-white p-8 rounded-lg mb-8">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={article.author.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + article.author.username}
              alt={article.author.username}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="font-medium">{article.author.username}</p>
              <p className="text-gray-300 text-sm">{articleDate}</p>
            </div>
          </div>
          
          {isAuthor && (
            <div className="flex space-x-2">
              <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                Edit Article
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Delete Article
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none mb-12">
        <p className="text-gray-600 text-lg mb-6">{article.description}</p>
        <div className="whitespace-pre-wrap leading-relaxed">
          {article.body}
        </div>
      </div>

      {/* Tags */}
      {article.tagList.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {article.tagList.map((tag) => (
              <span
                key={tag}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Article Actions */}
      <div className="border-t border-b py-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded border ${
                article.favorited
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-red-500 border-red-500 hover:bg-red-50'
              }`}
            >
              <span>♥</span>
              <span>{article.favorited ? 'Unfavorite' : 'Favorite'} Article</span>
              <span>({article.favoritesCount})</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <img
              src={article.author.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + article.author.username}
              alt={article.author.username}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-gray-600">
              {article.author.following ? 'Unfollow' : 'Follow'} {article.author.username}
            </span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <CommentList slug={slug} />
    </div>
  );
}