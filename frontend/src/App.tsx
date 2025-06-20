import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/forms/LoginForm';
import { RegisterForm } from './components/forms/RegisterForm';
import { ArticleForm } from './components/forms/ArticleForm';
import { ArticleList } from './components/Article/ArticleList';
import { TagsList } from './components/Common/TagsList';
import { useArticles } from './hooks/useArticles';
import './App.css';

function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'create'>('home');
  const [selectedTag, setSelectedTag] = useState<string>('');
  
  const { data: articlesResponse, isLoading, error } = useArticles({
    tag: selectedTag || undefined,
    limit: 10,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">RealWorld</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('home')}
                className={`px-3 py-2 text-sm rounded ${
                  currentView === 'home'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentView('create')}
                className={`px-3 py-2 text-sm rounded ${
                  currentView === 'create'
                    ? 'bg-green-100 text-green-800'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                New Article
              </button>
              <span className="text-gray-700">{user?.username}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentView === 'create' ? (
            <ArticleForm onSuccess={() => setCurrentView('home')} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="mb-6">
                  {selectedTag && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-600">Showing articles tagged: </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        {selectedTag}
                      </span>
                      <button
                        onClick={() => setSelectedTag('')}
                        className="ml-2 text-sm text-blue-600 hover:underline"
                      >
                        Clear filter
                      </button>
                    </div>
                  )}
                  <ArticleList
                    articles={articlesResponse?.articles || []}
                    isLoading={isLoading}
                    error={error?.message}
                  />
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <TagsList
                    onTagClick={setSelectedTag}
                    selectedTag={selectedTag}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function UnauthenticatedApp() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">RealWorld</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowRegister(false)}
                className={`px-4 py-2 text-sm rounded ${
                  !showRegister
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className={`px-4 py-2 text-sm rounded ${
                  showRegister
                    ? 'bg-green-600 text-white'
                    : 'text-green-600 hover:bg-green-50'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {showRegister ? <RegisterForm /> : <LoginForm />}
        </div>
      </main>
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

function AppWithProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

export default AppWithProviders;