/**
 * mini-app/src/components/HotelCard/index.tsx
 * 酒店卡片组件
 */

import { Image, Text, View } from '@tarojs/components';
import { Star, Location, Tag } from '@nutui/icons-react-taro';
import './index.scss';

interface HotelCardProps {
  hotel: {
    id: string;
    name: string;
    address: string;
    images: string[];
    rating: number;
    reviewCount: number;
    tags: string[];
    distance?: number;
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
      <Image
        className="hotel-image"
        src={hotel.images[0]}
        mode="aspectFill"
        lazyLoad
      />

      <View className="hotel-info">
        <View className="hotel-header">
          <Text className="hotel-name">{hotel.name}</Text>
          {hotel.distance !== undefined && (
            <View className="distance">
              <Location size="12" />
              <Text>{hotel.distance < 1 ? `${Math.round(hotel.distance * 1000)}m` : `${hotel.distance.toFixed(1)}km`}</Text>
            </View>
          )}
        </View>

        <View className="hotel-rating">
          <Star size="12" fill="#FFC107" />
          <Text className="rating-text">{hotel.rating}</Text>
          <Text className="review-count">({hotel.reviewCount}条评价)</Text>
        </View>

        <View className="hotel-tags">
          {hotel.tags.slice(0, 3).map((tag, index) => (
            <View key={index} className="tag">
              {tag}
            </View>
          ))}
        </View>

        <View className="hotel-footer">
          <View className="price-section">
            <Text className="price">¥{minPrice}</Text>
            <Text className="price-unit">起/晚</Text>
          </View>
          <Text className="address">{hotel.address}</Text>
        </View>
      </View>
    </View>
  );
}

export default HotelCard;
