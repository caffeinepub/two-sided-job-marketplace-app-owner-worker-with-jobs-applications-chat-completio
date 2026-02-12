import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useCurrentUser } from './hooks/useCurrentUser';
import SplashPage from './pages/SplashPage';
import RoleSelectPage from './pages/RoleSelectPage';
import HomePage from './pages/HomePage';
import CreateJobPage from './pages/CreateJobPage';
import JobListPage from './pages/JobListPage';
import JobDetailsPage from './pages/JobDetailsPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import AppLayout from './components/AppLayout';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

// Root component that handles authentication and role selection flow
function RootComponent() {
  const { identity } = useInternetIdentity();
  const { userProfile, isLoading } = useCurrentUser();
  
  // Show splash for unauthenticated users
  if (!identity) {
    return <SplashPage />;
  }
  
  // Show role select if authenticated but no profile
  if (!isLoading && !userProfile) {
    return <RoleSelectPage />;
  }
  
  // Show app layout for authenticated users with profile
  return (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <Toaster />
    </>
  );
}

// Root route with layout for authenticated pages
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Define routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const createJobRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-job',
  component: CreateJobPage,
});

const jobListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobs',
  component: JobListPage,
});

const jobDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobs/$jobId',
  component: JobDetailsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat/$jobId',
  component: ChatPage,
});

// Create router
const routeTree = rootRoute.addChildren([
  indexRoute,
  createJobRoute,
  jobListRoute,
  jobDetailsRoute,
  profileRoute,
  chatRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
