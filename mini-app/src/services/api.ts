/**
 * mini-app/src/services/api.ts
 * 真实API服务（Day 4开始使用）
 *
 * 切换方法：
 * 将 mockApi.ts 的导入改为 api.ts
 */

import Taro from '@tarojs/taro';
import type {
  HotelQueryParams,
  HotelListResponse,
  ApiResponse,
  ApiSuccess,
  Hotel,
  RegisterRequest,
  SafeUser,
} from '@shared/types';
import { API_CONFIG } from '@shared/constants/config';

/**
 * Taro.request封装
 */
const request = async <T = any>(
  url: string,
  options: Taro.request.Option = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await Taro.request({
      url: `${API_CONFIG.BASE_URL}${url}`,
      timeout: API_CONFIG.TIMEOUT,
      header: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    return response.data as ApiResponse<T>;
  } catch (error) {
    console.error('API请求失败:', error);
    return {
      success: false,
      message: '网络请求失败',
    };
  }
};

/**
 * 搜索酒店
 */
export const searchHotelsApi = async (
  params: HotelQueryParams
): Promise<HotelListResponse> => {
  // Taro.request: GET请求参数自动拼接到URL
  return request<HotelListResponse>('/hotels', {
    method: 'GET',
    data: params,
  }) as Promise<HotelListResponse>;
};

/**
 * 获取酒店详情
 */
export const getHotelDetailApi = async (id: string): Promise<ApiSuccess<Hotel>> => {
  return request(`/hotels/${id}`, {
    method: 'GET',
  }) as Promise<ApiSuccess<Hotel>>;
};

/**
 * 获取定位（LBS）
 */
export const getLocationApi = async (): Promise<{
  lat: number;
  lng: number;
  address?: string;
}> => {
  const ENV = process.env.TARO_ENV;

  // H5环境使用浏览器API
  if (ENV === 'h5') {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持定位'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        error => {
          // 定位失败，返回默认位置（天安门）
          console.warn('定位失败，使用默认位置', error);
          resolve({ lat: 39.9042, lng: 116.4074 });
        },
        { timeout: 5000 }
      );
    });
  }

  // 小程序环境使用 Taro API
  if (ENV === 'weapp') {
    try {
      const res = await Taro.getLocation({
        type: 'wgs84',
      });
      return {
        lat: res.latitude,
        lng: res.longitude,
      };
    } catch (error) {
      console.warn('定位失败，使用默认位置', error);
      return { lat: 39.9042, lng: 116.4074 };
    }
  }

  // 默认位置
  return { lat: 39.9042, lng: 116.4074 };
};

/**
 * 获取附近酒店
 */
export const getNearbyHotelsApi = async (
  location: { lat: number; lng: number },
  radius = 10
): Promise<HotelListResponse> => {
  return request('/hotels/nearby', {
    method: 'GET',
    data: {
      lat: location.lat,
      lng: location.lng,
      radius,
    },
  }) as Promise<HotelListResponse>;
};
