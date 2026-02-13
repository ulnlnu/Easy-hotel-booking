/**
 * mini-app/src/utils/distance.ts
 * 距离计算工具函数
 */

/**
 * 计算两点间距离（公里）
 * 使用Haversine公式
 */
export const calculateDistance = (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number => {
  const R = 6371; // 地球半径（公里）
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 保留一位小数
};

/**
 * 转换为弧度
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 格式化距离显示
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

/**
 * 根据距离排序
 */
export const sortByDistance = <T extends { location: { lat: number; lng: number } }>(
  items: T[],
  from: { lat: number; lng: number }
): T[] => {
  return items
    .map(item => ({
      ...item,
      distance: calculateDistance(from, item.location),
    }))
    .sort((a: any, b: any) => a.distance - b.distance);
};
