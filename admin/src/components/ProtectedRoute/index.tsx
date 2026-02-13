/**
 * admin/src/components/ProtectedRoute/index.tsx
 * 路由守卫组件
 */

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
}

function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/hotels/edit" replace />;
  }

  return children;
}

export default ProtectedRoute;
