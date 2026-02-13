# API接口参考文档 - 后端联调专用

> 本文档为成员C（后端+联调负责人）专用，详细说明每个API接口的实现要求

---

## 📋 目录

1. [通用规范](#通用规范)
2. [认证相关API](#认证相关api)
3. [酒店相关API](#酒店相关api)
4. [LBS定位API](#lbs定位api)
5. [错误处理规范](#错误处理规范)
6. [前后端联调流程](#前后端联调流程)
7. [调试与测试](#调试与测试)

---

## 通用规范

### HTTP状态码使用

| 状态码 | 使用场景 | 说明 |
|--------|---------|------|
| **200** | 请求成功 | 所有API成功响应都返回200 |
| **201** | 创建成功 | POST创建资源时返回201 |
| **400** | 请求参数错误 | 参数缺失、格式错误、业务规则校验失败 |
| **401** | 未认证 | 缺少token或token无效 |
| **403** | 无权限 | 已认证但权限不足 |
| **404** | 资源不存在 | 酒店、用户不存在 |
| **409** | 资源冲突 | 用户名已存在 |
| **500** | 服务器错误 | 未捕获的异常 |

### 响应格式规范

**所有API必须遵循以下响应格式**：

```typescript
// ✅ 成功响应（必须）
{
  "success": true,    // 必须字段
  "data": {          // 成功时必须有data
    // 实际数据
  },
  "message": "操作成功"  // 可选，提示信息
}

// ❌ 失败响应（必须）
{
  "success": false,   // 必须字段
  "message": "错误原因",  // 必须字段
  "code": "ERROR_CODE"  // 可选，错误码
}
```

**实现位置**：

```typescript
// server/src/controllers/auth.ts
export const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const user = await authService.findByUsername(body.username);

      // ✅ 成功响应
      res.json({
        success: true,
        data: {
          token: generateToken(user.id),
          user: safeUser,
        },
      });
    } catch (error) {
      // ❌ 失败响应
      res.status(401).json({
        success: false,
        message: '用户名或密码错误',
        code: 'INVALID_CREDENTIALS',
      });
    }
  },
};
```

### 请求头规范

| 请求头 | 说明 | 示例 |
|--------|------|------|
| **Content-Type** | 请求体格式 | `application/json` |
| **Authorization** | 认证token（需要认证的API） | `Bearer eyJhbGc...` |

**后端配置**：

```typescript
// server/src/app.ts
app.use(express.json());  // ✅ 解析JSON请求体
```

---

## 认证相关API

### 1. 用户注册

**接口定义**：

```typescript
/**
 * POST /api/auth/register
 * 用户注册
 */
```

**请求体**：

```json
{
  "username": "string (必填，3-20字符)",
  "password": "string (必填，6-20字符)",
  "realName": "string (必填，真实姓名)",
  "role": "admin | hotel_admin | user (必填)",
  "phone": "string (可选，手机号)",
  "email": "string (可选，邮箱)"
}
```

**后端实现**（`server/src/controllers/auth.ts`）：

```typescript
export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    const body: RegisterRequest = req.body;

    // 1. 验证必填字段
    if (!body.username || !body.password || !body.realName || !body.role) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：username, password, realName, role',
        code: 'MISSING_FIELDS',
      });
    }

    // 2. 检查用户名是否已存在
    const existingUser = await authService.findByUsername(body.username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '用户名已存在',
        code: 'USERNAME_EXISTS',
      });
    }

    // 3. 密码加密（使用bcrypt）
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // 4. 创建用户
    const newUser = await authService.create({
      ...body,
      password: hashedPassword,
    });

    // 5. 生成token
    const token = generateToken(newUser.id);

    // 6. 返回成功响应（不包含密码）
    const { password, ...safeUser } = newUser;
    res.status(201).json({
      success: true,
      data: {
        token,
        user: safeUser,
      },
      message: '注册成功',
    });
  },
};
```

**成功响应**：

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "user-123",
      "username": "newuser",
      "realName": "张三",
      "role": "user",
      "email": "test@example.com",
      "createdAt": "2025-02-13T10:00:00.000Z"
    }
  },
  "message": "注册成功"
}
```

---

### 2. 用户登录

**接口定义**：

```typescript
/**
 * POST /api/auth/login
 * 用户登录
 */
```

**请求体**：

```json
{
  "username": "string (必填)",
  "password": "string (必填)"
}
```

**后端实现**（`server/src/controllers/auth.ts`）：

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export const authController = {
  login: async (req: Request, res: Response) => {
    const body: LoginRequest = req.body;

    // 1. 验证输入
    if (!body.username || !body.password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空',
        code: 'MISSING_CREDENTIALS',
      });
    }

    // 2. 查找用户
    const user = await authService.findByUsername(body.username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // 3. 验证密码
    const bcrypt = require('bcrypt');
    const isValidPassword = await bcrypt.compare(body.password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // 4. 生成token
    const token = generateToken(user.id);

    // 5. 返回用户信息（不包含密码）
    const { password, ...safeUser } = user;
    res.json({
      success: true,
      data: {
        token,
        user: safeUser,
      },
      message: '登录成功',
    });
  },
};
```

**成功响应**：

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "admin-001",
      "username": "admin",
      "realName": "系统管理员",
      "role": "admin",
      "email": "admin@yisu.com",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 3. 获取当前用户信息

**接口定义**：

```typescript
/**
 * GET /api/auth/me
 * 获取当前登录用户信息（需要认证）
 */
```

**请求头**：

```
Authorization: Bearer eyJhbGc...
```

**后端实现**（`server/src/controllers/auth.ts` + `server/src/middleware/auth.ts`）：

```typescript
// 中间件验证token
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '未提供认证Token',
      code: 'UNAUTHORIZED',
    });
  }

  const token = authHeader.substring(7);  // 移除 "Bearer " 前缀

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;  // ✅ 将userId附加到请求对象
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token已过期或无效',
      code: 'TOKEN_EXPIRED',
    });
  }
};

// 控制器使用
export const authController = {
  me: async (req: Request, res: Response) => {
    // ✅ 从中间件获取userId
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
  },
};
```

---

## 酒店相关API

### 4. 获取酒店列表

**接口定义**：

```typescript
/**
 * GET /api/hotels
 * 获取酒店列表（支持分页、筛选、排序）
 */
```

**查询参数**：

```
keyword?: string          // 关键词（酒店名称/地址/城市）
city?: string             // 城市筛选
checkIn?: string          // 入住日期 (YYYY-MM-DD)
checkOut?: string         // 离店日期 (YYYY-MM-DD)
minPrice?: number         // 最低价格
maxPrice?: number         // 最高价格
tags?: string            // 标签筛选（逗号分隔："近地铁,含早餐"）
lat?: number             // 定位纬度（LBS搜索）
lng?: number             // 定位经度
radius?: number          // 搜索半径（公里），默认10
sortBy?: string          // 排序字段：price | distance | rating | createdAt
order?: string           // 排序方向：asc | desc
page?: number            // 当前页，默认1
pageSize?: number        // 每页数量，默认10，最大100
```

**后端实现**（`server/src/controllers/hotels.ts`）：

```typescript
export const hotelController = {
  getList: async (req: Request, res: Response) => {
    // 1. 提取查询参数
    const query: HotelQueryParams = {
      keyword: req.query.keyword as string,
      city: req.query.city as string,
      checkIn: req.query.checkIn as string,
      checkOut: req.query.checkOut as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
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

    // 2. 调用服务层处理业务逻辑
    const result = await hotelService.getList(query);

    // 3. 返回响应
    res.json(result);
  },
};
```

**服务层实现**（`server/src/services/hotels.ts`）：

```typescript
export const hotelService = {
  getList: async (params: HotelQueryParams) => {
    // 1. 读取所有酒店数据
    let hotels = await readHotels();

    // 2. 关键词筛选
    if (params.keyword) {
      hotels = hotels.filter(h =>
        h.name.includes(params.keyword!) ||
        h.address.includes(params.keyword!) ||
        h.city.includes(params.keyword!)
      );
    }

    // 3. 城市筛选
    if (params.city) {
      hotels = hotels.filter(h => h.city === params.city);
    }

    // 4. 价格筛选（使用最低房型价格）
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

    // 5. 标签筛选
    if (params.tags && params.tags.length > 0) {
      hotels = hotels.filter(h =>
        params.tags!.some(tag => h.tags.includes(tag))
      );
    }

    // 6. 只返回已通过的酒店
    hotels = hotels.filter(h => h.status === HotelStatus.APPROVED);

    // 7. 排序
    if (params.sortBy === 'price') {
      hotels.sort((a, b) => {
        const minPriceA = Math.min(...a.roomTypes.map(r => r.price));
        const minPriceB = Math.min(...b.roomTypes.map(r => r.price));
        return params.order === 'desc' ? minPriceB - minPriceA : minPriceA - minPriceB;
      });
    } else if (params.sortBy === 'distance' && params.location) {
      // 距离排序
      hotels = hotels.map(h => ({
        ...h,
        distance: calculateDistance(params.location!, h.location),
      }))
      .sort((a: any, b: any) => a.distance - b.distance);
    } else if (params.sortBy === 'rating') {
      hotels.sort((a, b) =>
        params.order === 'desc' ? a.rating - b.rating : b.rating - a.rating
      );
    }

    // 8. 分页
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const pageData = hotels.slice(start, end);

    // 9. 返回结果
    return {
      success: true,
      data: pageData,
      total: hotels.length,
      page: params.page,
      pageSize: params.pageSize,
      hasMore: end < hotels.length,
    };
  },
};
```

**成功响应**：

```json
{
  "success": true,
  "data": [
    {
      "id": "h-001",
      "name": "易宿精选酒店（北京朝阳店）",
      "address": "北京市朝阳区建国路88号",
      "city": "北京",
      "location": { "lat": 39.9042, "lng": 116.4074 },
      "images": ["https://..."],
      "rating": 4.8,
      "reviewCount": 256,
      "tags": ["近地铁", "免费停车"],
      "roomTypes": [...],
      "status": "approved",
      "distance": 1.2  // 当sortBy=distance时添加
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "hasMore": true
}
```

---

### 5. 获取酒店详情

**接口定义**：

```typescript
/**
 * GET /api/hotels/:id
 * 获取酒店详情
 */
```

**后端实现**（`server/src/controllers/hotels.ts`）：

```typescript
export const hotelController = {
  getDetail: async (req: Request, res: Response) => {
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
  },
};
```

**成功响应**：

```json
{
  "success": true,
  "data": {
    "id": "h-001",
    "name": "易宿精选酒店（北京朝阳店）",
    "address": "北京市朝阳区建国路88号",
    "city": "北京",
    "province": "北京",
    "location": { "lat": 39.9042, "lng": 116.4074 },
    "images": ["https://...", "https://..."],
    "rating": 4.8,
    "reviewCount": 256,
    "tags": ["近地铁", "免费停车", "含早餐"],
    "facilities": ["WiFi", "空调", "热水器", "电视"],
    "roomTypes": [
      {
        "id": "r-001",
        "name": "标准大床房",
        "area": "25㎡",
        "price": 299,
        "originalPrice": 399,
        "bedType": "大床1.8m",
        "maxGuests": 2,
        "stock": 10,
        "status": "available",
        "amenities": ["WiFi", "空调"]
      }
    ],
    "status": "approved",
    "createdBy": "admin-001",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 6. 创建酒店

**接口定义**：

```typescript
/**
 * POST /api/hotels
 * 创建酒店（需要认证）
 */
```

**请求体**（完整结构）：

```json
{
  "name": "string (必填)",
  "address": "string (必填)",
  "city": "string (必填)",
  "province": "string (必填)",
  "location": {
    "lat": "number (必填)",
    "lng": "number (必填)"
  },
  "images": ["string"] (必填，图片URL数组),
  "tags": ["string"] (必填，如：["近地铁", "含早餐"]),
  "facilities": ["string"] (必填，如：["WiFi", "空调"]),
  "roomTypes": [
    {
      "name": "string (必填)",
      "area": "string (必填)",
      "price": "number (必填)",
      "originalPrice": "number (可选)",
      "bedType": "string (必填)",
      "maxGuests": "number (必填)",
      "stock": "number (必填)",
      "status": "available | sold_out",
      "amenities": ["string"]
    }
  ]
}
```

**后端实现**（`server/src/controllers/hotels.ts`）：

```typescript
export const hotelController = {
  create: async (req: Request, res: Response) => {
    const body: CreateHotelRequest = req.body;
    const userId = (req as any).userId;  // ✅ 从认证中间件获取

    // 1. 验证必填字段
    if (!body.name || !body.address || !body.city || !body.location) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：name, address, city, location',
        code: 'MISSING_FIELDS',
      });
    }

    // 2. 调用服务层创建
    const hotel = await hotelService.create(body, userId);

    // 3. 返回创建结果
    res.status(201).json({
      success: true,
      data: hotel,
      message: '酒店创建成功',
    });
  },
};
```

**服务层实现**（`server/src/services/hotels.ts`）：

```typescript
export const hotelService = {
  create: async (data: CreateHotelRequest, createdBy: string): Promise<Hotel> => {
    const hotels = await readHotels();

    // 1. 生成唯一ID
    const id = generateId();

    // 2. 为房型生成ID
    const roomTypes = data.roomTypes.map(rt => ({
      ...rt,
      id: generateId(),
    }));

    // 3. 构建酒店对象
    const now = new Date().toISOString();
    const newHotel: Hotel = {
      id,
      ...data,
      rating: 0,  // ✅ 新酒店初始评分为0
      reviewCount: 0,  // ✅ 新酒店初始评论数为0
      status: HotelStatus.PENDING,  // ✅ 新酒店默认待审核
      createdBy,
      createdAt: now,
      updatedAt: now,
      roomTypes,
    };

    // 4. 保存并返回
    hotels.push(newHotel);
    await writeHotels(hotels);

    return newHotel;
  },
};
```

---

### 7. 审核酒店

**接口定义**：

```typescript
/**
 * POST /api/hotels/:id/audit
 * 审核酒店（通过/拒绝）（需要认证）
 */
```

**请求体**：

```json
{
  "action": "approve | reject (必填)",
  "reason": "string (action=reject时必填)"
}
```

**后端实现**（`server/src/controllers/hotels.ts`）：

```typescript
export const hotelController = {
  audit: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { action, reason } = req.body;

    // 1. 验证action
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'action参数错误，必须为approve或reject',
        code: 'INVALID_ACTION',
      });
    }

    // 2. 验证拒绝原因
    if (action === 'reject' && !reason) {
      return res.status(400).json({
        success: false,
        message: '拒绝时必须提供拒绝原因',
        code: 'MISSING_REASON',
      });
    }

    // 3. 调用服务层更新状态
    await hotelService.audit(id, action, reason);

    // 4. 返回结果
    res.json({
      success: true,
      message: action === 'approve' ? '审核通过' : '审核拒绝',
    });
  },
};
```

**服务层实现**（`server/src/services/hotels.ts`）：

```typescript
export const hotelService = {
  audit: async (id: string, action: 'approve' | 'reject', reason?: string): Promise<void> => {
    const hotels = await readHotels();
    const index = hotels.findIndex(h => h.id === id);

    if (index === -1) {
      throw new Error('酒店不存在');
    }

    // ✅ 更新状态
    hotels[index].status = action === 'approve'
      ? HotelStatus.APPROVED
      : HotelStatus.REJECTED;
    hotels[index].updatedAt = new Date().toISOString();

    await writeHotels(hotels);
  },
};
```

---

### 8. 更新酒店状态（上线/下线）

**接口定义**：

```typescript
/**
 * POST /api/hotels/:id/status
 * 更新酒店状态（需要认证）
 */
```

**请求体**：

```json
{
  "status": "online | offline (必填)"
}
```

**后端实现**（`server/src/controllers/hotels.ts`）：

```typescript
export const hotelController = {
  updateStatus: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['online', 'offline'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status参数错误',
        code: 'INVALID_STATUS',
      });
    }

    await hotelService.updateStatus(id, status);

    res.json({
      success: true,
      message: status === 'online' ? '酒店已上线' : '酒店已下线',
    });
  },
};
```

---

## LBS定位API

### 9. 获取附近酒店

**接口定义**：

```typescript
/**
 * GET /api/hotels/nearby
 * 获取附近酒店（LBS定位搜索）
 */
```

**查询参数**：

```
lat: number (必填)      // 纬度
lng: number (必填)      // 经度
radius: number (可选)    // 搜索半径（公里），默认10
page: number (可选)     // 当前页
pageSize: number (可选)  // 每页数量
```

**后端实现**（`server/src/controllers/hotels.ts`）：

```typescript
export const hotelController = {
  getNearby: async (req: Request, res: Response) => {
    const { lat, lng, radius = 10 } = req.query;

    // 1. 验证必填参数
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: '缺少定位参数：lat, lng',
        code: 'MISSING_LOCATION',
      });
    }

    // 2. 调用列表API，传入location参数
    const result = await hotelService.getList({
      location: {
        lat: Number(lat),
        lng: Number(lng),
        radius: Number(radius),
      },
      sortBy: 'distance',  // ✅ 默认按距离排序
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 10,
    });

    res.json(result);
  },
};
```

**距离计算实现**（`server/src/services/hotels.ts`）：

```typescript
/**
 * 使用Haversine公式计算两点间距离
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
```

**成功响应**：

```json
{
  "success": true,
  "data": [
    {
      "id": "h-001",
      "name": "易宿精选酒店（北京朝阳店）",
      "distance": 1.2,  // ✅ 距离用户的公里数
      "location": { "lat": 39.9042, "lng": 116.4074 },
      "address": "北京市朝阳区建国路88号",
      "rating": 4.8,
      "roomTypes": [...]
    }
  ],
  "total": 25,
  "hasMore": true
}
```

---

## 错误处理规范

### 统一错误响应

```typescript
// server/src/middleware/error.ts
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // ✅ 自定义ApiError
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });
  }

  // ✅ 其他未捕获错误
  return res.status(500).json({
    success: false,
    message: '服务器内部错误',
    code: 'INTERNAL_ERROR',
  });
};
```

### 自定义错误类

```typescript
// server/src/utils/errors.ts

/**
 * API错误基类
 */
export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'API_ERROR';
  }
}

/**
 * 使用示例
 */
export const hotelController = {
  getDetail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotel = await hotelService.getById(id);

      if (!hotel) {
        // ✅ 抛出404错误
        throw new NotFoundError('酒店');
      }

      res.json({ success: true, data: hotel });
    } catch (error) {
      // ✅ 传递给错误处理中间件
      next(error);
    }
  },
};
```

---

## 前后端联调流程

### Day 4 联调开始

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   Day 4 联调启动流程                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                               │
│  1. 后端启动（成员C）                                         │
│     cd server && npm run dev                                 │
│     → Server running on http://localhost:3000                     │
│                                                               │
│  2. PC端切换API（成员B）                                     │
│     修改所有页面 import:                                  │
│     - import { xxxApi } from './services/mockApi';            │
│     + import { xxxApi } from './services/api';                  │
│                                                               │
│  3. 移动端切换API（成员A）                                   │
│     修改所有页面 import:                                  │
│     - import { xxxApi } from '../../services/mockApi';          │
│     + import { xxxApi } from '../../services/api';                │
│                                                               │
│  4. 测试联调                                                   │
│     → PC端登录成功                                          │
│     → 移动端列表加载成功                                      │
│     → 创建酒店并能在移动端看到                                 │
│                                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 前端Token传递流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   JWT Token 传递流程                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                               │
│  1. 用户登录                                                 │
│     POST /api/auth/login { username, password }                  │
│     ↓                                                        │
│  2. 后端生成Token                                           │
│     { success: true, data: { token: "eyJ..." } }             │
│     ↓                                                        │
│  3. 前端保存Token                                          │
│     localStorage.setItem('auth-storage', { token: "eyJ..." })    │
│     或 Zustand persist自动保存                                │
│     ↓                                                        │
│  4. 后续请求携带Token                                       │
│     GET /api/hotels                                       │
│     Headers: Authorization: Bearer eyJ...                     │
│     ↓                                                        │
│  5. 后端验证Token                                           │
│     jwt.verify(token, SECRET) → { userId: "user-001" }        │
│     req.userId = decoded.userId                                 │
│     ↓                                                        │
│  6. 业务处理                                                 │
│     调用hotelService.getList()                            │
│     返回响应                                                 │
│                                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 调试与测试

### 后端测试命令

```bash
# 1. 启动后端
cd server
npm run dev

# 2. 测试健康检查
curl http://localhost:3000/api/health
# 预期输出：{"success":true,"message":"Server is running"}

# 3. 测试登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
# 预期输出：{"success":true,"data":{"token":"...","user":{...}}}

# 4. 测试获取酒店列表
curl "http://localhost:3000/api/hotels?page=1&pageSize=10"
# 预期输出：{"success":true,"data":[...],"total":...}

# 5. 测试认证API（使用返回的token）
curl -X GET http://localhost:3000/api/hotels \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 6. 测试CORS（模拟跨域请求）
curl -X OPTIONS http://localhost:3000/api/hotels \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -v
# 应该返回 Access-Control-Allow-Origin: http://localhost:5173
```

### 前端测试检查点

**PC端**（`http://localhost:5173`）：

```typescript
// 1. 检查网络请求
// 打开浏览器开发者工具 -> Network标签
// 查看请求是否正确发送到后端

// 2. 检查Token是否传递
// 查看 Request Headers 中是否有 Authorization: Bearer xxx

// 3. 检查响应格式
// 查看 Response 是否符合 { success: true, data: {...} } 格式

// 4. 检查LocalStorage
// Application -> Local Storage -> auth-storage
// 应该有 { state: { token: "...", user: {...} } }
```

**移动端**（`http://localhost:10086`）：

```typescript
// 1. 检查Taro.request配置
// mini-app/src/services/api.ts
// 确认baseURL指向 localhost:3000

// 2. 检查跨域
// Taro H5模式下检查CORS配置

// 3. 检查数据是否加载
// Network标签查看 API 响应
```

### 常见问题排查

| 问题 | 现象 | 排查步骤 | 解决方案 |
|-----|------|---------|---------|
| **CORS错误** | Console显示 `has been blocked by CORS` | 1. 检查 `server/src/app.ts` CORS配置<br>2. 确认origin包含前端地址<br>3. 确认credentials为true | 添加前端地址到CORS白名单 |
| **401错误** | 返回 `{ success: false, message: '未授权' }` | 1. 检查是否已登录<br>2. 检查Token是否正确存储<br>3. 检查请求头是否携带Token | 重新登录获取新Token |
| **类型错误** | TypeScript编译失败 | 1. 确认 `shared/types/` 类型定义完整<br>2. 重启TypeScript服务器<br>3. 清除node_modules重新安装 | 更新shared类型定义 |
| **API无响应** | 请求一直pending | 1. 确认后端是否启动<br>2. 确认端口3000未被占用<br>3. 查看后端控制台错误日志 | 启动后端服务 |

---

### 快速参考卡片

#### 后端必须配置

```typescript
// ✅ server/src/app.ts
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:10086'],
  credentials: true,
}));

// ✅ server/src/routes/hotels.ts
router.post('/', authenticate, hotelController.create);  // 需要认证的路由
```

#### 前端必须修改

```typescript
// ✅ admin/src/pages/Login/index.tsx
- import { loginApi } from './services/mockApi';
+ import { loginApi } from './services/api';

// ✅ mini-app/src/pages/list/index.tsx
- import { searchHotelsApi } from '../../services/mockApi';
+ import { searchHotelsApi } from '../../services/api';
```

#### 测试命令速查

```bash
# 后端
cd server && npm run dev          # 启动后端
curl http://localhost:3000/api/health  # 健康检查

# PC端
cd admin && npm run dev           # 启动PC端
# 浏览器访问 http://localhost:5173

# 移动端
cd mini-app && npm run dev:h5    # 启动H5
# 浏览器访问 http://localhost:10086
```

---

## Day 4联调清单

### 后端（成员C）

- [ ] 后端服务启动成功（控制台显示 `Server running on http://localhost:3000`）
- [ ] `/api/health` 端点测试通过（返回 `{ success: true }`）
- [ ] CORS配置正确（允许 `localhost:5173` 和 `localhost:10086`）
- [ ] JWT_SECRET环境变量已设置（或使用默认值）
- [ ] 登录接口测试成功（使用admin/password123）
- [ ] 创建酒店接口测试成功
- [ ] 酒店列表接口测试成功

### PC端（成员B）

- [ ] 所有页面已切换API导入：
  - [ ] `Login/index.tsx`: `import { loginApi } from './services/api'`
  - [ ] `HotelEdit/index.tsx`: `import { getHotelListApi, ... } from './services/api'`
  - [ ] `AuditList/index.tsx`: `import { getHotelListApi, ... } from './services/api'`
- [ ] 能成功登录并看到管理界面
- [ ] 能创建新酒店
- [ ] 能看到酒店列表数据

### 移动端（成员A）

- [ ] 所有页面已切换API导入：
  - [ ] `home/index.tsx`: `import { searchHotelsApi, ... } from '../../services/api'`
  - [ ] `list/index.tsx`: `import { searchHotelsApi, ... } from '../../services/api'`
  - [ ] `detail/index.tsx`: `import { getHotelDetailApi } from '../../services/api'`
- [ ] 能看到酒店列表数据
- [ ] 能进入酒店详情页
- [ ] 列表数据与PC端创建的一致

---

> **文档版本**：v1.0
> **适用对象**：成员C（后端+联调负责人）
> **最后更新**：2025-02-13
