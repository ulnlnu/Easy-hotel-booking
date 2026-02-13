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
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: CreateHotelRequest = req.body;
      const userId = (req as any).userId;

      // 验证输入
      if (!body.name || !body.address || !body.city || !body.location) {
        throw new ApiError(400, '缺少必填字段');
      }

      const hotel = await hotelService.create(body, userId);

      res.status(201).json({
        success: true,
        data: hotel,
      });
    } catch (error) {
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
