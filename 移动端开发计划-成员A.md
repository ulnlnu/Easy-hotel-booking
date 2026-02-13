# 移动端开发计划 - 成员A（方案A）

> 创建日期：2025-02-13
> 负责人：成员A
> 负责模块：酒店查询页（首页）、酒店列表页、酒店详情页
> 创新功能：虚拟滚动、LBS定位搜索

---

## 📋 开发模式：先Mock后联调

```
┌─────────────────────────────────────────────────────────────────┐
│                   模式二：先Mock后联调                        │
├─────────────────────────────────────────────────────────────────┤
│                                                               │
│  Day 1-3 ─────────────────────────────────────────────────    │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  移动端独立开发，使用Mock数据                        │        │
│  │  ┌──────────────┐      ┌──────────────┐           │        │
│  │  │ mockApi.ts   │ ───→│  Taro页面     │           │        │
│  │  │              │      │  (完全独立)  │           │        │
│  │  └──────────────┘      └──────────────┘           │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                               │
│  Day 4 ─────────────────────────────────────────────────────    │
│  ┌─────────────────┐        ┌─────────────────┐              │
│  │  移动端A      │  ←→   │   后端C        │              │
│  │  替换API调用   │        │  API已就绪      │              │
│  │  开始真实联调  │        │                 │              │
│  └─────────────────┘        └─────────────────┘              │
│                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Taro 移动端 Mock 数据实现

```typescript
/**
 * services/mockApi.ts
 * Taro 移动端 Mock API服务
 */

import Taro from '@tarojs/taro';

// 模拟网络延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock酒店数据
export const mockHotels = [
  {
    id: '1',
    name: '易宿精选酒店（北京朝阳店）',
    address: '北京市朝阳区建国路88号',
    distance: 1.2, // 距离（公里）
    rating: 4.8,
    price: 299,
    originalPrice: 399,
    images: [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=2',
    ],
    tags: ['近地铁', '免费停车', '含早餐'],
    facilities: ['WiFi', '空调', '热水器', '电视'],
    roomTypes: [
      { id: 'r1', name: '标准大床房', price: 299, area: '25㎡', stock: 10 },
      { id: 'r2', name: '豪华双床房', price: 399, area: '35㎡', stock: 5 },
      { id: 'r3', name: '商务套房', price: 599, area: '50㎡', stock: 3 },
    ],
    location: { lat: 39.9042, lng: 116.4074 }, // 经纬度
  },
  {
    id: '2',
    name: '易宿精选酒店（上海浦东店）',
    address: '上海市浦东新区世纪大道100号',
    distance: 0.8,
    rating: 4.9,
    price: 399,
    originalPrice: 499,
    images: [
      'https://picsum.photos/400/300?random=3',
      'https://picsum.photos/400/300?random=4',
    ],
    tags: ['江景房', '健身房', '游泳池'],
    facilities: ['WiFi', '空调', '冰箱', '洗衣机'],
    roomTypes: [
      { id: 'r4', name: '江景大床房', price: 499, area: '30㎡', stock: 8 },
    ],
    location: { lat: 31.2304, lng: 121.4737 },
  },
  // ... 更多Mock数据
];

/**
 * 搜索酒店（含分页）
 * GET /api/hotels
 */
export const searchHotelsApi = async (params: {
  keyword?: string;
  checkIn?: string;
  checkOut?: string;
  location?: { lat: number; lng: number };
  sortBy?: 'price' | 'distance' | 'rating';
  page: number;
  pageSize: number;
}) => {
  await delay(300); // 模拟网络延迟

  let list = [...mockHotels];

  // 关键词筛选
  if (params.keyword) {
    list = list.filter(h =>
      h.name.includes(params.keyword!) || h.address.includes(params.keyword!)
    );
  }

  // 距离排序（如果有定位）
  if (params.location && params.sortBy === 'distance') {
    list = list.map(h => ({
      ...h,
      distance: calculateDistance(params.location!, h.location),
    })).sort((a, b) => a.distance - b.distance);
  }

  // 价格排序
  if (params.sortBy === 'price') {
    list.sort((a, b) => a.price - b.price);
  }

  // 评分排序
  if (params.sortBy === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  // 分页
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  const pageData = list.slice(start, end);

  return {
    success: true,
    data: pageData,
    total: list.length,
    hasMore: end < list.length,
  };
};

/**
 * 获取酒店详情
 * GET /api/hotels/:id
 */
export const getHotelDetailApi = async (id: string) => {
  await delay(200);

  const hotel = mockHotels.find(h => h.id === id);

  if (!hotel) {
    return { success: false, message: '酒店不存在' };
  }

  return {
    success: true,
    data: hotel,
  };
};

/**
 * 获取定位（LBS）
 */
export const getLocationApi = async (): Promise<{
  lat: number;
  lng: number;
  address?: string;
}> => {
  await delay(500);

  // H5环境使用浏览器API
  if (process.env.TARO_ENV === 'h5') {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持定位'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        error => {
          // 定位失败，返回默认位置（天安门）
          console.warn('定位失败，使用默认位置', error);
          resolve({ lat: 39.9042, lng: 116.4074 });
        },
        { timeout: 5000 }
      );
    });
  }

  // 小程序环境使用 Taro API
  if (process.env.TARO_ENV === 'weapp') {
    try {
      const res = await Taro.getLocation();
      return {
        lat: res.latitude,
        lng: res.longitude,
      };
    } catch (error) {
      console.warn('定位失败，使用默认位置', error);
      return { lat: 39.9042, lng: 116.4074 };
    }
  }

  // 默认位置
  return { lat: 39.9042, lng: 116.4074 };
};

/**
 * 计算两点间距离（公里）
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

---

## 📅 两周详细开发计划

### Week 1：基础搭建 + 核心功能

| 天数 | 开发任务 | 详细内容 | Git分支 | Commit示例 |
|-----|---------|---------|---------|-----------|
| **Day 1** | 环境搭建 + 项目初始化 | 1. 初始化Taro项目<br>2. 安装NutUI/Taro UI<br>3. **创建mockApi.ts**<br>4. 配置路由<br>5. 安装Day.js | `feature/setup-mobile` | `feat: 初始化Taro项目`<br>`feat: 安装并配置NutUI组件库`<br>`feat: 创建Mock API服务`<br>`feat: 配置Taro Router` |
| **Day 2** | 首页框架 + 搜索表单 | 1. 首页布局<br>2. 搜索表单（目的地、日期）<br>3. 日历组件集成<br>4. **调用searchHotelsApi（Mock）** | `feature/home-page` | `feat: 实现首页布局`<br>`feat: 实现搜索表单`<br>`feat: 集成日历选择组件` |
| **Day 3** | 首页功能完善 | 1. 热门推荐展示<br>2. 搜索历史<br>3. 页面跳转 | `feature/home-page` | `feat: 添加热门推荐`<br>`feat: 实现搜索历史` |
| **Day 4** | **【联调开始】**列表页框架 | 1. **创建真实api.ts**<br>2. **替换Mock API**<br>3. 列表页布局<br>4. **基础列表渲染** | `feature/hotel-list` | `refactor: 创建真实API服务`<br>`refactor: 替换Mock API为真实API`<br>`feat: 实现列表页面布局` |
| **Day 5** | 列表功能完善 | 1. **骨架屏**加载<br>2. 筛选栏（价格、评分）<br>3. 排序功能 | `feature/hotel-list` | `feat: 添加骨架屏加载`<br>`feat: 实现筛选功能`<br>`feat: 实现排序功能` |
| **Day 6** | 详情页框架 | 1. 详情页布局<br>2. 图片轮播<br>3. 酒店基本信息 | `feature/hotel-detail` | `feat: 实现详情页布局`<br>`feat: 实现图片轮播` |
| **Day 7** | 详情页房型列表 | 1. 房型列表展示<br>2. 价格排序（低→高）<br>3. 预订按钮 | `feature/hotel-detail` | `feat: 实现房型列表`<br>`feat: 实现价格排序` |

### Week 2：创新功能 + 优化完善

| 天数 | 开发任务 | 详细内容 | Git分支 | Commit示例 |
|-----|---------|---------|---------|-----------|
| **Day 8** | **【创新1】虚拟滚动实现** | 1. 引入@tarojs/components虚拟滚动<br>2. 重构列表页使用虚拟滚动<br>3. 性能对比测试 | `feature/virtual-scroll` | `feat: 实现虚拟滚动列表`<br>`perf: 优化长列表渲染性能` |
| **Day 9** | 虚拟滚动调优 | 1. 动态高度计算<br>2. 滚动优化<br>3. 骨架屏配合 | `feature/virtual-scroll` | `perf: 优化虚拟滚动性能`<br>`feat: 支持动态高度` |
| **Day 10** | **【创新2】LBS定位实现** | 1. **实现getLocationApi**<br>2. H5/小程序API适配<br>3. 定位权限处理 | `feature/location` | `feat: 实现LBS定位功能`<br>`feat: 适配H5和小程序定位API` |
| **Day 11** | LBS功能完善 | 1. **"距我最近"排序**<br>2. **距离显示**<br>3. 定位失败降级 | `feature/location` | `feat: 实现距离排序`<br>`feat: 显示酒店距离`<br>`feat: 添加定位失败处理` |
| **Day 12** | 性能优化 + 懒加载 | 1. **图片懒加载**<br>2. 列表页无限加载<br>3. 下拉刷新 | `feature/performance` | `feat: 实现图片懒加载`<br>`feat: 实现无限滚动加载`<br>`feat: 实现下拉刷新` |
| **Day 13** | 移动端测试 | 1. 功能测试<br>2. **H5端测试**<br>3. **小程序端测试**（可选）<br>4. Bug修复 | `bugfix/day13` | `test: 完成移动端功能测试`<br>`fix: 修复H5端兼容性问题` |
| **Day 14** | Bug修复 + 演示准备 | 1. Bug修复<br>2. 代码优化<br>3. 准备演示数据 | - | `fix: 修复列表滚动问题`<br>`chore: 准备演示环境` |

---

## 🌳 Git分支策略

### 分支列表

```
main (主分支)
├── feature/setup-mobile      # 环境搭建
├── feature/home-page        # 首页/查询页
├── feature/hotel-list      # 酒店列表页
├── feature/hotel-detail     # 酒店详情页
├── feature/virtual-scroll   # 虚拟滚动（创新）
├── feature/location        # LBS定位（创新）
├── feature/performance     # 性能优化
└── bugfix/day13          # Bug修复
```

### 分支操作流程

```bash
# 1. 拉取最新main分支
git checkout main
git pull origin main

# 2. 创建功能分支
git checkout -b feature/hotel-list

# 3. 开发并提交
git add .
git commit -m "feat: 实现酒店列表页面"

# 4. 推送到远程
git push origin feature/hotel-list

# 5. 创建PR并合并
```

### 合并时间节点

| 日期 | 合并分支 | 检查点 |
|-----|---------|--------|
| Day 1 晚上 | `feature/setup-mobile` | M1: 环境搭建完成 |
| Day 3 晚上 | `feature/home-page` | 首页功能可用 |
| Day 5 晚上 | `feature/hotel-list` | 列表页基础功能可用 |
| Day 7 晚上 | `feature/hotel-detail` | M3: 所有基础页面完成 |
| Day 9 晚上 | `feature/virtual-scroll` | M4: 虚拟滚动完成 |
| Day 11 晚上 | `feature/location` | LBS定位完成 |
| Day 12 晚上 | `feature/performance` | 性能优化完成 |
| Day 13 晚上 | `bugfix/day13` | Bug修复完成 |

---

## 📝 Conventional Commits 提交示例

```bash
# 新功能
git commit -m "feat(home): 实现首页搜索表单"
git commit -m "feat(list): 实现酒店列表渲染"
git commit -m "feat(detail): 实现图片轮播组件"

# 创新功能
git commit -m "feat(virtual-scroll): 实现虚拟滚动优化"
git commit -m "feat(location): 实现LBS定位功能"

# 性能优化
git commit -m "perf: 优化图片加载性能"
git commit -m "perf: 优化列表渲染性能"

# Bug修复
git commit -m "fix: 修复滚动时列表卡顿问题"
git commit -m "fix: 修复H5端定位失败问题"

# 代码重构
git commit -m "refactor: 将Mock API替换为真实API"

# 测试
git commit -m "test: 完成H5端功能测试"
git commit -m "test: 完成小程序端兼容性测试"
```

---

## 🎯 创新功能实现细节

### 1. 虚拟滚动（Day 8-9）

#### 实现方案

```tsx
/**
 * pages/list/index.tsx
 * 使用 @tarojs/components 的 VirtualList
 */
import { ScrollView, View } from '@tarojs/components';
import VirtualList from '@tarojs/components/virtual-list';

const HotelList = ({ hotels }) => {
  const rowData = (hotel, index) => {
    return (
      <View className="hotel-item">
        {/* 酒店卡片内容 */}
      </View>
    );
  };

  return (
    <VirtualList
      height={window.innerHeight} // 视口高度
      width="100%"
      rowData={hotels}
      rowHeight={150} // 每项固定高度
      renderRow={rowData}
      overscanCount={5} // 预渲染数量
    />
  );
};
```

#### 评分要点

| 评分项 | 实现方式 | 验证方法 |
|-------|---------|---------|
| 技术复杂度（3分） | 只渲染可视区域列表项 | Chrome DevTools查看DOM数量 |
| 性能优化 | 配合骨架屏提升体验 | 列表滚动流畅度 |

---

### 2. LBS定位（Day 10-11）

#### 实现方案

```tsx
/**
 * hooks/useLocation.ts
 * 自定义定位Hook
 */
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { getLocationApi } from '../services/mockApi';

export const useLocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const loc = await getLocationApi();
      setLocation(loc);
    } catch (err: any) {
      setError(err.message || '定位失败');
    } finally {
      setLoading(false);
    }
  };

  return { location, loading, error, getLocation };
};

// 使用
const HomePage = () => {
  const { location, loading, getLocation } = useLocation();

  return (
    <View>
      <Button onClick={getLocation} loading={loading}>
        {loading ? '定位中...' : '获取当前位置'}
      </Button>
      {location && <Text>已定位</Text>}
    </View>
  );
};
```

#### H5/小程序适配

```typescript
// services/mockApi.ts
export const getLocationApi = async () => {
  // H5环境
  if (process.env.TARO_ENV === 'h5') {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => reject(err)
      );
    });
  }

  // 小程序环境
  if (process.env.TARO_ENV === 'weapp') {
    const res = await Taro.getLocation();
    return { lat: res.latitude, lng: res.longitude };
  }
};
```

#### 评分要点

| 评分项 | 实现方式 | 验证方法 |
|-------|---------|---------|
| 项目创新性（5分） | "距我最近"排序、显示距离 | 排序后首项为最近酒店 |
| 技术展示 | H5/小程序API适配 | 两端都能正常定位 |

---

## 📁 推荐的移动端目录结构

```
mini-app/
├── src/
│   ├── components/              # 公共组件
│   │   ├── HotelCard/         # 酒店卡片
│   │   │   └── index.tsx
│   │   ├── SearchBar/         # 搜索栏
│   │   │   └── index.tsx
│   │   ├── Calendar/          # 日历选择（成员C提供）
│   │   │   └── index.tsx
│   │   ├── FilterBar/         # 筛选栏
│   │   │   └── index.tsx
│   │   ├── ImageSwiper/       # 图片轮播
│   │   │   └── index.tsx
│   │   └── Skeleton/          # 骨架屏
│   │       └── index.tsx
│   ├── pages/                # 页面
│   │   ├── home/             # 首页/查询页
│   │   │   ├── index.tsx
│   │   │   ├── components/
│   │   │   │   ├── SearchForm.tsx
│   │   │   │   └── HotRecommend.tsx
│   │   │   └── service.ts
│   │   ├── list/             # 列表页
│   │   │   ├── index.tsx
│   │   │   ├── components/
│   │   │   │   ├── HotelList.tsx
│   │   │   │   ├── FilterBar.tsx
│   │   │   │   └── VirtualList.tsx  # 虚拟滚动
│   │   │   └── service.ts
│   │   └── detail/           # 详情页
│   │       ├── index.tsx
│   │       ├── components/
│   │       │   ├── ImageSwiper.tsx
│   │       │   ├── RoomList.tsx
│   │       │   └── BookButton.tsx
│   │       └── service.ts
│   ├── hooks/                # 自定义hooks
│   │   ├── useLocation.ts    # 定位Hook
│   │   ├── useVirtualList.ts # 虚拟滚动Hook
│   │   └── useRequest.ts    # 请求Hook
│   ├── services/             # API服务
│   │   ├── mockApi.ts        # Mock API
│   │   ├── api.ts           # 真实API
│   │   └── types.ts         # 类型定义
│   ├── utils/               # 工具函数
│   │   ├── date.ts          # 日期处理
│   │   └── distance.ts      # 距离计算
│   ├── styles/              # 全局样式
│   ├── app.config.ts        # Taro应用配置
│   ├── app.tsx
│   └── app.scss
├── project.h5.json          # H5端配置
├── project.weapp.json       # 小程序端配置
├── package.json
└── tsconfig.json
```

---

## 🎯 每日检查清单

### Day 1 检查清单
- [ ] Taro项目能正常启动（H5）
- [ ] NutUI组件正常显示
- [ ] 路由配置完成
- [ ] Mock API服务可用
- [ ] Git分支已创建并推送

### Day 2-3 检查清单
- [ ] 首页布局完成
- [ ] 搜索表单可正常输入
- [ ] 日历组件可选择日期
- [ ] 搜索可跳转到列表页

### Day 4-5 检查清单
- [ ] 列表页可正常显示
- [ ] 骨架屏加载正常
- [ ] 筛选功能正常工作
- [ ] 排序功能正常工作
- [ ] 下拉刷新可用
- [ ] 上拉加载更多可用

### Day 6-7 检查清单
- [ ] 详情页布局完成
- [ ] 图片轮播正常滑动
- [ ] 房型列表正确显示
- [ ] 价格排序正常工作
- [ ] 预订按钮可点击

### Day 8-9 检查清单（虚拟滚动）
- [ ] 虚拟滚动正常工作
- [ ] 列表滚动流畅
- [ ] DOM数量减少（只渲染可见项）
- [ ] 配合骨架屏加载

### Day 10-11 检查清单（LBS定位）
- [ ] H5端定位正常
- [ ] 小程序端定位正常（如开发）
- [ ] "距我最近"排序正确
- [ ] 距离显示正确
- [ ] 定位失败有降级方案

### Day 12 检查清单（性能优化）
- [ ] 图片懒加载正常
- [ ] 无限加载可用
- [ ] 下拉刷新可用
- [ ] 页面性能良好

### Day 13-14 检查清单
- [ ] H5端功能测试通过
- [ ] 小程序端测试通过（可选）
- [ ] 无严重Bug
- [ ] 演示数据准备完成
- [ ] 代码整洁无warning

---

## 📊 成员A工作量评估

| 功能模块 | 工作量 | 占比 |
|---------|--------|------|
| 环境搭建 | 0.5天 | 3.6% |
| 首页/查询页 | 2.5天 | 17.9% |
| 酒店列表页 | 4天 | 28.6% |
| 酒店详情页 | 3天 | 21.4% |
| 虚拟滚动（创新） | 2天 | 14.3% |
| LBS定位（创新） | 1.5天 | 10.7% |
| 测试+Bug修复 | 0.5天 | 3.6% |
| **总计** | **14天** | **100%** |

---

## 🔗 与其他成员的协作节点

| 时间 | 与成员C（后端）协作 | 与成员B（PC端）协作 |
|-----|-------------------|-------------------|
| Day 1 | - | - |
| Day 4 | 确认API接口规范<br>替换Mock为真实API | - |
| Day 7 | 联调酒店详情API | - |
| Day 11 | 测试LBS定位API | - |
| Day 14 | 集成测试验收 | 测试PC端→移动端数据流 |

---

## 📱 Taro 多端发布目标

### H5端（必选）

```bash
# 开发
npm run dev:h5

# 构建
npm run build:h5

# 输出目录
dist/
```

### 微信小程序（可选）

```bash
# 开发
npm run dev:weapp

# 构建
npm run build:weapp

# 输出目录
dist/
```

### 多端差异处理

```typescript
// 根据平台使用不同API
if (process.env.TARO_ENV === 'h5') {
  // H5 特有代码
  window.navigator.geolocation.getCurrentPosition(...)
} else if (process.env.TARO_ENV === 'weapp') {
  // 小程序特有代码
  Taro.getLocation().then(...)
}
```

---

## 🎓 学习资源

### Taro 官方文档
- 官网：https://taro-docs.jd.com/
- React 指南：https://taro-docs.jd.com/tutorial
- 组件库：https://taro-docs.jd.com/components

### NutUI 组件库
- 官网：https://nutui.jd.com/
- Taro 版本：https://nutui.jd.com/taro/

### 虚拟滚动参考
- Taro VirtualList文档
- react-window 源码参考

### LBS定位参考
- H5 Geolocation API：https://developer.mozilla.org/zh-CN/docs/Web/API/Geolocation
- 微信小程序定位：https://developers.weixin.qq.com/miniprogram/dev/api/location/wx.getLocation.html

---

> 文档版本：v1.0
> 最后更新：2025-02-13
> 状态：待确认后开始执行
