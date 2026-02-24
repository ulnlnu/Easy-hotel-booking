/**
 * mini-app/src/pages/list/index.tsx
 * 酒店列表页 - 接入虚拟滚动与LBS距离排序
 */

import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useReachBottom, usePullDownRefresh, useReady } from '@tarojs/taro';
import VirtualList from '@tarojs/components/virtual-list'; // 引入虚拟列表组件
import { useHotelStore } from '@/store/useHotelStore';
import { searchHotelsApi } from '@/services/api';
import FilterBar from '@/components/FilterBar';
import HotelCard from '@/components/HotelCard';
import Skeleton from '@/components/Skeleton';
import type { Hotel } from '@shared/types/hotel';
import './index.scss';

// 提取单行组件以供 VirtualList 渲染，使用 React.memo 优化性能
const Row = React.memo(({ id, index, data }: any) => {
  const hotel = data[index];
  const { handleHotelClick } = data.delegate; // 通过 delegate 传递事件
  return (
    <View id={id} style={{ padding: '0 12px', boxSizing: 'border-box' }}>
      <HotelCard hotel={hotel} onClick={() => handleHotelClick(hotel.id)} />
    </View>
  );
});

function List() {
  const { searchParams } = useHotelStore();
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('');
  
  // 用于计算虚拟列表的高度
  const [listHeight, setListHeight] = useState(600); 

  useReady(() => {
    // 动态获取系统视口高度减去顶部筛选栏的高度，作为虚拟列表的容器高度
    const sysInfo = Taro.getSystemInfoSync();
    // 假设 FilterBar 高度约为 44px
    setListHeight(sysInfo.windowHeight - 44); 
  });

  /**
   * 加载酒店列表
   */
  const loadHotels = async (isLoadMore = false) => {
    if (loading || (!hasMore && isLoadMore)) return;
    
    setLoading(true);
    try {
      const response = await searchHotelsApi({
        ...searchParams,
        sortBy: sortBy as any,
        page: isLoadMore ? Math.ceil(hotels.length / 10) + 1 : 1,
        pageSize: 10,
        // 如果按距离排序，确保传入 LBS 坐标
        location: sortBy === 'distance' ? searchParams.location : undefined, 
      });

      if (response.success) {
        if (isLoadMore) {
          setHotels(prev => [...prev, ...response.data]);
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
    // 排序条件改变时，重置列表并重新请求
    setHotels([]);
    setHasMore(true);
    loadHotels(false);
  }, [sortBy]);

  usePullDownRefresh(() => {
    setHasMore(true);
    loadHotels(false);
  });

  // 跳转详情
  const handleHotelClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${id}`,
    });
  };

  return (
    <View className="list-page">
      {/* 筛选栏 */}
      <FilterBar sortBy={sortBy} onSortChange={setSortBy} />

      {/* 酒店列表状态控制 */}
      {loading && hotels.length === 0 ? (
        <Skeleton count={4} />
      ) : hotels.length === 0 ? (
        <View className="empty">
          <Text>暂无酒店数据</Text>
        </View>
      ) : (
        <VirtualList
          height={listHeight}
          width="100%"
          itemData={hotels}
          itemCount={hotels.length}
          itemSize={130} // 根据你的 HotelCard 实际 CSS 高度进行调整 (卡片高度+间距)
          delegate={{ handleHotelClick }} // 传递方法到 Row
          renderItem={Row}
          onScrollToLower={() => {
            if (hasMore && !loading) loadHotels(true);
          }}
          overscanCount={4} // 预渲染数量，防止滑动白屏
        />
      )}
      
      {/* 底部加载状态 */}
      {loading && hotels.length > 0 && (
        <View className="loading-more"><Text>加载中...</Text></View>
      )}
      {!hasMore && hotels.length > 0 && (
        <View className="no-more"><Text>没有更多了</Text></View>
      )}
    </View>
  );
}

export default List;
