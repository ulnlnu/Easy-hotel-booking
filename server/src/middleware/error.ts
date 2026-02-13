/**
 * server/src/middleware/error.ts
 * 错误处理中间件
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';

/**
 * 错误处理中间件
 */
export const errorHandler = (
  error: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', error);

  // ApiError
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });
    return;
  }

  // 其他错误
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    code: 'INTERNAL_ERROR',
  });
};

/**
 * 404处理中间件
 */
export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
    code: 'NOT_FOUND',
  });
};
