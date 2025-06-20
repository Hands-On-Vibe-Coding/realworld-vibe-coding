import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { ArticleForm } from '../components/forms/ArticleForm';

export const Route = createFileRoute('/editor')({
  component: EditorPage,
  beforeLoad: () => {
    // Check authentication before loading
    const isAuthenticated = localStorage.getItem('token');
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
      });
    }
  },
});

function EditorPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate({ to: '/' });
  };

  return <ArticleForm onSuccess={handleSuccess} />;
}