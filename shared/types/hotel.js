"use strict";
/**
 * shared/types/hotel.ts
 * 酒店相关类型定义（前后端共用）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelStatus = void 0;
/**
 * 酒店状态枚举
 */
var HotelStatus;
(function (HotelStatus) {
    HotelStatus["PENDING"] = "pending";
    HotelStatus["APPROVED"] = "approved";
    HotelStatus["REJECTED"] = "rejected";
    HotelStatus["OFFLINE"] = "offline";
})(HotelStatus || (exports.HotelStatus = HotelStatus = {}));
//# sourceMappingURL=hotel.js.map