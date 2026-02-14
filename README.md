# 易宿酒店预订平台

> 前端训练营两周小组作业 - 3人团队项目

## 📋 快速启动检查清单

克隆项目后，请按顺序完成以下步骤：

- [ ] **安装 pnpm**（如果尚未安装）：`npm install -g pnpm@8`
- [ ] **安装依赖**：在根目录运行 `pnpm install`
- [ ] **配置环境变量**：
  - [ ] `cp server/.env.example server/.env`
  - [ ] `cp admin/.env.example admin/.env`
- [ ] **启动后端**：`pnpm dev:server` 或 `cd server && pnpm dev`
- [ ] **启动前端**：
  - [ ] 移动端：`pnpm dev:mini-app:h5`
  - [ ] PC端：`pnpm dev:admin`
- [ ] **验证运行**：访问移动端显示的端口（通常是 10086，如被占用可能自动切换到其他端口如 1565）或 http://localhost:5173（PC端）

---

## 项目简介

基于 Taro 跨端框架的酒店预订平台，包含移动端（用户端）、PC 管理端（后台）和 Express 后端 API。

### 技术亮点

| 亮点类别 | 具体内容 | 对应评分 |
|---------|----------|---------|
| **跨端技术** | 使用 Taro 实现 H5+微信小程序双端发布 | 项目创新性 |
| **性能优化** | 虚拟滚动解决长列表渲染卡顿 | 技术复杂度 |
| **用户体验** | 自定义日历组件支持入住/离店联动选择 | 用户体验 |
| **LBS 定位** | 获取用户当前位置，支持"距我最近"排序 | 项目创新性 |
| **代码质量** | TypeScript 全覆盖，规范的 Git 提交 | 代码质量 |

---

## 技术栈

| 端 | 技术方案 |
|---|---|
| **移动端（用户端）** | Taro + React + TypeScript + NutUI + Zustand |
| **PC 管理端** | React + Vite + Ant Design + TypeScript + Zustand |
| **后端 API** | Express + TypeScript + JSON 文件存储 |

---

## 项目结构

```
Trip/
├── mini-app/              # 移动端（Taro 跨端项目）
│   ├── src/
│   │   ├── components/    # 公共组件
│   │   ├── pages/         # 页面（home, list, detail）
│   │   ├── services/      # API服务（mockApi.ts + api.ts）
│   │   ├── hooks/         # 自定义hooks（useLocation, useVirtualList）
│   │   ├── store/         # Zustand状态管理
│   │   └── utils/         # 工具函数（日期、距离计算）
│   ├── project.h5.json    # H5端配置
│   └── package.json
│
├── admin/                 # PC 管理端（React + Vite）
│   ├── src/
│   │   ├── components/    # 公共组件（Layout）
│   │   ├── pages/         # 页面（Login, HotelEdit, AuditList）
│   │   ├── services/      # API服务（mockApi.ts + api.ts）
│   │   ├── store/         # Zustand状态管理
│   │   └── router.tsx     # 路由配置
│   └── package.json
│
├── server/                # Node.js 后端
│   ├── src/
│   │   ├── routes/        # API路由（auth, hotels）
│   │   ├── controllers/   # 控制器层
│   │   ├── services/      # 业务逻辑层
│   │   ├── middleware/    # 中间件（auth, cors, error）
│   │   ├── utils/         # 工具函数
│   │   └── data/         # JSON 数据存储
│   └── package.json
│
├── shared/                # 共享代码
│   ├── types/            # TypeScript 类型定义
│   ├── constants/        # 通用配置（API地址、端口等）
│   └── components/       # 共享组件（Calendar 日历组件）
│
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── package.json          # 根 Monorepo 配置
└── README.md
```

---

## 快速开始

### 1. 安装依赖

> **重要**：本项目使用 **pnpm** 作为包管理器，不支持 npm 或 yarn

```bash
# 安装 pnpm（如果尚未安装）
npm install -g pnpm@8

# 根目录（安装所有依赖，包括 monorepo）
pnpm install

# 验证安装
pnpm --version  # 应显示 >= 8.0.0
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp server/.env.example server/.env
cp admin/.env.example admin/.env

# server/.env 配置说明：
# - PORT: 后端端口（默认 3000）
# - JWT_SECRET: JWT 签名密钥（生产环境请修改）
# - CORS_ORIGINS: 允许的跨域来源（添加前端地址）
```

### 3. 初始化数据文件

```bash
# 确保 server/src/data 目录存在并有初始数据
# 项目已包含 gitkeep 文件，首次启动会自动创建 JSON 文件
```

### 4. 启动开发服务器

> **启动顺序**：必须先启动后端（server），再启动前端

#### 方式一：使用根目录命令（推荐）

```bash
# 启动后端
pnpm dev:server

# 启动移动端 H5（新终端窗口）
pnpm dev:mini-app:h5

# 启动 PC 管理端（新终端窗口）
pnpm dev:admin
```

#### 方式二：进入子目录启动

```bash
# 后端（端口 3000）
cd server && pnpm dev

# 移动端 H5（端口 10086）
cd mini-app && pnpm dev:h5

# PC 管理端（端口 5173）
cd admin && pnpm dev
```

### 5. 访问应用

| 端 | URL | 说明 |
|---|-----|------|
| 移动端 H5 | http://localhost:10086 （如被占用可能自动切换） | 用户端（Taro H5） - **查看控制台输出的实际端口** |
| 移动端小程序 | 微信开发者工具导入 `mini-app/project.config.json` | 微信小程序 |
| PC 管理端 | http://localhost:5173 | 管理后台 |
| 后端 API | http://localhost:3000 | API 服务 |
| 健康检查 | http://localhost:3000/api/health | 检查后端状态 |

### 6. 故障排除

#### 问题：pnpm install 失败
```bash
# 解决方案：确保 pnpm 版本 >= 8.0.0
pnpm install -g pnpm@8

# 清理缓存后重试
pnpm store prune
rm -rf node_modules
pnpm install
```

#### 问题：后端启动失败（.env 不存在）
```bash
# 解决方案：复制环境变量模板
cp server/.env.example server/.env
cp admin/.env.example admin/.env
```

#### 问题：前端 API 请求 404/CORS 错误
```bash
# 解决方案 1：检查后端是否运行
curl http://localhost:3000/api/health

# 解决方案 2：检查 CORS 配置是否包含前端端口
# 编辑 server/.env，添加所有可能的端口（Taro 可能自动切换）
CORS_ORIGINS=http://localhost:5173,http://localhost:10086,http://localhost:1565,http://localhost:8080

# 解决方案 3：检查 shared/constants/config.ts 中 BASE_URL 是否正确
BASE_URL=http://localhost:3000/api  # 注意 /api 后缀
```

#### 问题：移动端 H5 端口不是 10086
```bash
# 说明：Taro 可能因端口被占用自动选择其他端口（如 1565）
# 当前配置的端口：mini-app/config/index.ts 第 42 行
# 实际运行端口：查看控制台输出的 "App running at: http://localhost:XXXX"

# 解决方案 1：使用自动分配的端口（推荐）
# 优点：无需手动解决端口冲突，Taro 自动选择可用端口
# 操作：直接使用控制台输出的实际端口访问即可

# 解决方案 2：固定端口为 10086
# 步骤 1：确保端口未被占用（Windows 使用 netstat -ano | findstr :10086）
# 步骤 2：编辑 mini-app/config/index.ts，确认 h5.port 配置正确
# 步骤 3：重启开发服务器
pnpm dev:mini-app:h5

# 解决方案 3：固定端口为其他值
# 编辑 mini-app/config/index.ts，修改第 42 行：
h5: {
  port: 8080  # 改为其他端口
  // ...
}
```

#### 问题：shared 模块找不到
```bash
# 说明：pnpm workspace 链接问题，确保在根目录运行
pnpm install  # 必须在 Trip/ 根目录运行
```

### 4. 演示账号

| 角色 | 用户名 | 密码 |
|-----|--------|------|
| 管理员 | admin | password123 |
| 酒店管理员 | hoteladmin | password123 |

---

## 开发规范

### Git 提交规范

使用 Conventional Commits 规范：

```bash
# 新功能
git commit -m "feat(hotel): 实现酒店列表页面"
git commit -m "feat(list): 实现虚拟滚动优化"

# Bug修复
git commit -m "fix: 修复日期选择bug"

# 性能优化
git commit -m "perf: 优化图片加载性能"

# 代码重构
git commit -m "refactor: 将Mock API替换为真实API"

# 测试
git commit -m "test: 完成H5端功能测试"

# 文档更新
git commit -m "docs: 更新README文档"
```

### 分支策略

- `main` - 主分支
- `feature/xxx` - 功能分支
- `bugfix/xxx` - Bug 修复分支

---

## 开发模式

### Mock 模式（Day 1-3）

前端使用 `services/mockApi.ts` 中的 Mock 数据进行开发：

```typescript
// 前端导入 Mock API
import { searchHotelsApi } from './services/mockApi';
```

### 真实 API 模式（Day 4 起）

切换为真实后端 API：

```typescript
// 切换导入
import { searchHotelsApi } from './services/api';
```

---

## API 文档

### 认证相关

```
POST /api/auth/register  # 用户注册
POST /api/auth/login     # 用户登录
GET  /api/auth/me        # 获取当前用户信息
```

### 酒店相关

```
GET    /api/hotels              # 获取酒店列表（支持分页、筛选、排序）
GET    /api/hotels/nearby       # 获取附近酒店（LBS定位）
GET    /api/hotels/:id          # 获取酒店详情
POST   /api/hotels              # 创建酒店（需要认证）
PUT    /api/hotels/:id          # 更新酒店（需要认证）
POST   /api/hotels/:id/audit    # 审核酒店（需要管理员权限）
POST   /api/hotels/:id/status   # 更新酒店状态（需要认证）
DELETE /api/hotels/:id          # 删除酒店（需要认证）
```

### 健康检查

```
GET /api/health  # 服务器健康检查
```

---

## 创新功能实现

### 1. 虚拟滚动（Day 8-9）

- 使用 `@tarojs/components/virtual-list` 实现长列表优化
- 只渲染可视区域的酒店列表项
- 配合骨架屏提升加载体验

### 2. 自定义日历组件（共享组件）

- 支持入住/离店日期联动选择
- 自动计算入住间夜
- 标记已售罄日期
- 价格日历视图

### 3. LBS 定位搜索（Day 10-11）

- H5 端使用浏览器 Geolocation API
- 小程序端使用 Taro.getLocation()
- "距我最近"排序选项
- 显示距离用户的公里数

---

## Taro 多端发布

### H5 网页版

```bash
npm run dev:h5      # 开发
npm run build:h5    # 构建
```

### 微信小程序

```bash
npm run dev:weapp    # 开发
npm run build:weapp  # 构建
```

---

## 团队成员

| 成员 | 负责模块 |
|-----|---------|
| 成员 A | 移动端（Taro）、虚拟滚动、LBS 定位 |
| 成员 B | PC 管理端（React + Ant Design） |
| 成员 C | 后端（Express）、日历组件、联调 |

---

## 许可证

MIT

---

> **版本**: v1.0.0
> **创建日期**: 2025-02-13
> **状态**: 开发中
