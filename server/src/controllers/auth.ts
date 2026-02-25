/**
 * server/src/controllers/auth.ts
 * 认证控制器
 *
 * 【什么是控制器？】
 * 控制器是处理 HTTP 请求的核心，它负责：
 * 1. 从请求中获取参数（req.body, req.params, req.headers）
 * 2. 调用服务层处理业务逻辑
 * 3. 返回响应给客户端（res.json）
 *
 * 【控制器的职责边界】
 * 控制器只负责"接收请求 → 调用服务 → 返回响应"
 * 具体的业务逻辑（如密码加密、数据库查询）应该放在服务层
 *
 * 【Express 的三个核心参数】
 * - req (Request): 请求对象，包含请求参数、请求头等
 * - res (Response): 响应对象，用于返回数据给客户端
 * - next (NextFunction): 下一个中间件函数，用于错误处理
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authService } from '../services/auth';
import { ApiError } from '../utils/errors';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import type { LoginRequest, RegisterRequest, UserRole } from '../../../shared/types/user';

// ========================================
// 配置常量
// ========================================

// JWT 密钥：用于签名和验证 Token
// 生产环境应该从环境变量读取，不要硬编码在代码中
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Token 有效期：7天
// '7d' 表示 7 天，也可以写成 '168h'（168小时）
const JWT_EXPIRES_IN = '7d';

/**
 * 生成 JWT Token
 *
 * 【JWT 结构】
 * JWT 由三部分组成：Header.Payload.Signature
 * - Header: 算法信息
 * - Payload: 存储的数据（这里存了 userId）
 * - Signature: 签名，防止被篡改
 *
 * @param userId - 用户ID，会被存入 Token 中
 * @returns 生成的 Token 字符串
 */
function generateToken(userId: string): string {
  // jwt.sign(载荷, 密钥, 选项)
  // 载荷：要存储的数据，这里是 userId
  // 密钥：用于签名，验证时需要相同的密钥
  // 选项：expiresIn 设置过期时间
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 认证控制器
 *
 * 【为什么用对象导出？】
 * 使用对象 authController = { login, register, ... } 的方式导出，
 * 而不是单独导出每个函数，这样的好处是：
 * 1. 代码组织更清晰
 * 2. 导入时可以明确知道这些函数属于 authController
 * 3. 便于扩展（添加新方法只需在对象中添加）
 */
export const authController = {
  // ========================================
  // 用户注册
  // ========================================
  /**
   * 用户注册
   *
   * 【注册流程】
   * 1. 验证必填字段是否存在
   * 2. 验证密码强度
   * 3. 检查用户名是否已存在
   * 4. 对密码进行加密
   * 5. 创建用户记录
   * 6. 生成 Token
   * 7. 返回用户信息（不含密码）
   *
   * 【请求体】
   * {
   *   username: string,    // 用户名
   *   password: string,    // 密码
   *   realName: string,    // 真实姓名
   *   role: UserRole,      // 角色
   *   phone?: string,      // 手机号（可选）
   *   email?: string       // 邮箱（可选）
   * }
   */
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Step 1: 获取请求体数据
      // req.body 是 Express 解析后的 JSON 请求体
      const body: RegisterRequest = req.body;

      // Step 2: 验证必填字段
      // 如果缺少任何必填字段，抛出 400 错误
      if (!body.username || !body.password || !body.realName || !body.role) {
        // ApiError 是自定义错误类，第一个参数是 HTTP 状态码，第二个是错误消息
        throw new ApiError(400, '缺少必填字段');
      }

      // Step 3: 禁止注册管理员账号
      // 系统管理员只能由现有管理员在后台创建，防止权限提升攻击
      if (body.role === 'admin') {
        throw new ApiError(403, '系统管理员账号仅能由现有管理员在账号管理中创建');
      }

      // Step 4: 验证密码强度
      // 调用工具函数验证密码是否符合要求（8-20位+字母+数字）
      const passwordStrength = validatePasswordStrength(body.password);
      if (!passwordStrength.valid) {
        throw new ApiError(400, passwordStrength.message);
      }

      // Step 5: 检查用户名是否已存在
      // 调用服务层查询数据库
      const existingUser = await authService.findByUsername(body.username);
      if (existingUser) {
        // 409 Conflict 表示资源冲突
        throw new ApiError(409, '用户名已存在');
      }

      // Step 6: 对密码进行加密
      // 永远不要存储明文密码！
      // hashPassword 使用 bcrypt 算法加密
      const hashedPassword = await hashPassword(body.password);

      // Step 7: 创建用户
      // 将加密后的密码传给服务层
      // ...body 是展开运算符，把 body 的所有属性展开
      // 然后覆盖 password 属性为加密后的密码
      const user = await authService.create({
        ...body,
        password: hashedPassword,
      });

      // Step 8: 生成 Token
      // 注册成功后自动登录，所以生成 Token
      const token = generateToken(user.id);

      // Step 9: 过滤掉密码字段
      // 解构赋值 + rest 运算符
      // 把 password 单独提取出来，剩下的属性放入 safeUser
      // 这样返回给前端的数据就不会包含密码
      const { password, ...safeUser } = user;

      // Step 10: 返回响应
      // res.status(201) 设置 HTTP 状态码为 201（创建成功）
      // res.json() 返回 JSON 格式的响应体
      res.status(201).json({
        success: true,
        data: {
          token,
          user: safeUser,
        },
      });
    } catch (error) {
      // 错误处理：将错误传递给 Express 的错误处理中间件
      // next(error) 会跳过后续中间件，直接进入错误处理
      next(error);
    }
  },

  // ========================================
  // 用户登录 ⭐ 最重要！答辩必问
  // ========================================
  /**
   * 用户登录
   *
   * 【登录流程】
   * 1. 验证用户名和密码是否为空
   * 2. 根据用户名查找用户
   * 3. 验证密码是否正确
   * 4. 生成 JWT Token
   * 5. 返回 Token 和用户信息
   *
   * 【安全注意】
   * - 用户不存在和密码错误返回相同的错误消息
   *   防止攻击者枚举用户名
   *
   * 【请求体】
   * {
   *   username: string,
   *   password: string
   * }
   */
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Step 1: 获取请求体
      const body: LoginRequest = req.body;

      // Step 2: 验证输入是否为空
      if (!body.username || !body.password) {
        throw new ApiError(400, '用户名和密码不能为空');
      }

      // Step 3: 根据用户名查找用户
      // 调用服务层的 findByUsername 方法
      const user = await authService.findByUsername(body.username);
      if (!user) {
        // 用户不存在
        // 注意：错误消息是"用户名或密码错误"，而不是"用户不存在"
        // 这是为了安全，防止攻击者枚举系统中存在的用户名
        throw new ApiError(401, '用户名或密码错误');
      }

      // Step 4: 验证密码
      // comparePassword(明文密码, 加密后的密码)
      // bcrypt.compare 会用相同的算法和盐值加密明文，然后比较
      const isValidPassword = await comparePassword(body.password, user.password);
      if (!isValidPassword) {
        // 密码错误，返回和用户不存在相同的错误消息
        throw new ApiError(401, '用户名或密码错误');
      }

      // Step 5: 验证通过，生成 Token
      // Token 中存储用户 ID，有效期 7 天
      const token = generateToken(user.id);

      // Step 6: 过滤密码字段
      // 不要把密码返回给前端！
      const { password, ...safeUser } = user;

      // Step 7: 返回响应
      // 登录成功返回 200 状态码（默认就是 200，不需要显式设置）
      res.json({
        success: true,
        data: {
          token,
          user: safeUser,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ========================================
  // 获取当前用户信息
  // ========================================
  /**
   * 获取当前用户信息
   *
   * 【这个接口的前提】
   * 请求必须通过 authenticate 中间件
   * 中间件会验证 Token，并把 userId 存到 req.userId
   *
   * 【请求头】
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   */
  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 从 req 对象获取 userId
      // 这个 userId 是 authenticate 中间件设置的
      // (req as any) 是类型断言，因为 Express 默认类型没有 userId 属性
      const userId = (req as any).userId;

      // 双重检查：确保 userId 存在
      if (!userId) {
        throw new ApiError(401, '未授权');
      }

      // 根据 ID 查询用户
      const user = await authService.findById(userId);
      if (!user) {
        // 理论上不应该发生，因为 Token 是有效的
        // 但如果用户被删除了，就会出现这种情况
        throw new ApiError(404, '用户不存在');
      }

      // 过滤密码字段
      const { password, ...safeUser } = user;

      // 返回用户信息
      res.json({
        success: true,
        data: safeUser,
      });
    } catch (error) {
      next(error);
    }
  },

  // ========================================
  // 更新当前用户信息
  // ========================================
  /**
   * 更新当前用户信息
   *
   * 【只能更新部分字段】
   * 用户只能修改自己的 realName、phone、email
   * 不能修改 username、role、password（这些有单独的接口）
   */
  updateMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      // 从请求体中解构出允许修改的字段
      const { realName, phone, email } = req.body;

      if (!userId) {
        throw new ApiError(401, '未授权');
      }

      // 检查用户是否存在
      const user = await authService.findById(userId);
      if (!user) {
        throw new ApiError(404, '用户不存在');
      }

      // 构建更新对象
      // 只更新请求体中提供的字段
      const updates: any = {};
      if (realName) updates.realName = realName;
      if (phone) updates.phone = phone;
      if (email !== undefined) updates.email = email;  // email 可以设置为空字符串

      // 调用服务层更新
      await authService.update(userId, updates);

      // 查询更新后的用户信息
      const updatedUser = await authService.findById(userId);
      const { password, ...safeUser } = updatedUser!;  // ! 表示断言不为 null

      res.json({
        success: true,
        data: safeUser,
        message: '个人信息更新成功',
      });
    } catch (error) {
      next(error);
    }
  },

  // ========================================
  // 修改密码
  // ========================================
  /**
   * 修改密码
   *
   * 【安全设计】
   * 1. 需要验证旧密码 - 防止被他人恶意修改
   * 2. 新密码需要强度验证
   * 3. 新密码加密后存储
   */
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { oldPassword, newPassword } = req.body;

      // 验证必填字段
      if (!oldPassword || !newPassword) {
        throw new ApiError(400, '缺少必填字段');
      }

      // 查询当前用户
      const user = await authService.findById(userId);
      if (!user) {
        throw new ApiError(404, '用户不存在');
      }

      // 验证旧密码是否正确
      const isValidPassword = await comparePassword(oldPassword, user.password);
      if (!isValidPassword) {
        throw new ApiError(401, '原密码错误');
      }

      // 验证新密码强度
      const passwordStrength = validatePasswordStrength(newPassword);
      if (!passwordStrength.valid) {
        throw new ApiError(400, passwordStrength.message);
      }

      // 加密新密码
      const hashedPassword = await hashPassword(newPassword);

      // 更新密码
      await authService.update(userId, { password: hashedPassword });

      res.json({
        success: true,
        message: '密码修改成功',
      });
    } catch (error) {
      next(error);
    }
  },

  // ========================================
  // 获取所有用户（仅系统管理员）
  // ========================================
  /**
   * 获取所有用户
   *
   * 【权限检查】
   * 在控制器内部检查用户角色
   * 只有 admin 角色才能调用此接口
   */
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 先查询当前登录用户
      const requestingUser = await authService.findById((req as any).userId);

      // 检查是否是管理员
      if (!requestingUser || requestingUser.role !== 'admin') {
        throw new ApiError(403, '无权访问');
      }

      // 查询所有用户
      const users = await authService.findAll();

      // 移除所有用户的密码字段
      // map 遍历数组，对每个用户执行解构过滤
      const safeUsers = users.map(({ password, ...user }) => user);

      res.json({
        success: true,
        data: safeUsers,
      });
    } catch (error) {
      next(error);
    }
  },

  // ========================================
  // 更新用户（仅系统管理员）
  // ========================================
  /**
   * 更新用户
   *
   * 【路由参数】
   * PUT /api/auth/users/:id
   * :id 是路由参数，通过 req.params.id 获取
   */
  updateUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 权限检查
      const requestingUser = await authService.findById((req as any).userId);
      if (!requestingUser || requestingUser.role !== 'admin') {
        throw new ApiError(403, '无权访问');
      }

      // 从路由参数获取用户 ID
      const { id } = req.params;
      const updates = req.body;

      if (!id) {
        throw new ApiError(400, '缺少用户ID');
      }

      // 检查目标用户是否存在
      const targetUser = await authService.findById(id as string);
      if (!targetUser) {
        throw new ApiError(404, '用户不存在');
      }

      // 如果要更新密码，需要加密
      if (updates.password) {
        const passwordStrength = validatePasswordStrength(updates.password);
        if (!passwordStrength.valid) {
          throw new ApiError(400, passwordStrength.message);
        }
        updates.password = await hashPassword(updates.password);
      }

      // 执行更新
      await authService.update(id as string, updates);

      // 返回更新后的用户信息
      const updatedUser = await authService.findById(id as string);
      const { password, ...safeUser } = updatedUser!;

      res.json({
        success: true,
        data: safeUser,
        message: '用户更新成功',
      });
    } catch (error) {
      next(error);
    }
  },

  // ========================================
  // 删除用户（仅系统管理员）
  // ========================================
  /**
   * 删除用户
   *
   * 【安全检查】
   * 不允许删除自己，防止管理员把自己删了导致系统无管理员
   */
  deleteUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 权限检查
      const requestingUser = await authService.findById((req as any).userId);
      if (!requestingUser || requestingUser.role !== 'admin') {
        throw new ApiError(403, '无权访问');
      }

      const { id } = req.params;

      if (!id) {
        throw new ApiError(400, '缺少用户ID');
      }

      // 不允许删除自己
      // 比较路由参数中的 id 和当前登录用户的 id
      if (id === (req as any).userId) {
        throw new ApiError(400, '不能删除当前登录用户');
      }

      // 执行删除
      await authService.delete(id as string);

      res.json({
        success: true,
        message: '用户删除成功',
      });
    } catch (error) {
      next(error);
    }
  },

  // ========================================
  // 注销账号（需要密码确认）
  // ========================================
  /**
   * 注销账号
   *
   * 【和删除用户的区别】
   * - deleteUser: 管理员删除其他用户
   * - deleteAccount: 用户删除自己的账号
   *
   * 【安全设计】
   * 需要再次输入密码确认，防止误操作或被他人恶意删除
   */
  deleteAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { password } = req.body;

      // 验证密码是否提供
      if (!password) {
        throw new ApiError(400, '请输入密码确认');
      }

      // 查询当前用户
      const user = await authService.findById(userId);
      if (!user) {
        throw new ApiError(404, '用户不存在');
      }

      // 验证密码
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        throw new ApiError(401, '密码错误');
      }

      // 删除用户账号
      await authService.delete(userId);

      res.json({
        success: true,
        message: '账号已注销',
      });
    } catch (error) {
      next(error);
    }
  },
};
