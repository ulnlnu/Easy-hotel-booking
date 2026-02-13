/**
 * admin/src/services/api.ts
 * 真实API服务（Day 4开始使用）
 *
 * 切换方法：
 * 将 mockApi.ts 的导入改为 api.ts
 */

import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  ApiResponse,
  HotelQueryParams,
  CreateHotelRequest,
  UpdateHotelRequest,
  HotelListResponse,
} from '@shared/types';
import { API_CONFIG } from '@shared/constants/config';

/**
 * 创建axios实例
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 */
apiClient.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const auth = JSON.parse(token);
        if (auth.state.token) {
          config.headers.Authorization = `Bearer ${auth.state.token}`;
        }
      } catch (error) {
        // ignore
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      // 服务器返回错误
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // 请求发送但没有收到响应
      return Promise.reject({
        success: false,
        message: '网络连接失败，请检查网络',
      });
    } else {
      // 请求配置错误
      return Promise.reject({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * 认证相关API
 */
export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  return apiClient.post('/auth/login', data);
};

export const registerApi = async (data: any): Promise<any> => {
  return apiClient.post('/auth/register', data);
};

export const getUserInfoApi = async (): Promise<any> => {
  return apiClient.get('/auth/me');
};

/**
 * 酒店相关API
 */
export const getHotelListApi = async (params: HotelQueryParams): Promise<HotelListResponse> => {
  return apiClient.get('/hotels', { params });
};

export const getHotelDetailApi = async (id: string): Promise<any> => {
  return apiClient.get(`/hotels/${id}`);
};

export const createHotelApi = async (data: CreateHotelRequest): Promise<any> => {
  return apiClient.post('/hotels', data);
};

export const updateHotelApi = async (id: string, data: UpdateHotelRequest): Promise<any> => {
  return apiClient.put(`/hotels/${id}`, data);
};

export const deleteHotelApi = async (id: string): Promise<any> => {
  return apiClient.delete(`/hotels/${id}`);
};

export const auditHotelApi = async (
  id: string,
  action: 'approve' | 'reject',
  reason?: string
): Promise<any> => {
  return apiClient.post(`/hotels/${id}/audit`, { action, reason });
};

export const updateHotelStatusApi = async (id: string, status: 'online' | 'offline'): Promise<any> => {
  return apiClient.post(`/hotels/${id}/status`, { status });
};
