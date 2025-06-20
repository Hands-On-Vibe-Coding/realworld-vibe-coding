import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { Layout } from '@/components/Layout/Layout';
import { HomePage } from '@/pages/Home';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';

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

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
]);

// Router
export const router = createRouter({ routeTree });

// Register router type
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}