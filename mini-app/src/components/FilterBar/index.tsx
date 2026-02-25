/**
 * mini-app/src/components/FilterBar/index.tsx
 * 筛选栏组件 - 城市选择 + 价格快捷选择（含排序） + 高级筛选抽屉
 */

import React, { useState, useMemo } from 'react';
import { View, Text, Input } from '@tarojs/components';
import { useHotelStore } from '@/store/useHotelStore';
import FilterDrawer from './FilterDrawer';
import CityPicker from '@/components/CityPicker';
import { findCityByName } from '@/data/cities';
import './index.scss';

// 价格快捷选项（包含排序选项）
const PRICE_OPTIONS = [
  { label: '不限', min: undefined, max: undefined, sort: undefined },
  { label: '价格升序', min: undefined, max: undefined, sort: 'price-asc' },
  { label: '价格降序', min: undefined, max: undefined, sort: 'price-desc' },
  { label: '¥300以下', min: 0, max: 300, sort: undefined },
  { label: '¥300-600', min: 300, max: 600, sort: undefined },
  { label: '¥600-1000', min: 600, max: 1000, sort: undefined },
  { label: '¥1000以上', min: 1000, max: undefined, sort: undefined },
];

interface FilterBarProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

function FilterBar({ sortBy, onSortChange }: FilterBarProps) {
  const { searchParams, setSearchParams, locatedCity } = useHotelStore();

  // 下拉菜单状态
  const [activeDropdown, setActiveDropdown] = useState<'price' | null>(null);
  // 抽屉状态
  const [drawerOpen, setDrawerOpen] = useState(false);
  // 城市选择器状态
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  // 自定义价格输入状态
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');

  // 获取选中城市的显示名称 - 只显示城市名
  const cityLabel = useMemo(() => {
    if (!searchParams.city) return '全国';
    const cityData = findCityByName(searchParams.city);
    if (cityData) {
      return cityData.name; // 只返回城市名，不带省份
    }
    return searchParams.city;
  }, [searchParams.city]);

  // 计算当前价格/排序显示文本
  const priceLabel = useMemo(() => {
    // 优先显示排序状态
    if (sortBy === 'price-asc') return '价格↑';
    if (sortBy === 'price-desc') return '价格↓';

    const { minPrice, maxPrice } = searchParams;
    if (minPrice === undefined && maxPrice === undefined) {
      return '价格';
    }
    if (maxPrice === undefined) {
      return `¥${minPrice}+`;
    }
    if (minPrice === 0) {
      return `¥${maxPrice}以下`;
    }
    return `¥${minPrice}-${maxPrice}`;
  }, [searchParams.minPrice, searchParams.maxPrice, sortBy]);

  // 计算活动筛选数量（包含排序）
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (sortBy && sortBy !== 'price-asc' && sortBy !== 'price-desc') count++; // 价格排序不算在筛选里
    if (searchParams.starLevel) count++;
    if (searchParams.minRating) count++;
    if (searchParams.facilities && searchParams.facilities.length > 0) {
      count += searchParams.facilities.length;
    }
    if (searchParams.tags && searchParams.tags.length > 0) {
      count += searchParams.tags.length;
    }
    return count;
  }, [sortBy, searchParams.starLevel, searchParams.minRating, searchParams.facilities, searchParams.tags]);

  // 处理价格/排序选择
  const handlePriceSelect = (option: typeof PRICE_OPTIONS[0]) => {
    setActiveDropdown(null);
    setCustomMinPrice('');
    setCustomMaxPrice('');

    // 如果是排序选项，更新排序状态并清除价格筛选
    if (option.sort) {
      onSortChange(option.sort);
      setSearchParams({
        minPrice: undefined,
        maxPrice: undefined,
      });
    } else {
      // 如果选择价格区间，清除价格排序
      if (option.min !== undefined || option.max !== undefined) {
        onSortChange('');
      }
      setSearchParams({
        minPrice: option.min,
        maxPrice: option.max,
      });
    }
  };

  // 应用自定义价格
  const applyCustomPrice = () => {
    const min = customMinPrice ? parseInt(customMinPrice, 10) : undefined;
    const max = customMaxPrice ? parseInt(customMaxPrice, 10) : undefined;
    // 选择自定义价格时清除价格排序
    onSortChange('');
    setSearchParams({
      minPrice: min,
      maxPrice: max,
    });
    setActiveDropdown(null);
  };

  // 切换下拉菜单
  const toggleDropdown = (type: 'price') => {
    setActiveDropdown(prev => (prev === type ? null : type));
  };

  // 关闭下拉菜单
  const closeDropdown = () => setActiveDropdown(null);

  // 城市选择回调
  const handleCitySelect = (city: string) => {
    setSearchParams({ city: city || undefined });
    setCityPickerOpen(false);
  };

  // 判断价格选项是否激活
  const isPriceOptionActive = (option: typeof PRICE_OPTIONS[0]) => {
    if (option.sort) {
      return sortBy === option.sort;
    }
    return searchParams.minPrice === option.min && searchParams.maxPrice === option.max && !sortBy;
  };

  return (
    <View className="filter-bar">
      <View className="filter-bar__inner">
        {/* 城市选择 - 常驻第一位 */}
        <View className="filter-bar__item filter-bar__item--city" onClick={() => setCityPickerOpen(true)}>
          <Text className="filter-bar__location-icon">📍</Text>
          <Text className={`filter-bar__label ${searchParams.city ? 'filter-bar__label--active' : ''}`}>
            {cityLabel}
          </Text>
          <Text className="filter-bar__arrow">▼</Text>
        </View>

        {/* 价格（含排序） */}
        <View className="filter-bar__item" onClick={() => toggleDropdown('price')}>
          <Text className={`filter-bar__label ${searchParams.minPrice !== undefined || searchParams.maxPrice !== undefined || sortBy === 'price-asc' || sortBy === 'price-desc' ? 'filter-bar__label--active' : ''}`}>
            {priceLabel}
          </Text>
          <Text className={`filter-bar__arrow ${activeDropdown === 'price' ? 'filter-bar__arrow--up' : ''}`}>
            ▼
          </Text>
        </View>

        {/* 筛选 */}
        <View className="filter-bar__item" onClick={() => setDrawerOpen(true)}>
          <Text className={`filter-bar__label ${activeFilterCount > 0 ? 'filter-bar__label--active' : ''}`}>
            筛选
          </Text>
          {activeFilterCount > 0 && (
            <View className="filter-bar__badge">
              <Text className="filter-bar__badge-text">{activeFilterCount}</Text>
            </View>
          )}
          <Text className="filter-bar__icon">☰</Text>
        </View>
      </View>

      {/* 价格下拉菜单 */}
      {activeDropdown === 'price' && (
        <>
          <View className="filter-bar__mask" onClick={closeDropdown} />
          <View className="filter-bar__dropdown">
            {PRICE_OPTIONS.map(option => {
              const isActive = isPriceOptionActive(option);
              return (
                <View
                  key={option.label}
                  className={`filter-bar__option ${isActive ? 'filter-bar__option--active' : ''}`}
                  onClick={() => handlePriceSelect(option)}
                >
                  <Text>{option.label}</Text>
                  {isActive && <Text className="filter-bar__check">✓</Text>}
                </View>
              );
            })}
            {/* 自定义价格输入 */}
            <View className="filter-bar__custom-price">
              <View className="filter-bar__custom-price-label">
                <Text>自定义价格</Text>
              </View>
              <View className="filter-bar__custom-price-inputs">
                <Input
                  className="filter-bar__custom-input"
                  type="number"
                  placeholder="最低价"
                  placeholderStyle="color: #9CA3AF"
                  value={customMinPrice}
                  onInput={(e) => setCustomMinPrice(e.detail.value)}
                />
                <Text className="filter-bar__custom-separator">-</Text>
                <Input
                  className="filter-bar__custom-input"
                  type="number"
                  placeholder="最高价"
                  placeholderStyle="color: #9CA3AF"
                  value={customMaxPrice}
                  onInput={(e) => setCustomMaxPrice(e.detail.value)}
                />
              </View>
              <View className="filter-bar__custom-price-btn" onClick={applyCustomPrice}>
                <Text>确定</Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* 筛选抽屉 */}
      <FilterDrawer
        visible={drawerOpen}
        sortBy={sortBy}
        onSortChange={onSortChange}
        onClose={() => setDrawerOpen(false)}
      />

      {/* 城市选择器 */}
      <CityPicker
        visible={cityPickerOpen}
        value={searchParams.city}
        locatedCity={locatedCity}
        onSelect={handleCitySelect}
        onClose={() => setCityPickerOpen(false)}
      />
    </View>
  );
}

export default FilterBar;
