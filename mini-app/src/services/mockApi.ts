/**
 * mini-app/src/services/mockApi.ts
 * Mock API服务（Day 1-3使用）
 * 包含LBS定位功能
 *
 * Day 4后切换为真实API：
 * import { xxxApi } from './api';
 */

import Taro from '@tarojs/taro';
import type { HotelQueryParams, Hotel, Location } from '@shared/types';
import { HotelStatus } from '@shared/types/hotel';

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock酒店数据
const mockHotels: Hotel[] = [
  {
    id: 'h-001',
    name: '易宿精选酒店（北京朝阳店）',
    address: '北京市朝阳区建国路88号',
    city: '北京',
    province: '北京',
    location: { lat: 39.9042, lng: 116.4074 },
    images: [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=2',
    ],
    rating: 4.8,
    reviewCount: 256,
    tags: ['近地铁', '免费停车', '含早餐'],
    facilities: ['WiFi', '空调', '热水器', '电视'],
    roomTypes: [
      {
        id: 'r-001',
        name: '标准大床房',
        area: '25㎡',
        price: 299,
        originalPrice: 399,
        bedType: '大床1.8m',
        maxGuests: 2,
        stock: 10,
        status: 'available',
        amenities: ['WiFi', '空调'],
      },
      {
        id: 'r-002',
        name: '豪华双床房',
        area: '35㎡',
        price: 399,
        bedType: '双床1.2m',
        maxGuests: 2,
        stock: 5,
        status: 'available',
        amenities: ['WiFi', '空调', '冰箱'],
      },
      {
        id: 'r-003',
        name: '商务套房',
        area: '50㎡',
        price: 599,
        bedType: '大床2.0m',
        maxGuests: 3,
        stock: 3,
        status: 'available',
        amenities: ['WiFi', '空调', '电视', '冰箱'],
      },
    ],
    status: HotelStatus.APPROVED,
    createdBy: 'admin-001',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'h-002',
    name: '易宿精选酒店（上海浦东店）',
    address: '上海市浦东新区世纪大道100号',
    city: '上海',
    province: '上海',
    location: { lat: 31.2304, lng: 121.4737 },
    images: [
      'https://picsum.photos/400/300?random=3',
      'https://picsum.photos/400/300?random=4',
    ],
    rating: 4.9,
    reviewCount: 189,
    tags: ['江景房', '健身房', '游泳池'],
    facilities: ['WiFi', '空调', '冰箱', '洗衣机'],
    roomTypes: [
      {
        id: 'r-004',
        name: '江景大床房',
        area: '30㎡',
        price: 499,
        bedType: '大床2.0m',
        maxGuests: 2,
        stock: 8,
        status: 'available',
        amenities: ['WiFi', '空调', '冰箱'],
      },
    ],
    status: HotelStatus.APPROVED,
    createdBy: 'admin-001',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'h-003',
    name: '易宿精选酒店（广州天河店）',
    address: '广州市天河区天河路123号',
    city: '广州',
    province: '广东',
    location: { lat: 23.1291, lng: 113.2644 },
    images: [
      'https://picsum.photos/400/300?random=5',
      'https://picsum.photos/400/300?random=6',
    ],
    rating: 4.7,
    reviewCount: 142,
    tags: ['近地铁', '商务中心'],
    facilities: ['WiFi', '空调', '会议室'],
    roomTypes: [
      {
        id: 'r-005',
        name: '商务大床房',
        area: '28㎡',
        price: 359,
        bedType: '大床1.8m',
        maxGuests: 2,
        stock: 15,
        status: 'available',
        amenities: ['WiFi', '空调', '办公桌'],
      },
    ],
    status: HotelStatus.APPROVED,
    createdBy: 'admin-001',
    createdAt: '2025-01-03T00:00:00.000Z',
    updatedAt: '2025-01-03T00:00:00.000Z',
  },
];

/**
 * 计算两点间距离（公里）
 */
function calculateDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const R = 6371; // 地球半径（公里）
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 保留一位小数
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 搜索酒店（含分页）
 */
export const searchHotelsApi = async (params: HotelQueryParams) => {
  await delay(300);

  let list = [...mockHotels];

  // 关键词筛选
  if (params.keyword) {
    list = list.filter(
      h =>
        h.name.includes(params.keyword!) ||
        h.address.includes(params.keyword!) ||
        h.city.includes(params.keyword!)
    );
  }

  // 城市筛选
  if (params.city) {
    list = list.filter(h => h.city === params.city);
  }

  // 距离排序（如果有定位）
  if (params.location && params.sortBy === 'distance') {
    list = list
      .map(h => ({
        ...h,
        distance: calculateDistance(params.location!, h.location),
      }))
      .sort((a: any, b: any) => a.distance - b.distance);
  }

  // 价格排序
  if (params.sortBy === 'price') {
    list.sort((a, b) => {
      const minPriceA = Math.min(...a.roomTypes.map(r => r.price));
      const minPriceB = Math.min(...b.roomTypes.map(r => r.price));
      return minPriceA - minPriceB;
    });
  }

  // 评分排序
  if (params.sortBy === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  // 分页
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  const pageData = list.slice(start, end);

  return {
    success: true,
    data: pageData,
    total: list.length,
    hasMore: end < list.length,
  };
};

/**
 * 获取酒店详情
 */
export const getHotelDetailApi = async (id: string) => {
  await delay(200);

  const hotel = mockHotels.find(h => h.id === id);

  if (!hotel) {
    return { success: false, message: '酒店不存在' };
  }

  return {
    success: true,
    data: hotel,
  };
};

/**
 * 获取定位（LBS）
 * 支持H5和微信小程序
 */
export const getLocationApi = async (): Promise<{
  lat: number;
  lng: number;
  address?: string;
}> => {
  await delay(500);

  const ENV = process.env.TARO_ENV;

  // H5环境使用浏览器API
  if (ENV === 'h5') {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持定位'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        error => {
          // 定位失败，返回默认位置（天安门）
          console.warn('定位失败，使用默认位置', error);
          resolve({ lat: 39.9042, lng: 116.4074 });
        },
        { timeout: 5000 }
      );
    });
  }

  // 小程序环境使用 Taro API
  if (ENV === 'weapp') {
    try {
      const res = await Taro.getLocation({
        type: 'wgs84',
      });
      return {
        lat: res.latitude,
        lng: res.longitude,
      };
    } catch (error) {
      console.warn('定位失败，使用默认位置', error);
      return { lat: 39.9042, lng: 116.4074 };
    }
  }

  // 默认位置
  return { lat: 39.9042, lng: 116.4074 };
};

/**
 * 获取附近酒店
 */
export const getNearbyHotelsApi = async (location: Location, radius = 10) => {
  return searchHotelsApi({
    location: {
      lat: location.lat,
      lng: location.lng,
      radius,
    },
    sortBy: 'distance',
    page: 1,
    pageSize: 20,
  });
};
