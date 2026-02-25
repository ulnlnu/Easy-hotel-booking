/**
 * server/src/utils/password.ts
 * 密码加密工具
 *
 * 【这个文件的作用】
 * 提供密码相关的工具函数：
 * 1. 加密密码（hashPassword）
 * 2. 验证密码（comparePassword）
 * 3. 密码强度验证（validatePasswordStrength）
 * 4. 生成 ID（generateId）
 *
 * 【为什么要加密密码？】
 * - 绝对不能存储明文密码！
 * - 如果数据库泄露，加密后的密码无法还原
 * - bcrypt 是专门为密码存储设计的加密算法
 *
 * 【bcryptjs vs bcrypt】
 * 我们使用 bcryptjs（纯 JavaScript 实现），而不是 bcrypt（需要编译）
 * bcryptjs 功能相同，但不需要安装额外的依赖，兼容性更好
 */

import * as bcrypt from 'bcryptjs';

// ========================================
// 密码加密
// ========================================

/**
 * 加密密码 ⭐ 重要！答辩可能会问
 *
 * 【bcrypt 加密原理】
 * 1. 生成随机盐值（salt）
 * 2. 盐值 + 密码 → 多次哈希运算 → 加密后的密码
 * 3. 最终存储的是：盐值 + 加密后的密码
 *
 * 【为什么每次加密结果不同？】
 * 因为每次生成不同的随机盐值
 * 即使是相同的密码，加密后的结果也不同
 * 但验证时 bcrypt 会自动提取盐值进行比对
 *
 * 【saltRounds 是什么？】
 * - 表示加密的"轮数"，即哈希运算的次数
 * - 值越大越安全，但耗时越长
 * - 10 是常用的平衡值（约 100ms）
 *
 * @param password - 用户输入的明文密码
 * @returns 加密后的密码字符串
 *
 * @example
 * const hashed = await hashPassword('admin123');
 * // 结果类似: "$2b$10$7722uibO7rslz4jINo9/zOlDUGP0k9cKirDRvhxu4DU4jh0plvOYi"
 * //          ↑    ↑
 * //        算法  轮数
 */
export async function hashPassword(password: string): Promise<string> {
  // saltRounds = 10 表示 2^10 = 1024 次哈希运算
  const saltRounds = 10;

  // bcrypt.hash(明文密码, 轮数)
  // 返回的是包含算法、轮数、盐值、哈希值的完整字符串
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return hashedPassword;
}

// ========================================
// 密码验证
// ========================================

/**
 * 验证密码 ⭐ 重要！答辩可能会问
 *
 * 【验证流程】
 * 1. 从存储的哈希值中提取盐值
 * 2. 用相同的盐值加密用户输入的密码
 * 3. 比较两个哈希值是否相同
 *
 * 【为什么不用 "==" 比较？】
 * bcrypt.compare 内部使用时间安全的比较算法
 * 防止通过计时攻击猜测密码
 *
 * @param password - 用户输入的明文密码
 * @param hashedPassword - 数据库中存储的加密密码
 * @returns 是否匹配（true = 密码正确，false = 密码错误）
 *
 * @example
 * const isMatch = await comparePassword('admin123', '$2b$10$...');
 * // isMatch = true 表示密码正确
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  // bcrypt.compare(明文密码, 加密后的密码)
  // 内部会：
  // 1. 从 hashedPassword 中提取盐值
  // 2. 用相同的盐值加密 password
  // 3. 比较两个哈希值
  return bcrypt.compare(password, hashedPassword);
}

// ========================================
// 密码强度验证
// ========================================

/**
 * 密码强度验证结果类型
 */
export interface PasswordStrengthResult {
  valid: boolean;    // 是否通过验证
  message: string;   // 验证结果消息（失败时是错误原因）
}

/**
 * 验证密码强度 ⭐ 重要！这是创新点
 *
 * 【密码规则】
 * 1. 长度至少 8 位
 * 2. 必须包含字母（大小写均可）
 * 3. 必须包含数字
 *
 * 【前后端统一】
 * 这个规则和前端完全一致！
 * - 前端：实时提示用户密码强度
 * - 后端：再次验证，防止绕过前端直接调用 API
 *
 * 【正则表达式解释】
 * - /[a-zA-Z]/  匹配任意字母（a-z 或 A-Z）
 * - /\d/        匹配任意数字（等价于 /[0-9]/）
 * - .test(str)  检查字符串是否匹配正则
 *
 * @param password - 要验证的密码
 * @returns 验证结果对象
 *
 * @example
 * validatePasswordStrength('admin123')
 * // 返回 { valid: true, message: '密码强度符合要求' }
 *
 * validatePasswordStrength('123')
 * // 返回 { valid: false, message: '密码长度至少8位' }
 *
 * validatePasswordStrength('adminadmin')
 * // 返回 { valid: false, message: '密码必须包含数字' }
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  // 规则 1: 长度检查
  if (password.length < 8) {
    return { valid: false, message: '密码长度至少8位' };
  }

  // 规则 2: 必须包含字母
  // [a-zA-Z] 匹配任意大小写字母
  // .test() 返回 true/false
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含字母' };
  }

  // 规则 3: 必须包含数字
  // \d 是数字的简写，等价于 [0-9]
  if (!/\d/.test(password)) {
    return { valid: false, message: '密码必须包含数字' };
  }

  // 所有规则通过
  return { valid: true, message: '密码强度符合要求' };
}

// ========================================
// ID 生成工具
// ========================================

/**
 * 生成随机 ID
 *
 * 【ID 格式】
 * "时间戳-随机字符串"
 * 例如: "1740012345678-abc123def"
 *        ↑           ↑
 *     13位时间戳   9位随机字符
 *
 * 【为什么用时间戳？】
 * - 保证 ID 大致有序（后创建的 ID 更大）
 * - 避免重复（时间戳精确到毫秒）
 *
 * 【Math.random().toString(36) 是什么？】
 * - Math.random() 生成 0-1 之间的随机数
 * - .toString(36) 转换为 36 进制（0-9 + a-z）
 * - .substr(2, 9) 从第 2 位开始截取 9 位（去掉 "0." 前缀）
 *
 * @returns 随机生成的 ID 字符串
 */
export function generateId(): string {
  // Date.now() 返回当前时间的毫秒时间戳
  // Math.random().toString(36).substr(2, 9) 生成 9 位随机字符
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 生成酒店 ID（带前缀）
 *
 * @returns 格式如 "h-abc123def"
 */
export function generateHotelId(): string {
  // substring(11) 去掉时间戳部分，只保留随机字符
  return `h-${generateId().substring(11)}`;
}

/**
 * 生成房型 ID（带前缀）
 *
 * @returns 格式如 "r-abc123def"
 */
export function generateRoomTypeId(): string {
  return `r-${generateId().substring(11)}`;
}

/**
 * 生成用户 ID（带前缀）
 *
 * @returns 格式如 "user-abc123def"
 */
export function generateUserId(): string {
  return `user-${generateId().substring(11)}`;
}
