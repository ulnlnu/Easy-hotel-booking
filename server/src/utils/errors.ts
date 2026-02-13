/**
 * server/src/utils/errors.ts
 * 自定义错误类
 */

/**
 * API错误类
 */
export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    this.code = code || 'API_ERROR';
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * 认证错误类
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = '认证失败') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * 权限错误类
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = '无权访问') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * 资源不存在错误类
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = '资源') {
    super(404, `${resource}不存在`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * 业务逻辑错误类
 */
export class BusinessError extends ApiError {
  constructor(message: string, code?: string) {
    super(400, message, code || 'BUSINESS_ERROR');
    this.name = 'BusinessError';
  }
}
