/**
 * server/src/controllers/hotels.ts
 * 酒店控制器
 */

import { Request, Response, NextFunction } from 'express';
import { hotelService } from '../services/hotels';
import { ApiError } from '../utils/errors';
import type {
  CreateHotelRequest,
  UpdateHotelRequest,
  AuditHotelRequest,
  UpdateHotelStatusRequest,
  HotelQueryParams,
} from '../../../shared/types/hotel';

/**
 * 酒店控制器
 */
export const hotelController = {
  /**
   * 获取酒店列表
   */
  getList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 处理tags参数：支持逗号分隔字符串或数组格式
      let tags: string[] | undefined = undefined;
      if (req.query.tags) {
        if (typeof req.query.tags === 'string') {
          tags = (req.query.tags as string).split(',');
        } else if (Array.isArray(req.query.tags)) {
          tags = req.query.tags as string[];
        }
      }

      const query: HotelQueryParams = {
        keyword: req.query.keyword as string,
        city: req.query.city as string,
        checkIn: req.query.checkIn as string,
        checkOut: req.query.checkOut as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        tags,
        status: req.query.status as string,  // 支持状态筛选
        includeAll: req.query.includeAll === 'true' || req.query.includeAll === true,  // 支持包含所有状态
        sortBy: req.query.sortBy as any,
        order: req.query.order as 'asc' | 'desc',
        page: Number(req.query.page) || 1,
        pageSize: Math.min(Number(req.query.pageSize) || 10, 100),
      };

      // 处理定位参数
      if (req.query.lat && req.query.lng) {
        query.location = {
          lat: Number(req.query.lat),
          lng: Number(req.query.lng),
          radius: req.query.radius ? Number(req.query.radius) : undefined,
        };
      }

      const result = await hotelService.getList(query);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取附近酒店（LBS）
   */
  getNearby: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lat, lng, radius = 10 } = req.query;

      if (!lat || !lng) {
        throw new ApiError(400, '缺少定位参数');
      }

      const query: HotelQueryParams = {
        location: {
          lat: Number(lat),
          lng: Number(lng),
          radius: Number(radius),
        },
        sortBy: 'distance',
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
      };

      const result = await hotelService.getList(query);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取酒店详情
   */
  getDetail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const hotel = await hotelService.getById(id);

      if (!hotel) {
        throw new ApiError(404, '酒店不存在');
      }

      res.json({
        success: true,
        data: hotel,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 创建酒店
   *
   * 调试日志说明：
   * 1. 请求体验证日志 - 检查接收到的数据结构
   * 2. 用户认证日志 - 确认 userId 是否正确提取
   * 3. 服务调用日志 - 追踪调用前后的状态
   * 4. 错误捕获日志 - 记录任何异常信息
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // [调试日志 1] 打印接收到的请求体，检查数据结构是否正确
      console.log('[创建酒店 - Controller] 请求体:', JSON.stringify(req.body, null, 2));

      const body: CreateHotelRequest = req.body;
      const userId = (req as any).userId;

      // [调试日志 2] 打印从认证中间件提取的用户ID
      console.log('[创建酒店 - Controller] 用户ID:', userId);
      console.log('[创建酒店 - Controller] 用户ID类型:', typeof userId);

      // 验证输入
      console.log('[创建酒店 - Controller] 开始验证必填字段...');
      if (!body.name || !body.address || !body.city || !body.location) {
        console.log('[创建酒店 - Controller] 验证失败 - 缺少必填字段');
        console.log('[创建酒店 - Controller] name:', !!body.name);
        console.log('[创建酒店 - Controller] address:', !!body.address);
        console.log('[创建酒店 - Controller] city:', !!body.city);
        console.log('[创建酒店 - Controller] location:', !!body.location);
        throw new ApiError(400, '缺少必填字段');
      }
      console.log('[创建酒店 - Controller] 必填字段验证通过');

      // [调试日志 3] 调用服务层前打印
      console.log('[创建酒店 - Controller] 准备调用 hotelService.create...');
      const hotel = await hotelService.create(body, userId);
      console.log('[创建酒店 - Controller] hotelService.create 调用成功');
      console.log('[创建酒店 - Controller] 返回的酒店ID:', hotel.id);

      res.status(201).json({
        success: true,
        data: hotel,
      });
    } catch (error) {
      // [调试日志 4] 捕获并详细打印错误信息
      console.log('[创建酒店 - Controller] 捕获到错误:');
      console.log('[创建酒店 - Controller] 错误名称:', error?.constructor?.name);
      console.log('[创建酒店 - Controller] 错误消息:', error?.message);
      console.log('[创建酒店 - Controller] 错误堆栈:', error?.stack);
      next(error);
    }
  },

  /**
   * 更新酒店
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const body: UpdateHotelRequest = req.body;

      const hotel = await hotelService.getById(id);
      if (!hotel) {
        throw new ApiError(404, '酒店不存在');
      }

      const updatedHotel = await hotelService.update(id, body);

      res.json({
        success: true,
        data: updatedHotel,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 审核酒店
   */
  audit: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const body: AuditHotelRequest = req.body;

      const hotel = await hotelService.getById(id);
      if (!hotel) {
        throw new ApiError(404, '酒店不存在');
      }

      await hotelService.audit(id, body.action, body.reason);

      res.json({
        success: true,
        message: body.action === 'approve' ? '审核通过' : '审核拒绝',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 更新酒店状态
   */
  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status }: UpdateHotelStatusRequest = req.body;

      const hotel = await hotelService.getById(id);
      if (!hotel) {
        throw new ApiError(404, '酒店不存在');
      }

      await hotelService.updateStatus(id, status);

      res.json({
        success: true,
        message: status === 'online' ? '酒店已上线' : '酒店已下线',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 删除酒店
   */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const hotel = await hotelService.getById(id);
      if (!hotel) {
        throw new ApiError(404, '酒店不存在');
      }

      await hotelService.delete(id);

      res.json({
        success: true,
        message: '酒店已删除',
      });
    } catch (error) {
      next(error);
    }
  },
};
