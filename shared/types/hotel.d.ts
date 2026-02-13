/**
 * shared/types/hotel.ts
 * 酒店相关类型定义（前后端共用）
 */
import type { RoomType } from './room';
/**
 * 酒店状态枚举
 */
export declare enum HotelStatus {
    PENDING = "pending",// 待审核
    APPROVED = "approved",// 已通过
    REJECTED = "rejected",// 已拒绝
    OFFLINE = "offline"
}
/**
 * 酒店信息接口
 */
export interface Hotel {
    id: string;
    name: string;
    address: string;
    city: string;
    province: string;
    location: {
        lat: number;
        lng: number;
    };
    images: string[];
    rating: number;
    reviewCount: number;
    tags: string[];
    facilities: string[];
    roomTypes: RoomType[];
    status: HotelStatus;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * 酒店列表查询参数
 */
export interface HotelQueryParams {
    keyword?: string;
    city?: string;
    checkIn?: string;
    checkOut?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    location?: {
        lat: number;
        lng: number;
        radius?: number;
    };
    sortBy?: 'price' | 'distance' | 'rating' | 'createdAt';
    order?: 'asc' | 'desc';
    page: number;
    pageSize: number;
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
    reason?: string;
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
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
//# sourceMappingURL=hotel.d.ts.map