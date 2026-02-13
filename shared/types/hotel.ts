/**
 * shared/types/hotel.ts
 * 酒店相关类型定义（前后端共用）
 */

import type { RoomType } from './room';

/**
 * 酒店状态枚举
 */
export enum HotelStatus {
  PENDING = 'pending', // 待审核
  APPROVED = 'approved', // 已通过
  REJECTED = 'rejected', // 已拒绝
  OFFLINE = 'offline', // 已下线
}

/**
 * 酒店信息接口
 */
export interface Hotel {
  id: string;
  name: string; // 酒店名称
  address: string; // 详细地址
  city: string; // 所在城市
  province: string; // 所在省份
  location: {
    lat: number; // 纬度
    lng: number; // 经度
  };
  images: string[]; // 图片URL数组
  rating: number; // 评分（0-5）
  reviewCount: number; // 评论数
  tags: string[]; // 标签（如"近地铁"、"含早餐"）
  facilities: string[]; // 设施列表（如"WiFi"、"空调"）
  roomTypes: RoomType[]; // 房型列表
  status: HotelStatus; // 审核状态
  createdBy: string; // 创建者ID
  createdAt: string; // 创建时间（ISO 8601）
  updatedAt: string; // 更新时间（ISO 8601）
}

/**
 * 酒店列表查询参数
 */
export interface HotelQueryParams {
  keyword?: string; // 关键词（酒店名称/地址）
  city?: string; // 城市筛选
  checkIn?: string; // 入住日期（YYYY-MM-DD）
  checkOut?: string; // 离店日期（YYYY-MM-DD）
  minPrice?: number; // 最低价格
  maxPrice?: number; // 最高价格
  tags?: string[]; // 标签筛选
  location?: {
    // 定位搜索
    lat: number;
    lng: number;
    radius?: number; // 搜索半径（公里）
  };
  sortBy?: 'price' | 'distance' | 'rating' | 'createdAt'; // 排序方式
  order?: 'asc' | 'desc'; // 排序方向
  page: number; // 当前页
  pageSize: number; // 每页数量
}

/**
 * 创建酒店请求
 */
export interface CreateHotelRequest {
  name: string;
  address: string;
  city: string;
  province: string;
  location: {
    lat: number;
    lng: number;
  };
  images: string[];
  tags: string[];
  facilities: string[];
  roomTypes: Omit<RoomType, 'id'>[];
}

/**
 * 更新酒店请求
 */
export interface UpdateHotelRequest {
  name?: string;
  address?: string;
  city?: string;
  province?: string;
  location?: {
    lat: number;
    lng: number;
  };
  images?: string[];
  tags?: string[];
  facilities?: string[];
  roomTypes?: Omit<RoomType, 'id'>[];
}

/**
 * 酒店审核请求
 */
export interface AuditHotelRequest {
  action: 'approve' | 'reject';
  reason?: string; // 拒绝原因
}

/**
 * 更新酒店状态请求
 */
export interface UpdateHotelStatusRequest {
  status: 'online' | 'offline';
}

/**
 * 酒店列表响应
 */
export interface HotelListResponse {
  success: true;
  data: Hotel[];
  total: number; // 总数
  page: number; // 当前页
  pageSize: number; // 每页数量
  hasMore: boolean; // 是否有更多
}
