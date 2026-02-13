/**
 * shared/components/Calendar/DatePanel.tsx
 * 日期面板组件
 */

import { View, Text } from '@tarojs/components';
import dayjs from 'dayjs';
import type { DateData } from './types';

interface DatePanelProps {
  month: dayjs.Dayjs;
  selectedRange: [string | null, string | null];
  selectType: 'checkIn' | 'checkOut';
  isDateDisabled: (date: dayjs.Dayjs) => boolean;
  isDateSoldOut: (dateStr: string) => boolean;
  priceData?: Record<string, number>;
  onDateClick: (dateData: DateData) => void;
}

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

function DatePanel({
  month,
  selectedRange,
  selectType,
  isDateDisabled,
  isDateSoldOut,
  priceData,
  onDateClick,
}: DatePanelProps) {
  /**
   * 生成日历数据
   */
  const generateCalendarData = (): DateData[] => {
    const startOfMonth = month.startOf('month');
    const endOfMonth = month.endOf('month');
    const startOfWeek = startOfMonth.startOf('week');
    const endOfWeek = endOfMonth.endOf('week');

    const days: DateData[] = [];
    const current = startOfWeek;

    while (current.isBefore(endOfWeek) || current.isSame(endOfWeek)) {
      days.push({
        date: dayjs(current),
        fullDate: current.format('YYYY-MM-DD'),
        day: current.date(),
        isCurrentMonth: current.isSame(month, 'month'),
        isToday: current.isSame(dayjs(), 'day'),
      });
      current.add(1, 'day');
    }

    return days;
  };

  const calendarData = generateCalendarData();

  /**
   * 获取日期状态
   */
  const getDateStatus = (dateData: DateData): string => {
    const statuses: string[] = [];

    if (!dateData.isCurrentMonth) {
      statuses.push('other-month');
    }

    if (dateData.isToday) {
      statuses.push('today');
    }

    // 检查是否在选中范围内
    const [start, end] = selectedRange;
    if (start && dateData.fullDate === start) {
      statuses.push('checkIn');
    } else if (end && dateData.fullDate === end) {
      statuses.push('checkOut');
    } else if (start && end && dateData.date.isAfter(dayjs(start)) && dateData.date.isBefore(dayjs(end))) {
      statuses.push('in-range');
    }

    // 已售罄
    if (dateData.isCurrentMonth && isDateSoldOut(dateData.fullDate)) {
      statuses.push('sold-out');
    }

    return statuses.join(' ');
  };

  /**
   * 处理日期点击
   */
  const handleClick = (dateData: DateData) => {
    if (!dateData.isCurrentMonth || isDateDisabled(dateData.date)) {
      return;
    }

    onDateClick(dateData);
  };

  return (
    <View className="date-panel">
      {/* 星期头 */}
      <View className="week-header">
        {WEEK_DAYS.map((day, index) => (
          <View key={index} className="week-day">
            <Text>{day}</Text>
          </View>
        ))}
      </View>

      {/* 日期网格 */}
      <View className="date-grid">
        {calendarData.map((dateData, index) => {
          const status = getDateStatus(dateData);
          const price = priceData?.[dateData.fullDate];

          return (
            <View
              key={index}
              className={`date-cell ${status}`}
              onClick={() => handleClick(dateData)}
            >
              {/* 日期数字 */}
              <Text className="date-number">{dateData.day}</Text>

              {/* 价格 */}
              {price && dateData.isCurrentMonth && (
                <Text className="date-price">¥{price}</Text>
              )}

              {/* 已售罄标记 */}
              {status.includes('sold-out') && (
                <View className="sold-out-tag">
                  <Text>售罄</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default DatePanel;
