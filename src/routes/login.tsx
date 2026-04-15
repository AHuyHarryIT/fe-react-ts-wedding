import { useState } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import AdminLogin from '@/features/auth/components/AdminLoginForm';
import { initializeAuth } from '@services/AuthService';
import { useAuthStore } from '@stores/authStore';
import {
  consumeAuthFeedbackReason,
  consumeRedirectPath,
} from '@/auth/sessionPolicy';

function LoginRoutePage() {
  const [feedbackReason] = useState(() => consumeAuthFeedbackReason());
  return <AdminLogin feedbackReason={feedbackReason} />;
}

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const { isAuthenticated, isInitialized } = useAuthStore.getState();

    if (!isInitialized || isAuthenticated) {
      await initializeAuth(true);
    }

    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: consumeRedirectPath() });
    }
  },
  component: LoginRoutePage,
});
