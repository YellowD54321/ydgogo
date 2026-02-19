import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { AuthContextType } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import NewGamePage from '@/pages/NewGamePage';

interface RouterContext {
  auth: AuthContextType;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: NewGamePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute]);

export const router = createRouter({
  routeTree,
  context: { auth: undefined! },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
