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
