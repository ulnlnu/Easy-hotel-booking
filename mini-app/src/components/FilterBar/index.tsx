/**
 * mini-app/src/components/FilterBar/index.tsx
 * 筛选栏组件 - 紧凑型（优化版）
 */

import { View, Text } from '@tarojs/components';
import './index.scss';

interface SortOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOptions?: SortOption[];
}

const defaultSortOptions: SortOption[] = [
  { label: '综合', value: '' },
  { label: '价格', value: 'price' },
  { label: '距离', value: 'distance' },
  { label: '评分', value: 'rating' },
];

function FilterBar({
  sortBy,
  onSortChange,
  sortOptions = defaultSortOptions,
}: FilterBarProps) {
  return (
    <View className="filter-bar">
      <View className="filter-bar__inner">
        {sortOptions.map(option => (
          <View
            key={option.value}
            className={`filter-bar__item ${sortBy === option.value ? 'filter-bar__item--active' : ''}`}
            onClick={() => onSortChange(option.value)}
          >
            <Text className="filter-bar__label">{option.label}</Text>
            {sortBy === option.value && <View className="filter-bar__indicator" />}
          </View>
        ))}
      </View>
    </View>
  );
}

export default FilterBar;
