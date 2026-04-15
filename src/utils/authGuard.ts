import { redirect } from '@tanstack/react-router';
import { useAuthStore } from '@stores/authStore';
import { initializeAuth } from '@services/AuthService';
import {
  captureRedirectPath,
  setAuthFeedbackReason,
} from '@/auth/sessionPolicy';

type AuthPersistApi = {
  hasHydrated: () => boolean;
  onFinishHydration: (callback: () => void) => () => void;
};

type RouterLocationLike = {
  href?: string;
  pathname?: string;
  searchStr?: string;
};

const getPersistApi = () => useAuthStore.persist as AuthPersistApi;

const normalizeRedirectPath = (value?: string | null): string => {
  if (!value || typeof value !== 'string' || !value.startsWith('/')) {
    return '/';
  }

  if (value === '/login') {
    return '/';
  }

  return value;
};

const buildPathFromLocation = (location?: RouterLocationLike): string => {
  if (!location) {
    if (typeof window === 'undefined') {
      return '/';
    }

    return normalizeRedirectPath(
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    );
  }

  if (location.href && typeof window !== 'undefined') {
    try {
      const url = new URL(location.href, window.location.origin);
      return normalizeRedirectPath(`${url.pathname}${url.search}${url.hash}`);
    } catch {
      return normalizeRedirectPath(location.href);
    }
  }

  const pathname = location.pathname || '/';
  const search = location.searchStr || '';
  return normalizeRedirectPath(`${pathname}${search}`);
};

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

export async function requireStaffAuth(opts?: {
  location?: RouterLocationLike;
}): Promise<void> {
  await waitForAuthHydration();

  const authState = useAuthStore.getState();
  if (!authState.isInitialized) {
    await initializeAuth(true);
  }

  if (!useAuthStore.getState().isAuthenticated) {
    captureRedirectPath(buildPathFromLocation(opts?.location));
    setAuthFeedbackReason('login-required');
    throw redirect({ to: '/login' });
  }
}
