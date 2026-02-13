# mini-app - 移动端

> 易宿酒店预订平台 - 移动端（Taro跨端）
> 技术栈：Taro + React + TypeScript + NutUI + Zustand + Taro.request

---

## 快速开始

### 1. 安装依赖

```bash
cd mini-app
npm install
# 或
pnpm install
```

### 2. 启动开发服务器

```bash
# H5端
npm run dev:h5

# 微信小程序端
npm run dev:weapp
```

访问：
- H5: http://localhost:10086
- 小程序：使用微信开发者工具打开 `dist/` 目录

### 3. 构建生产版本

```bash
# H5构建
npm run build:h5

# 小程序构建
npm run build:weapp
```

---

## 目录结构

```
mini-app/
├── src/
│   ├── components/          # 公共组件
│   │   ├── HotelCard/      # 酒店卡片
│   │   ├── FilterBar/      # 筛选栏
│   │   └── Skeleton/       # 骨架屏
│   ├── pages/             # 页面
│   │   ├── home/          # 首页/查询页
│   │   ├── list/          # 列表页
│   │   └── detail/       # 详情页
│   ├── services/          # API服务
│   ├── store/             # Zustand状态管理
│   ├── hooks/            # 自定义hooks
│   │   ├── useLocation.ts  # LBS定位Hook
│   │   ├── useRequest.ts   # 请求Hook
│   │   └── useVirtualList.ts # 虚拟滚动Hook
│   ├── utils/            # 工具函数
│   │   ├── date.ts        # 日期处理
│   │   └── distance.ts    # 距离计算
│   ├── app.config.ts     # Taro应用配置
│   ├── app.scss         # 全局样式
│   └── app.tsx          # 应用入口
├── project.h5.json      # H5端配置
├── project.weapp.json   # 小程序端配置
└── package.json
```

---

## 功能模块

### 1. 首页/查询页 (`pages/home/`)
- 目的地搜索
- 入住/离店日期选择
- 当前位置获取（LBS）
- 热门城市推荐

### 2. 酒店列表页 (`pages/list/`)
- 酒店列表展示
- 价格区间筛选
- 标签筛选
- 排序功能（价格/距离/评分）

### 3. 酒店详情页 (`pages/detail/`)
- 酒店基本信息
- 图片轮播
- 房型列表
- 价格排序

---

## 状态管理

使用 Zustand：

```typescript
import { useHotelStore } from '@/store/useHotelStore';
import { useLocationStore } from '@/store/useLocationStore';

function Component() {
  const { searchParams, setSearchParams } = useHotelStore();
  const { location } = useLocationStore();
  // ...
}
```

---

## API集成

### 请求封装

`src/services/request.ts` 提供了统一的请求方法：

```typescript
import { get, post } from '@/services/request';

// GET请求
const hotels = await get<HotelListResponse>('/hotels', params);

// POST请求
const result = await post<LoginResponse>('/auth/login', data);
```

### LBS定位

```typescript
import { useLocation } from '@/hooks/useLocation';

function Component() {
  const { location, getLocation, loading } = useLocation();

  const handleLocate = async () => {
    await getLocation();
    // location 将包含 { lat, lng }
  };
}
```

---

## 多端适配

### 条件编译

```typescript
// 根据平台使用不同API
if (process.env.TARO_ENV === 'h5') {
  // H5 特有代码
  navigator.geolocation.getCurrentPosition(...)
} else if (process.env.TARO_ENV === 'weapp') {
  // 小程序特有代码
  Taro.getLocation().then(...)
}
```

### 样式适配

```scss
// 使用 Taro 的尺寸单位 rpx，自动适配不同屏幕
.container {
  width: 750rpx;  // 等于屏幕宽度
  height: 200rpx;
}
```

---

## 创新功能

### 1. 虚拟滚动

```typescript
import { useVirtualList } from '@/hooks/useVirtualList';

function HotelList() {
  const { visibleData, totalHeight } = useVirtualList(hotels);

  return (
    <ScrollView scrollY style={{ height: '100vh' }}>
      <View style={{ height: totalHeight }}>
        {visibleData.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)}
      </View>
    </ScrollView>
  );
}
```

### 2. LBS定位

- H5端使用浏览器 Geolocation API
- 小程序端使用 Taro.getLocation()
- 定位失败自动降级到默认位置（天安门）

---

## 常见问题

### Q: H5端无法定位？
A: 确保使用 HTTPS 或 localhost。浏览器要求安全上下文才能使用定位。

### Q: 小程序定位失败？
A: 检查 `app.json` 中是否配置了 `permission` 权限。

### Q: NutUI组件样式不生效？
A: 确保在 `app.scss` 中正确导入了 NutUI 样式。

---

## 待开发功能

- [ ] 自定义日历组件
- [ ] 图片懒加载
- [ ] 下拉刷新/上拉加载
- [ ] 房型价格区间筛选
- [ ] 收藏功能
- [ ] 分享功能
