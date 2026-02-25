/**
 * mini-app/src/pages/list/index.tsx
 * 酒店列表页 - 接入虚拟滚动与LBS距离排序
 * 技术亮点：虚拟滚动（小程序端） + LBS定位搜索 + H5兼容
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReady } from '@tarojs/taro';
import VirtualList from '@tarojs/components/virtual-list';
import { useHotelStore } from '@/store/useHotelStore';
import { searchHotelsApi } from '@/services/api';
import FilterBar from '@/components/FilterBar';
import HotelCard from '@/components/HotelCard';
import Skeleton from '@/components/Skeleton';
import type { Hotel } from '@shared/types/hotel';
import './index.scss';

// 检测是否为 H5 环境
const IS_H5 = process.env.TARO_ENV === 'h5';

// 提取单行组件以供 VirtualList 渲染，使用 React.memo 优化性能
// Taro VirtualList 的 item 组件接收 { id, index, data, isScrolling } props
const Row = React.memo(({ id, index, data }: { id: string; index: number; data: Hotel[] }) => {
  const hotel = data[index];
  if (!hotel) return null;

  return (
    <View id={id} className="list-page__item">
      <HotelCard hotel={hotel} onClick={() => {
        Taro.navigateTo({ url: `/pages/detail/index?id=${hotel.id}` });
      }} />
    </View>
  );
});

function List() {
  const { searchParams, setSearchParams } = useHotelStore();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('');

  // 用于计算虚拟列表的高度
  const [listHeight, setListHeight] = useState(600);

  useReady(() => {
    // 动态获取系统视口高度减去顶部筛选栏的高度
    const sysInfo = Taro.getSystemInfoSync();
    // FilterBar 高度约 88px
    setListHeight(sysInfo.windowHeight - 88);
  });

  // 获取当前有效的筛选标签
  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; value: string }[] = [];
    if (searchParams.city) {
      filters.push({ key: 'city', label: '城市', value: searchParams.city });
    }
    if (searchParams.keyword) {
      filters.push({ key: 'keyword', label: '关键词', value: searchParams.keyword });
    }
    if (searchParams.checkIn && searchParams.checkOut) {
      filters.push({ key: 'date', label: '日期', value: `${searchParams.checkIn} 至 ${searchParams.checkOut}` });
    }
    return filters;
  }, [searchParams]);

  // 清除单个筛选
  const clearFilter = useCallback((key: string) => {
    if (key === 'date') {
      setSearchParams({ checkIn: undefined, checkOut: undefined });
    } else {
      setSearchParams({ [key]: undefined });
    }
  }, [setSearchParams]);

  // 清除所有筛选
  const clearAllFilters = useCallback(() => {
    setSearchParams({
      city: undefined,
      keyword: undefined,
      checkIn: undefined,
      checkOut: undefined,
      location: undefined,
    });
  }, [setSearchParams]);

  /**
   * 加载酒店列表
   */
  const loadHotels = async (isLoadMore = false) => {
    if (loading || (!hasMore && isLoadMore)) return;

    setLoading(true);
    try {
      // 过滤空值参数
      const cleanParams: Record<string, any> = {};
      const rawParams = {
        ...searchParams,
        sortBy: sortBy as any,
        page: isLoadMore ? Math.ceil(hotels.length / 10) + 1 : 1,
        pageSize: 10,
        // 如果按距离排序，确保传入 LBS 坐标
        location: sortBy === 'distance' ? searchParams.location : undefined,
      };

      Object.entries(rawParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          cleanParams[key] = value;
        }
      });

      console.log('Request params:', cleanParams);
      const response = await searchHotelsApi(cleanParams as any);
      console.log('API Response:', response);

      if (response.success) {
        if (isLoadMore) {
          setHotels(prev => [...prev, ...response.data]);
        } else {
          setHotels(response.data);
        }
        setHasMore(response.hasMore);
      }
    } catch (error: any) {
      console.error('Load hotels error:', error);
      Taro.showToast({ title: error.message || '加载失败', icon: 'error' });
    } finally {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }
  };

  // 初始加载
  useEffect(() => {
    loadHotels(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 筛选变化时重新加载
  useEffect(() => {
    setHotels([]);
    setHasMore(true);
    loadHotels(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.city, searchParams.keyword, searchParams.checkIn, searchParams.checkOut]);

  // 排序条件改变时，重置列表并重新请求
  useEffect(() => {
    setHotels([]);
    setHasMore(true);
    loadHotels(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  usePullDownRefresh(() => {
    setHasMore(true);
    loadHotels(false);
  });

  // 加载更多
  const handleScrollToLower = useCallback(() => {
    if (hasMore && !loading) {
      loadHotels(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading]);

  return (
    <View className="list-page">
      {/* 筛选栏 */}
      <FilterBar sortBy={sortBy} onSortChange={setSortBy} />

      {/* 筛选标签 */}
      {activeFilters.length > 0 && (
        <View className="list-page__filter-tags">
          <View className="filter-tags__list">
            {activeFilters.map((filter) => (
              <View key={filter.key} className="filter-tags__tag" onClick={() => clearFilter(filter.key)}>
                <Text className="filter-tags__tag-text">{filter.value}</Text>
                <Text className="filter-tags__close-icon">×</Text>
              </View>
            ))}
          </View>
          <View className="filter-tags__clear" onClick={clearAllFilters}>
            <Text>清除全部</Text>
          </View>
        </View>
      )}

      {/* 酒店列表 - H5 使用 ScrollView，小程序使用 VirtualList */}
      {loading && hotels.length === 0 ? (
        <Skeleton count={4} />
      ) : hotels.length === 0 ? (
        <View className="list-page__empty">
          <Text className="list-page__empty-text">暂无符合条件的酒店</Text>
          {activeFilters.length > 0 && (
            <View className="list-page__empty-hint" onClick={clearAllFilters}>
              <Text>点击清除筛选条件</Text>
            </View>
          )}
        </View>
      ) : IS_H5 ? (
        // H5 环境：使用 ScrollView 普通滚动
        <ScrollView
          className="list-page__scroll"
          scrollY
          style={{ height: `${listHeight}px` }}
          onScrollToLower={handleScrollToLower}
          lowerThreshold={100}
        >
          {hotels.map((hotel) => (
            <View key={hotel.id} className="list-page__item">
              <HotelCard
                hotel={hotel}
                onClick={() => {
                  Taro.navigateTo({ url: `/pages/detail/index?id=${hotel.id}` });
                }}
              />
            </View>
          ))}
          {/* 底部加载状态移到 ScrollView 内部 */}
          {loading && hotels.length > 0 && (
            <View className="list-page__loading-more">
              <Text>加载中...</Text>
            </View>
          )}
          {!hasMore && hotels.length > 0 && (
            <View className="list-page__no-more">
              <Text>已经到底啦~</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        // 小程序环境：使用 VirtualList 虚拟滚动
        <VirtualList
          height={listHeight}
          width="100%"
          item={Row}              // Taro VirtualList 使用 item 属性
          itemData={hotels}       // 完整的数据数组
          itemCount={hotels.length}
          itemSize={200}          // HotelCard 高度约 180px + 间距 20px
          overscanCount={5}       // 预渲染数量，防止滑动白屏
          lowerThreshold={100}    // 触底距离
          onScrollToLower={handleScrollToLower}
        />
      )}

      {/* 底部加载状态 - 仅小程序端显示（H5 端在 ScrollView 内部） */}
      {!IS_H5 && loading && hotels.length > 0 && (
        <View className="list-page__loading-more">
          <Text>加载中...</Text>
        </View>
      )}
      {!IS_H5 && !hasMore && hotels.length > 0 && (
        <View className="list-page__no-more">
          <Text>已经到底啦~</Text>
        </View>
      )}
    </View>
  );
}

export default List;
