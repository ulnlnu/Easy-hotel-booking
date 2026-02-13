# API接口参考文档 - 后端开发与联调专用

> **成员C专用版本** - 后端开发与联调完整参考

---

## 📋 快速导航

- [1. 通用规范](#1-通用规范)
- [2. 认证API详细实现](#2-认证api详细实现)
- [3. 酒店API详细实现](#3-酒店api详细实现)
- [4. 中间件实现](#4-中间件实现)
- [5. 数据存储实现](#5-数据存储实现)
- [6. 错误处理实现](#6-错误处理实现)

---

## 1. 通用规范

### 1.1 响应格式强制要求

**所有接口必须严格遵循以下格式**：

```typescript
// ✅ 成功响应（强制）
{
  "success": true,
  "data": { /* 实际数据 */ },
  "message": "操作成功（可选）"
}

// ❌ 失败响应（强制）
{
  "success": false,
  "message": "错误原因（必填）",
  "code": "ERROR_CODE（可选）"
}
```

**实现检查清单**：

```typescript
// ✅ 每个controller方法必须检查
export const hotelController = {
  create: async (req, res) => {
    try {
      const result = await hotelService.create(req.body, req.userId);
      // ✅ 成功：success=true, 有data字段
      res.status(201).json({
        success: true,
        data: result,
        message: '创建成功'
      });
    } catch (error) {
      // ❌ 失败：success=false, 有message字段
      res.status(400).json({
        success: false,
        message: error.message || '创建失败',
        code: 'CREATE_FAILED'
      });
    }
  }
};
```

### 1.2 HTTP状态码使用规范

| 状态码 | 后端使用场景 | 示例 |
|--------|-------------|------|
| **200** | 默认成功响应 | 所有GET、PUT、DELETE成功 |
| **201** | 资源创建成功 | POST /api/hotels 创建酒店 |
| **400** | 请求参数错误 | 缺少必填字段、参数格式错误、业务规则校验失败 |
| **401** | 认证失败 | Token缺失、Token过期、Token无效 |
| **403** | 权限不足 | 已登录但无权操作（非管理员尝试管理员操作） |
| **404** | 资源不存在 | 酒店/用户ID不存在 |
| **409** | 资源冲突 | 用户名已存在 |
| **500** | 服务器内部错误 | 未捕获的异常 |

**实现示例**：

```typescript
// server/src/controllers/hotels.ts
export const hotelController = {
  getDetail: async (req, res, next) => {
    try {
      const hotel = await hotelService.getById(req.params.id);

      // ✅ 使用404表示资源不存在
      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: '酒店不存在',
          code: 'HOTEL_NOT_FOUND'
        });
      }

      // ✅ 使用200表示成功
      res.json({
        success: true,
        data: hotel
      });
    } catch (error) {
      // ✅ 未捕获异常使用500
      next(error); // 传递给错误处理中间件，返回500
    }
  }
};
```

---

## 2. 认证API详细实现

### 2.1 用户注册 (POST /api/auth/register)

**完整Controller实现**：

```typescript
// server/src/controllers/auth.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { RegisterRequest, SafeUser } from '../../../shared/types/user';
import { authService } from '../services/auth';
import { ApiError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export const authController = {
  /**
   * 用户注册
   *
   * 业务规则：
   * 1. 用户名必填，3-20字符
   * 2. 密码必填，6-20字符
   * 3. realName必填
   * 4. role必填（admin|hotel_admin|user）
   * 5. 用户名不能重复
   * 6. 密码必须bcrypt加密存储
   */
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: RegisterRequest = req.body;

      // ========== 第1步：参数校验 ==========
      if (!body.username || !body.password || !body.realName || !body.role) {
        return res.status(400).json({
          success: false,
          message: '缺少必填字段：username, password, realName, role',
          code: 'MISSING_FIELDS',
        });
      }

      // 用户名长度校验
      if (body.username.length < 3 || body.username.length > 20) {
        return res.status(400).json({
          success: false,
          message: '用户名长度必须在3-20字符之间',
          code: 'INVALID_USERNAME_LENGTH',
        });
      }

      // 密码长度校验
      if (body.password.length < 6 || body.password.length > 20) {
        return res.status(400).json({
          success: false,
          message: '密码长度必须在6-20字符之间',
          code: 'INVALID_PASSWORD_LENGTH',
        });
      }

      // 角色校验
      const validRoles = ['admin', 'hotel_admin', 'user'];
      if (!validRoles.includes(body.role)) {
        return res.status(400).json({
          success: false,
          message: '角色参数错误，必须为admin、hotel_admin或user',
          code: 'INVALID_ROLE',
        });
      }

      // ========== 第2步：业务规则校验 ==========
      const existingUser = await authService.findByUsername(body.username);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: '用户名已存在',
          code: 'USERNAME_EXISTS',
        });
      }

      // ========== 第3步：数据处理 ==========
      // ✅ 密码必须bcrypt加密（cost=10）
      const hashedPassword = await bcrypt.hash(body.password, 10);

      // ========== 第4步：创建用户 ==========
      const newUser = await authService.create({
        ...body,
        password: hashedPassword,
      });

      // ========== 第5步：生成token ==========
      const token = generateToken(newUser.id);

      // ========== 第6步：返回响应（不含密码） ==========
      const { password, ...safeUser } = newUser;

      res.status(201).json({
        success: true,
        data: {
          token,
          user: safeUser as SafeUser,
        },
        message: '注册成功',
      });
    } catch (error) {
      next(error);
    }
  },

  // ... 其他方法
};
```

**Service层实现**：

```typescript
// server/src/services/auth.ts
import type { User, RegisterRequest } from '../../../shared/types/user';
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE = path.join(__dirname, '../../data/users.json');

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const authService = {
  findByUsername: async (username: string): Promise<User | null> => {
    const users = await readUsers();
    return users.find(u => u.username === username) || null;
  },

  create: async (data: RegisterRequest & { password: string }): Promise<User> => {
    const users = await readUsers();

    const now = new Date().toISOString();
    const newUser: User = {
      id: generateId(),
      username: data.username,
      password: data.password,  // ✅ 已加密的密码
      realName: data.realName,
      role: data.role,
      phone: data.phone,
      email: data.email,
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);
    await writeUsers(users);

    return newUser;
  },
};

async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeUsers(users: User[]): Promise<void> {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}
```

---

### 2.2 用户登录 (POST /api/auth/login)

**完整Controller实现**：

```typescript
export const authController = {
  /**
   * 用户登录
   *
   * 业务规则：
   * 1. 验证用户名和密码
   * 2. 用户不存在返回401（而非404，防止用户名枚举）
   * 3. 密码错误返回401
   * 4. 登录成功生成JWT token（7天有效）
   * 5. 返回用户信息（不含密码）
   */
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: LoginRequest = req.body;

      // ========== 第1步：参数校验 ==========
      if (!body.username || !body.password) {
        return res.status(400).json({
          success: false,
          message: '用户名和密码不能为空',
          code: 'MISSING_CREDENTIALS',
        });
      }

      // ========== 第2步：查找用户 ==========
      const user = await authService.findByUsername(body.username);

      // ✅ 安全：用户不存在和密码错误返回相同提示
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // ========== 第3步：验证密码 ==========
      const bcrypt = require('bcrypt');
      const isValidPassword = await bcrypt.compare(body.password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // ========== 第4步：生成JWT token ==========
      const token = generateToken(user.id);

      // ========== 第5步：返回响应 ==========
      const { password, ...safeUser } = user;

      // ✅ 登录成功返回200
      res.json({
        success: true,
        data: {
          token,  // ✅ JWT token，7天有效
          user: safeUser,  // ✅ 不含密码
        },
        message: '登录成功',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取当前用户信息
   *
   * 业务规则：
   * 1. 需要认证（token验证通过后才能访问）
   * 2. 从中间件注入的req.userId获取用户ID
   * 3. 返回用户信息（不含密码）
   */
  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ✅ 从认证中间件获取userId
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权',
          code: 'UNAUTHORIZED',
        });
      }

      const user = await authService.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在',
          code: 'USER_NOT_FOUND',
        });
      }

      const { password, ...safeUser } = user;

      res.json({
        success: true,
        data: safeUser,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 修改密码
   *
   * 业务规则：
   * 1. 需要认证
   * 2. 验证旧密码是否正确
   * 3. 新密码bcrypt加密后更新
   */
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { oldPassword, newPassword } = req.body;

      // 参数校验
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: '缺少必填字段：oldPassword, newPassword',
          code: 'MISSING_FIELDS',
        });
      }

      // 新密码长度校验
      if (newPassword.length < 6 || newPassword.length > 20) {
        return res.status(400).json({
          success: false,
          message: '新密码长度必须在6-20字符之间',
          code: 'INVALID_PASSWORD_LENGTH',
        });
      }

      const user = await authService.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在',
          code: 'USER_NOT_FOUND',
        });
      }

      // 验证旧密码
      const bcrypt = require('bcrypt');
      const isValidPassword = await bcrypt.compare(oldPassword, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '原密码错误',
          code: 'INVALID_OLD_PASSWORD',
        });
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

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
};
```

---

## 3. 酒店API详细实现

### 3.1 获取酒店列表 (GET /api/hotels)

**完整Controller实现**：

```typescript
// server/src/controllers/hotels.ts
export const hotelController = {
  /**
   * 获取酒店列表
   *
   * 业务规则：
   * 1. 支持关键词搜索（酒店名称/地址/城市）
   * 2. 支持城市筛选
   * 3. 支持价格区间筛选（使用最低房型价格）
   * 4. 支持标签筛选（多选，逗号分隔）
   * 5. 只返回已通过审核的酒店
   * 6. 支持排序：price|distance|rating|createdAt
   * 7. 支持分页
   * 8. 距离排序时返回distance字段
   */
  getList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ========== 第1步：提取查询参数 ==========
      const query: HotelQueryParams = {
        keyword: req.query.keyword as string,
        city: req.query.city as string,
        checkIn: req.query.checkIn as string,
        checkOut: req.query.checkOut as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        // ✅ LBS定位参数
        location: req.query.lat && req.query.lng ? {
          lat: Number(req.query.lat),
          lng: Number(req.query.lng),
          radius: req.query.radius ? Number(req.query.radius) : undefined,
        } : undefined,
        sortBy: req.query.sortBy as 'price' | 'distance' | 'rating' | 'createdAt',
        order: req.query.order as 'asc' | 'desc',
        page: Number(req.query.page) || 1,
        pageSize: Math.min(Number(req.query.pageSize) || 10, 100),
      };

      // ========== 第2步：调用Service层 ==========
      const result = await hotelService.getList(query);

      // ========== 第3步：返回响应 ==========
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取附近酒店（LBS）
   *
   * 业务规则：
   * 1. 必须提供lat和lng参数
   * 2. 使用Haversine公式计算距离
   * 3. 默认按距离升序排序
   * 4. 默认搜索半径10公里
   * 5. 返回的酒店必须包含distance字段
   */
  getNearby: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lat, lng, radius = 10 } = req.query;

      // 参数校验
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: '缺少定位参数：lat, lng',
          code: 'MISSING_LOCATION',
        });
      }

      // 复用getList方法，传入location参数
      const result = await hotelService.getList({
        location: {
          lat: Number(lat),
          lng: Number(lng),
          radius: Number(radius),
        },
        sortBy: 'distance',
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取酒店详情
   *
   * 业务规则：
   * 1. 根据ID查找酒店
   * 2. 不存在返回404
   * 3. 存在返回200和完整酒店信息
   */
  getDetail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const hotel = await hotelService.getById(id);

      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: '酒店不存在',
          code: 'HOTEL_NOT_FOUND',
        });
      }

      res.json({
        success: true,
        data: hotel,
      });
    } catch (error) {
      next(error);
    }
  },

  // ... 其他方法
};
```

**完整Service层实现**：

```typescript
// server/src/services/hotels.ts
import type { Hotel, HotelQueryParams, CreateHotelRequest } from '../../../shared/types/hotel';
import { HotelStatus } from '../../../shared/types/hotel';
import fs from 'fs/promises';
import path from 'path';

const HOTELS_FILE = path.join(__dirname, '../../data/hotels.json');

/**
 * 使用Haversine公式计算两点间距离（公里）
 */
function calculateDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const R = 6371; // 地球半径（公里）
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 保留一位小数
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function generateId(): string {
  return `h-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const hotelService = {
  /**
   * 获取酒店列表
   */
  getList: async (params: HotelQueryParams) => {
    let hotels = await readHotels();

    // ========== 筛选逻辑 ==========

    // 1. 关键词筛选
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      hotels = hotels.filter(h =>
        h.name.toLowerCase().includes(keyword) ||
        h.address.toLowerCase().includes(keyword) ||
        h.city.toLowerCase().includes(keyword)
      );
    }

    // 2. 城市筛选
    if (params.city) {
      hotels = hotels.filter(h => h.city === params.city);
    }

    // 3. 价格筛选（使用最低房型价格）
    if (params.minPrice !== undefined) {
      hotels = hotels.filter(h => {
        const minPrice = Math.min(...h.roomTypes.map(r => r.price));
        return minPrice >= params.minPrice!;
      });
    }

    if (params.maxPrice !== undefined) {
      hotels = hotels.filter(h => {
        const minPrice = Math.min(...h.roomTypes.map(r => r.price));
        return minPrice <= params.maxPrice!;
      });
    }

    // 4. 标签筛选（多选，任一匹配即可）
    if (params.tags && params.tags.length > 0) {
      hotels = hotels.filter(h =>
        params.tags!.some(tag => h.tags.includes(tag))
      );
    }

    // 5. 状态筛选（只返回已通过的酒店）
    hotels = hotels.filter(h => h.status === HotelStatus.APPROVED);

    // ========== 排序逻辑 ==========

    if (params.sortBy === 'price') {
      // 按最低价格排序
      hotels.sort((a, b) => {
        const minPriceA = Math.min(...a.roomTypes.map(r => r.price));
        const minPriceB = Math.min(...b.roomTypes.map(r => r.price));
        return params.order === 'desc' ? minPriceB - minPriceA : minPriceA - minPriceB;
      });
    } else if (params.sortBy === 'distance' && params.location) {
      // ✅ 距离排序：计算每个酒店到用户位置的距离
      hotels = hotels
        .map(h => ({
          ...h,
          distance: calculateDistance(params.location!, h.location),
        }))
        .sort((a: any, b: any) => a.distance - b.distance);
    } else if (params.sortBy === 'rating') {
      // 按评分排序
      hotels.sort((a, b) =>
        params.order === 'desc' ? a.rating - b.rating : b.rating - a.rating
      );
    } else if (params.sortBy === 'createdAt') {
      // 按创建时间排序
      hotels.sort((a, b) =>
        params.order === 'desc'
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    // ========== 分页逻辑 ==========
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const pageData = hotels.slice(start, end);

    // ========== 返回结果 ==========
    return {
      success: true,
      data: pageData,
      total: hotels.length,
      page: params.page,
      pageSize: params.pageSize,
      hasMore: end < hotels.length,
    };
  },

  /**
   * 根据ID获取酒店
   */
  getById: async (id: string): Promise<Hotel | null> => {
    const hotels = await readHotels();
    return hotels.find(h => h.id === id) || null;
  },

  /**
   * 创建酒店
   */
  create: async (data: CreateHotelRequest, createdBy: string): Promise<Hotel> => {
    const hotels = await readHotels();

    // 生成酒店ID
    const id = generateId();

    // 为房型生成ID
    const roomTypes = data.roomTypes.map(rt => ({
      ...rt,
      id: `r-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));

    const now = new Date().toISOString();
    const newHotel: Hotel = {
      id,
      ...data,
      rating: 0,
      reviewCount: 0,
      status: HotelStatus.PENDING, // ✅ 新酒店默认待审核
      createdBy,
      createdAt: now,
      updatedAt: now,
      roomTypes,
    };

    hotels.push(newHotel);
    await writeHotels(hotels);

    return newHotel;
  },

  /**
   * 审核酒店
   */
  audit: async (id: string, action: 'approve' | 'reject', reason?: string): Promise<void> => {
    const hotels = await readHotels();
    const index = hotels.findIndex(h => h.id === id);

    if (index === -1) {
      throw new Error('酒店不存在');
    }

    hotels[index].status = action === 'approve'
      ? HotelStatus.APPROVED
      : HotelStatus.REJECTED;
    hotels[index].updatedAt = new Date().toISOString();

    await writeHotels(hotels);
  },

  /**
   * 更新酒店状态（上线/下线）
   */
  updateStatus: async (id: string, status: 'online' | 'offline'): Promise<void> => {
    const hotels = await readHotels();
    const index = hotels.findIndex(h => h.id === id);

    if (index === -1) {
      throw new Error('酒店不存在');
    }

    hotels[index].status = status === 'online'
      ? HotelStatus.APPROVED
      : HotelStatus.OFFLINE;
    hotels[index].updatedAt = new Date().toISOString();

    await writeHotels(hotels);
  },

  /**
   * 删除酒店
   */
  delete: async (id: string): Promise<void> => {
    const hotels = await readHotels();
    const filtered = hotels.filter(h => h.id !== id);

    if (filtered.length === hotels.length) {
      throw new Error('酒店不存在');
    }

    await writeHotels(filtered);
  },
};

async function readHotels(): Promise<Hotel[]> {
  try {
    const data = await fs.readFile(HOTELS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeHotels(hotels: Hotel[]): Promise<void> {
  await fs.mkdir(path.dirname(HOTELS_FILE), { recursive: true });
  await fs.writeFile(HOTELS_FILE, JSON.stringify(hotels, null, 2));
}
```

---

## 4. 中间件实现

### 4.1 认证中间件

```typescript
// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ✅ 扩展Express Request类型
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // ========== 第1步：获取Authorization header ==========
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证Token',
        code: 'UNAUTHORIZED',
      });
    }

    // ========== 第2步：提取token ==========
    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    // ========== 第3步：验证token ==========
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // ========== 第4步：附加到请求对象 ==========
    req.userId = decoded.userId;

    // ========== 第5步：继续处理 ==========
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token已过期',
        code: 'TOKEN_EXPIRED',
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: '无效的Token',
        code: 'INVALID_TOKEN',
      });
    } else {
      return res.status(401).json({
        success: false,
        message: '认证失败',
        code: 'AUTH_FAILED',
      });
    }
  }
};

/**
 * 管理员权限中间件
 * 验证用户是否为管理员角色
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: '未授权',
      code: 'UNAUTHORIZED',
    });
  }

  // ✅ 从数据库查询用户角色
  // 这里简化处理，实际应查询用户角色
  // const user = await userService.findById(userId);
  // if (user.role !== 'admin') {
  //   return res.status(403).json({
  //     success: false,
  //     message: '需要管理员权限',
  //     code: 'FORBIDDEN',
  //   });
  // }

  next();
};
```

### 4.2 CORS中间件

```typescript
// server/src/middleware/cors.ts
import cors from 'cors';

/**
 * ✅ CORS配置
 * 必须允许前端域名访问，否则会产生跨域错误
 */
export const corsConfig = cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',   // PC管理端
      'http://localhost:10086',  // 移动端H5
      'http://127.0.0.1:5173',
      'http://127.0.0.1:10086',
    ];

    // 允许没有origin的请求（如Postman、curl）
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      const error = new Error('不允许的跨域请求来源');
      console.error('CORS error:', error);
      // ✅ 开发环境可以允许所有来源
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,  // ✅ 允许携带cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

export default corsConfig;
```

### 4.3 错误处理中间件

```typescript
// server/src/middleware/error.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';

/**
 * ✅ 统一错误处理中间件
 * 所有controller中传递给next()的错误都会被这里捕获
 */
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 记录错误日志
  console.error('Error captured:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // ========== 自定义ApiError ==========
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });
  }

  // ========== 其他未捕获错误 ==========
  // 生产环境不暴露具体错误信息
  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(500).json({
    success: false,
    message: isDevelopment ? error.message : '服务器内部错误',
    code: 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: error.stack }), // 仅开发环境返回堆栈
  });
};

/**
 * 404处理
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
    code: 'NOT_FOUND',
    path: req.path,
  });
};
```

---

## 5. 数据存储实现

### 5.1 初始数据文件

```json
// server/src/data/users.json
[
  {
    "id": "admin-001",
    "username": "admin",
    "password": "$2b$10$abcdefghijklmnopqrstuvwxyz123456", // bcrypt加密后的 "password123"
    "realName": "系统管理员",
    "role": "admin",
    "email": "admin@yisu.com",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]

// server/src/data/hotels.json
[]  // 初始为空，由管理员创建
```

### 5.2 数据读写封装

```typescript
// server/src/services/hotels.ts（部分代码）
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const HOTELS_FILE = path.join(DATA_DIR, 'hotels.json');

/**
 * ✅ 确保数据目录存在
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // 目录已存在，忽略
  }
}

/**
 * ✅ 读取酒店数据
 */
async function readHotels(): Promise<Hotel[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(HOTELS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // 文件不存在，返回空数组
    console.error('Read hotels error:', error);
    return [];
  }
}

/**
 * ✅ 写入酒店数据
 */
async function writeHotels(hotels: Hotel[]): Promise<void> {
  await ensureDataDir();
  try {
    // ✅ 格式化JSON，方便查看
    const jsonString = JSON.stringify(hotels, null, 2);
    await fs.writeFile(HOTELS_FILE, jsonString, 'utf-8');
  } catch (error) {
    console.error('Write hotels error:', error);
    throw error;
  }
}
```

---

## 6. 错误处理实现

### 6.1 自定义错误类

```typescript
// server/src/utils/errors.ts
/**
 * ✅ 自定义API错误类
 * 所有业务错误都应该抛出这些错误类的实例
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
 * ✅ 验证错误（400）
 */
export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * ✅ 认证错误（401）
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = '认证失败') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * ✅ 权限错误（403）
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = '无权访问') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * ✅ 资源不存在错误（404）
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = '资源') {
    super(404, `${resource}不存在`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * ✅ 业务逻辑错误（400）
 */
export class BusinessError extends ApiError {
  constructor(message: string, code?: string) {
    super(400, message, code || 'BUSINESS_ERROR');
    this.name = 'BusinessError';
  }
}
```

### 6.2 错误使用示例

```typescript
// server/src/controllers/hotels.ts
export const hotelController = {
  getDetail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // ✅ 参数验证
      if (!id || id.length === 0) {
        // 抛出验证错误
        throw new ValidationError('酒店ID不能为空');
      }

      const hotel = await hotelService.getById(id);

      // ✅ 资源不存在
      if (!hotel) {
        throw new NotFoundError('酒店');
      }

      res.json({
        success: true,
        data: hotel,
      });
    } catch (error) {
      // ✅ 传递给错误处理中间件
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: CreateHotelRequest = req.body;

      // ✅ 业务规则验证
      if (!body.name || body.name.trim().length === 0) {
        throw new BusinessError('酒店名称不能为空', 'INVALID_HOTEL_NAME');
      }

      const hotel = await hotelService.create(body, req.userId);

      res.status(201).json({
        success: true,
        data: hotel,
        message: '酒店创建成功',
      });
    } catch (error) {
      next(error);
    }
  },
};
```

---

## Day 4联调检查清单

### 后端启动检查

- [ ] 安装依赖成功（`cd server && npm install`）
- [ ] 环境变量配置（`.env`文件或使用默认值）
  - [ ] `JWT_SECRET` 已设置
  - [ ] `NODE_ENV=development`
- [ ] 服务启动成功（控制台显示 `Server running on http://localhost:3000`）
- [ ] 健康检查通过（`curl http://localhost:3000/api/health`）
- [ ] CORS配置正确（响应头包含 `Access-Control-Allow-Origin`）

### API测试检查

- [ ] **注册接口测试**
  ```bash
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"123456","realName":"测试用户","role":"user"}'
  ```
  预期：`{"success":true,"data":{"token":"...","user":{...}}}`

- [ ] **登录接口测试**
  ```bash
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"password123"}'
  ```
  预期：`{"success":true,"data":{"token":"...","user":{...},"message":"登录成功"}`

- [ ] **酒店列表测试**
  ```bash
  curl "http://localhost:3000/api/hotels?page=1&pageSize=10"
  ```
  预期：返回酒店列表（初始为空或已有数据）

- [ ] **创建酒店测试**（需要Token）
  ```bash
  curl -X POST http://localhost:3000/api/hotels \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{"name":"测试酒店","address":"北京市","city":"北京","province":"北京","location":{"lat":39.9,"lng":116.4},"images":["https://..."],"tags":["近地铁"],"facilities":["WiFi"],"roomTypes":[]}'
  ```

### 前端联调对接

- [ ] PC端已切换API导入
- [ ] 移动端已切换API导入
- [ ] PC端能成功登录并获取token
- [ ] PC端能创建酒店
- [ ] 移动端能看到PC端创建的酒店数据
- [ ] 距离排序正常工作

### 数据一致性检查

- [ ] 类型定义一致（前后端使用相同的shared/types）
- [ ] 响应格式一致（所有API遵循success/data格式）
- [ ] 错误处理一致（所有错误返回success=false/message）

---

> **文档版本**：v1.0（成员C专用）
> **最后更新**：2025-02-13
> **维护者**：成员C（后端+联调负责人）
