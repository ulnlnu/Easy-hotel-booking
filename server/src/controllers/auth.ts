/**
 * server/src/controllers/auth.ts
 * 认证控制器
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authService } from '../services/auth';
import { ApiError } from '../utils/errors';
import { hashPassword, comparePassword } from '../utils/password';
import type { LoginRequest, RegisterRequest, UserRole } from '../../../shared/types/user';

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
   * 更新当前用户信息
   */
  updateMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { realName, phone, email } = req.body;

      if (!userId) {
        throw new ApiError(401, '未授权');
      }

      const user = await authService.findById(userId);
      if (!user) {
        throw new ApiError(404, '用户不存在');
      }

      // 更新允许修改的字段
      const updates: any = {};
      if (realName) updates.realName = realName;
      if (phone) updates.phone = phone;
      if (email !== undefined) updates.email = email;

      await authService.update(userId, updates);

      const updatedUser = await authService.findById(userId);
      const { password, ...safeUser } = updatedUser!;

      res.json({
        success: true,
        data: safeUser,
        message: '个人信息更新成功',
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

  /**
   * 获取所有用户（仅系统管理员）
   */
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestingUser = await authService.findById((req as any).userId);

      if (!requestingUser || requestingUser.role !== 'admin') {
        throw new ApiError(403, '无权访问');
      }

      const users = await authService.findAll();

      // 移除密码后返回
      const safeUsers = users.map(({ password, ...user }) => user);

      res.json({
        success: true,
        data: safeUsers,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 更新用户（仅系统管理员）
   */
  updateUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestingUser = await authService.findById((req as any).userId);

      if (!requestingUser || requestingUser.role !== 'admin') {
        throw new ApiError(403, '无权访问');
      }

      const { id } = req.params;
      const updates = req.body;

      if (!id) {
        throw new ApiError(400, '缺少用户ID');
      }

      const targetUser = await authService.findById(id as string);
      if (!targetUser) {
        throw new ApiError(404, '用户不存在');
      }

      // 如果更新密码，需要加密
      if (updates.password) {
        updates.password = await hashPassword(updates.password);
      }

      await authService.update(id as string, updates);

      const updatedUser = await authService.findById(id as string);
      const { password, ...safeUser } = updatedUser!;

      res.json({
        success: true,
        data: safeUser,
        message: '用户更新成功',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 删除用户（仅系统管理员）
   */
  deleteUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestingUser = await authService.findById((req as any).userId);

      if (!requestingUser || requestingUser.role !== 'admin') {
        throw new ApiError(403, '无权访问');
      }

      const { id } = req.params;

      if (!id) {
        throw new ApiError(400, '缺少用户ID');
      }

      // 不允许删除自己
      if (id === (req as any).userId) {
        throw new ApiError(400, '不能删除当前登录用户');
      }

      await authService.delete(id as string);

      res.json({
        success: true,
        message: '用户删除成功',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 注销账号（需要密码确认）
   */
  deleteAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { password } = req.body;

      if (!password) {
        throw new ApiError(400, '请输入密码确认');
      }

      const user = await authService.findById(userId);
      if (!user) {
        throw new ApiError(404, '用户不存在');
      }

      // 验证密码
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        throw new ApiError(401, '密码错误');
      }

      // 删除用户账号
      await authService.delete(userId);

      res.json({
        success: true,
        message: '账号已注销',
      });
    } catch (error) {
      next(error);
    }
  },
};
