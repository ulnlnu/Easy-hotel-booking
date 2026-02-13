/**
 * admin/src/services/mockApi.ts
 * Mock API服务（Day 1-3使用）
 *
 * Day 4后切换为真实API：
 * import { xxxApi } from './api';
 */

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock用户数据
const mockUsers = [
  {
    id: 'admin-001',
    username: 'admin',
    password: 'password123', // 实际应该加密
    realName: '系统管理员',
    role: 'admin' as const,
    email: 'admin@yisu.com',
  },
  {
    id: 'hotel-admin-001',
    username: 'hoteladmin',
    password: 'password123',
    realName: '酒店管理员',
    role: 'hotel_admin' as const,
    email: 'hotel@yisu.com',
  },
];

// Mock酒店数据
import type { Hotel, HotelQueryParams } from '@shared/types/hotel';
import type { LoginRequest, RegisterRequest, SafeUser } from '@shared/types/user';
import { HotelStatus } from '@shared/types/hotel';

const mockHotels: Hotel[] = [
  {
    id: 'h-001',
    name: '易宿精选酒店（北京朝阳店）',
    address: '北京市朝阳区建国路88号',
    city: '北京',
    province: '北京',
    location: { lat: 39.9042, lng: 116.4074 },
    images: ['https://picsum.photos/400/300?random=1'],
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
        status: 'available' as const,
        amenities: ['WiFi', '空调'],
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
    images: ['https://picsum.photos/400/300?random=2'],
    rating: 4.9,
    reviewCount: 189,
    tags: ['江景房', '健身房', '游泳池'],
    facilities: ['WiFi', '空调', '冰箱', '洗衣机'],
    roomTypes: [
      {
        id: 'r-002',
        name: '江景大床房',
        area: '30㎡',
        price: 499,
        bedType: '大床2.0m',
        maxGuests: 2,
        stock: 8,
        status: 'available' as const,
        amenities: ['WiFi', '空调', '冰箱'],
      },
    ],
    status: HotelStatus.PENDING,
    createdBy: 'admin-001',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  },
];

/**
 * 登录API
 */
export const loginApi = async (data: LoginRequest) => {
  await delay(500);

  const user = mockUsers.find(u => u.username === data.username && u.password === data.password);

  if (!user) {
    return {
      success: false,
      message: '用户名或密码错误',
    };
  }

  const { password, ...safeUser } = user;
  const token = `mock-token-${user.id}-${Date.now()}`;

  return {
    success: true,
    data: {
      token,
      user: safeUser as SafeUser,
    },
  };
};

/**
 * 获取酒店列表
 */
export const getHotelListApi = async (params: HotelQueryParams) => {
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

  // 状态筛选
  if (params.tags) {
    // 暂不实现
  }

  // 分页
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  const pageData = list.slice(start, end);

  return {
    success: true,
    data: pageData,
    total: list.length,
    page: params.page,
    pageSize: params.pageSize,
    hasMore: end < list.length,
  };
};

/**
 * 创建酒店
 */
export const createHotelApi = async (data: any) => {
  await delay(500);

  const newHotel: Hotel = {
    id: `h-${Date.now()}`,
    ...data,
    rating: 0,
    reviewCount: 0,
    status: HotelStatus.PENDING,
    createdBy: 'admin-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockHotels.push(newHotel);

  return {
    success: true,
    data: newHotel,
  };
};

/**
 * 更新酒店
 */
export const updateHotelApi = async (id: string, data: any) => {
  await delay(400);

  const index = mockHotels.findIndex(h => h.id === id);
  if (index === -1) {
    return {
      success: false,
      message: '酒店不存在',
    };
  }

  mockHotels[index] = {
    ...mockHotels[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    data: mockHotels[index],
  };
};

/**
 * 审核酒店
 */
export const auditHotelApi = async (id: string, action: 'approve' | 'reject', reason?: string) => {
  await delay(300);

  const hotel = mockHotels.find(h => h.id === id);
  if (!hotel) {
    return {
      success: false,
      message: '酒店不存在',
    };
  }

  hotel.status = action === 'approve' ? HotelStatus.APPROVED : HotelStatus.REJECTED;
  hotel.updatedAt = new Date().toISOString();

  return {
    success: true,
    message: action === 'approve' ? '审核通过' : '审核拒绝',
  };
};

/**
 * 删除酒店
 */
export const deleteHotelApi = async (id: string) => {
  await delay(300);

  const index = mockHotels.findIndex(h => h.id === id);
  if (index === -1) {
    return {
      success: false,
      message: '酒店不存在',
    };
  }

  mockHotels.splice(index, 1);

  return {
    success: true,
    message: '删除成功',
  };
};
