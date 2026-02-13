/**
 * mini-app/src/pages/detail/index.tsx
 * 酒店详情页
 */

import { useState, useEffect } from 'react';
import { View, Swiper, SwiperItem, Image, Text, Button } from '@tarojs/components';
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro';
import { Star, Phone, Location, ChevronLeft } from '@nutui/icons-react-taro';
import { getHotelDetailApi } from '@/services/mockApi';
// Day 4后切换为真实API：
// import { getHotelDetailApi } from '@/services/api';
import type { Hotel } from '@shared/types/hotel';
import './index.scss';

function Detail() {
  const router = useRouter();
  const { id } = router.params;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadHotelDetail();
  }, [id]);

  /**
   * 加载酒店详情
   */
  const loadHotelDetail = async () => {
    setLoading(true);
    try {
      const response = await getHotelDetailApi(id);
      if (response.success) {
        setHotel(response.data);
        // 设置导航栏标题
        Taro.setNavigationBarTitle({
          title: response.data.name,
        });
      }
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '加载失败',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 联系酒店
   */
  const handleContact = () => {
    Taro.makePhoneCall({
      phoneNumber: '400-123-4567',
    });
  };

  /**
   * 预订
   */
  const handleBooking = () => {
    Taro.showToast({
      title: '预订功能开发中',
      icon: 'none',
    });
  };

  /**
   * 返回
   */
  const handleBack = () => {
    Taro.navigateBack();
  };

  /**
   * 分享配置
   */
  useShareAppMessage(() => {
    return {
      title: hotel?.name || '易宿酒店',
      path: `/pages/detail/index?id=${id}`,
      imageUrl: hotel?.images[0],
    };
  });

  if (loading) {
    return <View className="detail-page loading">加载中...</View>;
  }

  if (!hotel) {
    return <View className="detail-page">酒店不存在</View>;
  }

  // 房型按价格排序
  const sortedRoomTypes = [...hotel.roomTypes].sort((a, b) => a.price - b.price);

  return (
    <View className="detail-page">
      {/* 导航栏 */}
      <View className="nav-bar">
        <View className="nav-back" onClick={handleBack}>
          <ChevronLeft size="20" />
        </View>
        <View className="nav-share">
          <Text>分享</Text>
        </View>
      </View>

      {/* 图片轮播 */}
      <View className="image-swiper">
        <Swiper
          indicatorColor="#fff"
          indicatorActiveColor="#1890ff"
          circular
          indicatorDots
          autoplay
          interval={3000}
          current={currentImageIndex}
          onChange={e => setCurrentImageIndex(e.detail.current)}
        >
          {hotel.images.map((image, index) => (
            <SwiperItem key={index}>
              <Image
                src={image}
                mode="aspectFill"
                className="swiper-image"
                lazyLoad
              />
            </SwiperItem>
          ))}
        </Swiper>
        <View className="image-count">
          <Text>{currentImageIndex + 1}/{hotel.images.length}</Text>
        </View>
      </View>

      {/* 酒店信息 */}
      <View className="hotel-info">
        <View className="hotel-header">
          <Text className="hotel-name">{hotel.name}</Text>
          <View className="rating">
            <Star size="14" fill="#FFC107" />
            <Text className="rating-text">{hotel.rating}</Text>
            <Text className="review-count">({hotel.reviewCount}条评价)</Text>
          </View>
        </View>

        <View className="address">
          <Location size="14" />
          <Text>{hotel.address}</Text>
        </View>

        {/* 设施标签 */}
        <View className="facilities">
          {hotel.facilities.map((facility, index) => (
            <View key={index} className="facility-tag">
              <Text>{facility}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 房型列表 */}
      <View className="room-section">
        <View className="section-title">
          <Text>选择房型</Text>
        </View>
        <View className="room-list">
          {sortedRoomTypes.map(room => (
            <View key={room.id} className="room-item">
              <View className="room-info">
                <Text className="room-name">{room.name}</Text>
                <Text className="room-area">{room.area}</Text>
                <View className="room-bed">
                  <Text>{room.bedType}</Text>
                  <Text className="max-guests">最多{room.maxGuests}人</Text>
                </View>
              </View>
              <View className="room-action">
                <View className="price-section">
                  <Text className="price">¥{room.price}</Text>
                  {room.originalPrice && (
                    <Text className="original-price">¥{room.originalPrice}</Text>
                  )}
                  <Text className="unit">/晚</Text>
                </View>
                <Button
                  className="book-btn"
                  size="mini"
                  disabled={room.status === 'sold_out'}
                  onClick={handleBooking}
                >
                  <Text>{room.status === 'sold_out' ? '已售罄' : '预订'}</Text>
                </Button>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 底部操作栏 */}
      <View className="bottom-bar">
        <Button className="contact-btn" onClick={handleContact}>
          <Phone size="18" />
          <Text>联系酒店</Text>
        </Button>
      </View>
    </View>
  );
}

export default Detail;
