import { createFileRoute } from '@tanstack/react-router';
import AdminLogin from '@/features/auth/components/AdminLoginForm';

export const Route = createFileRoute('/login')({
  component: AdminLogin,
});
