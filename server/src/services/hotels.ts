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

    // 状态筛选
    // - 如果指定了 status 参数，按指定状态筛选
    // - 如果 includeAll 为 true，不进行状态筛选（管理端使用）
    // - 否则只返回已通过的酒店（移动端默认行为）
    if (params.status) {
      hotels = hotels.filter(h => h.status === params.status);
    } else if (!params.includeAll) {
      hotels = hotels.filter(h => h.status === HotelStatus.APPROVED);
    }

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
   *
   * 调试日志说明：
   * 1. 入参日志 - 检查接收到的创建请求和创建者ID
   * 2. 枚举值日志 - 确认 HotelStatus 枚举是否正确导入
   * 3. 酒店对象日志 - 打印即将保存的完整酒店数据
   * 4. 文件操作日志 - 追踪数据读写过程
   */
  create: async (data: CreateHotelRequest, createdBy: string): Promise<Hotel> => {
    // [调试日志 1] 打印服务层接收到的参数
    console.log('[创建酒店 - Service] create 方法被调用');
    console.log('[创建酒店 - Service] createdBy (创建者ID):', createdBy);
    console.log('[创建酒店 - Service] 酒店名称:', data.name);
    console.log('[创建酒店 - Service] 酒店地址:', data.address);
    console.log('[创建酒店 - Service] 酒店城市:', data.city);

    // [调试日志 2] 检查 HotelStatus 枚举是否正确导入
    console.log('[创建酒店 - Service] 检查 HotelStatus 枚举...');
    console.log('[创建酒店 - Service] HotelStatus 对象:', HotelStatus);
    console.log('[创建酒店 - Service] HotelStatus.PENDING 值:', HotelStatus.PENDING);
    console.log('[创建酒店 - Service] HotelStatus 类型:', typeof HotelStatus);

    const hotels = await readHotels();
    console.log('[创建酒店 - Service] 当前酒店总数:', hotels.length);

    const now = new Date().toISOString();
    const newHotelId = generateId();
    console.log('[创建酒店 - Service] 生成的新酒店ID:', newHotelId);

    // [调试日志 3] 构建新酒店对象，准备详细日志
    console.log('[创建酒店 - Service] 构建新酒店对象...');
    const newHotel: Hotel = {
      id: newHotelId,
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

    console.log('[创建酒店 - Service] 新酒店对象构建完成');
    console.log('[创建酒店 - Service] 新酒店状态 (status):', newHotel.status);
    console.log('[创建酒店 - Service] 房型数量:', newHotel.roomTypes.length);

    // [调试日志 4] 打印完整的新酒店对象（用于调试）
    console.log('[创建酒店 - Service] 完整新酒店对象:', JSON.stringify(newHotel, null, 2));

    // 添加到数组并保存
    hotels.push(newHotel);
    console.log('[创建酒店 - Service] 酒店已添加到数组，准备保存到文件...');

    await writeHotels(hotels);
    console.log('[创建酒店 - Service] 酒店数据已保存到文件');
    console.log('[创建酒店 - Service] 创建成功，返回酒店对象');

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
