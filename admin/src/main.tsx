/**
 * admin/src/main.tsx
 * PC管理端入口文件
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Router from './router';
import './index.scss';

// 蓝白主题配色
const theme = {
  token: {
    colorPrimary: '#2563eb',
    colorPrimaryHover: '#3b82f6',
    colorPrimaryActive: '#1d4ed8',
    colorInfo: '#2563eb',
    borderRadius: 8,
    colorBgContainer: '#ffffff',
    colorBorderSecondary: '#e5e7eb',
  },
  components: {
    Menu: {
      itemSelectedBg: '#eff6ff',
      itemSelectedColor: '#2563eb',
      itemHoverColor: '#2563eb',
      itemHoverBg: '#f8fafc',
    },
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#1e293b',
    },
    Card: {
      headerBg: '#f8fafc',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={theme}>
      <Router />
    </ConfigProvider>
  </React.StrictMode>
);

