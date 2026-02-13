/**
 * mini-app/src/utils/date.ts
 * 日期处理工具函数
 */

import dayjs from 'dayjs';

/**
 * 格式化日期
 */
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

/**
 * 计算间夜数
 */
export const calculateNights = (checkIn: string, checkOut: string): number => {
  const days = dayjs(checkOut).diff(dayjs(checkIn), 'day');
  return Math.max(days, 1);
};

/**
 * 获取日期范围（用于日历组件）
 */
export const getDateRange = (startDate: string, days: number): string[] => {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    dates.push(dayjs(startDate).add(i, 'day').format('YYYY-MM-DD'));
  }
  return dates;
};

/**
 * 检查日期是否有效
 */
export const isValidDateRange = (checkIn: string, checkOut: string): boolean => {
  const today = dayjs().startOf('day');
  const checkInDate = dayjs(checkIn).startOf('day');
  const checkOutDate = dayjs(checkOut).startOf('day');

  // 入住日期不能早于今天
  if (checkInDate.isBefore(today)) {
    return false;
  }

  // 离店日期必须晚于入住日期
  if (checkOutDate.isBefore(checkInDate) || checkOutDate.isSame(checkInDate)) {
    return false;
  }

  return true;
};

/**
 * 获取最小离店日期
 */
export const getMinCheckOutDate = (checkIn: string): string => {
  return dayjs(checkIn).add(1, 'day').format('YYYY-MM-DD');
};

/**
 * 获取最大入住日期
 */
export const getMaxCheckInDate = (months = 3): string => {
  return dayjs().add(months, 'month').format('YYYY-MM-DD');
};
