/**
 * admin/src/hooks/useAuth.ts
 * 认证相关Hook
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * 认证Hook
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();

  /**
   * 登录
   */
  const login = useCallback((user: any, token: string) => {
    setAuth(user, token);
  }, [setAuth]);

  /**
   * 退出登录
   */
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  /**
   * 检查是否有权限
   */
  const hasRole = useCallback((roles: string | string[]) => {
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  }, [user]);

  /**
   * 是否为管理员
   */
  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout: handleLogout,
    hasRole,
    isAdmin,
  };
};
