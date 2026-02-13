# admin - PC管理端

> 易宿酒店预订平台 - PC管理后台
> 技术栈：React + Vite + TypeScript + Ant Design + Zustand + axios

---

## 快速开始

### 1. 安装依赖

```bash
cd admin
npm install
# 或
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 4. 构建生产版本

```bash
npm run build
```

---

## 目录结构

```
admin/
├── src/
│   ├── components/          # 公共组件
│   │   ├── Layout/        # 主布局
│   │   ├── PageHeader/    # 页面头部
│   │   ├── ImageUpload/   # 图片上传
│   │   └── ProtectedRoute/ # 路由守卫
│   ├── pages/             # 页面
│   │   ├── Login/         # 登录/注册
│   │   ├── HotelEdit/     # 酒店录入
│   │   └── AuditList/     # 审核管理
│   ├── services/          # API服务
│   ├── store/             # Zustand状态管理
│   ├── hooks/            # 自定义hooks
│   ├── utils/            # 工具函数
│   └── router.tsx        # 路由配置
├── .env                 # 环境变量
└── package.json
```

---

## 功能模块

### 1. 登录/注册 (`/login`)
- 管理员登录
- 酒店管理员注册
- 演示账号提示

### 2. 酒店信息管理 (`/hotels/edit`)
- 酒店列表查看
- 新增酒店
- 编辑酒店
- 删除酒店
- 状态显示（待审核/已通过/已拒绝/已下线）

### 3. 审核管理 (`/hotels/audit`)
- 待审核列表
- 审核通过/拒绝
- 上架/下架操作
- 多状态标签页

---

## 测试账号

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin123 | admin | 系统管理员 |
| manager | admin123 | hotel_admin | 酒店管理员 |

---

## API集成

### API配置

API地址配置在 `src/services/api.ts`：

```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
});
```

### 切换Mock/真实API

```typescript
// 使用Mock API（开发阶段）
import { loginApi } from '@/services/mockApi';

// 使用真实API（联调阶段）
import { loginApi } from '@/services/api';
```

---

## 状态管理

使用 Zustand + persist 中间件：

```typescript
import { useAuthStore } from '@/store/useAuthStore';

function Component() {
  const { user, token, isAuthenticated, logout } = useAuthStore();
  // ...
}
```

---

## 样式开发

- 使用 Ant Design 组件库
- 全局样式：`src/index.scss`
- 页面样式：同级 `index.scss`
- 使用 BEM 命名规范

---

## 开发规范

### Commit 规范

```bash
feat: 新功能
fix: 修复bug
style: 样式修改
refactor: 代码重构
docs: 文档修改
chore: 构建/工具修改
```

### 目录命名

- 组件：PascalCase (如 `PageHeader/`)
- 页面：PascalCase (如 `HotelEdit/`)
- 工具函数：camelCase (如 `formatDate`)

---

## 常见问题

### Q: 登录后刷新页面丢失登录状态？
A: 使用了 Zustand persist 中间件，状态会持久化到 localStorage。

### Q: API请求跨域？
A: Vite 配置了代理，`/api` 请求会转发到 `http://localhost:3000`。

### Q: 图片上传功能？
A: 当前版本使用输入URL方式，后续可接入真实的文件上传。

---

## 待开发功能

- [ ] 真实图片上传功能
- [ ] 酒店详情预览
- [ ] 批量操作
- [ ] 数据导出
- [ ] 角色权限管理
