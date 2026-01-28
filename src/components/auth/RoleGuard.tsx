'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'user' | 'admin';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

/**
 * RoleGuard Component
 * Conditionally renders content based on user role.
 */
export default function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const hasPermission = allowedRoles.includes(user.role);

  if (!hasPermission) {
    console.warn(`User ${user.id} attempted to access content requiring roles: ${allowedRoles.join(', ')}`);
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
