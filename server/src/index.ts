/**
 * server/src/index.ts
 * Express后端服务入口文件
 */

import 'dotenv/config';
import app from './app';
import { API_CONFIG } from '../../shared/constants/config';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Base URL: ${API_CONFIG.BASE_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
