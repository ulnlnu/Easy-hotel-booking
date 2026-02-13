/**
 * mini-app/src/components/Skeleton/index.tsx
 * 骨架屏组件
 */

import { View } from '@tarojs/components';
import './index.scss';

interface SkeletonProps {
  count?: number;
}

function Skeleton({ count = 1 }: SkeletonProps) {
  return (
    <View className="skeleton-container">
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="skeleton-item">
          <View className="skeleton-image" />
          <View className="skeleton-content">
            <View className="skeleton-title" />
            <View className="skeleton-text" />
            <View className="skeleton-text short" />
            <View className="skeleton-footer">
              <View className="skeleton-price" />
              <View className="skeleton-button" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export default Skeleton;
