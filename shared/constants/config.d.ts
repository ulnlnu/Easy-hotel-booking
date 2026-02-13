/**
 * shared/constants/config.ts
 * 通用配置（前后端共用）
 */
/**
 * API配置
 */
export declare const API_CONFIG: {
    readonly BASE_URL: "https://api.yisu.com" | "http://localhost:3000";
    readonly TIMEOUT: 10000;
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_PAGE_SIZE: 10;
    readonly MAX_PAGE_SIZE: 100;
};
/**
 * 应用配置
 */
export declare const APP_CONFIG: {
    readonly APP_NAME: "易宿酒店预订";
    readonly VERSION: "1.0.0";
    readonly LOCATION: {
        readonly DEFAULT_LAT: 39.9042;
        readonly DEFAULT_LNG: 116.4074;
        readonly DEFAULT_RADIUS: 10;
        readonly MAX_RADIUS: 50;
    };
    readonly UPLOAD: {
        readonly MAX_FILE_SIZE: number;
        readonly ALLOWED_TYPES: readonly ["image/jpeg", "image/png", "image/webp", "image/gif"];
    };
    readonly DATE: {
        readonly FORMAT: "YYYY-MM-DD";
        readonly MAX_BOOKING_DAYS: 30;
        readonly MIN_NIGHTS: 1;
        readonly MAX_NIGHTS: 30;
    };
};
/**
 * 错误码
 */
export declare const ERROR_CODES: {
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly TOKEN_EXPIRED: "TOKEN_EXPIRED";
    readonly INVALID_CREDENTIALS: "INVALID_CREDENTIALS";
    readonly HOTEL_NOT_FOUND: "HOTEL_NOT_FOUND";
    readonly ROOM_NOT_AVAILABLE: "ROOM_NOT_AVAILABLE";
    readonly INVALID_DATE_RANGE: "INVALID_DATE_RANGE";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly BAD_REQUEST: "BAD_REQUEST";
};
/**
 * 酒店状态配置
 */
export declare const HOTEL_STATUS: {
    readonly PENDING: "pending";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
    readonly OFFLINE: "offline";
};
/**
 * 用户角色配置
 */
export declare const USER_ROLES: {
    readonly ADMIN: "admin";
    readonly HOTEL_ADMIN: "hotel_admin";
    readonly USER: "user";
};
/**
 * 排序选项
 */
export declare const SORT_OPTIONS: {
    readonly PRICE_ASC: "price";
    readonly DISTANCE: "distance";
    readonly RATING: "rating";
    readonly CREATED_AT: "createdAt";
};
//# sourceMappingURL=config.d.ts.map