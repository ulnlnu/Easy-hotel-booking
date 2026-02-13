/**
 * mini-app/src/services/request.ts
 * Taro.request 封装
 */

import Taro from '@tarojs/taro';
import { API_CONFIG } from '@shared/constants/config';

/**
 * 统一请求方法
 */
async function request<T = any>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    params?: any;
    header?: Record<string, string>;
  } = {}
): Promise<{
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  hasMore?: boolean;
}> {
  const token = Taro.getStorageSync('token');

  try {
    const response = await Taro.request({
      url: `${API_CONFIG.BASE_URL}${url}`,
      method: options.method || 'GET',
      data: options.data,
      data: options.params, // Taro的GET请求参数通过data传递
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
    });

    // 统一返回格式
    if (response.data.success === false) {
      Taro.showToast({
        title: response.data.message || '请求失败',
        icon: 'error',
        duration: 2000,
      });
      return response.data;
    }

    return response.data;
  } catch (error: any) {
    console.error('Request error:', error);

    // 处理网络错误
    let errorMessage = '网络错误';
    if (error.errMsg) {
      errorMessage = error.errMsg;
    } else if (error.message) {
      errorMessage = error.message;
    }

    Taro.showToast({
      title: errorMessage,
      icon: 'error',
      duration: 2000,
    });

    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * GET请求
 */
export const get = <T = any>(url: string, params?: any) =>
  request<T>(url, { method: 'GET', params });

/**
 * POST请求
 */
export const post = <T = any>(url: string, data?: any) =>
  request<T>(url, { method: 'POST', data });

/**
 * PUT请求
 */
export const put = <T = any>(url: string, data?: any) =>
  request<T>(url, { method: 'PUT', data });

/**
 * DELETE请求
 */
export const del = <T = any>(url: string) =>
  request<T>(url, { method: 'DELETE' });

export default request;
