import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider } from '@/contexts/AuthProvider';
import { useAuth } from '@/hooks/useAuth';
import { router } from '@/router';
import '@/index.css';

const queryClient = new QueryClient();

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <InnerApp />
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
