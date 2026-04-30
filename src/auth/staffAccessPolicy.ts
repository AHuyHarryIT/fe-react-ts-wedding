import type { User } from '@types';

export const MENU_REQUIRED_PERMISSION: Record<string, string | null> = {
  dashboard: null,
  bookings: 'bookings:read',
  orders: 'orders:read',
  jobs: 'jobs:read',
  chat: 'chat.read',
  services: 'services:read',
  packages: 'packages:read',
  albums: 'albums:read',
  reports: 'reports:read',
  customers: 'customers:read',
  staff: 'users:read',
  roles: 'roles:read',
  permissions: 'permissions:read',
  settings: null,
};

export const ROUTE_REQUIRED_PERMISSION: Record<string, string | null> = {
  '/': null,
  '/bookings': 'bookings:read',
  '/orders': 'orders:read',
  '/orders/$orderId': 'orders:read',
  '/payments/result': 'payments:read',
  '/jobs': 'jobs:read',
  '/chat': 'chat.read',
  '/services': 'services:read',
  '/packages': 'packages:read',
  '/albums': 'albums:read',
  '/reports': 'reports:read',
  '/customers': 'customers:read',
  '/users': 'users:read',
  '/roles': 'roles:read',
  '/permissions': 'permissions:read',
  '/settings': null,
};

export const extractPermissionKeys = (user: User | null): Set<string> => {
  const keys = new Set<string>();

  if (!user?.roles?.length) {
    return keys;
  }

  for (const role of user.roles) {
    if (!role?.permissions?.length) {
      continue;
    }

    for (const rolePermission of role.permissions) {
      const key = rolePermission?.permission?.key;
      if (key) {
        keys.add(key);
      }
    }
  }

  return keys;
};

export const hasRequiredPermission = (
  user: User | null,
  requiredPermission: string | null | undefined
): boolean => {
  if (!requiredPermission) {
    return true;
  }

  return extractPermissionKeys(user).has(requiredPermission);
};

export const resolveRequiredPermissionByPath = (
  pathname: string
): string | null | undefined => {
  if (ROUTE_REQUIRED_PERMISSION[pathname] !== undefined) {
    return ROUTE_REQUIRED_PERMISSION[pathname];
  }

  if (pathname.startsWith('/orders/')) {
    return ROUTE_REQUIRED_PERMISSION['/orders/$orderId'];
  }

  return undefined;
};
