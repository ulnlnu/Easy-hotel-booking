/**
 * admin/src/store/useHotelStore.ts
 * 酒店管理状态（Zustand）
 */

import { create } from 'zustand';
import type { Hotel, HotelQueryParams } from '@shared/types/hotel';

interface HotelState {
  // 酒店列表
  hotels: Hotel[];
  total: number;
  loading: boolean;

  // 查询参数
  queryParams: Partial<HotelQueryParams>;

  // 操作
  setHotels: (hotels: Hotel[], total: number) => void;
  setLoading: (loading: boolean) => void;
  setQueryParams: (params: Partial<HotelQueryParams>) => void;
  addHotel: (hotel: Hotel) => void;
  updateHotel: (id: string, hotel: Partial<Hotel>) => void;
  removeHotel: (id: string) => void;
}

export const useHotelStore = create<HotelState>(set => ({
  hotels: [],
  total: 0,
  loading: false,
  queryParams: {
    page: 1,
    pageSize: 10,
  },

  setHotels: (hotels, total) => set({ hotels, total }),
  setLoading: loading => set({ loading }),
  setQueryParams: params => set(state => ({ queryParams: { ...state.queryParams, ...params })),
  addHotel: hotel => set(state => ({ hotels: [...state.hotels, hotel] })),
  updateHotel: (id, updatedHotel) =>
    set(state => ({
      hotels: state.hotels.map(h => (h.id === id ? { ...h, ...updatedHotel } : h)),
    })),
  removeHotel: id =>
    set(state => ({
      hotels: state.hotels.filter(h => h.id !== id),
    })),
}));
