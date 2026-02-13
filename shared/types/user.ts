/**
 * shared/types/user.ts
 * 用户相关类型定义
 */

/**
 * 用户角色
 */
export enum UserRole {
  ADMIN = 'admin', // 管理员
  HOTEL_ADMIN = 'hotel_admin', // 酒店管理员
  USER = 'user', // 普通用户
}

/**
 * 用户信息
 */
export interface User {
  id: string;
  username: string; // 用户名
  password: string; // 密码（仅后端存储，不返回前端）
  realName: string; // 真实姓名
  role: UserRole; // 角色
  phone?: string; // 手机号
  email?: string; // 邮箱
  avatar?: string; // 头像URL
  createdAt: string; // 注册时间
  updatedAt: string; // 更新时间
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
    token: string; // JWT token
    user: SafeUser; // 不包含密码的用户信息
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
