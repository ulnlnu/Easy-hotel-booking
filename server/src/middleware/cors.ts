/**
 * server/src/middleware/cors.ts
 * CORS配置中间件
 */

import cors from 'cors';

/**
 * CORS配置
 * 支持本地开发、Vercel 部署（包括预览部署）
 */
export const corsConfig = cors({
  origin: function (origin, callback) {
    // 本地开发域名
    const localOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:10086',
      'http://localhost:1565',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:10086',
      'http://127.0.0.1:1565',
    ];

    // 生产环境固定域名
    const productionOrigins = [
      'https://easy-hotel-booking-admin.vercel.app',
      'https://easy-hotel-booking-h5.vercel.app',
      'https://trip-mini-app.vercel.app',
    ];

    // 从环境变量读取额外域名
    const envOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
      : [];

    // 允许没有origin的请求（如移动应用、Postman等）
    if (!origin) return callback(null, true);

    // 检查是否是允许的域名
    const isAllowed =
      localOrigins.includes(origin) ||
      productionOrigins.includes(origin) ||
      envOrigins.includes(origin) ||
      // 允许所有 Vercel 预览部署 URL
      origin.endsWith('.vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, false); // 不抛出错误，只是拒绝
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

export default corsConfig;
