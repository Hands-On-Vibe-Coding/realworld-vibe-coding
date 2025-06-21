import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { Layout } from '@/components/Layout/Layout';
import { HomePage } from '@/pages/Home';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { ArticlePage } from '@/pages/Article';
import { EditorPage } from '@/pages/Editor';
import { ProfilePage } from '@/pages/Profile';

// Root route
const rootRoute = createRootRoute({
  component: Layout,
});

// Home route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

// Auth routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

// Article route
const articleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/article/$slug',
  component: ArticlePage,
});

// Editor routes
const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editor',
  component: EditorPage,
});

const editorEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editor/$slug',
  component: EditorPage,
});

// Profile route
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$username',
  component: ProfilePage,
});

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  articleRoute,
  editorRoute,
  editorEditRoute,
  profileRoute,
]);

// Router
export const router = createRouter({ routeTree });

// Register router type
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}