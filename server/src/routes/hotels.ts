/**
 * server/src/routes/hotels.ts
 * 酒店相关路由
 */

import { Router } from 'express';
import { hotelController } from '../controllers/hotels';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

/**
 * GET /api/hotels
 * 获取酒店列表（支持分页、筛选、排序）
 */
router.get('/', hotelController.getList);

/**
 * GET /api/hotels/nearby
 * 获取附近酒店（LBS定位）
 */
router.get('/nearby', hotelController.getNearby);

/**
 * GET /api/hotels/:id
 * 获取酒店详情
 */
router.get('/:id', hotelController.getDetail);

/**
 * POST /api/hotels
 * 创建酒店（需要认证）
 */
router.post('/', authenticate, hotelController.create);

/**
 * PUT /api/hotels/:id
 * 更新酒店（需要认证）
 */
router.put('/:id', authenticate, hotelController.update);

/**
 * POST /api/hotels/:id/audit
 * 审核酒店（需要管理员权限）
 */
router.post('/:id/audit', authenticate, hotelController.audit);

/**
 * POST /api/hotels/:id/status
 * 更新酒店状态（需要认证）
 */
router.post('/:id/status', authenticate, hotelController.updateStatus);

/**
 * DELETE /api/hotels/:id
 * 删除酒店（需要认证）
 */
router.delete('/:id', authenticate, hotelController.delete);

export default router;
