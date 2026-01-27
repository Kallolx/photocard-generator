'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * 
 * This component guards routes based on authentication and authorization.
 * Currently returns children directly for UI development.
 * 
 * TODO: Implement actual route protection when auth is ready:
 * 1. Check if user is authenticated
 * 2. Check if user has required role
 * 3. Redirect unauthorized users
 * 4. Show loading state during auth check
 * 5. Handle auth state persistence
 * 
 * Example usage:
 * <ProtectedRoute requireAuth={true}>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute requireAdmin={true} redirectTo="/auth/login">
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  requireAuth = false,
  requireAdmin = false,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();

  // TODO: Implement actual protection logic
  // For now, render children to allow UI development
  
  /*
  // Future implementation:
  
  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }
    
    if (requireAdmin && !isAdmin) {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, isAdmin, requireAuth, requireAdmin, redirectTo, router]);

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#5d4e37] font-inter">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }
  */

  return <>{children}</>;
}
