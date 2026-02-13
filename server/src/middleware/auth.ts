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
    // 获取Authorization header
    const authHeader = req.headers.authorization;

    // 检查token是否存在
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, '未提供认证Token');
    }

    // 提取token（移除"Bearer "前缀）
    const token = authHeader.substring(7);

    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // 将用户ID附加到请求对象
    req.userId = decoded.userId;

    next();
  } catch (error: any) {
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
