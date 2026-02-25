/**
 * server/src/routes/auth.ts
 * 认证相关路由
 *
 * 【什么是路由？】
 * 路由就是 API 的"地址簿"，它定义了：
 * - 什么 URL 路径对应什么处理函数
 * - 哪些接口需要登录才能访问
 *
 * 【Express 路由语法】
 * router.方法('路径', 中间件1, 中间件2, ..., 处理函数)
 *
 * 例如：router.post('/login', authController.login)
 * 表示：当收到 POST 请求到 /api/auth/login 时，调用 authController.login 函数
 *
 * 【中间件 authenticate 的作用】
 * 如果路由中有 authenticate，表示这个接口需要登录
 * authenticate 会验证请求头中的 JWT Token，验证通过才会继续执行后续代码
 */

import { Router } from 'express';
import { authController } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

// 创建一个路由实例
// Router() 是 Express 提供的方法，用于创建可挂载的路由处理器
const router: Router = Router();

// ========================================
// 公开接口（无需登录即可访问）
// ========================================

/**
 * POST /api/auth/register
 * 用户注册
 *
 * 【为什么不需要 authenticate？】
 * 因为注册时用户还没有账号，当然没有 Token，所以这是公开接口
 *
 * 【请求体示例】
 * {
 *   "username": "test",
 *   "password": "test1234",
 *   "realName": "测试用户",
 *   "role": "hotel_admin"
 * }
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * 用户登录
 *
 * 【这是最核心的接口之一】
 * 用户输入用户名密码，验证通过后返回 JWT Token
 *
 * 【请求体示例】
 * {
 *   "username": "admin",
 *   "password": "admin123"
 * }
 *
 * 【响应示例】
 * {
 *   "success": true,
 *   "data": {
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "user": { "id": "xxx", "username": "admin", ... }
 *   }
 * }
 */
router.post('/login', authController.login);

// ========================================
// 需要登录的接口（有 authenticate 中间件）
// ========================================

/**
 * GET /api/auth/me
 * 获取当前用户信息（需要认证）
 *
 * 【authenticate 的作用】
 * 1. 从请求头中取出 Token
 * 2. 验证 Token 是否有效
 * 3. 从 Token 中解析出 userId
 * 4. 把 userId 存到 req.userId 中，供后续使用
 *
 * 如果 Token 无效或过期，authenticate 会直接返回 401 错误，
 * 不会执行 authController.me
 */
router.get('/me', authenticate, authController.me);

/**
 * PUT /api/auth/me
 * 更新当前用户信息（需要认证）
 *
 * 【PUT vs POST 的区别】
 * - POST 通常用于"创建"资源
 * - PUT 通常用于"更新"资源
 *
 * 【请求体示例】
 * {
 *   "realName": "新名字",
 *   "phone": "13800138000",
 *   "email": "new@email.com"
 * }
 */
router.put('/me', authenticate, authController.updateMe);

/**
 * POST /api/auth/change-password
 * 修改密码（需要认证）
 *
 * 【请求体示例】
 * {
 *   "oldPassword": "admin123",
 *   "newPassword": "newpass123"
 * }
 *
 * 【安全考虑】
 * 1. 需要验证旧密码，防止被他人恶意修改
 * 2. 新密码会进行强度验证（8-20位+字母+数字）
 * 3. 新密码会用 bcrypt 加密后存储
 */
router.post('/change-password', authenticate, authController.changePassword);

// ========================================
// 管理员接口（需要登录 + 管理员权限）
// ========================================

/**
 * GET /api/auth/users
 * 获取所有用户（需要认证+系统管理员权限）
 *
 * 【权限控制】
 * 虽然这里只有 authenticate，但 authController.getAllUsers 内部
 * 会检查当前用户是否是 admin 角色，不是则返回 403 无权访问
 */
router.get('/users', authenticate, authController.getAllUsers);

/**
 * PUT /api/auth/users/:id
 * 更新用户（需要认证+系统管理员权限）
 *
 * 【:id 是什么？】
 * 这是一个"路由参数"，表示这个位置可以是任意值
 * 例如：PUT /api/auth/users/user-123
 * :id 的值就是 "user-123"
 *
 * 在控制器中通过 req.params.id 获取这个值
 */
router.put('/users/:id', authenticate, authController.updateUser);

/**
 * DELETE /api/auth/users/:id
 * 删除用户（需要认证+系统管理员权限）
 *
 * 【RESTful 规范】
 * - GET 用于获取资源
 * - POST 用于创建资源
 * - PUT 用于更新资源
 * - DELETE 用于删除资源
 */
router.delete('/users/:id', authenticate, authController.deleteUser);

/**
 * DELETE /api/auth/account
 * 注销账号（需要认证+密码确认）
 *
 * 【注销 vs 删除用户的区别】
 * - DELETE /api/auth/users/:id 是管理员删除其他用户
 * - DELETE /api/auth/account 是用户删除自己的账号
 *
 * 注销账号需要用户再次输入密码确认，防止误操作
 */
router.delete('/account', authenticate, authController.deleteAccount);

// 导出路由，供 app.ts 使用
// 在 app.ts 中：app.use('/api/auth', authRoutes);
// 这样所有本文件定义的路由都会加上 /api/auth 前缀
export default router;
