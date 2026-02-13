"use strict";
/**
 * shared/types/room.ts
 * 房型相关类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BedType = exports.RoomStatus = void 0;
/**
 * 房型状态
 */
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["AVAILABLE"] = "available";
    RoomStatus["SOLD_OUT"] = "sold_out";
})(RoomStatus || (exports.RoomStatus = RoomStatus = {}));
/**
 * 床型
 */
var BedType;
(function (BedType) {
    BedType["SINGLE"] = "single";
    BedType["DOUBLE"] = "double";
    BedType["KING"] = "king";
    BedType["TWIN"] = "twin";
})(BedType || (exports.BedType = BedType = {}));
//# sourceMappingURL=room.js.map