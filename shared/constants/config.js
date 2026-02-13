"use strict";
/**
 * shared/constants/config.ts
 * 通用配置（前后端共用）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SORT_OPTIONS = exports.USER_ROLES = exports.HOTEL_STATUS = exports.ERROR_CODES = exports.APP_CONFIG = exports.API_CONFIG = void 0;
/**
 * API配置
 */
exports.API_CONFIG = {
    // 开发环境API地址
    BASE_URL: process.env.NODE_ENV === 'production'
        ? 'https://api.yisu.com'
        : 'http://localhost:3000',
    // 超时时间（毫秒）
    TIMEOUT: 10000,
    // 分页默认值
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
};
/**
 * 应用配置
 */
exports.APP_CONFIG = {
    // 应用名称
    APP_NAME: '易宿酒店预订',
    // 版本号
    VERSION: '1.0.0',
    // LBS定位配置
    LOCATION: {
        // 默认位置（天安门）
        DEFAULT_LAT: 39.9042,
        DEFAULT_LNG: 116.4074,
        // 搜索半径（公里）
        DEFAULT_RADIUS: 10,
        // 最大搜索半径
        MAX_RADIUS: 50,
    },
    // 图片上传配置
    UPLOAD: {
        // 最大文件大小（字节）10MB
        MAX_FILE_SIZE: 10 * 1024 * 1024,
        // 允许的图片类型
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    },
    // 日期配置
    DATE: {
        // 日期格式
        FORMAT: 'YYYY-MM-DD',
        // 最大预订天数
        MAX_BOOKING_DAYS: 30,
        // 最少入住天数
        MIN_NIGHTS: 1,
        // 最多入住天数
        MAX_NIGHTS: 30,
    },
};
/**
 * 错误码
 */
exports.ERROR_CODES = {
    // 认证错误
    UNAUTHORIZED: 'UNAUTHORIZED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    // 业务错误
    HOTEL_NOT_FOUND: 'HOTEL_NOT_FOUND',
    ROOM_NOT_AVAILABLE: 'ROOM_NOT_AVAILABLE',
    INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
    // 服务器错误
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    BAD_REQUEST: 'BAD_REQUEST',
};
/**
 * 酒店状态配置
 */
exports.HOTEL_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    OFFLINE: 'offline',
};
/**
 * 用户角色配置
 */
exports.USER_ROLES = {
    ADMIN: 'admin',
    HOTEL_ADMIN: 'hotel_admin',
    USER: 'user',
};
/**
 * 排序选项
 */
exports.SORT_OPTIONS = {
    PRICE_ASC: 'price',
    DISTANCE: 'distance',
    RATING: 'rating',
    CREATED_AT: 'createdAt',
};
//# sourceMappingURL=config.js.map