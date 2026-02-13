/**
 * shared/types/user.ts
 * 用户相关类型定义
 */
/**
 * 用户角色
 */
export declare enum UserRole {
    ADMIN = "admin",// 管理员
    HOTEL_ADMIN = "hotel_admin",// 酒店管理员
    USER = "user"
}
/**
 * 用户信息
 */
export interface User {
    id: string;
    username: string;
    password: string;
    realName: string;
    role: UserRole;
    phone?: string;
    email?: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * 用户信息（不包含密码，用于返回前端）
 */
export type SafeUser = Omit<User, 'password'>;
/**
 * 登录请求
 */
export interface LoginRequest {
    username: string;
    password: string;
}
/**
 * 登录响应
 */
export interface LoginResponse {
    success: true;
    data: {
        token: string;
        user: SafeUser;
    };
}
/**
 * 注册请求
 */
export interface RegisterRequest {
    username: string;
    password: string;
    realName: string;
    role: UserRole;
    phone?: string;
    email?: string;
}
/**
 * 修改密码请求
 */
export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}
/**
 * 更新用户信息请求
 */
export interface UpdateUserRequest {
    realName?: string;
    phone?: string;
    email?: string;
    avatar?: string;
}
//# sourceMappingURL=user.d.ts.map