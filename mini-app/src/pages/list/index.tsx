/**
 * mini-app/src/pages/list/index.tsx
 * 酒店列表页
 */

import { useState, useEffect } from 'react';
import { View, ScrollView, Text } from '@tarojs/components';
import Taro, { useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { useHotelStore } from '@/store/useHotelStore';
import { searchHotelsApi } from '@/services/mockApi';
// Day 4后切换为真实API：
// import { searchHotelsApi } from '@/services/api';
import FilterBar from '@/components/FilterBar';
import HotelCard from '@/components/HotelCard';
import Skeleton from '@/components/Skeleton';
import type { Hotel } from '@shared/types/hotel';
import './index.scss';

function List() {
  const { searchParams } = useHotelStore();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('');

  /**
   * 加载酒店列表
   */
  const loadHotels = async (isLoadMore = false) => {
    setLoading(true);
    try {
      const response = await searchHotelsApi({
        ...searchParams,
        sortBy: sortBy as any,
        page: isLoadMore ? Math.ceil(hotels.length / 10) + 1 : 1,
        pageSize: 10,
      });

      if (response.success) {
        if (isLoadMore) {
          setHotels([...hotels, ...response.data]);
        } else {
          setHotels(response.data);
        }
        setHasMore(response.hasMore);
      }
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '加载失败',
        icon: 'error',
      });
    } finally {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }
  };

  useEffect(() => {
    loadHotels();
  }, [sortBy]);

  /**
   * 下拉刷新
   */
  usePullDownRefresh(() => {
    loadHotels();
  });

  /**
   * 上拉加载更多
   */
  useReachBottom(() => {
    if (!loading && hasMore) {
      loadHotels(true);
    }
  });

  /**
   * 排序变化
   */
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  /**
   * 跳转详情
   */
  const handleHotelClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${id}`,
    });
  };

  return (
    <View className="list-page">
      {/* 筛选栏 */}
      <FilterBar sortBy={sortBy} onSortChange={handleSortChange} />

      {/* 酒店列表 */}
      {loading && hotels.length === 0 ? (
        <Skeleton count={3} />
      ) : (
        <View className="hotel-list">
          {hotels.map(hotel => (
            <HotelCard key={hotel.id} hotel={hotel} onClick={handleHotelClick} />
          ))}

          {/* 加载状态 */}
          {loading && <Skeleton count={1} />}

          {/* 没有更多 */}
          {!hasMore && hotels.length > 0 && (
            <View className="no-more">
              <Text>没有更多了</Text>
            </View>
          )}

          {/* 空状态 */}
          {!loading && hotels.length === 0 && (
            <View className="empty">
              <Text>暂无酒店数据</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default List;
