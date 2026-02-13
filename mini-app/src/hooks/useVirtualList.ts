/**
 * mini-app/src/hooks/useVirtualList.ts
 * 虚拟滚动Hook（Day 8-9实现）
 */

import { useState, useRef, useEffect } from 'react';

interface VirtualListOptions {
  dataSource: any[];
  itemHeight: number;
  visibleHeight: number;
  overscan?: number;
}

interface VirtualListResult {
  visibleData: any[];
  startIndex: number;
  endIndex: number;
  scrollTop: number;
  handleScroll: (scrollTop: number) => void;
}

/**
 * 虚拟列表Hook
 * 用于优化长列表性能
 */
export const useVirtualList = ({
  dataSource,
  itemHeight,
  visibleHeight,
  overscan = 3,
}: VirtualListOptions): VirtualListResult => {
  const [scrollTop, setScrollTop] = useState(0);

  // 计算可见范围
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    dataSource.length - 1,
    Math.ceil((scrollTop + visibleHeight) / itemHeight) + overscan
  );

  // 可见数据
  const visibleData = dataSource.slice(startIndex, endIndex + 1);

  /**
   * 处理滚动
   */
  const handleScroll = (scrollTop: number) => {
    setScrollTop(scrollTop);
  };

  return {
    visibleData,
    startIndex,
    endIndex,
    scrollTop,
    handleScroll,
  };
};
