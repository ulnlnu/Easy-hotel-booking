/**
 * mini-app/src/components/DateRangePicker/index.tsx
 * 日期范围选择组件 - 单月版本，带年月选择
 */

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import './index.scss';

interface DateRangePickerProps {
  value?: {
    checkIn: string;
    checkOut: string;
  };
  onConfirm: (data: { checkIn: string; checkOut: string; nights: number }) => void;
  onCancel: () => void;
  visible: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const DEFAULT_MIN_DATE = new Date();
const DEFAULT_MAX_DATE = dayjs().add(1, 'year').toDate();

// 平台检测
const isH5 = process.env.TARO_ENV === 'h5';

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
  const [viewDate, setViewDate] = useState(new Date()); // 当前查看的月份
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const nights = selectedCheckIn && selectedCheckOut
    ? Math.max(1, dayjs(selectedCheckOut).diff(dayjs(selectedCheckIn), 'day'))
    : 0;

  // 初始化：同步外部传入的值
  useEffect(() => {
    if (visible) {
      if (value?.checkIn && value?.checkOut) {
        setSelectedCheckIn(value.checkIn);
        setSelectedCheckOut(value.checkOut);
        setViewDate(new Date(value.checkIn));
      } else {
        // 重置状态
        setSelectedCheckIn(null);
        setSelectedCheckOut(null);
        setViewDate(new Date());
      }
    }
  }, [visible, value?.checkIn, value?.checkOut]);

  // 生成当前月的日历数据
  const generateMonthDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = dayjs(viewDate).startOf('month').day();
    const daysInMonth = dayjs(viewDate).daysInMonth();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, month, year, empty: true });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month, year, empty: false });
    }
    return days;
  };

  const monthDays = generateMonthDays();
  const currentMonthName = dayjs(viewDate).format('YYYY年MM月');

  // 生成可选的年月列表
  const generateMonthOptions = () => {
    const options = [];
    const start = dayjs(minDate).startOf('month');
    const end = dayjs(maxDate).endOf('month');
    let current = start;

    while (current.isBefore(end) || current.isSame(end, 'month')) {
      options.push({
        value: current.format('YYYY-MM'),
        label: current.format('YYYY年MM月')
      });
      current = current.add(1, 'month');
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  // 检查日期是否在有效范围内
  const isDateDisabled = (year: number, month: number, day: number) => {
    const date = dayjs(new Date(year, month, day));
    const min = dayjs(minDate).startOf('day');
    const max = dayjs(maxDate).endOf('day');

    // 超出最大最小范围
    if (date.isBefore(min) || date.isAfter(max)) return true;

    return false;
  };

  const handleDayClick = (year: number, month: number, day: number) => {
    if (day === 0) return;

    const clickedDate = dayjs(new Date(year, month, day)).format('YYYY-MM-DD');

    // 检查是否在有效范围内
    if (isDateDisabled(year, month, day)) return;

    // 选择逻辑
    if (!selectedCheckIn) {
      // 第一次点击：选择入住日期
      setSelectedCheckIn(clickedDate);
      setSelectedCheckOut(null);
    } else if (!selectedCheckOut) {
      // 第二次点击：选择离店日期
      const checkInDate = dayjs(selectedCheckIn);
      const clickedDay = dayjs(clickedDate);

      if (clickedDay.isAfter(checkInDate)) {
        // 离店日期必须在入住日期之后
        setSelectedCheckOut(clickedDate);
      } else if (clickedDay.isSame(checkInDate, 'day')) {
        // 点击同一天，不做处理
        return;
      } else {
        // 点击入住日期之前的日期，重新选择入住日期
        setSelectedCheckIn(clickedDate);
        setSelectedCheckOut(null);
      }
    } else {
      // 已有完整选择，重新开始
      setSelectedCheckIn(clickedDate);
      setSelectedCheckOut(null);
    }
  };

  // 上个月
  const handlePrevMonth = () => {
    const prev = dayjs(viewDate).subtract(1, 'month');
    if (prev.isSame(dayjs(minDate).startOf('month')) || prev.isAfter(dayjs(minDate).startOf('month'))) {
      setViewDate(prev.toDate());
    }
  };

  // 下个月
  const handleNextMonth = () => {
    const next = dayjs(viewDate).add(1, 'month');
    if (next.isSame(dayjs(maxDate).startOf('month')) || next.isBefore(dayjs(maxDate).startOf('month'))) {
      setViewDate(next.toDate());
    }
  };

  // 年月选择
  const handleMonthChange = (e) => {
    const selectedIndex = e.detail.value;
    const selected = monthOptions[selectedIndex];
    if (selected) {
      setViewDate(new Date(selected.value + '-01'));
    }
    setShowMonthPicker(false);
  };

  const handleReset = () => {
    setSelectedCheckIn(null);
    setSelectedCheckOut(null);
    setViewDate(new Date());
  };

  const handleCancel = () => {
    handleReset();
    onCancel();
  };

  const handleConfirm = () => {
    if (selectedCheckIn && selectedCheckOut) {
      const nights = dayjs(selectedCheckOut).diff(dayjs(selectedCheckIn), 'day');
      onConfirm({ checkIn: selectedCheckIn, checkOut: selectedCheckOut, nights });
    }
  };

  const formatDisplayDate = () => {
    if (selectedCheckIn && selectedCheckOut) {
      return `${selectedCheckIn} 至 ${selectedCheckOut} · ${nights}晚`;
    }
    if (selectedCheckIn) return `已选入住: ${selectedCheckIn}`;
    return '请选择入住和离店日期';
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  // 检查是否可以切换月份
  const canPrevMonth = dayjs(viewDate).isAfter(dayjs(minDate).startOf('month'));
  const canNextMonth = dayjs(viewDate).isBefore(dayjs(maxDate).startOf('month'));

  // 当前选中的月份索引
  const currentMonthIndex = monthOptions.findIndex(
    opt => opt.value === dayjs(viewDate).format('YYYY-MM')
  );

  if (!visible) return null;

  return (
    <View className="daterangepicker-container">
      <View className="daterangepicker-mask" onClick={handleCancel} />
      <View className="daterangepicker-content">
        {/* 顶部栏 */}
        <View className="daterangepicker-header">
          <View className="daterangepicker-back" onClick={handleCancel}>
            <Text className="back-icon">←</Text>
          </View>
          <View className="daterangepicker-header-center">
            <Text className="daterangepicker-title">选择日期</Text>
            <Text className="daterangepicker-selected">{formatDisplayDate()}</Text>
          </View>
          <View className="daterangepicker-header-right" />
        </View>

        {/* 步骤提示 */}
        <View className="daterangepicker-steps">
          <View className={`step ${selectedCheckIn ? 'active' : ''} ${selectedCheckOut ? 'completed' : ''}`}>
            <View className="step-number">{selectedCheckIn ? (selectedCheckOut ? '✓' : '1') : '1'}</View>
            <Text className="step-text">入住</Text>
          </View>
          <View className="step-line" />
          <View className={`step ${selectedCheckOut ? 'active completed' : ''}`}>
            <View className="step-number">{selectedCheckOut ? '✓' : '2'}</View>
            <Text className="step-text">离店</Text>
          </View>
        </View>

        {/* 月份导航 */}
        <View className="calendar-nav">
          <View
            className={`calendar-nav__btn calendar-nav__prev ${!canPrevMonth ? 'disabled' : ''}`}
            onClick={canPrevMonth ? handlePrevMonth : undefined}
          >
            <Text>‹</Text>
          </View>

          {isH5 ? (
            <View
              className="calendar-nav__title"
              onClick={() => setShowMonthPicker(!showMonthPicker)}
            >
              <Text>{currentMonthName}</Text>
              <Text className="calendar-nav__arrow">▼</Text>
            </View>
          ) : (
            <Picker
              mode="selector"
              range={monthOptions}
              rangeKey="label"
              value={currentMonthIndex >= 0 ? currentMonthIndex : 0}
              onChange={handleMonthChange}
            >
              <View className="calendar-nav__title">
                <Text>{currentMonthName}</Text>
                <Text className="calendar-nav__arrow">▼</Text>
              </View>
            </Picker>
          )}

          <View
            className={`calendar-nav__btn calendar-nav__next ${!canNextMonth ? 'disabled' : ''}`}
            onClick={canNextMonth ? handleNextMonth : undefined}
          >
            <Text>›</Text>
          </View>
        </View>

        {/* H5 年月选择下拉 */}
        {isH5 && showMonthPicker && (
          <View className="calendar-month-dropdown">
            <ScrollView scrollY className="calendar-month-dropdown__list">
              {monthOptions.map((opt, index) => (
                <View
                  key={opt.value}
                  className={`calendar-month-dropdown__item ${index === currentMonthIndex ? 'active' : ''}`}
                  onClick={() => {
                    setViewDate(new Date(opt.value + '-01'));
                    setShowMonthPicker(false);
                  }}
                >
                  <Text>{opt.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 日历区域 */}
        <ScrollView scrollY className="daterangepicker-calendar">
          <View className="calendar-month">
            <View className="calendar-weekdays">
              {weekDays.map((day, index) => (
                <View key={index} className="calendar-weekday">
                  <Text>{day}</Text>
                </View>
              ))}
            </View>
            <View className="calendar-days">
              {monthDays.map((dayObj, dayIndex) => {
                // 使用唯一的 key 确保正确重新渲染
                const dateKey = dayObj.empty
                  ? `empty-${dayIndex}`
                  : `${dayObj.year}-${dayObj.month}-${dayObj.day}`;

                const currentDate = dayjs(new Date(dayObj.year, dayObj.month, dayObj.day));
                const currentDateStr = currentDate.format('YYYY-MM-DD');
                const isToday = !dayObj.empty && currentDate.isSame(dayjs(), 'day');
                const isCheckInSelected = selectedCheckIn === currentDateStr;
                const isCheckOutSelected = selectedCheckOut === currentDateStr;
                const isInRange = selectedCheckIn && selectedCheckOut &&
                  currentDate.isAfter(selectedCheckIn) && currentDate.isBefore(selectedCheckOut);
                const disabled = isDateDisabled(dayObj.year, dayObj.month, dayObj.day);

                // 使用数组方式拼接类名，避免小程序中的解析问题
                const dayClasses = [
                  'calendar-day',
                  dayObj.empty ? 'empty' : '',
                  isToday ? 'today' : '',
                  isCheckInSelected ? 'checkin-selected' : '',
                  isCheckOutSelected ? 'checkout-selected' : '',
                  isInRange ? 'in-range' : '',
                  disabled ? 'disabled' : ''
                ].filter(Boolean).join(' ');

                return (
                  <View
                    key={dateKey}
                    className={dayClasses}
                    onClick={() => !disabled && !dayObj.empty && handleDayClick(dayObj.year, dayObj.month, dayObj.day)}
                  >
                    {!dayObj.empty && (
                      <Text className="day-number">{dayObj.day}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* 底部操作栏 */}
        <View className="daterangepicker-footer">
          <View className="daterangepicker-footer__btn daterangepicker-footer__reset" onClick={handleReset}>
            <Text>重置</Text>
          </View>
          <View
            className={`daterangepicker-footer__btn daterangepicker-footer__confirm ${(!selectedCheckIn || !selectedCheckOut) ? 'disabled' : ''}`}
            onClick={selectedCheckIn && selectedCheckOut ? handleConfirm : undefined}
          >
            <Text>确认选择</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default DateRangePicker;
