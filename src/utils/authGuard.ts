import { redirect } from '@tanstack/react-router';
import { useAuthStore } from '@stores/authStore';

type AuthPersistApi = {
  hasHydrated: () => boolean;
  onFinishHydration: (callback: () => void) => () => void;
};

const getPersistApi = () => useAuthStore.persist as AuthPersistApi;

export async function waitForAuthHydration(): Promise<void> {
  const persist = getPersistApi();

  if (persist.hasHydrated()) {
    return;
  }

  await new Promise<void>((resolve) => {
    const unsubscribe = persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}

export async function requireStaffAuth(): Promise<void> {
  await waitForAuthHydration();

  if (!useAuthStore.getState().isAuthenticated) {
    throw redirect({ to: '/login' });
  }
}
