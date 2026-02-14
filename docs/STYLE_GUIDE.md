# 易宿酒店预订平台 - 样式规范使用指南

> 本文档为开发者（包括 AI 助手）提供统一的样式编写规范，确保项目所有端（admin、mini-app）的视觉一致性。

---

## 📑 目录

- [快速开始](#快速开始)
- [设计令牌速查](#设计令牌速查)
- [样式编写规范](#样式编写规范)
- [常见场景示例](#常见场景示例)
- [AI 任务提示模板](#ai-任务提示模板)
- [常见问题](#常见问题)

---

## 🚀 快速开始

### 1. Admin 端（PC管理后台）

全局样式已在 `admin/src/index.scss` 中引入设计令牌：

```scss
@import '@shared/styles/design-tokens.scss';
```

在组件中直接使用 SCSS 变量：

```scss
.my-component {
  color: $color-primary;
  padding: $spacing-16;
  border-radius: $radius-base;
}
```

### 2. Mini-app 端（移动端）

全局样式已在 `mini-app/src/app.scss` 中引入 CSS 变量：

```scss
@import '@shared/styles/variables.css';
```

在组件中直接使用 CSS 变量：

```scss
.my-component {
  color: var(--color-primary);
  padding: var(--spacing-16);
  border-radius: var(--radius-base);
}
```

---

## 🎨 设计令牌速查

### 颜色系统

| 用途 | Admin (SCSS) | Mini-app (CSS) | 值 | 使用场景 |
|------|--------------|----------------|-----|----------|
| **主色** | `$color-primary` | `var(--color-primary)` | `#1890ff` | 主按钮、链接、强调元素 |
| 主色悬停 | `$color-primary-hover` | `var(--color-primary-hover)` | `#40a9ff` | 按钮悬停状态 |
| 主色激活 | `$color-primary-active` | `var(--color-primary-active)` | `#096dd9` | 按钮激活状态 |
| 主色浅色 | `$color-primary-light` | `var(--color-primary-light)` | `#e6f7ff` | 主色背景、标签 |
| **成功色** | `$color-success` | `var(--color-success)` | `#52c41a` | 成功提示、成功状态 |
| 成功浅色 | `$color-success-light` | `var(--color-success-light)` | `#f6ffed` | 成功背景 |
| **警告色** | `$color-warning` | `var(--color-warning)` | `#faad14` | 警告提示 |
| 警告浅色 | `$color-warning-light` | `var(--color-warning-light)` | `#fffbe6` | 警告背景 |
| **错误色** | `$color-error` | `var(--color-error)` | `#f5222d` | 错误提示、删除操作 |
| 错误浅色 | `$color-error-light` | `var(--color-error-light)` | `#fff1f0` | 错误背景 |
| **主要文本** | `$color-text-primary` | `var(--color-text-primary)` | `#333333` | 标题、正文 |
| **次要文本** | `$color-text-secondary` | `var(--color-text-secondary)` | `#666666` | 描述文字、辅助信息 |
| **辅助文本** | `$color-text-tertiary` | `var(--color-text-tertiary)` | `#999999` | 提示文字、标签 |
| 占位符 | `$color-text-placeholder` | `var(--color-text-placeholder)` | `#bfbfbf` | 输入框占位符 |
| **边框** | `$color-border-base` | `var(--color-border-base)` | `#e8e8e8` | 默认边框 |
| 浅边框 | `$color-border-light` | `var(--color-border-light)` | `#f0f0f0` | 分割线 |
| **页面背景** | `$color-bg-page` | `var(--color-bg-page)` | `#f5f5f5` | 页面背景色 |
| **容器背景** | `$color-bg-container` | `var(--color-bg-container)` | `#ffffff` | 卡片、容器背景 |
| 悬停背景 | `$color-bg-hover` | `var(--color-bg-hover)` | `#f5f5f5` | 可点击元素悬停 |
| **价格色** | `$color-price` | `var(--color-price)` | `#ff4d4f` | 价格显示 |
| **评分色** | `$color-rating` | `var(--color-rating)` | `#ffc107` | 星级评分 |

### 间距系统

| 名称 | Admin (SCSS) | Mini-app (CSS) | 值 | 使用场景 |
|------|--------------|----------------|-----|----------|
| 极小 | `$spacing-4` / `$spacing-xs` | `var(--spacing-4)` | `4px` | 紧凑间距、小元素内边距 |
| 小 | `$spacing-8` / `$spacing-sm` | `var(--spacing-8)` | `8px` | 小间距、图标与文字间距 |
| 中小 | `$spacing-12` / `$spacing-md` | `var(--spacing-12)` | `12px` | 按钮内边距 |
| **标准** | `$spacing-16` / `$spacing-base` | `var(--spacing-16)` | `16px` | **最常用的间距** |
| 中大 | `$spacing-20` | `var(--spacing-20)` | `20px` | 大按钮内边距 |
| **大** | `$spacing-24` / `$spacing-lg` | `var(--spacing-24)` | `24px` | 卡片内边距、区块间距 |
| 超大 | `$spacing-32` / `$spacing-xl` | `var(--spacing-32)` | `32px` | 大区块间距 |
| 特大 | `$spacing-48` | `var(--spacing-48)` | `48px` | 页面级间距 |

### 圆角系统

| 名称 | Admin (SCSS) | Mini-app (CSS) | 值 | 使用场景 |
|------|--------------|----------------|-----|----------|
| 小圆角 | `$radius-xs` | `var(--radius-xs)` | `2px` | 小元素 |
| **标准圆角** | `$radius-sm` | `var(--radius-sm)` | `4px` | 输入框、小按钮 |
| **中圆角** | `$radius-base` | `var(--radius-base)` | `8px` | 容器、面板 |
| **大圆角** | `$radius-lg` | `var(--radius-lg)` | `12px` | **卡片（推荐）** |
| 超大圆角 | `$radius-xl` | `var(--radius-xl)` | `16px` | 特殊场景 |
| 圆形 | `$radius-round` | `var(--radius-round)` | `50%` | 头像、圆形按钮 |

### 阴影系统

| 名称 | Admin (SCSS) | Mini-app (CSS) | 使用场景 |
|------|--------------|----------------|----------|
| 小阴影 | `$shadow-sm` | `var(--shadow-sm)` | 轻微浮起效果 |
| **标准阴影** | `$shadow-base` | `var(--shadow-base)` | **卡片阴影（推荐）** |
| 中阴影 | `$shadow-md` | `var(--shadow-md)` | 弹出层、模态框 |
| 大阴影 | `$shadow-lg` | `var(--shadow-lg)` | 气泡、下拉菜单 |
| 超大阴影 | `$shadow-xl` | `var(--shadow-xl)` | 顶层浮层 |

### 字体系统（Admin PC端）

| 名称 | 变量 | 值 | 使用场景 |
|------|------|-----|----------|
| 极小 | `$font-size-xs` | `12px` | 辅助说明 |
| 小 | `$font-size-sm` | `14px` | 正文 |
| **标准** | `$font-size-base` | `16px` | 基础字号 |
| 大 | `$font-size-lg` | `18px` | 小标题 |
| 超大 | `$font-size-xl` | `20px` | 标题 |
| 特大 | `$font-size-xxl` | `24px` | 大标题 |

### 字重系统

| 名称 | 变量 | 值 | 使用场景 |
|------|------|-----|----------|
| 常规 | `$font-weight-normal` | `400` | 正文 |
| 中等 | `$font-weight-medium` | `500` | 强调文字 |
| **半粗** | `$font-weight-semibold` | `600` | **小标题（推荐）** |
| 粗体 | `$font-weight-bold` | `700` | 大标题 |

---

## 📏 样式编写规范

### ✅ 推荐做法

```scss
// ✅ 使用设计令牌变量
.my-card {
  color: $color-text-primary;
  background: $color-bg-container;
  padding: $spacing-16;
  border-radius: $radius-lg;
  box-shadow: $shadow-base;
}
```

### ❌ 禁止做法

```scss
// ❌ 硬编码颜色值
.my-card {
  color: #333333;
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
```

### 规则总结

| 规则 | 说明 |
|------|------|
| 1. **禁止硬编码** | 所有颜色、间距、圆角、阴影必须使用变量 |
| 2. **语义化命名** | 优先使用语义化变量（如 `$padding-card`）而非原始值 |
| 3. **一致性** | 相同功能的样式必须使用相同的变量 |
| 4. **组件复用** | 出现 3 次以上的样式模式应抽象为组件 |

---

## 💡 常见场景示例

### 1. 卡片组件

**Admin 端：**
```scss
.hotel-card {
  background: $color-bg-container;
  border-radius: $radius-lg;        // 12px
  padding: $spacing-24;             // 24px
  margin-bottom: $spacing-24;
  box-shadow: $shadow-base;

  &:hover {
    box-shadow: $shadow-md;
    transition: $transition-base;
  }
}
```

**Mini-app 端：**
```scss
.hotel-card {
  background: var(--color-bg-container);
  border-radius: var(--radius-lg);
  padding: var(--spacing-24);
  margin-bottom: var(--spacing-24);
  box-shadow: var(--shadow-base);
}
```

### 2. 按钮样式

```scss
// 主要按钮
.btn-primary {
  background: $color-primary;
  color: $color-bg-container;
  padding: $spacing-12 $spacing-16;
  border-radius: $radius-sm;        // 4px
  font-weight: $font-weight-medium;
  transition: $transition-base;

  &:hover {
    background: $color-primary-hover;
  }

  &:active {
    background: $color-primary-active;
  }
}
```

### 3. 文本样式

```scss
// 标题
.title {
  font-size: $font-size-lg;          // 18px
  font-weight: $font-weight-semibold; // 600
  color: $color-text-primary;
  margin-bottom: $spacing-12;
}

// 描述文字
.description {
  font-size: $font-size-sm;          // 14px
  color: $color-text-secondary;      // #666
  line-height: $line-height-base;    // 1.57
}

// 单行文本省略
.text-ellipsis {
  @include text-ellipsis(1);
}

// 两行文本省略
.text-ellipsis-2 {
  @include text-ellipsis(2);
}
```

### 4. 标签/徽章

```scss
// 主色标签
.tag-primary {
  background: $color-primary-light;
  color: $color-primary;
  padding: $spacing-8 $spacing-12;
  border-radius: $radius-sm;
  font-size: $font-size-sm;
}

// 成功标签
.tag-success {
  background: $color-success-light;
  color: $color-success;
  padding: $spacing-8 $spacing-12;
  border-radius: $radius-sm;
  font-size: $font-size-sm;
}
```

### 5. 状态指示

```scss
// 价格显示
.price {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-price;  // #ff4d4f
}

// 评分星级
.rating {
  color: $color-rating;  // #ffc107
  font-size: $font-size-lg;
}

// 评分数值
.rating-score {
  color: $color-rating;
  font-weight: $font-weight-semibold;
  font-size: $font-size-base;
}
```

### 6. 布局容器

```scss
// Flex 居中
.flex-center {
  @include flex-center;
}

// Flex 两端对齐
.flex-between {
  @include flex-between;
}

// 页面容器
.page-container {
  min-height: 100vh;
  background: $color-bg-page;
  padding: $spacing-24;
}
```

### 7. 输入框

```scss
.input {
  width: 100%;
  padding: $spacing-8 $spacing-12;
  border: 1px solid $color-border-base;
  border-radius: $radius-sm;  // 4px
  font-size: $font-size-base;
  color: $color-text-primary;
  transition: $transition-base;

  &::placeholder {
    color: $color-text-placeholder;
  }

  &:focus {
    border-color: $color-primary;
    outline: none;
  }

  &:disabled {
    background: $color-disabled-bg;
    border-color: $color-disabled-border;
    color: $color-disabled-text;
    cursor: not-allowed;
  }
}
```

---

## 🤖 AI 任务提示模板

在给 AI（或开发者）分配任务时，请在任务描述中加入以下规范要求：

### 标准模板

```
【样式规范要求】
本项目使用统一的设计令牌系统，所有样式编写必须遵循以下规范：

1. 引入设计令牌
   - Admin 端：@import '@shared/styles/design-tokens.scss'
   - Mini-app 端：使用全局引入的 CSS 变量

2. 颜色使用
   - 禁止硬编码颜色值（如 #1890ff）
   - 使用设计令牌变量：$color-primary、$color-text-primary 等
   - 参考速查表：docs/STYLE_GUIDE.md

3. 间距使用
   - 使用 $spacing-* 系列变量
   - 常用：$spacing-8、$spacing-16、$spacing-24

4. 圆角使用
   - 输入框/小按钮：$radius-sm (4px)
   - 容器/面板：$radius-base (8px)
   - 卡片（推荐）：$radius-lg (12px)

5. 阴影使用
   - 卡片悬停：$shadow-base
   - 弹出层：$shadow-md

6. 字体使用
   - 小标题：$font-weight-semibold + $font-size-lg
   - 正文：$font-size-base
   - 描述：$font-size-sm + $color-text-secondary

7. 组件复用
   - 相同样式出现 3 次以上，应抽象为通用组件
   - 新增通用样式时，请更新到 shared/styles/ 中

详细规范请查看：docs/STYLE_GUIDE.md
```

### 简化模板（快速任务）

```
【样式规范】
- 使用 @shared/styles/design-tokens.scss 中的变量
- 颜色：$color-primary、$color-text-primary
- 间距：$spacing-8、$spacing-16、$spacing-24
- 圆角：$radius-sm (输入框)、$radius-lg (卡片)
- 阴影：$shadow-base
- 详细规范：docs/STYLE_GUIDE.md
```

### Mini-app 专用模板

```
【样式规范 - Mini-app】
- 使用 CSS 变量：var(--color-primary)
- 间距：var(--spacing-16)、var(--spacing-24)
- 圆角：var(--radius-lg) 用于卡片
- 阴影：var(--shadow-base)
- 价格：var(--color-price)
- 评分：var(--color-rating)
- 详细规范：docs/STYLE_GUIDE.md
```

---

## ❓ 常见问题

### Q1: 为什么不能直接写颜色值？

**A:** 直接写颜色值会导致：
- 不同页面风格不一致
- 后期主题切换困难
- 代码可维护性差

### Q2: 间距应该用哪个变量？

**A:** 参考以下场景：
- `$spacing-8`：图标与文字间距、小元素内边距
- `$spacing-12`：按钮内边距
- `$spacing-16`：最常用的间距
- `$spacing-24`：卡片内边距、区块间距
- `$spacing-32`+：大区块间距

### Q3: 卡片应该用什么圆角和阴影？

**A:** 推荐：
- 圆角：`$radius-lg` (12px)
- 阴影：`$shadow-base`
- 内边距：`$spacing-24`

### Q4: 如何处理悬停效果？

**A:** 使用过渡变量：
```scss
transition: $transition-base;  // all 0.2s ease-in-out

&:hover {
  background: $color-bg-hover;
  box-shadow: $shadow-md;
}
```

### Q5: 文本溢出怎么处理？

**A:** 使用混合宏：
```scss
// 单行省略
@include text-ellipsis(1);

// 多行省略
@include text-ellipsis(2);
```

### Q6: 如何让 AI 遵循样式规范？

**A:** 在任务描述中加入 `【样式规范要求】` 模板，明确指定使用设计令牌变量。

---

## 📚 相关文档

- [设计令牌完整定义](../shared/styles/design-tokens.scss)
- [CSS 变量定义](../shared/styles/variables.css)
- [样式规范 README](../shared/styles/README.md)

---

## 🔄 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|---------|
| 2026-02-14 | 1.0.0 | 初始版本，建立统一设计令牌系统 |
