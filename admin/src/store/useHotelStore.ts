/**
 * admin/src/store/useHotelStore.ts
 * 酒店管理状态（Zustand）
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Hotel, HotelQueryParams } from '@shared/types/hotel';

interface HotelState {
  // 酒店列表
  hotels: Hotel[];

  // 总数
  total: number;

  // 加载状态
  loading: boolean;

  // 搜索参数
  queryParams: Partial<HotelQueryParams>;

  // 操作
  setHotels: (hotels: Hotel[]) => void;
  setTotal: (total: number) => void;
  setLoading: (loading: boolean) => void;
  setQueryParams: (params: Partial<HotelQueryParams>) => void;
  addHotel: (hotel: Hotel) => void;
  updateHotel: (id: string, updatedHotel: Hotel) => void;
  removeHotel: (id: string) => void;
}

const defaultSearchParams: HotelQueryParams = {
  page: 1,
  pageSize: 10,
};

export const useHotelStore = create<HotelState>()(
  persist(
    set => ({
      hotels: [],
      total: 0,
      loading: false,
      queryParams: defaultSearchParams,

      setHotels: hotels => set({ hotels }),

      setTotal: total => set({ total }),

      setLoading: loading => set({ loading }),

      setQueryParams: params => set({ queryParams: { ...defaultSearchParams, ...params } }),

      addHotel: hotel => set(state => ({
        hotels: [...state.hotels, hotel],
        total: state.total + 1,
      })),

      updateHotel: (id, updatedHotel) => set(state => ({
        hotels: state.hotels.map(h =>
          h.id === id ? { ...h, ...updatedHotel } : h
        ),
      })),

      removeHotel: id => set(state => ({
        hotels: state.hotels.filter(h => h.id !== id),
        total: state.total - 1,
      })),
    }),
    {
      name: 'hotel-storage',
      version: 1,
    }
  )
);
