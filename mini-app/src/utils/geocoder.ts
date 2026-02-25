/**
 * mini-app/src/utils/geocoder.ts
 * 本地逆地理编码（经纬度 → 城市）
 */

import { getAllCities, type CityData } from '@/data/cities';

/** 定位结果 */
export interface LocationResult {
  city: string;       // 城市名
  province: string;   // 省份
  displayName: string; // 显示名称（如"北京市"或"广东·深圳"）
}

/**
 * 根据经纬度获取城市信息
 * 通过匹配城市边界框来判断
 */
export const getCityByLocation = (lat: number, lng: number): LocationResult | null => {
  const cities = getAllCities();

  // 精确匹配：点在城市边界内
  const exactMatch = cities.find(city => {
    const { minLat, maxLat, minLng, maxLng } = city.bounds;
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
  });

  if (exactMatch) {
    return {
      city: exactMatch.name,
      province: exactMatch.province,
      displayName: formatDisplayName(exactMatch.name, exactMatch.province),
    };
  }

  // 模糊匹配：找最近的城市（当不在任何城市边界内时）
  let nearestCity: CityData | null = null;
  let minDistance = Infinity;

  cities.forEach(city => {
    const centerLat = (city.bounds.minLat + city.bounds.maxLat) / 2;
    const centerLng = (city.bounds.minLng + city.bounds.maxLng) / 2;

    // 简单欧几里得距离（对于小范围足够精确）
    const distance = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2));

    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  });

  // 只在距离合理范围内返回（约200km）
  if (nearestCity && minDistance < 2) {
    return {
      city: nearestCity.name,
      province: nearestCity.province,
      displayName: formatDisplayName(nearestCity.name, nearestCity.province),
    };
  }

  return null;
};

/**
 * 格式化显示名称
 * 直辖市: "北京市"
 * 普通城市: "广东·深圳"
 */
const formatDisplayName = (city: string, province: string): string => {
  // 直辖市
  if (city === province) {
    return `${city}市`;
  }
  return `${province}·${city}`;
};

/**
 * 根据经纬度获取城市名称（简化版）
 */
export const getCityNameByLocation = (lat: number, lng: number): string | null => {
  const result = getCityByLocation(lat, lng);
  return result?.city || null;
};

/**
 * 检查坐标是否在中国境内（粗略判断）
 */
export const isInChina = (lat: number, lng: number): boolean => {
  return lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135;
};
