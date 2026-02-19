import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { AuthContextType } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import LoginPage from '@/pages/LoginPage';
import NewGamePage from '@/pages/NewGamePage';

interface RouterContext {
  auth: AuthContextType;
}

function RootLayout() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
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
