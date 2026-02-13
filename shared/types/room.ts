/**
 * shared/types/room.ts
 * 房型相关类型定义
 */

/**
 * 房型状态
 */
export enum RoomStatus {
  AVAILABLE = 'available', // 可预订
  SOLD_OUT = 'sold_out', // 已售罄
}

/**
 * 床型
 */
export enum BedType {
  SINGLE = 'single', // 单人床
  DOUBLE = 'double', // 双人床
  KING = 'king', // 大床
  TWIN = 'twin', // 双床
}

/**
 * 房型信息
 */
export interface RoomType {
  id: string;
  name: string; // 房型名称（如"标准大床房"）
  area: string; // 面积（如"25㎡"）
  price: number; // 价格（元/晚）
  originalPrice?: number; // 原价
  bedType: string; // 床型（如"大床1.8m"）
  maxGuests: number; // 最大入住人数
  stock: number; // 库存
  status: RoomStatus; // 状态
  amenities: string[]; // 设施（如"WiFi"、"空调"）
  images?: string[]; // 房型图片
}

/**
 * 房型价格信息（用于日历组件）
 */
export interface RoomPriceInfo {
  date: string; // 日期（YYYY-MM-DD）
  price: number; // 当日价格
  available: boolean; // 是否可预订
  stock: number; // 剩余库存
}

/**
 * 预订请求
 */
export interface BookingRequest {
  hotelId: string;
  roomTypeId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  contactName: string;
  contactPhone: string;
}

/**
 * 预订响应
 */
export interface BookingResponse {
  success: true;
  data: {
    orderId: string;
    totalAmount: number;
    nights: number;
  };
}
