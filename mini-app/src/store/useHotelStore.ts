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

  // 操作
  setSearchParams: (params: Partial<HotelQueryParams>) => void;
  addViewedHotel: (hotelId: string) => void;
  clearViewedHotels: () => void;
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

      setSearchParams: params =>
        set(state => ({
          searchParams: { ...state.searchParams, ...params },
        })),

      addViewedHotel: hotelId =>
        set(state => ({
          viewedHotels: [hotelId, ...state.viewedHotels.filter(id => id !== hotelId)].slice(0, 20),
        })),

      clearViewedHotels: () => set({ viewedHotels: [] }),
    }),
    {
      name: 'hotel-storage',
    }
  )
);
