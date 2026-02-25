/**
 * mini-app/src/store/useHotelStore.ts
 * 酒店搜索状态（Zustand）
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HotelQueryParams } from '@shared/types/hotel';

interface HotelState {
  // 搜索参数
  searchParams: HotelQueryParams;

  // 已浏览的酒店
  viewedHotels: string[];

  // 定位识别的城市信息（通过GPS定位获得）
  locatedCity: {
    city: string;        // 城市名
    province: string;    // 省份
    displayName: string; // 显示名称（如"北京市"或"广东·深圳"）
  } | null;

  // 操作
  setSearchParams: (params: Partial<HotelQueryParams>) => void;
  addViewedHotel: (hotelId: string) => void;
  clearViewedHotels: () => void;
  setLocatedCity: (city: { city: string; province: string; displayName: string } | null) => void;
}

const defaultSearchParams: HotelQueryParams = {
  page: 1,
  pageSize: 10,
};

export const useHotelStore = create<HotelState>()(
  persist(
    set => ({
      searchParams: defaultSearchParams,
      viewedHotels: [],
      locatedCity: null,

      setSearchParams: params =>
        set(state => ({
          searchParams: { ...state.searchParams, ...params },
        })),

      addViewedHotel: hotelId =>
        set(state => ({
          viewedHotels: [hotelId, ...state.viewedHotels.filter(id => id !== hotelId)].slice(0, 20),
        })),

      clearViewedHotels: () => set({ viewedHotels: [] }),

      setLocatedCity: city => set({ locatedCity: city }),
    }),
    {
      name: 'hotel-storage',
      // 迁移旧版本数据，清除无效的城市筛选
      migrate: (persistedState: any) => {
        if (persistedState?.state?.searchParams?.city) {
          // 清除旧的城市筛选
          persistedState.state.searchParams.city = undefined;
        }
        return persistedState;
      },
      version: 1,
    }
  )
);
