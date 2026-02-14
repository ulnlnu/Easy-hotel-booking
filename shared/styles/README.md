# 样式规范使用指南

## 📋 概述

本目录包含易宿酒店预订平台的统一样式规范，用于确保所有端（admin、mini-app）的视觉一致性。

## 📁 文件说明

| 文件 | 用途 | 适用场景 |
|------|------|----------|
| `design-tokens.scss` | SCSS 变量定义和混合宏 | **admin** 及其他需要 SCSS 的项目 |
| `variables.css` | CSS 自定义属性 | **mini-app** 及其他使用 CSS 变量的场景 |

---

## 🔧 Admin 端使用方式

### 1. 引入设计令牌

在 `admin/src/index.scss` 全局引入：

```scss
@import '@shared/styles/design-tokens.scss';
```

或者在组件样式文件中引入：

```scss
// admin/src/components/MyComponent/index.scss
@import '@shared/styles/design-tokens.scss';

.my-component {
  color: $color-primary;
  padding: $spacing-16;
  border-radius: $radius-base;
}
```

### 2. 路径别名配置

确保 `admin/tsconfig.json` 中已配置路径别名：

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  }
}
```

### 3. 常用变量示例

```scss
// 颜色
color: $color-primary;
color: $color-text-primary;
background: $color-bg-container;
border-color: $color-border-base;

// 间距
padding: $spacing-16;
margin: $spacing-24 0;
gap: $spacing-12;

// 字体
font-size: $font-size-base;
font-weight: $font-weight-semibold;
line-height: $line-height-base;

// 圆角
border-radius: $radius-base;  // 8px
border-radius: $radius-lg;    // 12px（卡片推荐）

// 阴影
box-shadow: $shadow-base;

// 过渡
transition: $transition-base;
```

### 4. 使用混合宏（Mixins）

```scss
// 文本溢出省略
.my-text {
  @include text-ellipsis(1);  // 单行省略
}

.my-text-multi {
  @include text-ellipsis(2);  // 两行省略
}

// Flex 布局
.my-flex {
  @include flex-center;      // 居中对齐
  @include flex-between;     // 两端对齐
}

// 自定义滚动条
.my-scroll {
  @include custom-scrollbar(8px, #f1f1f1, #c1c1c1);
}
```

---

## 📱 Mini-app 端使用方式

### 1. 引入 CSS 变量

在 `mini-app/src/app.scss` 全局引入：

```scss
@import '@shared/styles/variables.css';
```

### 2. 使用变量

```scss
// 在组件中使用 CSS 变量
.my-component {
  color: var(--color-primary);
  padding: var(--spacing-16);
  border-radius: var(--radius-base);
}
```

### 3. 注意事项

- 移动端使用 Taro 的 `pxtransform` 转换，尺寸以 750px 设计稿为准
- 字号变量 `design-tokens.scss` 中已定义移动端专用变量（`$font-size-mobile-*`）

---

## 🎨 设计规范速查

### 颜色规范

| 用途 | 变量名 | 值 |
|------|--------|-----|
| 主色 | `$color-primary` | `#1890ff` |
| 成功 | `$color-success` | `#52c41a` |
| 警告 | `$color-warning` | `#faad14` |
| 错误 | `$color-error` | `#f5222d` |
| 主要文本 | `$color-text-primary` | `#333333` |
| 次要文本 | `$color-text-secondary` | `#666666` |
| 辅助文本 | `$color-text-tertiary` | `#999999` |
| 边框 | `$color-border-base` | `#e8e8e8` |
| 页面背景 | `$color-bg-page` | `#f5f5f5` |
| 价格 | `$color-price` | `#ff4d4f` |

### 间距规范

| 名称 | 变量名 | 值 | 用途 |
|------|--------|-----|------|
| 极小 | `$spacing-4` | `4px` | 紧凑间距 |
| 小 | `$spacing-8` | `8px` | 小间距 |
| 中小 | `$spacing-12` | `12px` | 组件内边距 |
| 标准 | `$spacing-16` | `16px` | 常用间距 |
| 中大 | `$spacing-20` | `20px` | 按钮内边距 |
| 大 | `$spacing-24` | `24px` | 卡片内边距 |
| 超大 | `$spacing-32` | `32px` | 区块间距 |
| 特大 | `$spacing-48` | `48px` | 页面级间距 |

### 圆角规范

| 名称 | 变量名 | 值 | 用途 |
|------|--------|-----|------|
| 小圆角 | `$radius-sm` | `4px` | 输入框、按钮 |
| 中圆角 | `$radius-base` | `8px` | 容器 |
| 大圆角 | `$radius-lg` | `12px` | 卡片（推荐） |
| 超大圆角 | `$radius-xl` | `16px` | 特殊场景 |

### 字号规范（PC端）

| 名称 | 变量名 | 值 | 用途 |
|------|--------|-----|------|
| 极小 | `$font-size-xs` | `12px` | 辅助信息 |
| 小 | `$font-size-sm` | `14px` | 正文 |
| 标准 | `$font-size-base` | `16px` | 基础字号 |
| 大 | `$font-size-lg` | `18px` | 小标题 |
| 超大 | `$font-size-xl` | `20px` | 标题 |
| 特大 | `$font-size-xxl` | `24px` | 大标题 |

---

## 👥 协作规范

### 给 AI/成员的任务提示模板

在分配开发任务时，请在任务描述中加入以下提示：

```
样式规范要求：
- 使用 @shared/styles/design-tokens.scss 中定义的设计令牌
- 颜色使用 $color-primary、$color-text-primary 等变量，不要硬编码颜色值
- 间距使用 $spacing-* 系列变量
- 圆角使用 $radius-* 系列变量
- 新增通用样式时，请更新到 shared/styles/ 中
```

### 新增样式规范流程

如果需要新增变量：

1. 在 `shared/styles/design-tokens.scss` 中添加
2. 同步更新 `shared/styles/variables.css`（如果是 CSS 变量）
3. 更新本 README 的速查表
4. 通知团队成员

---

## ⚠️ 注意事项

1. **不要硬编码样式值**：优先使用设计令牌中的变量
2. **保持一致性**：相同样式的使用场景应使用相同的变量
3. **修改前确认**：设计令牌的修改会影响多个页面，修改前请与团队确认
4. **组件复用优先**：重复出现3次以上的样式应抽象为组件
5. **移动端单位**：mini-app 使用 Taro，尺寸以 750px 设计稿为准

---

## 📚 参考资源

- [Ant Design 设计规范](https://ant.design/docs/spec/introduce-cn)
- [NutUI 设计规范](https://nutui.jd.com/theme/)
- [Taro 样式指南](https://taro-docs.jd.com/docs/style)
