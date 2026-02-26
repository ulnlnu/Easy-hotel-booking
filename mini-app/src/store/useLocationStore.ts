/**
 * mini-app/src/store/useLocationStore.ts
 * 定位状态（Zustand）
 */

import Taro from '@tarojs/taro';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Location } from '@shared/types/api';

/**
 * 自定义存储引擎 - 适配微信小程序
 */
const taroStorage = {
  getItem: (name: string): string | null => {
    try {
      const value = Taro.getStorageSync(name);
      return value || null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      Taro.setStorageSync(name, value);
    } catch {
      // 忽略存储错误
    }
  },
  removeItem: (name: string): void => {
    try {
      Taro.removeStorageSync(name);
    } catch {
      // 忽略删除错误
    }
  },
};

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
      storage: createJSONStorage(() => taroStorage),
    }
  )
);
