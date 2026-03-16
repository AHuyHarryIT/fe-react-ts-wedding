import { createFileRoute } from '@tanstack/react-router';
import { ChatPage } from '@components/chat/ChatPage';
import { AdminLayout } from '@components/layouts/AdminLayout';
import { useAuthStore } from '@stores/authStore';

export const Route = createFileRoute('/chat')({
  beforeLoad: () => {
    // Check if user is authenticated
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
  },
  component: ChatPageRoute,
});

function ChatPageRoute() {
  const user = useAuthStore((state) => state.user);

  // For testing, use the current user's ID as the customer ID
  const userId = user?.id || '';

  return (
    <AdminLayout selectedKey="chat">
      <ChatPage customerId={userId} />
    </AdminLayout>
  );
}
