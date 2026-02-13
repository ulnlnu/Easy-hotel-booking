/**
 * shared/types/api.ts
 * API请求/响应通用类型
 */

/**
 * API成功响应
 */
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * API错误响应
 */
export interface ApiError {
  success: false;
  message: string;
  code?: string; // 错误码
  details?: any; // 错误详情
}

/**
 * API响应（联合类型）
 */
export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 分页响应
 */
export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * 定位信息
 */
export interface Location {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  province?: string;
}

/**
 * 距离计算结果
 */
export interface DistanceResult {
  distance: number; // 距离（公里）
  duration?: number; // 预计时间（分钟）
}

/**
 * 文件上传响应
 */
export interface UploadResponse {
  success: true;
  data: {
    url: string; // 文件URL
    filename: string; // 文件名
    size: number; // 文件大小（字节）
  };
}
