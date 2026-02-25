/**
 * mini-app/src/pages/list/index.tsx
 * 酒店列表页 - 接入虚拟滚动与LBS距离排序 + 多维筛选
 * 技术亮点：虚拟滚动（小程序端） + LBS定位搜索 + H5兼容 + 多维筛选 + 优雅入场动画
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

// 骨架屏最小显示时间（毫秒），避免闪烁
const SKELETON_MIN_DURATION = 300;

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
  const { searchParams, setSearchParams, clearFilters, preloadedHotels, preloadedHasMore, clearPreloadedHotels } = useHotelStore();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('');
  // 入场动画状态
  const [isEntering, setIsEntering] = useState(true);
  // 首次加载状态（避免骨架屏闪烁）
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const loadStartTimeRef = useRef<number>(0);

  // 用于计算虚拟列表的高度
  const [listHeight, setListHeight] = useState(600);

  // 是否已完成初始数据加载的标记
  const initialLoadDoneRef = useRef(false);
  // 上一次筛选参数的快照，用于检测真正的变化
  const prevParamsSnapshotRef = useRef<string>('');
  // 是否正在使用预加载数据
  const usingPreloadRef = useRef(false);

  useReady(() => {
    // 动态获取系统视口高度减去顶部筛选栏的高度
    const sysInfo = Taro.getSystemInfoSync();
    // FilterBar 高度约 88px
    setListHeight(sysInfo.windowHeight - 88);

    // 延迟关闭入场动画，让页面平滑过渡
    setTimeout(() => {
      setIsEntering(false);
    }, 50);
  });

  /**
   * 加载酒店列表
   */
  const loadHotels = useCallback(async (isLoadMore = false) => {
    if (loading || (!hasMore && isLoadMore)) return;

    // 记录开始时间
    if (!isLoadMore && isFirstLoad) {
      loadStartTimeRef.current = Date.now();
    }

    setLoading(true);
    try {
      // 过滤空值参数
      const cleanParams: Record<string, any> = {};

      // 解析排序参数（支持 price-asc, price-desc, distance, rating）
      let sortField = sortBy;
      let sortOrder: 'asc' | 'desc' | undefined;
      if (sortBy.includes('-')) {
        const [field, order] = sortBy.split('-');
        sortField = field;
        sortOrder = order as 'asc' | 'desc';
      }

      const rawParams = {
        ...searchParams,
        sortBy: sortField as any,
        order: sortOrder,
        page: isLoadMore ? Math.ceil(hotels.length / 10) + 1 : 1,
        pageSize: 10,
        // 如果按距离排序，确保传入 LBS 坐标
        location: sortField === 'distance' ? searchParams.location : undefined,
      };

      Object.entries(rawParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          // 数组转逗号分隔字符串（facilities, tags）
          if (Array.isArray(value)) {
            if (value.length > 0) {
              cleanParams[key] = value.join(',');
            }
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await searchHotelsApi(cleanParams as any);

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
      // 首次加载时，确保骨架屏至少显示 SKELETON_MIN_DURATION 毫秒
      if (!isLoadMore && isFirstLoad) {
        const elapsed = Date.now() - loadStartTimeRef.current;
        const remainingTime = Math.max(0, SKELETON_MIN_DURATION - elapsed);
        setTimeout(() => {
          setLoading(false);
          setIsFirstLoad(false);
        }, remainingTime);
      } else {
        setLoading(false);
      }
      Taro.stopPullDownRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasMore, sortBy, searchParams, hotels.length, isFirstLoad]);

  // 生成当前筛选参数的快照（用于检测变化）
  const getParamsSnapshot = useCallback(() => {
    return JSON.stringify({
      city: searchParams.city,
      keyword: searchParams.keyword,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      starLevel: searchParams.starLevel,
      minRating: searchParams.minRating,
      facilities: searchParams.facilities,
      tags: searchParams.tags,
      sortBy,
    });
  }, [searchParams, sortBy]);

  // 初始加载 - 检查预加载数据或发起请求（只执行一次）
  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;

    // 记录初始参数快照
    prevParamsSnapshotRef.current = getParamsSnapshot();

    if (preloadedHotels && preloadedHotels.length > 0) {
      // 使用预加载数据，避免重新请求
      setHotels(preloadedHotels);
      setHasMore(preloadedHasMore);
      setIsFirstLoad(false);
      setLoading(false);
      clearPreloadedHotels();
      usingPreloadRef.current = true;
    } else {
      // 没有预加载数据，正常加载
      loadHotels(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 监听筛选/排序变化 - 只在参数真正变化时才重新加载
  useEffect(() => {
    // 跳过初始加载（已在上面的 useEffect 中处理）
    if (!initialLoadDoneRef.current) return;

    const currentSnapshot = getParamsSnapshot();

    // 如果参数没有真正变化，不重新加载
    if (currentSnapshot === prevParamsSnapshotRef.current) {
      return;
    }

    // 参数变化了，更新快照并重新加载
    prevParamsSnapshotRef.current = currentSnapshot;

    // 重置列表状态
    setHotels([]);
    setHasMore(true);
    setIsFirstLoad(true);

    // 重新加载
    loadHotels(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams.city,
    searchParams.keyword,
    searchParams.checkIn,
    searchParams.checkOut,
    searchParams.minPrice,
    searchParams.maxPrice,
    searchParams.starLevel,
    searchParams.minRating,
    searchParams.facilities,
    searchParams.tags,
    sortBy,
  ]);

  usePullDownRefresh(() => {
    setHasMore(true);
    loadHotels(false);
  });

  // H5 环境：使用原生 DOM 事件监听滚动
  useEffect(() => {
    if (!IS_H5) return;

    const timer = setTimeout(() => {
      const container = document.querySelector('.list-page__scroll') as HTMLDivElement;
      if (!container) return;

      const handleNativeScroll = (e: Event) => {
        const target = e.target as HTMLDivElement;
        const { scrollTop, scrollHeight, clientHeight } = target;
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;

        if (distanceToBottom < 200 && hasMore && !loading) {
          loadHotels(true);
        }
      };

      container.addEventListener('scroll', handleNativeScroll, true);
      window.addEventListener('scroll', handleNativeScroll, true);
      (container as any)._scrollHandler = handleNativeScroll;
    }, 100);

    return () => {
      clearTimeout(timer);
      const container = document.querySelector('.list-page__scroll') as HTMLDivElement;
      if (container && (container as any)._scrollHandler) {
        container.removeEventListener('scroll', (container as any)._scrollHandler, true);
        window.removeEventListener('scroll', (container as any)._scrollHandler, true);
      }
    };
  }, [hasMore, loading, loadHotels]);

  // 加载更多
  const handleScrollToLower = useCallback(() => {
    if (hasMore && !loading) {
      loadHotels(true);
    }
  }, [hasMore, loading, loadHotels, hotels.length]);

  // 获取当前有效的筛选标签（不包含城市，城市在筛选栏第一位常驻显示）
  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; value: string }[] = [];
    // 城市在筛选栏第一位常驻显示，不再作为标签
    if (searchParams.keyword) {
      filters.push({ key: 'keyword', label: '关键词', value: searchParams.keyword });
    }
    if (searchParams.checkIn && searchParams.checkOut) {
      filters.push({ key: 'date', label: '日期', value: `${searchParams.checkIn} 至 ${searchParams.checkOut}` });
    }
    // 新增筛选标签显示
    if (searchParams.starLevel) {
      const stars = '★'.repeat(searchParams.starLevel);
      filters.push({ key: 'starLevel', label: '星级', value: `${stars}` });
    }
    if (searchParams.minPrice !== undefined || searchParams.maxPrice !== undefined) {
      const priceStr = searchParams.minPrice !== undefined && searchParams.maxPrice !== undefined
        ? `¥${searchParams.minPrice}-${searchParams.maxPrice}`
        : searchParams.minPrice !== undefined
          ? `¥${searchParams.minPrice}+`
          : `¥${searchParams.maxPrice}以下`;
      filters.push({ key: 'price', label: '价格', value: priceStr });
    }
    if (searchParams.facilities && searchParams.facilities.length > 0) {
      filters.push({ key: 'facilities', label: '设施', value: searchParams.facilities.join('、') });
    }
    if (searchParams.tags && searchParams.tags.length > 0) {
      filters.push({ key: 'tags', label: '特色', value: searchParams.tags.join('、') });
    }
    return filters;
  }, [searchParams]);

  // 清除单个筛选
  const clearFilter = useCallback((key: string) => {
    switch (key) {
      case 'date':
        setSearchParams({ checkIn: undefined, checkOut: undefined });
        break;
      case 'price':
        setSearchParams({ minPrice: undefined, maxPrice: undefined });
        break;
      case 'facilities':
        setSearchParams({ facilities: undefined });
        break;
      case 'tags':
        setSearchParams({ tags: undefined });
        break;
      case 'starLevel':
        setSearchParams({ starLevel: undefined });
        break;
      default:
        setSearchParams({ [key]: undefined });
    }
  }, [setSearchParams]);

  // 清除所有筛选
  const clearAllFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  return (
    <View className={`list-page ${isEntering ? 'list-page--entering' : 'list-page--entered'}`}>
      {/* 筛选栏 */}
      <FilterBar sortBy={sortBy} onSortChange={setSortBy} />

      {/* 酒店列表 - H5 使用 ScrollView，小程序使用 VirtualList */}
      {isFirstLoad && loading && hotels.length === 0 ? (
        <View className="list-page__skeleton-wrapper">
          <Skeleton count={4} />
        </View>
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
        // H5 环境：使用原生 div 滚动（Taro ScrollView 在 H5 有兼容性问题）
        <View
          className="list-page__scroll"
          style={{ height: `${listHeight}px`, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
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
          {/* 底部加载状态 */}
          {loading && hotels.length > 0 && (
            <View className="list-page__loading-more">
              <Text>加载中...</Text>
            </View>
          )}
          {!hasMore && hotels.length > 0 && (
            <View className="list-page__no-more">
              <Text>已经到底啦~（共{hotels.length}家酒店）</Text>
            </View>
          )}
        </View>
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
