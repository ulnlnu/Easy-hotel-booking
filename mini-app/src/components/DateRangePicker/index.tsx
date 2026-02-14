/**
 * mini-app/src/components/DateRangePicker/index.tsx
 * 日期范围选择组件（使用 Taro 内置组件）
 */

import { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import './index.scss';

interface DateRangePickerProps {
  /** 入住日期 YYYY-MM-DD */
  value?: {
    checkIn: string;
    checkOut: string;
  };
  /** 确认回调 */
  onConfirm: (data: { checkIn: string; checkOut: string; nights: number }) => void;
  /** 取消回调 */
  onCancel: () => void;
  /** 是否显示 */
  visible: boolean;
  /** 最小入住日期（默认今天） */
  minDate?: Date;
  /** 最大预订日期（默认3个月后） */
  maxDate?: Date;
}

const DEFAULT_MIN_DATE = new Date();
const DEFAULT_MAX_DATE = dayjs().add(3, 'month').toDate();

function DateRangePicker({
  value,
  onConfirm,
  onCancel,
  visible,
  minDate = DEFAULT_MIN_DATE,
  maxDate = DEFAULT_MAX_DATE,
}: DateRangePickerProps) {
  const [selectedCheckIn, setSelectedCheckIn] = useState<string | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(minDate);

  // 计算间夜数
  const nights = selectedCheckIn && selectedCheckOut
    ? Math.max(1, dayjs(selectedCheckOut).diff(dayjs(selectedCheckIn), 'day'))
    : 0;

  // 初始化时设置已选择的日期
  useEffect(() => {
    if (value?.checkIn && value?.checkOut) {
      // 只在值实际改变时更新，避免无限循环
      if (selectedCheckIn !== value.checkIn || selectedCheckOut !== value.checkOut) {
        setSelectedCheckIn(value.checkIn);
        setSelectedCheckOut(value.checkOut);
      }
    }
  }, [value?.checkIn, value?.checkOut]);

  // 生成月份的日历数据
  const generateMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = dayjs(date).startOf('month').day(); // 0=周日, 1=周一, ...
    const daysInMonth = dayjs(date).daysInMonth();

    const days = [];

    // 填充月初空白
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, month, year, empty: true });
    }

    // 填充日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month, year, empty: false });
    }

    return days;
  };

  // 生成日历网格数据（显示3个月）
  const generateCalendarGrid = () => {
    const grids = [];
    const startMonth = dayjs(currentMonth);

    for (let m = 0; m < 3; m++) {
      const monthDate = startMonth.add(m, 'month');
      grids.push({
        year: monthDate.year(),
        month: monthDate.month(),
        monthName: monthDate.format('YYYY年MM月'),
        days: generateMonthDays(monthDate.toDate())
      });
    }

    return grids;
  };

  const calendarGrids = generateCalendarGrid();

  // 检查日期是否可用
  const isDateDisabled = (year: number, month: number, day: number) => {
    const date = dayjs(new Date(year, month, day));
    const min = dayjs(minDate).startOf('day');
    const max = dayjs(maxDate).endOf('day');

    // 早于最小日期或晚于最大日期
    if (date.isBefore(min) || date.isAfter(max)) {
      return true;
    }

    // 如果已选择入住日期，禁用入住日期及之前的所有日期
    // 离店日期必须晚于入住日期（至少1晚）
    if (selectedCheckIn) {
      const checkInDate = dayjs(selectedCheckIn);
      if (date.isSame(checkInDate) || date.isBefore(checkInDate)) {
        return true;
      }
    }

    return false;
  };

  // 处理日期点击
  const handleDayClick = (year: number, month: number, day: number) => {
    if (day === 0) return; // 忽略空白日期

    const clickedDate = dayjs(new Date(year, month, day)).format('YYYY-MM-DD');

    if (!selectedCheckIn) {
      // 第一步：选择入住日期
      setSelectedCheckIn(clickedDate);
      setCurrentMonth(new Date(year, month, 1));
    } else if (!selectedCheckOut) {
      // 第二步：选择离店日期
      const checkInDate = dayjs(selectedCheckIn);
      const checkOutDate = dayjs(clickedDate);

      if (checkOutDate.isAfter(checkInDate)) {
        const nights = checkOutDate.diff(checkInDate, 'day');
        setSelectedCheckOut(clickedDate);
        // 立即确认（使用 requestAnimationFrame 确保状态已更新）
        requestAnimationFrame(() => {
          onConfirm({
            checkIn: selectedCheckIn,
            checkOut: clickedDate,
            nights,
          });
        });
      } else {
        // 如果选择的日期早于或等于入住日期，重新选择入住日期
        setSelectedCheckIn(clickedDate);
        setSelectedCheckOut(null);
        setCurrentMonth(new Date(year, month, 1));
      }
    } else {
      // 重新选择入住日期
      setSelectedCheckIn(clickedDate);
      setSelectedCheckOut(null);
      setCurrentMonth(new Date(year, month, 1));
    }
  };

  // 重置选择
  const handleReset = () => {
    setSelectedCheckIn(null);
    setSelectedCheckOut(null);
    setCurrentMonth(minDate);
  };

  // 取消
  const handleCancel = () => {
    handleReset();
    onCancel();
  };

  // 确认
  const handleConfirm = () => {
    if (selectedCheckIn && selectedCheckOut) {
      const nights = dayjs(selectedCheckOut).diff(dayjs(selectedCheckIn), 'day');
      onConfirm({
        checkIn: selectedCheckIn,
        checkOut: selectedCheckOut,
        nights,
      });
    }
  };

  // 格式化日期显示
  const formatDisplayDate = () => {
    if (selectedCheckIn && selectedCheckOut) {
      return `${selectedCheckIn} 至 ${selectedCheckOut}${nights > 0 ? ` · ${nights}晚` : ''}`;
    }
    if (selectedCheckIn) {
      return selectedCheckIn;
    }
    return '请选择日期';
  };

  // 获取星期标题
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  if (!visible) {
    return null;
  }

  return (
    <View className="daterangepicker-container">
      <View className="daterangepicker-content" onClick={e => e.stopPropagation()}>
        {/* 顶部提示 */}
        <View className="daterangepicker-header">
          <Text className="daterangepicker-title">选择入住离店日期</Text>
          <Text className="daterangepicker-selected">{formatDisplayDate()}</Text>
        </View>

        {/* 步骤提示 */}
        <View className="daterangepicker-steps">
          <View className={`step ${selectedCheckIn ? 'active' : ''} ${selectedCheckOut ? 'completed' : ''}`}>
            <View className="step-number">
              {selectedCheckOut ? '✓' : '1'}
            </View>
            <Text className="step-text">选择入住日期</Text>
          </View>
          <View className="step-line" />
          <View className={`step ${selectedCheckOut ? 'active' : ''}`}>
            <View className="step-number">
              {selectedCheckOut ? '✓' : '2'}
            </View>
            <Text className="step-text">选择离店日期</Text>
          </View>
        </View>

        {/* 日历区域 */}
        <ScrollView scrollY className="daterangepicker-calendar">
          {calendarGrids.map((grid, gridIndex) => (
            <View key={gridIndex} className="calendar-month">
              <View className="calendar-month-title">
                <Text>{grid.monthName}</Text>
              </View>

              {/* 星期标题 */}
              <View className="calendar-weekdays">
                {weekDays.map((day, index) => (
                  <View key={index} className="calendar-weekday">
                    <Text>{day}</Text>
                  </View>
                ))}
              </View>

              {/* 日期网格 */}
              <View className="calendar-days">
                {grid.days.map((dayObj, dayIndex) => {
                  const isToday = !dayObj.empty &&
                    dayjs(new Date(grid.year, grid.month, dayObj.day)).isSame(dayjs(), 'day');
                  const isSelected = !dayObj.empty &&
                    ((selectedCheckIn && dayjs(new Date(grid.year, grid.month, dayObj.day)).format('YYYY-MM-DD') === selectedCheckIn) ||
                    (selectedCheckOut && dayjs(new Date(grid.year, grid.month, dayObj.day)).format('YYYY-MM-DD') === selectedCheckOut));
                  const disabled = isDateDisabled(grid.year, grid.month, dayObj.day);
                  const isCheckInSelected = selectedCheckIn &&
                    dayjs(new Date(grid.year, grid.month, dayObj.day)).format('YYYY-MM-DD') === selectedCheckIn;
                  const isCheckOutSelected = selectedCheckOut &&
                    dayjs(new Date(grid.year, grid.month, dayObj.day)).format('YYYY-MM-DD') === selectedCheckOut;

                  return (
                    <View
                      key={dayIndex}
                      className={`calendar-day
                        ${dayObj.empty ? 'empty' : ''}
                        ${isToday ? 'today' : ''}
                        ${isSelected ? 'selected' : ''}
                        ${isCheckInSelected ? 'checkin-selected' : ''}
                        ${isCheckOutSelected ? 'checkout-selected' : ''}
                        ${disabled ? 'disabled' : ''}
                      `}
                      onClick={() => !disabled && handleDayClick(grid.year, grid.month, dayObj.day)}
                    >
                      {!dayObj.empty && (
                        <Text className="day-number">{dayObj.day}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* 底部操作栏 */}
        <View className="daterangepicker-footer">
          <Button className="reset-btn" onClick={handleReset}>
            <Text>重置</Text>
          </Button>
          <Button className="cancel-btn" onClick={handleCancel}>
            <Text>取消</Text>
          </Button>
          <Button
            className="confirm-btn"
            disabled={!selectedCheckIn || !selectedCheckOut}
            onClick={handleConfirm}
          >
            <Text>确认</Text>
          </Button>
        </View>

        {/* 提示信息 */}
        <View className="daterangepicker-tip">
          <Text className="tip-text">
            💡 入住日期最早为今天，离店日期需晚于入住日期
          </Text>
        </View>
      </View>
    </View>
  );
}

export default DateRangePicker;
