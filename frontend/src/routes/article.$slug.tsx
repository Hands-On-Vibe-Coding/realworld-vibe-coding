import { createFileRoute } from '@tanstack/react-router';
import { ArticleDetail } from '../components/Article/ArticleDetail';

export const Route = createFileRoute('/article/$slug')({
  component: ArticleDetailPage,
});

function ArticleDetailPage() {
  const { slug } = Route.useParams();
  
  return <ArticleDetail slug={slug} />;
}