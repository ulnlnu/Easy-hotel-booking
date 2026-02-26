/**
 * shared/constants/config.ts
 * 通用配置（前后端共用）
 */

/**
 * API配置
 * 注意：小程序无法访问 localhost，需要使用局域网 IP
 */
const getBaseUrl = () => {
  // 生产环境 fallback（Node.js 环境优先检查）
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
    return 'https://trip-server.onrender.com/api';
  }

  // 小程序环境使用局域网 IP（微信开发者工具中可识别 TARO_ENV）
  if (typeof process !== 'undefined' && process.env && process.env.TARO_ENV === 'weapp') {
    return 'http://192.168.1.133:3000/api';
  }

  // 浏览器环境：检查全局变量（Vercel 注入）
  if (typeof window !== 'undefined') {
    const envUrl = (window as any).__API_BASE_URL__;
    if (envUrl) return envUrl;
  }

  // H5 和其他环境使用 localhost
  return 'http://localhost:3000/api';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 10000,
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

/**
 * 应用配置
 */
export const APP_CONFIG = {
  APP_NAME: '易宿酒店预订',
  VERSION: '1.0.0',
  LOCATION: {
    DEFAULT_LAT: 39.9042,
    DEFAULT_LNG: 116.4074,
    DEFAULT_RADIUS: 10,
    MAX_RADIUS: 50,
  },
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  DATE: {
    FORMAT: 'YYYY-MM-DD',
    MAX_BOOKING_DAYS: 30,
    MIN_NIGHTS: 1,
    MAX_NIGHTS: 30,
  },
};

/**
 * 错误码
 */
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  HOTEL_NOT_FOUND: 'HOTEL_NOT_FOUND',
  ROOM_NOT_AVAILABLE: 'ROOM_NOT_AVAILABLE',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
};

/**
 * 酒店状态配置
 */
export const HOTEL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  OFFLINE: 'offline',
};

/**
 * 用户角色配置
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  HOTEL_ADMIN: 'hotel_admin',
  USER: 'user',
};

/**
 * 排序选项
 */
export const SORT_OPTIONS = {
  PRICE_ASC: 'price',
  DISTANCE: 'distance',
  RATING: 'rating',
  CREATED_AT: 'createdAt',
};
