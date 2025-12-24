import { createFileRoute } from '@tanstack/react-router';
import AdminLogin from '@components/admin/AdminLogin.tsx';

export const Route = createFileRoute('/login')({
  component: AdminLogin,
});
