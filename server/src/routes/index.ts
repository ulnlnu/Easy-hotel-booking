/**
 * server/src/routes/index.ts
 * 路由汇总
 */

import { Router, Request, Response } from 'express';
import authRoutes from './auth';
import hotelRoutes from './hotels';

const router: Router = Router();

// 认证路由
router.use('/auth', authRoutes);

// 酒店路由
router.use('/hotels', hotelRoutes);

// 健康检查
router.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

export default router;
