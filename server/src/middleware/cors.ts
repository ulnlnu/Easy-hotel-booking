/**
 * server/src/middleware/cors.ts
 * CORS配置中间件
 */

import cors from 'cors';

/**
 * CORS配置
 */
export const corsConfig = cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173', // PC管理端
      'http://localhost:5174', // PC管理端备用端口
      'http://localhost:5175', // PC管理端备用端口
      'http://localhost:10086', // 移动端H5（Taro配置）
      'http://localhost:1565', // 移动端H5（Python服务器）
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:10086',
      'http://127.0.0.1:1565',
    ];

    // 允许没有origin的请求（如移动应用、Postman等）
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('不允许的跨域请求来源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

export default corsConfig;
