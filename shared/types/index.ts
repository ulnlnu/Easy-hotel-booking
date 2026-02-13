/**
 * shared/types/index.ts
 * 统一导出所有类型
 */

// 酒店相关
export * from './hotel';
export type {
  Hotel,
  HotelStatus,
  HotelQueryParams,
  CreateHotelRequest,
  UpdateHotelRequest,
  AuditHotelRequest,
  UpdateHotelStatusRequest,
  HotelListResponse,
} from './hotel';

// 房型相关
export * from './room';
export type {
  RoomType,
  RoomStatus,
  RoomPriceInfo,
  BookingRequest,
  BookingResponse,
} from './room';

// 用户相关
export * from './user';
export type {
  User,
  UserRole,
  SafeUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ChangePasswordRequest,
  UpdateUserRequest,
} from './user';

// API通用
export * from './api';
export type {
  ApiSuccess,
  ApiError,
  ApiResponse,
  PaginationParams,
  PaginationResponse,
  Location,
  DistanceResult,
  UploadResponse,
} from './api';
