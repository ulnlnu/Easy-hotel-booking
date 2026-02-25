/**
 * mini-app/src/components/FilterBar/index.tsx
 * 筛选栏组件 - 支持排序下拉、价格快捷选择（含自定义输入）、高级筛选抽屉
 */

import { useState, useMemo } from 'react';
import { View, Text, Input } from '@tarojs/components';
import { useHotelStore } from '@/store/useHotelStore';
import FilterDrawer from './FilterDrawer';
import './index.scss';

// 排序选项
const SORT_OPTIONS = [
  { label: '综合排序', value: '' },
  { label: '价格最低', value: 'price-asc' },
  { label: '价格最高', value: 'price-desc' },
  { label: '评分最高', value: 'rating' },
];

// 价格快捷选项
const PRICE_OPTIONS = [
  { label: '不限', min: undefined, max: undefined },
  { label: '¥300以下', min: 0, max: 300 },
  { label: '¥300-600', min: 300, max: 600 },
  { label: '¥600-1000', min: 600, max: 1000 },
  { label: '¥1000以上', min: 1000, max: undefined },
];

interface FilterBarProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

function FilterBar({ sortBy, onSortChange }: FilterBarProps) {
  const { searchParams } = useHotelStore();

  // 下拉菜单状态
  const [activeDropdown, setActiveDropdown] = useState<'sort' | 'price' | null>(null);
  // 抽屉状态
  const [drawerOpen, setDrawerOpen] = useState(false);
  // 自定义价格输入状态
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');

  // 计算当前排序显示文本
  const sortLabel = useMemo(() => {
    const option = SORT_OPTIONS.find(opt => opt.value === sortBy);
    return option?.label || '综合';
  }, [sortBy]);

  // 计算当前价格显示文本
  const priceLabel = useMemo(() => {
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
  }, [searchParams.minPrice, searchParams.maxPrice]);

  // 计算活动筛选数量
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchParams.starLevel) count++;
    if (searchParams.minRating) count++;
    if (searchParams.facilities && searchParams.facilities.length > 0) {
      count += searchParams.facilities.length;
    }
    if (searchParams.tags && searchParams.tags.length > 0) {
      count += searchParams.tags.length;
    }
    return count;
  }, [searchParams.starLevel, searchParams.minRating, searchParams.facilities, searchParams.tags]);

  // 处理排序选择
  const handleSortSelect = (value: string) => {
    onSortChange(value);
    setActiveDropdown(null);
  };

  // 处理价格选择
  const handlePriceSelect = (option: typeof PRICE_OPTIONS[0]) => {
    setActiveDropdown(null);
    setCustomMinPrice('');
    setCustomMaxPrice('');
    const { setSearchParams } = useHotelStore.getState();
    setSearchParams({
      minPrice: option.min,
      maxPrice: option.max,
    });
  };

  // 应用自定义价格
  const applyCustomPrice = () => {
    const min = customMinPrice ? parseInt(customMinPrice, 10) : undefined;
    const max = customMaxPrice ? parseInt(customMaxPrice, 10) : undefined;
    const { setSearchParams } = useHotelStore.getState();
    setSearchParams({
      minPrice: min,
      maxPrice: max,
    });
    setActiveDropdown(null);
  };

  // 切换下拉菜单
  const toggleDropdown = (type: 'sort' | 'price') => {
    setActiveDropdown(prev => (prev === type ? null : type));
  };

  // 关闭下拉菜单
  const closeDropdown = () => setActiveDropdown(null);

  return (
    <View className="filter-bar">
      <View className="filter-bar__inner">
        {/* 综合排序 */}
        <View className="filter-bar__item" onClick={() => toggleDropdown('sort')}>
          <Text className={`filter-bar__label ${sortBy ? 'filter-bar__label--active' : ''}`}>
            {sortLabel}
          </Text>
          <Text className={`filter-bar__arrow ${activeDropdown === 'sort' ? 'filter-bar__arrow--up' : ''}`}>
            ▼
          </Text>
        </View>

        {/* 价格 */}
        <View className="filter-bar__item" onClick={() => toggleDropdown('price')}>
          <Text className={`filter-bar__label ${searchParams.minPrice !== undefined || searchParams.maxPrice !== undefined ? 'filter-bar__label--active' : ''}`}>
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

      {/* 排序下拉菜单 */}
      {activeDropdown === 'sort' && (
        <>
          <View className="filter-bar__mask" onClick={closeDropdown} />
          <View className="filter-bar__dropdown">
            {SORT_OPTIONS.map(option => (
              <View
                key={option.value}
                className={`filter-bar__option ${sortBy === option.value ? 'filter-bar__option--active' : ''}`}
                onClick={() => handleSortSelect(option.value)}
              >
                <Text>{option.label}</Text>
                {sortBy === option.value && <Text className="filter-bar__check">✓</Text>}
              </View>
            ))}
          </View>
        </>
      )}

      {/* 价格下拉菜单 */}
      {activeDropdown === 'price' && (
        <>
          <View className="filter-bar__mask" onClick={closeDropdown} />
          <View className="filter-bar__dropdown">
            {PRICE_OPTIONS.map(option => {
              const isActive =
                searchParams.minPrice === option.min && searchParams.maxPrice === option.max;
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
        onClose={() => setDrawerOpen(false)}
      />
    </View>
  );
}

export default FilterBar;
