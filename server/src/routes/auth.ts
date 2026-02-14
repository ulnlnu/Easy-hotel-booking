/**
 * server/src/routes/auth.ts
 * 认证相关路由
 */

import { Router } from 'express';
import { authController } from '../controllers/auth';

const router: Router = Router();

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/me
 * 获取当前用户信息（需要认证）
 */
router.get('/me', authController.me);

/**
 * POST /api/auth/change-password
 * 修改密码（需要认证）
 */
router.post('/change-password', authController.changePassword);

/**
 * GET /api/auth/users
 * 获取所有用户（需要认证+系统管理员权限）
 */
router.get('/users', authController.getAllUsers);

/**
 * PUT /api/auth/users/:id
 * 更新用户（需要认证+系统管理员权限）
 */
router.put('/users/:id', authController.updateUser);

/**
 * DELETE /api/auth/users/:id
 * 删除用户（需要认证+系统管理员权限）
 */
router.delete('/users/:id', authController.deleteUser);

export default router;
