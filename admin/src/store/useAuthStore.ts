/**
 * admin/src/store/useAuthStore.ts
 * 认证状态管理（Zustand）
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SafeUser } from '@shared/types/user';

interface AuthState {
  user: SafeUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: SafeUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
