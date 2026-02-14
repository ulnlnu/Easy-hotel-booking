/**
 * server/src/middleware/auth.ts
 * 认证中间件
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * 生成JWT Token
 */
function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 扩展Express Request类型
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

/**
 * 认证中间件
 * 验证JWT Token，附加用户信息到请求对象
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    // [调试日志 - 认证中间件] 记录请求到达
    console.log('[认证中间件] 请求到达:', req.method, req.path);
    console.log('[认证中间件] Authorization header:', req.headers.authorization ? '存在' : '不存在');

    // 获取Authorization header
    const authHeader = req.headers.authorization;

    // 检查token是否存在
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[认证中间件] 认证失败 - 缺少或无效的 Authorization header');
      throw new ApiError(401, '未提供认证Token');
    }

    // 提取token（移除"Bearer "前缀）
    const token = authHeader.substring(7);
    console.log('[认证中间件] Token 长度:', token.length);
    console.log('[认证中间件] 开始验证 Token...');

    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    console.log('[认证中间件] Token 验证成功');
    console.log('[认证中间件] 提取的 userId:', decoded.userId);

    // 将用户ID附加到请求对象
    req.userId = decoded.userId;
    console.log('[认证中间件] req.userId 已设置:', req.userId);

    next();
  } catch (error: any) {
    console.log('[认证中间件] 捕获到错误:');
    console.log('[认证中间件] 错误名称:', error.name);
    console.log('[认证中间件] 错误消息:', error.message);

    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token已过期');
    } else if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, '无效的Token');
    } else {
      throw new ApiError(401, '认证失败');
    }
  }
};

/**
 * 管理员权限中间件
 * 验证用户是否为管理员角色
 */
export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  const userId = req.userId;

  if (!userId) {
    throw new ApiError(401, '未授权');
  }

  // TODO: 实际使用时应从数据库查询用户角色
  // 这里暂时跳过，实际使用时需要配合认证中间件使用
  next();
};

/**
 * 可选认证中间件
 * 如果有token则解析，没有则跳过
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = decoded.userId;
    }

    next();
  } catch (error) {
    // 忽略错误，继续处理请求
    next();
  }
};

export { generateToken };
