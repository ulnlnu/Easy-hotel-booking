/**
 * server/src/utils/password.ts
 * 密码加密工具
 */

import * as bcrypt from 'bcryptjs';

/**
 * 加密密码
 * @param password 明文密码
 * @returns 加密后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hashedPassword 加密后的密码
 * @returns 是否匹配
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * 密码强度验证结果
 */
export interface PasswordStrengthResult {
  valid: boolean;
  message: string;
}

/**
 * 验证密码强度
 * 要求：至少8位，包含字母和数字（与前端一致）
 * @param password 明文密码
 * @returns 验证结果
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  if (password.length < 8) {
    return { valid: false, message: '密码长度至少8位' };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含字母' };
  }

  if (!/\d/.test(password)) {
    return { valid: false, message: '密码必须包含数字' };
  }

  return { valid: true, message: '密码强度符合要求' };
}

/**
 * 生成随机ID
 * @returns 随机生成的ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 生成酒店ID前缀
 */
export function generateHotelId(): string {
  return `h-${generateId().substring(11)}`;
}

/**
 * 生成房型ID前缀
 */
export function generateRoomTypeId(): string {
  return `r-${generateId().substring(11)}`;
}

/**
 * 生成用户ID前缀
 */
export function generateUserId(): string {
  return `user-${generateId().substring(11)}`;
}
