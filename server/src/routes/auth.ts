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

export default router;
