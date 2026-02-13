/**
 * shared/components/Calendar/types.ts
 * 日历组件类型定义
 */

import dayjs from 'dayjs';

/**
 * 日期数据
 */
export interface DateData {
  date: dayjs.Dayjs;
  fullDate: string; // YYYY-MM-DD
  day: number; // 日期数字
  isCurrentMonth: boolean; // 是否当前月
  isToday: boolean; // 是否今天
}
