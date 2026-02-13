/**
 * mini-app/src/store/useLocationStore.ts
 * 定位状态（Zustand）
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Location } from '@shared/types/api';

interface LocationState {
  // 当前位置
  location: Location | null;

  // 定位状态
  loading: boolean;
  error: string | null;

  // 操作
  setLocation: (location: Location) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    set => ({
      location: null,
      loading: false,
      error: null,

      setLocation: location => set({ location, error: null }),

      setLoading: loading => set({ loading }),

      setError: error => set({ error, loading: false }),

      clearLocation: () => set({ location: null, error: null }),
    }),
    {
      name: 'location-storage',
    }
  )
);
