/**
 * shared/types/room.ts
 * 房型相关类型定义
 */
/**
 * 房型状态
 */
export declare enum RoomStatus {
    AVAILABLE = "available",// 可预订
    SOLD_OUT = "sold_out"
}
/**
 * 床型
 */
export declare enum BedType {
    SINGLE = "single",// 单人床
    DOUBLE = "double",// 双人床
    KING = "king",// 大床
    TWIN = "twin"
}
/**
 * 房型信息
 */
export interface RoomType {
    id: string;
    name: string;
    area: string;
    price: number;
    originalPrice?: number;
    bedType: string;
    maxGuests: number;
    stock: number;
    status: RoomStatus;
    amenities: string[];
    images?: string[];
}
/**
 * 房型价格信息（用于日历组件）
 */
export interface RoomPriceInfo {
    date: string;
    price: number;
    available: boolean;
    stock: number;
}
/**
 * 预订请求
 */
export interface BookingRequest {
    hotelId: string;
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
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
//# sourceMappingURL=room.d.ts.map