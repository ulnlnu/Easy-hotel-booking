/**
 * server/src/services/hotels.ts
 * 酒店服务层
 */

import fs from 'fs/promises';
import path from 'path';
import type {
  Hotel,
  CreateHotelRequest,
  UpdateHotelRequest,
  HotelQueryParams,
} from '../../../shared/types/hotel';
import { HotelStatus } from '../../../shared/types/hotel';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const HOTELS_FILE = path.join(DATA_DIR, 'hotels.json');

/**
 * 确保数据目录存在
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // 目录已存在，忽略
  }
}

/**
 * 读取酒店数据
 */
async function readHotels(): Promise<Hotel[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(HOTELS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // 文件不存在，返回空数组
    return [];
  }
}

/**
 * 写入酒店数据
 */
async function writeHotels(hotels: Hotel[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(HOTELS_FILE, JSON.stringify(hotels, null, 2));
}

/**
 * 生成ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

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
 * 酒店服务
 */
export const hotelService = {
  /**
   * 获取酒店列表
   */
  getList: async (params: HotelQueryParams) => {
    let hotels = await readHotels();

    // 关键词筛选
    if (params.keyword) {
      hotels = hotels.filter(
        h =>
          h.name.includes(params.keyword!) ||
          h.address.includes(params.keyword!) ||
          h.city.includes(params.keyword!)
      );
    }

    // 城市筛选
    if (params.city) {
      hotels = hotels.filter(h => h.city === params.city);
    }

    // 价格筛选（使用最低房型价格）
    if (params.minPrice !== undefined) {
      hotels = hotels.filter(h => {
        const minPrice = Math.min(...h.roomTypes.map(r => r.price));
        return minPrice >= params.minPrice!;
      });
    }

    if (params.maxPrice !== undefined) {
      hotels = hotels.filter(h => {
        const minPrice = Math.min(...h.roomTypes.map(r => r.price));
        return minPrice <= params.maxPrice!;
      });
    }

    // 标签筛选
    if (params.tags && params.tags.length > 0) {
      hotels = hotels.filter(h => params.tags!.some(tag => h.tags.includes(tag)));
    }

    // 状态筛选（只返回已通过的酒店）
    hotels = hotels.filter(h => h.status === HotelStatus.APPROVED);

    // 排序
    if (params.sortBy === 'price') {
      // 按最低价格排序
      hotels.sort((a, b) => {
        const minPriceA = Math.min(...a.roomTypes.map(r => r.price));
        const minPriceB = Math.min(...b.roomTypes.map(r => r.price));
        return params.order === 'desc' ? minPriceB - minPriceA : minPriceA - minPriceB;
      });
    } else if (params.sortBy === 'distance' && params.location) {
      // 按距离排序
      hotels = hotels
        .map(h => ({
          ...h,
          distance: calculateDistance(params.location!, h.location),
        }))
        .sort((a, b) => (a as any).distance - (b as any).distance);
    } else if (params.sortBy === 'rating') {
      hotels.sort((a, b) =>
        params.order === 'desc' ? a.rating - b.rating : b.rating - a.rating
      );
    } else if (params.sortBy === 'createdAt') {
      hotels.sort((a, b) =>
        params.order === 'desc'
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    // 分页
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const pageData = hotels.slice(start, end);

    return {
      success: true,
      data: pageData,
      total: hotels.length,
      page: params.page,
      pageSize: params.pageSize,
      hasMore: end < hotels.length,
    };
  },

  /**
   * 根据ID获取酒店
   */
  getById: async (id: string): Promise<Hotel | null> => {
    const hotels = await readHotels();
    return hotels.find(h => h.id === id) || null;
  },

  /**
   * 创建酒店
   */
  create: async (data: CreateHotelRequest, createdBy: string): Promise<Hotel> => {
    const hotels = await readHotels();

    const now = new Date().toISOString();
    const newHotel: Hotel = {
      id: generateId(),
      ...data,
      rating: 0,
      reviewCount: 0,
      status: HotelStatus.PENDING,
      createdBy,
      createdAt: now,
      updatedAt: now,
      // 为房型生成ID
      roomTypes: data.roomTypes.map(rt => ({
        ...rt,
        id: generateId(),
      })),
    };

    hotels.push(newHotel);
    await writeHotels(hotels);

    return newHotel;
  },

  /**
   * 更新酒店
   */
  update: async (id: string, data: UpdateHotelRequest): Promise<Hotel | null> => {
    const hotels = await readHotels();
    const index = hotels.findIndex(h => h.id === id);

    if (index === -1) {
      return null;
    }

    // 处理房型数据（如果提供了房型，需要保留现有ID或生成新ID）
    const roomTypes = data.roomTypes
      ? data.roomTypes.map((rt, idx) => ({
          ...rt,
          id: hotels[index].roomTypes[idx]?.id || generateId(),
        }))
      : hotels[index].roomTypes;

    hotels[index] = {
      ...hotels[index],
      ...data,
      roomTypes,
      updatedAt: new Date().toISOString(),
    } as Hotel;

    await writeHotels(hotels);

    return hotels[index];
  },

  /**
   * 审核酒店
   */
  audit: async (id: string, action: 'approve' | 'reject', reason?: string): Promise<void> => {
    const hotels = await readHotels();
    const index = hotels.findIndex(h => h.id === id);

    if (index === -1) {
      throw new Error('酒店不存在');
    }

    hotels[index].status = action === 'approve' ? HotelStatus.APPROVED : HotelStatus.REJECTED;
    hotels[index].updatedAt = new Date().toISOString();

    await writeHotels(hotels);
  },

  /**
   * 更新酒店状态
   */
  updateStatus: async (id: string, status: 'online' | 'offline'): Promise<void> => {
    const hotels = await readHotels();
    const index = hotels.findIndex(h => h.id === id);

    if (index === -1) {
      throw new Error('酒店不存在');
    }

    hotels[index].status = status === 'online' ? HotelStatus.APPROVED : HotelStatus.OFFLINE;
    hotels[index].updatedAt = new Date().toISOString();

    await writeHotels(hotels);
  },

  /**
   * 删除酒店
   */
  delete: async (id: string): Promise<void> => {
    const hotels = await readHotels();
    const filtered = hotels.filter(h => h.id !== id);

    if (filtered.length === hotels.length) {
      throw new Error('酒店不存在');
    }

    await writeHotels(filtered);
  },
};
