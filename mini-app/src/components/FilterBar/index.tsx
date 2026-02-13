/**
 * mini-app/src/components/FilterBar/index.tsx
 * 筛选栏组件
 */

import { View, Text } from '@tarojs/components';
import { Filter } from '@nutui/icons-react-taro';
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
  { label: '默认排序', value: '' },
  { label: '价格优先', value: 'price' },
  { label: '距我最近', value: 'distance' },
  { label: '评分最高', value: 'rating' },
];

function FilterBar({
  sortBy,
  onSortChange,
  sortOptions = defaultSortOptions,
}: FilterBarProps) {
  return (
    <View className="filter-bar">
      {sortOptions.map(option => (
        <View
          key={option.value}
          className={`filter-item ${sortBy === option.value ? 'active' : ''}`}
          onClick={() => onSortChange(option.value)}
        >
          <Filter size="14" />
          <Text>{option.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default FilterBar;
