/**
 * server/src/middleware/auth.ts
 * 认证中间件
 *
 * 【什么是中间件？】
 * 中间件是一个函数，在请求到达控制器之前执行。
 * 它可以：
 * - 验证请求（比如检查用户是否登录）
 * - 修改请求对象（比如添加用户信息）
 * - 终止请求（比如返回错误）
 *
 * 【中间件的工作原理】
 * 请求 → 中间件1 → 中间件2 → 控制器 → 响应
 *
 * 每个中间件接收三个参数：
 * - req: 请求对象
 * - res: 响应对象
 * - next: 调用后继续执行下一个中间件/控制器
 *
 * 【中间件的使用方式】
 * router.get('/me', authenticate, authController.me)
 *                     ↑
 *               这就是中间件，请求先经过它，再到达控制器
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/errors';

// JWT 密钥（和控制器中保持一致）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * 生成 JWT Token
 *
 * 【为什么这里也有这个函数？】
 * 控制器中已经有一个 generateToken，这里再定义一个是为了：
 * 1. 中间件文件可以独立工作
 * 2. 导出供其他模块使用（见文件末尾的 export）
 *
 * @param userId - 要存入 Token 的用户 ID
 * @returns JWT Token 字符串
 */
function generateToken(userId: string): string {
  // jwt.sign(载荷, 密钥, 选项)
  // - 载荷 { userId }: 存储的数据，后续可以从 Token 中解析出来
  // - 密钥 JWT_SECRET: 用于签名，验证时需要相同的密钥
  // - 选项 { expiresIn }: Token 有效期
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 扩展 Express Request 类型
 *
 * 【为什么需要这个？】
 * Express 默认的 Request 类型没有 userId 和 userRole 属性。
 * 我们要在中间件中设置 req.userId，需要先扩展类型定义。
 *
 * 【TypeScript 类型扩展语法】
 * declare global { ... } 声明全局类型
 * namespace Express { ... } 扩展 Express 命名空间
 * interface Request { ... } 扩展 Request 接口
 *
 * 这样写完后，req.userId 和 req.userRole 就不会报类型错误了
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;    // 当前登录用户的 ID
      userRole?: string;  // 当前登录用户的角色（预留）
    }
  }
}

/**
 * 认证中间件 ⭐ 最重要！答辩必问
 *
 * 【这个中间件做什么？】
 * 1. 从请求头获取 Token
 * 2. 验证 Token 是否有效
 * 3. 从 Token 中解析出 userId
 * 4. 把 userId 存到 req 对象中
 * 5. 调用 next() 继续执行后续代码
 *
 * 【Token 的格式】
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLWFkbWluMDAxIiwiaWF0IjoxNzQwMDEyMzQ1NiwiZXhwIjoxNzQwNjE3MTU2fQ.xxx
 *              ↑      ↑
 *           前缀    Token 内容
 *
 * @param req - Express 请求对象
 * @param _res - Express 响应对象（下划线表示未使用）
 * @param next - 下一个中间件/控制器函数
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    // ========== 调试日志 ==========
    // 这些 console.log 用于开发调试，生产环境可以删除
    console.log('[认证中间件] 请求到达:', req.method, req.path);
    console.log('[认证中间件] Authorization header:', req.headers.authorization ? '存在' : '不存在');

    // ========== Step 1: 获取 Authorization 请求头 ==========
    // req.headers.authorization 获取请求头中的 Authorization 字段
    const authHeader = req.headers.authorization;

    // ========== Step 2: 检查请求头格式 ==========
    // Token 格式应该是 "Bearer xxxxx"
    // - authHeader 存在
    // - 以 "Bearer " 开头（注意 Bearer 后面有空格）
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[认证中间件] 认证失败 - 缺少或无效的 Authorization header');
      // 抛出 401 错误，表示未认证
      throw new ApiError(401, '未提供认证Token');
    }

    // ========== Step 3: 提取 Token ==========
    // authHeader.substring(7) 截取从第 7 个字符开始的内容
    // "Bearer eyJhbGc..." → "eyJhbGc..."
    //                      ↑
    //               从这里开始截取（索引 7，因为 "Bearer " 有 7 个字符）
    const token = authHeader.substring(7);
    console.log('[认证中间件] Token 长度:', token.length);
    console.log('[认证中间件] 开始验证 Token...');

    // ========== Step 4: 验证 Token ==========
    // jwt.verify(token, secret) 验证 Token
    // - 验证签名是否正确（用相同的密钥）
    // - 验证是否过期
    // - 返回 Token 中存储的数据（载荷）
    //
    // 如果验证失败，会抛出错误，进入 catch 块
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    console.log('[认证中间件] Token 验证成功');
    console.log('[认证中间件] 提取的 userId:', decoded.userId);

    // ========== Step 5: 将 userId 附加到请求对象 ==========
    // 这样后续的控制器就可以通过 req.userId 获取当前登录用户的 ID
    req.userId = decoded.userId;
    console.log('[认证中间件] req.userId 已设置:', req.userId);

    // ========== Step 6: 调用 next() 继续执行 ==========
    // next() 调用后，请求会继续传递给下一个中间件或控制器
    // 如果不调用 next()，请求就会被挂起，客户端收不到响应
    next();

  } catch (error: any) {
    // ========== 错误处理 ==========
    console.log('[认证中间件] 捕获到错误:');
    console.log('[认证中间件] 错误名称:', error.name);
    console.log('[认证中间件] 错误消息:', error.message);

    // 根据错误类型返回不同的错误消息
    // jwt.verify 可能抛出以下错误：
    // - TokenExpiredError: Token 已过期
    // - JsonWebTokenError: Token 格式错误或签名不匹配
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token已过期');
    } else if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, '无效的Token');
    } else {
      // 其他错误（比如我们主动抛出的 ApiError）
      throw new ApiError(401, '认证失败');
    }
  }
};

/**
 * 管理员权限中间件
 *
 * 【用途】
 * 验证用户是否为管理员角色
 * 配合 authenticate 中间件使用
 *
 * 【使用方式】
 * router.delete('/users/:id', authenticate, requireAdmin, controller)
 *                                ↑            ↑
 *                           先验证登录   再验证权限
 *
 * 【当前状态】
 * TODO: 实际使用时应从数据库查询用户角色
 * 目前权限检查是在控制器内部进行的
 */
export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  // 从 req 获取 userId（由 authenticate 中间件设置）
  const userId = req.userId;

  // 检查是否已登录
  if (!userId) {
    throw new ApiError(401, '未授权');
  }

  // TODO: 实际使用时应从数据库查询用户角色
  // 这里暂时跳过，实际使用时需要配合认证中间件使用
  // 正确的实现应该是：
  // const user = await authService.findById(userId);
  // if (user.role !== 'admin') {
  //   throw new ApiError(403, '需要管理员权限');
  // }

  next();
};

/**
 * 可选认证中间件
 *
 * 【和 authenticate 的区别】
 * - authenticate: 必须有有效 Token，否则报错
 * - optionalAuth: 有 Token 就解析，没有就跳过
 *
 * 【使用场景】
 * 某些接口对登录和未登录用户都开放，但显示不同内容
 * 例如：商品详情页，登录用户显示收藏状态，未登录用户不显示
 *
 * 【为什么 catch 中直接 next()？】
 * 因为是"可选"认证，Token 无效时也应该继续执行，而不是返回错误
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    // 如果有 Token，尝试解析
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      // 解析成功，设置 userId
      req.userId = decoded.userId;
    }

    // 无论有没有 Token，都继续执行
    next();
  } catch (error) {
    // Token 无效，忽略错误，继续执行
    // 这里的想法是：有 Token 但无效，就当作没有 Token 处理
    next();
  }
};

// 导出 generateToken，供控制器使用
// 控制器可以 import { generateToken } from '../middleware/auth'
export { generateToken };
