/**
 * server/src/app.ts
 * Express应用配置
 */

import express from 'express';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/error';
import { ApiError } from './utils/errors';
import corsConfig from './middleware/cors';

const app = express();

// 安全中间件
app.use(helmet());

// CORS配置 - 使用统一的CORS配置
app.use(corsConfig);

// 解析JSON请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API路由
app.use('/api', routes);

// 404处理
app.use((_req, _res, next) => {
  next(new ApiError(404, 'API endpoint not found'));
});

// 错误处理中间件
app.use(errorHandler);

export default app;
