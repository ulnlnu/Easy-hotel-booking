# API接口使用指南 - 前端开发专用

> **成员A和B专用版本** - API调用与对接简明指南

---

## 📋 快速查找

| API类型 | 路径 | 使用场景 |
|---------|------|---------|
| 用户登录 | `POST /api/auth/login` | PC端登录 |
| 用户注册 | `POST /api/auth/register` | PC端注册 |
| 获取当前用户 | `GET /api/auth/me` | 获取用户信息 |
| 酒店列表 | `GET /api/hotels` | 移动端列表 |
| 附近酒店 | `GET /api/hotels/nearby` | LBS定位搜索 |
| 酒店详情 | `GET /api/hotels/:id` | 详情页数据 |
| 创建酒店 | `POST /api/hotels` | PC端创建 |
| 更新酒店 | `PUT /api/hotels/:id` | PC端编辑 |
| 审核酒店 | `POST /api/hotels/:id/audit` | PC端审核 |
| 更新状态 | `POST /api/hotels/:id/status` | PC端上下线 |
| 删除酒店 | `DELETE /api/hotels/:id` | PC端删除 |

---

## 🔑 Day 4联调：如何切换到真实API

### 切换前（Day 1-3）

```typescript
// 前端使用Mock数据
import { loginApi, getHotelListApi } from './services/mockApi';

// ✅ 特点：
// - 无需启动后端
// - 数据是内存中的假数据
// - 网络延迟是模拟的
```

### 切换后（Day 4起）

```typescript
// 前端调用真实后端API
import { loginApi, getHotelListApi } from './services/api';

// ✅ 特点：
// - 必须启动后端（`cd server && npm run dev`）
// - 真实的HTTP请求（axios/Taro.request）
// - 需要有效的token
```

### 需要修改的文件

**PC端（成员B）**：

| 文件 | 操作 |
|-----|------|
| `admin/src/pages/Login/index.tsx` | 将 `import { loginApi } from './services/mockApi'` 改为 `import { loginApi } from './services/api'` |
| `admin/src/pages/HotelEdit/index.tsx` | 将 `import { getHotelListApi, ... } from './services/mockApi'` 改为 `import { getHotelListApi, ... } from './services/api'` |
| `admin/src/pages/AuditList/index.tsx` | 将 `import { getHotelListApi, ... } from './services/mockApi'` 改为 `import { getHotelListApi, ... } from './services/api'` |

**移动端（成员A）**：

| 文件 | 操作 |
|-----|------|
| `mini-app/src/pages/home/index.tsx` | 将 `import { searchHotelsApi } from '../../services/mockApi'` 改为 `import { searchHotelsApi } from '../../services/api'` |
| `mini-app/src/pages/list/index.tsx` | 将 `import { searchHotelsApi } from '../../services/mockApi'` 改为 `import { searchHotelsApi } from '../../services/api'` |
| `mini-app/src/pages/detail/index.tsx` | 将 `import { getHotelDetailApi } from '../../services/mockApi'` 改为 `import { getHotelDetailApi } from '../../services/api'` |

---

## 📡 API详细说明

### 1. 认证相关

#### 1.1 用户登录

```typescript
// POST /api/auth/login

// 请求
{
  "username": "string (必填)",
  "password": "string (必填)"
}

// 响应（成功）
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",  // ✅ 保存这个，后续请求需要
    "user": {
      "id": "admin-001",
      "username": "admin",
      "realName": "系统管理员",
      "role": "admin"
    }
  },
  "message": "登录成功"
}

// 响应（失败）
{
  "success": false,
  "message": "用户名或密码错误"
}
```

**PC端使用示例**：

```typescript
// admin/src/pages/Login/index.tsx
import { loginApi } from './services/api';  // ✅ Day 4切换

const handleLogin = async () => {
  const values = await form.validateFields(); // { username, password }

  const response = await loginApi(values);

  if (response.success) {
    // ✅ 保存token和用户信息
    setAuth(response.data.user, response.data.token);

    // ✅ 跳转到管理页面
    navigate('/hotels/edit');
  } else {
    message.error(response.message);
  }
};
```

#### 1.2 获取当前用户信息

```typescript
// GET /api/auth/me
// Headers: Authorization: Bearer eyJhbGc...

// 响应
{
  "success": true,
  "data": {
    "id": "admin-001",
    "username": "admin",
    "realName": "系统管理员",
    "role": "admin",
    "email": "admin@yisu.com"
  }
}
```

**使用场景**：

```typescript
// 页面加载时获取用户信息
useEffect(() => {
  const fetchUserInfo = async () => {
    const response = await getUserInfoApi();
    if (response.success) {
      setUserInfo(response.data);
    }
  };
  fetchUserInfo();
}, []);
```

---

### 2. 酒店相关

#### 2.1 获取酒店列表

```typescript
// GET /api/hotels

// 查询参数
{
  "keyword": "string (可选)",      // 酒店名称/地址/城市关键词
  "city": "string (可选)",         // 城市筛选
  "minPrice": 100,               // 最低价格
  "maxPrice": 500,                // 最高价格
  "sortBy": "price|distance|rating|createdAt",  // 排序字段
  "order": "asc|desc",           // 排序方向
  "page": 1,                      // 当前页
  "pageSize": 10                 // 每页数量
}

// LBS定位搜索
{
  "lat": 39.9042,               // 纬度（必填）
  "lng": 116.4074,              // 经度（必填）
  "radius": 10,                  // 搜索半径（公里）
  "sortBy": "distance"           // 固定按距离排序
}

// 响应
{
  "success": true,
  "data": [
    {
      "id": "h-001",
      "name": "易宿精选酒店（北京朝阳店）",
      "address": "北京市朝阳区建国路88号",
      "city": "北京",
      "rating": 4.8,
      "reviewCount": 256,
      "tags": ["近地铁", "免费停车"],
      "roomTypes": [...],
      "location": { "lat": 39.9042, "lng": 116.4074 },
      "distance": 1.2  // ✅ LBS搜索时返回距离
    }
  ],
  "total": 100,
  "hasMore": true
}
```

**移动端使用示例**：

```typescript
// mini-app/src/pages/list/index.tsx
import { searchHotelsApi } from '../../services/api';  // ✅ Day 4切换

const List = () => {
  const loadHotels = async () => {
    const response = await searchHotelsApi({
      page: 1,
      pageSize: 10,
      sortBy: 'price',  // 按价格排序
      order: 'asc',      // 升序
    });

    if (response.success) {
      setHotels(response.data);
    }
  };
};
```

#### 2.2 获取酒店详情

```typescript
// GET /api/hotels/:id
// 例如：GET /api/hotels/h-001

// 响应
{
  "success": true,
  "data": {
    "id": "h-001",
    "name": "易宿精选酒店（北京朝阳店）",
    "address": "北京市朝阳区建国路88号",
    "images": ["https://...", "https://..."],
    "rating": 4.8,
    "roomTypes": [
      {
        "id": "r-001",
        "name": "标准大床房",
        "area": "25㎡",
        "price": 299,
        "bedType": "大床1.8m",
        "maxGuests": 2,
        "stock": 10
      }
    ],
    "facilities": ["WiFi", "空调", "电视"],
    "status": "approved"
  }
}
```

**移动端使用示例**：

```typescript
// mini-app/src/pages/detail/index.tsx
import { getHotelDetailApi } from '../../services/api';  // ✅ Day 4切换

const Detail = () => {
  const { id } = useRouter().params;

  useEffect(() => {
    const loadDetail = async () => {
      const response = await getHotelDetailApi(id);

      if (response.success) {
        setHotel(response.data);
      }
    };
    loadDetail();
  }, [id]);
};
```

#### 2.3 创建酒店（PC端专用）

```typescript
// POST /api/hotels
// Headers: Authorization: Bearer eyJhbGc...  (需要认证)

// 请求体
{
  "name": "易宿精选酒店（北京朝阳店）",
  "address": "北京市朝阳区建国路88号",
  "city": "北京",
  "province": "北京",
  "location": {
    "lat": 39.9042,
    "lng": 116.4074
  },
  "images": ["https://example.com/image1.jpg"],
  "tags": ["近地铁", "含早餐"],
  "facilities": ["WiFi", "空调"],
  "roomTypes": [
    {
      "name": "标准大床房",
      "area": "25㎡",
      "price": 299,
      "bedType": "大床1.8m",
      "maxGuests": 2,
      "stock": 10,
      "amenities": ["WiFi"],
      "status": "available"
    }
  ]
}

// 响应
{
  "success": true,
  "data": {
    "id": "h-001",
    "name": "易宿精选酒店（北京朝阳店）",
    "status": "pending",  // ✅ 新创建的酒店默认待审核
    "createdBy": "admin-001",
    "createdAt": "2025-02-13T10:00:00.000Z"
  },
  "message": "酒店创建成功"
}
```

**PC端使用示例**：

```typescript
// admin/src/pages/HotelEdit/index.tsx
import { createHotelApi } from './services/api';  // ✅ Day 4切换

const HotelEdit = () => {
  const handleSubmit = async () => {
    const values = await form.validateFields();

    const response = await createHotelApi(values);

    if (response.success) {
      message.success('酒店创建成功');
      // 刷新列表
      fetchHotels();
    } else {
      message.error(response.message);
    }
  };
};
```

#### 2.4 审核酒店（PC端专用）

```typescript
// POST /api/hotels/:id/audit
// Headers: Authorization: Bearer eyJhbGc...  (需要认证，需管理员权限)

// 请求体
{
  "action": "approve | reject",
  "reason": "string (action=reject时必填)"
}

// 响应（通过）
{
  "success": true,
  "message": "审核通过"
}

// 响应（拒绝）
{
  "success": true,
  "message": "审核拒绝"
}
```

**PC端使用示例**：

```typescript
// admin/src/pages/AuditList/index.tsx
import { auditHotelApi } from './services/api';  // ✅ Day 4切换

const AuditList = () => {
  const handleAudit = async (hotelId: string, action: 'approve' | 'reject') => {
    const response = await auditHotelApi(hotelId, action, action === 'reject' ? '价格偏高' : undefined);

    if (response.success) {
      message.success(response.message);
      fetchHotels(); // 刷新列表
    }
  };
};
```

---

## ⚠️ 错误处理说明

### 统一响应格式

```typescript
// ✅ 成功响应
{
  "success": true,
  "data": { /* 实际数据 */ },
  "message": "操作成功（可选）"
}

// ❌ 失败响应
{
  "success": false,
  "message": "错误原因（必填）",
  "code": "ERROR_CODE（可选）"
}
```

### 常见错误

| HTTP状态 | message | code | 说明 | 处理方式 |
|---------|---------|------|------|---------|
| **401** | 未授权 | `UNAUTHORIZED` | Token缺失或过期 | 重新登录 |
| **403** | 无权访问 | `FORBIDDEN` | 权限不足 | 提示需要管理员权限 |
| **404** | 酒店不存在 | `HOTEL_NOT_FOUND` | 酒店/用户ID不存在 | 检查ID是否正确 |
| **409** | 用户名已存在 | `USERNAME_EXISTS` | 注册时用户名重复 | 更换用户名 |
| **400** | 缺少必填字段 | `MISSING_FIELDS` | 参数不完整 | 检查必填字段 |
| **400** | 参数验证失败 | `VALIDATION_ERROR` | 业务规则不满足 | 查看错误信息 |

### 前端错误处理

```typescript
// PC端
import { message } from 'antd';

try {
  const response = await createHotelApi(values);

  if (response.success) {
    message.success('酒店创建成功');
  } else {
    message.error(response.message);  // ✅ 使用Ant Design提示
  }
} catch (error) {
  message.error('网络请求失败');
}

// 移动端
import Taro from '@tarojs/taro';

try {
  const response = await getHotelDetailApi(id);

  if (response.success) {
    // 处理数据
  } else {
    Taro.showToast({
      title: response.message,
      icon: 'error',
    });  // ✅ 使用Taro提示
  }
} catch (error) {
  Taro.showToast({
    title: '网络请求失败',
    icon: 'error',
  });
}
```

---

## 🧪 Day 4联调测试

### 测试步骤

#### 第一步：启动后端

```bash
# 打开新终端窗口
cd d:\000Code\000program\Trip\server
npm run dev

# 预期输出：
# 🚀 Server is running on http://localhost:3000
```

#### 第二步：测试健康检查

```bash
# 使用浏览器或curl
curl http://localhost:3000/api/health

# 预期输出：
{"success":true,"message":"Server is running","timestamp":"..."}
```

#### 第三步：测试登录

```bash
# PC端测试
# 访问 http://localhost:5173
# 输入用户名：admin
# 输入密码：password123
# 点击登录

# 预期：登录成功，跳转到管理页面
```

#### 第四步：测试创建酒店

```bash
# 登录后，在PC管理端创建酒店
# 填写表单后提交

# 预期：
# 1. 请求成功（200状态）
# 2. 返回 { success: true, data: { id: "h-xxx", ... } }
```

#### 第五步：测试移动端查看

```bash
# 移动端访问 http://localhost:10086
# 点击列表页
# 应该能看到PC端创建的酒店数据
```

### 验证清单

- [ ] 后端服务正常启动（控制台无报错）
- [ ] 健康检查接口返回正确
- [ ] PC端能成功登录并跳转
- [ ] PC端能创建酒店
- [ ] 移动端能看到PC端创建的酒店数据
- [ ] 移动端列表数据格式与PC端一致

---

## 📚 参考卡片

### PC端（成员B）

```typescript
// Day 4切换时需要修改的导入
- admin/src/pages/Login/index.tsx
- admin/src/pages/HotelEdit/index.tsx
- admin/src/pages/AuditList/index.tsx

// 切换方法
- import { xxxApi } from './services/api';

// 使用axios配置
- baseURL: 'http://localhost:3000'
- timeout: 10000
```

### 移动端（成员A）

```typescript
// Day 4切换时需要修改的导入
- mini-app/src/pages/home/index.tsx
- mini-app/src/pages/list/index.tsx
- mini-app/src/pages/detail/index.tsx

// 切换方法
- import { xxxApi } from '../../services/api';

// 使用Taro.request配置
- baseURL: 'http://localhost:3000'
- timeout: 10000
```

---

## 🔧 快速问题排查

### 问题：登录失败

**现象**：返回 `{ success: false, message: '用户名或密码错误' }`

**排查**：
1. 检查用户名是否正确：admin
2. 检查密码是否正确：password123
3. 确认后端是否正常启动

---

### 问题：看不到数据

**现象**：列表页或详情页没有数据

**排查**：
1. 检查是否已切换到真实API（`./services/api`）
2. 检查后端是否有数据（PC端先创建一个酒店）
3. 检查网络请求是否成功（浏览器开发者工具 -> Network）
4. 检查响应格式是否正确（`{ success: true, data: [...] }`）

---

### 问题：CORS错误

**现象**：控制台显示 `CORS policy` 错误

**排查**：
1. 检查后端 `server/src/app.ts` 是否配置了CORS
2. 确认origin包含前端地址：
   - http://localhost:5173
   - http://localhost:10086
3. 重启后端服务

---

> **文档版本**：v1.0（前端专用）
> **适用对象**：成员A（移动端）、成员B（PC端）
> **最后更新**：2025-02-13
