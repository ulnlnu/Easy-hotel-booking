/**
 * shared/components/Calendar/index.tsx
 * 自定义日历组件
 * 支持H5和小程序
 *
 * 功能：
 * - 入住/离店日期联动选择
 * - 自动计算入住间夜
 * - 标记已售罄日期
 * - 价格日历视图
 */

import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { ChevronLeft, ChevronRight } from '@nutui/icons-react-taro';
import dayjs from 'dayjs';
import type { DateData } from './types';
import DatePanel from './DatePanel';
import './index.scss';

interface CalendarProps {
  value?: [string, string]; // [入住日期, 离店日期]
  onChange?: (value: [string, string]) => void;
  minDate?: string; // 最小可选日期
  maxDate?: string; // 最大可选日期
  priceData?: Record<string, number>; // 价格数据 { '2025-01-01': 299 }
  soldOutDates?: string[]; // 已售罄日期
  disabled?: boolean; // 禁用
}

function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
  priceData,
  soldOutDates = [],
  disabled = false,
}: CalendarProps) {
  // 当前显示的月份
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));

  // 选中的日期范围
  const [selectedRange, setSelectedRange] = useState<[string | null, string | null]>([
    value?.[0] || null,
    value?.[1] || null,
  ]);

  // 选中的类型：checkIn | checkOut
  const [selectType, setSelectType] = useState<'checkIn' | 'checkOut'>('checkIn');

  /**
   * 计算间夜数
   */
  const calculateNights = (): number => {
    const [start, end] = selectedRange;
    if (!start || !end) return 0;
    const days = dayjs(end).diff(dayjs(start), 'day');
    return Math.max(days, 1);
  };

  /**
   * 检查日期是否可选
   */
  const isDateDisabled = (date: dayjs.Dayjs): boolean => {
    if (disabled) return true;

    // 检查最小日期
    if (minDate && date.isBefore(dayjs(minDate), 'day')) {
      return true;
    }

    // 检查最大日期
    if (maxDate && date.isAfter(dayjs(maxDate), 'day')) {
      return true;
    }

    return false;
  };

  /**
   * 检查日期是否已售罄
   */
  const isDateSoldOut = (dateStr: string): boolean => {
    return soldOutDates.includes(dateStr);
  };

  /**
   * 处理日期点击
   */
  const handleDateClick = (dateData: DateData) => {
    const dateStr = dateData.fullDate;

    if (isDateDisabled(dateData.date)) {
      return;
    }

    if (selectType === 'checkIn') {
      // 选择入住日期
      setSelectedRange([dateStr, null]);
      setSelectType('checkOut');
    } else {
      // 选择离店日期
      const [checkIn] = selectedRange;
      if (checkIn) {
        // 离店日期必须晚于入住日期
        if (dayjs(dateStr).isAfter(dayjs(checkIn)) || dayjs(dateStr).isSame(dayjs(checkIn))) {
          setSelectedRange([checkIn, dateStr]);
          onChange?.([checkIn, dateStr]);
        } else {
          // 如果选择的日期早于或等于入住日期，重新选择入住日期
          setSelectedRange([dateStr, null]);
        }
      } else {
        // 没有入住日期，直接设置
        setSelectedRange([dateStr, null]);
      }
    }
  };

  /**
   * 上一月
   */
  const handlePrevMonth = () => {
    setCurrentMonth(prev => prev.subtract(1, 'month'));
  };

  /**
   * 下一月
   */
  const handleNextMonth = () => {
    setCurrentMonth(prev => prev.add(1, 'month'));
  };

  /**
   * 回到今天
   */
  const handleToday = () => {
    setCurrentMonth(dayjs().startOf('month'));
    setSelectedRange([null, null]);
    setSelectType('checkIn');
  };

  /**
   * 确认选择
   */
  const handleConfirm = () => {
    const [checkIn, checkOut] = selectedRange;
    if (checkIn && checkOut) {
      onChange?.([checkIn, checkOut]);
    }
  };

  /**
   * 清空选择
   */
  const handleClear = () => {
    setSelectedRange([null, null]);
    setSelectType('checkIn');
    onChange?.(['', '']);
  };

  const nights = calculateNights();

  return (
    <View className="calendar-container">
      {/* 头部 */}
      <View className="calendar-header">
        <View className="month-selector">
          <View
            className={`month-btn ${isDateDisabled(currentMonth) ? 'disabled' : ''}`}
            onClick={handlePrevMonth}
          >
            <ChevronLeft size="16" />
          </View>
          <Text className="month-text">
            {currentMonth.format('YYYY年MM月')}
          </Text>
          <View
            className={`month-btn ${isDateDisabled(currentMonth.add(1, 'month')) ? 'disabled' : ''}`}
            onClick={handleNextMonth}
          >
            <ChevronRight size="16" />
          </View>
        </View>
        <View className="header-actions">
          <View className="today-btn" onClick={handleToday}>
            <Text>今天</Text>
          </View>
        </View>
      </View>

      {/* 已选信息 */}
      {selectedRange[0] || selectedRange[1] ? (
        <View className="selected-info">
          <View className="info-item">
            <Text className="info-label">入住</Text>
            <Text className="info-date">{selectedRange[0] || '请选择'}</Text>
          </View>
          <View className="info-nights">
            <Text className="nights-count">{nights}</Text>
            <Text className="nights-text">晚</Text>
          </View>
          <View className="info-item">
            <Text className="info-label">离店</Text>
            <Text className="info-date">{selectedRange[1] || '请选择'}</Text>
          </View>
        </View>
      ) : (
        <View className="select-tip">
          <Text>请选择入住日期</Text>
        </View>
      )}

      {/* 日历面板 */}
      <View className="calendar-body">
        <DatePanel
          month={currentMonth}
          selectedRange={selectedRange}
          selectType={selectType}
          isDateDisabled={isDateDisabled}
          isDateSoldOut={isDateSoldOut}
          priceData={priceData}
          onDateClick={handleDateClick}
        />
      </View>

      {/* 底部操作 */}
      {selectedRange[0] && selectedRange[1] && (
        <View className="calendar-footer">
          <View className="footer-btns">
            <View className="footer-btn clear" onClick={handleClear}>
              <Text>清空</Text>
            </View>
            <View className="footer-btn confirm" onClick={handleConfirm}>
              <Text>确认</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default Calendar;
