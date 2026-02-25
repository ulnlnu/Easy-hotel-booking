/**
 * mini-app/src/components/HotelCard/index.tsx
 * 酒店卡片组件 - 横向布局（优化版）
 */

import React from 'react';
import { Image, Text, View } from '@tarojs/components';
import './index.scss';

interface HotelCardProps {
  hotel: {
    id: string;
    name: string;
    address: string;
    city?: string;
    images: string[];
    rating: number;
    reviewCount: number;
    tags: string[];
    distance?: number;
    starLevel?: number;
    roomTypes: Array<{ price: number; originalPrice?: number }>;
  };
  onClick?: (id: string) => void;
}

function HotelCard({ hotel, onClick }: HotelCardProps) {
  const minPrice = Math.min(...hotel.roomTypes.map(r => r.price));

  const handleClick = () => {
    onClick?.(hotel.id);
  };

  return (
    <View className="hotel-card" onClick={handleClick}>
      {/* 左侧图片 */}
      <View className="hotel-card__image-wrap">
        <Image
          className="hotel-card__image"
          src={hotel.images[0]}
          mode="aspectFill"
          lazyLoad
        />
        {hotel.starLevel && hotel.starLevel >= 4 && (
          <View className="hotel-card__star-badge">
            {hotel.starLevel}星
          </View>
        )}
      </View>

      {/* 右侧信息 */}
      <View className="hotel-card__info">
        {/* 酒店名称 */}
        <Text className="hotel-card__name">{hotel.name}</Text>

        {/* 评分和地址 */}
        <View className="hotel-card__meta">
          <View className="hotel-card__rating">
            <Text className="hotel-card__star-icon">★</Text>
            <Text className="hotel-card__rating-num">{hotel.rating}</Text>
            <Text className="hotel-card__review-count">{hotel.reviewCount}条评价</Text>
          </View>
        </View>

        {/* 地址/距离 */}
        <View className="hotel-card__location">
          {hotel.distance !== undefined ? (
            <View className="hotel-card__distance">
              <Text className="hotel-card__location-icon">📍</Text>
              <Text>{hotel.distance < 1 ? `${Math.round(hotel.distance * 1000)}m` : `${hotel.distance.toFixed(1)}km`}</Text>
            </View>
          ) : (
            <Text className="hotel-card__address">{hotel.address}</Text>
          )}
        </View>

        {/* 标签 */}
        <View className="hotel-card__tags">
          {hotel.tags.slice(0, 2).map((tag, index) => (
            <View key={index} className="hotel-card__tag">
              {tag}
            </View>
          ))}
        </View>

        {/* 底部价格 */}
        <View className="hotel-card__footer">
          <View className="hotel-card__price">
            <Text className="hotel-card__price-symbol">¥</Text>
            <Text className="hotel-card__price-num">{minPrice}</Text>
            <Text className="hotel-card__price-unit">起</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default HotelCard;
