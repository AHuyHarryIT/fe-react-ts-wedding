import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import './index.css';
import { ThemeInitializer } from '@shared/providers/ThemeInitializer';
import { QueryProvider } from '@shared/providers/QueryProvider';
import { routeTree } from '@/routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeInitializer>
        <RouterProvider router={router} />
      </ThemeInitializer>
    </QueryProvider>
  </StrictMode>
);
