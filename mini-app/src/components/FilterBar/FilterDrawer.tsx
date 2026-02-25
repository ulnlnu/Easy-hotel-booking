/**
 * mini-app/src/components/FilterBar/FilterDrawer.tsx
 * 筛选抽屉组件 - 排序 + 高级筛选面板（星级、设施、特色标签）
 */

import { useState, useEffect, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useHotelStore } from '@/store/useHotelStore';
import './FilterDrawer.scss';

// 排序选项（价格排序已移至价格筛选下拉菜单）
const SORT_OPTIONS = [
  { label: '综合排序', value: '' },
  { label: '评分最高', value: 'rating' },
];

// 星级选项
const STAR_OPTIONS = [
  { label: '不限', value: undefined },
  { label: '★★★★★', value: 5 },
  { label: '★★★★', value: 4 },
  { label: '★★★', value: 3 },
];

// 常用设施选项
const FACILITY_OPTIONS = [
  'WiFi',
  '停车场',
  '健身房',
  '泳池',
  'SPA',
  '餐厅',
  '早餐',
  '会议室',
];

// 常用特色标签
const TAG_OPTIONS = [
  '近地铁',
  '含早餐',
  '近景区',
  '近商圈',
  '海景房',
  '江景房',
  '湖景房',
  '亲子酒店',
  '商务首选',
];

interface FilterDrawerProps {
  visible: boolean;
  sortBy: string;
  onSortChange: (value: string) => void;
  onClose: () => void;
}

function FilterDrawer({ visible, sortBy, onSortChange, onClose }: FilterDrawerProps) {
  const { searchParams, setSearchParams } = useHotelStore();

  // 本地筛选状态（确认前不写入 store）
  const [localFilters, setLocalFilters] = useState({
    starLevel: undefined as number | undefined,
    facilities: [] as string[],
    tags: [] as string[],
  });
  // 本地排序状态
  const [localSortBy, setLocalSortBy] = useState('');

  // 当抽屉打开时，同步 store 状态到本地
  useEffect(() => {
    if (visible) {
      setLocalFilters({
        starLevel: searchParams.starLevel,
        facilities: searchParams.facilities || [],
        tags: searchParams.tags || [],
      });
      setLocalSortBy(sortBy);
    }
  }, [visible, searchParams, sortBy]);

  // 切换设施选择
  const toggleFacility = (facility: string) => {
    setLocalFilters(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  // 切换标签选择
  const toggleTag = (tag: string) => {
    setLocalFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  // 选择星级
  const selectStarLevel = (value: number | undefined) => {
    setLocalFilters(prev => ({
      ...prev,
      starLevel: value,
    }));
  };

  // 重置筛选
  const handleReset = () => {
    setLocalFilters({
      starLevel: undefined,
      facilities: [],
      tags: [],
    });
    setLocalSortBy('');
  };

  // 确认筛选
  const handleConfirm = () => {
    setSearchParams({
      starLevel: localFilters.starLevel,
      facilities: localFilters.facilities.length > 0 ? localFilters.facilities : undefined,
      tags: localFilters.tags.length > 0 ? localFilters.tags : undefined,
    });
    onSortChange(localSortBy);
    onClose();
    Taro.showToast({ title: '筛选已应用', icon: 'success', duration: 1000 });
  };

  // 计算是否有活动筛选
  const hasActiveFilters = useMemo(() => {
    return (
      localSortBy !== '' ||
      localFilters.starLevel !== undefined ||
      localFilters.facilities.length > 0 ||
      localFilters.tags.length > 0
    );
  }, [localSortBy, localFilters]);

  if (!visible) return null;

  return (
    <View className="filter-drawer">
      {/* 遮罩层 */}
      <View className="filter-drawer__mask" onClick={onClose} />

      {/* 抽屉内容 */}
      <View className="filter-drawer__content">
        {/* 头部 */}
        <View className="filter-drawer__header">
          <Text className="filter-drawer__title">筛选</Text>
          {hasActiveFilters && (
            <View className="filter-drawer__reset" onClick={handleReset}>
              <Text>重置</Text>
            </View>
          )}
        </View>

        {/* 可滚动内容区域 */}
        <View className="filter-drawer__scroll">
          {/* 排序方式 */}
          <View className="filter-drawer__section">
            <Text className="filter-drawer__section-title">排序方式</Text>
            <View className="filter-drawer__options">
              {SORT_OPTIONS.map(option => (
                <View
                  key={option.value}
                  className={`filter-drawer__option-btn ${localSortBy === option.value ? 'filter-drawer__option-btn--active' : ''}`}
                  onClick={() => setLocalSortBy(option.value)}
                >
                  <Text>{option.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 酒店星级 */}
          <View className="filter-drawer__section">
            <Text className="filter-drawer__section-title">酒店星级</Text>
            <View className="filter-drawer__options">
              {STAR_OPTIONS.map(option => (
                <View
                  key={option.label}
                  className={`filter-drawer__option-btn ${localFilters.starLevel === option.value ? 'filter-drawer__option-btn--active' : ''}`}
                  onClick={() => selectStarLevel(option.value)}
                >
                  <Text>{option.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 酒店设施 */}
          <View className="filter-drawer__section">
            <Text className="filter-drawer__section-title">酒店设施</Text>
            <View className="filter-drawer__tags">
              {FACILITY_OPTIONS.map(facility => (
                <View
                  key={facility}
                  className={`filter-drawer__tag ${localFilters.facilities.includes(facility) ? 'filter-drawer__tag--active' : ''}`}
                  onClick={() => toggleFacility(facility)}
                >
                  <Text>{facility}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 特色标签 */}
          <View className="filter-drawer__section">
            <Text className="filter-drawer__section-title">特色标签</Text>
            <View className="filter-drawer__tags">
              {TAG_OPTIONS.map(tag => (
                <View
                  key={tag}
                  className={`filter-drawer__tag ${localFilters.tags.includes(tag) ? 'filter-drawer__tag--active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  <Text>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 底部按钮 */}
        <View className="filter-drawer__footer">
          <View className="filter-drawer__btn filter-drawer__btn--cancel" onClick={onClose}>
            <Text>取消</Text>
          </View>
          <View className="filter-drawer__btn filter-drawer__btn--confirm" onClick={handleConfirm}>
            <Text>查看酒店</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default FilterDrawer;
