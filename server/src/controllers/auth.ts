/**
 * server/src/controllers/auth.ts
 * 认证控制器
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authService } from '../services/auth';
import { ApiError } from '../utils/errors';
import { hashPassword, comparePassword } from '../utils/password';
import type { LoginRequest, RegisterRequest } from '../../../shared/types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * 生成JWT Token
 */
function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 认证控制器
 */
export const authController = {
  /**
   * 用户注册
   */
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: RegisterRequest = req.body;

      // 验证输入
      if (!body.username || !body.password || !body.realName || !body.role) {
        throw new ApiError(400, '缺少必填字段');
      }

      // 检查用户名是否已存在
      const existingUser = await authService.findByUsername(body.username);
      if (existingUser) {
        throw new ApiError(409, '用户名已存在');
      }

      // 密码加密
      const hashedPassword = await hashPassword(body.password);

      // 创建用户
      const user = await authService.create({
        ...body,
        password: hashedPassword,
      });

      // 生成token
      const token = generateToken(user.id);

      // 返回用户信息（不包含密码）
      const { password, ...safeUser } = user;

      res.status(201).json({
        success: true,
        data: {
          token,
          user: safeUser,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 用户登录
   */
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: LoginRequest = req.body;

      // 验证输入
      if (!body.username || !body.password) {
        throw new ApiError(400, '用户名和密码不能为空');
      }

      // 查找用户
      const user = await authService.findByUsername(body.username);
      if (!user) {
        throw new ApiError(401, '用户名或密码错误');
      }

      // 验证密码
      const isValidPassword = await comparePassword(body.password, user.password);
      if (!isValidPassword) {
        throw new ApiError(401, '用户名或密码错误');
      }

      // 生成token
      const token = generateToken(user.id);

      // 返回用户信息（不包含密码）
      const { password, ...safeUser } = user;

      res.json({
        success: true,
        data: {
          token,
          user: safeUser,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取当前用户信息
   */
  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 从中间件获取用户信息
      const userId = (req as any).userId;

      if (!userId) {
        throw new ApiError(401, '未授权');
      }

      const user = await authService.findById(userId);
      if (!user) {
        throw new ApiError(404, '用户不存在');
      }

      const { password, ...safeUser } = user;

      res.json({
        success: true,
        data: safeUser,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 修改密码
   */
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        throw new ApiError(400, '缺少必填字段');
      }

      const user = await authService.findById(userId);
      if (!user) {
        throw new ApiError(404, '用户不存在');
      }

      // 验证旧密码
      const isValidPassword = await comparePassword(oldPassword, user.password);
      if (!isValidPassword) {
        throw new ApiError(401, '原密码错误');
      }

      // 加密新密码
      const hashedPassword = await hashPassword(newPassword);

      // 更新密码
      await authService.update(userId, { password: hashedPassword });

      res.json({
        success: true,
        message: '密码修改成功',
      });
    } catch (error) {
      next(error);
    }
  },
};
