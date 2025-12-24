import { createFileRoute } from '@tanstack/react-router';
import AdminLogin from '@/components/AdminLogin';

export const Route = createFileRoute('/login')({
  component: AdminLogin,
});
