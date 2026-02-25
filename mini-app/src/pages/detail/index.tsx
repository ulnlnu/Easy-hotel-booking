/**
 * mini-app/src/pages/detail/index.tsx
 * 酒店详情页
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Swiper, SwiperItem, Image, Text, Button } from '@tarojs/components';
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro';
import { getHotelDetailApi } from '@/services/api';
import { useHotelStore } from '@/store/useHotelStore';
import DateRangePicker from '@/components/DateRangePicker';
import { Hotel } from '@shared/types/hotel';
import './index.scss';

// 获取今天的日期字符串 (YYYY-MM-DD)
const getTodayStr = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取明天的日期字符串
const getTomorrowStr = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function Detail() {
  const router = useRouter();
  const { id } = router.params;
  const { searchParams, setSearchParams } = useHotelStore();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);

  // 从 store 获取日期，如果没有则使用默认值（今天-明天）
  const checkIn = searchParams.checkIn || getTodayStr();
  const checkOut = searchParams.checkOut || getTomorrowStr();

  // 计算入住天数
  const nights = useMemo(() => {
    return Math.max(1, Math.floor(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    ));
  }, [checkIn, checkOut]);

  useEffect(() => {
    loadHotelDetail();
  }, [id]);

  /**
   * 加载酒店详情
   */
  const loadHotelDetail = async () => {
    if (!id) return;
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
    } catch (error) {
        const err = error instanceof Error ? error : new Error('加载失败');
        Taro.showToast({
            title: err.message,
            icon: 'error',
        });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 日期选择确认
   */
  const handleDateConfirm = (data: { checkIn: string; checkOut: string; nights: number }) => {
    setSearchParams({ checkIn: data.checkIn, checkOut: data.checkOut });
    setShowCalendar(false);
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
      imageUrl: hotel?.images?.[0] || '',
    };
  });

  if (loading) {
    return <View className="detail-page loading">加载中...</View>;
  }

  if (!hotel) {
    return <View className="detail-page">酒店不存在</View>;
  }

  // 增加安全校验，防止后端返回空数据或 null 导致前端解构崩溃
  const sortedRoomTypes = hotel?.roomTypes
    ? [...hotel.roomTypes].sort((a, b) => a.price - b.price)
    : [];

  // 设施标签也增加默认值校验
  const facilities = hotel?.facilities || [];

  return (
    <View className="detail-page">
      {/* 导航栏 */}
      <View className="nav-bar">
        <View className="nav-back" onClick={handleBack}>
          <Text className="nav-back-icon">←</Text>
        </View>
      </View>

      {/* 图片轮播 */}
      <View className="image-swiper">
        <Swiper
          className="swiper"
          indicatorColor="#fff"
          indicatorActiveColor="#1890ff"
          circular
          indicatorDots
          autoplay
          interval={3000}
          current={currentImageIndex}
          onChange={e => setCurrentImageIndex(e.detail.current)}
          style={{ height: '75vw' }}
        >
          {hotel.images?.map((image, index) => (
            <SwiperItem key={index} className="swiper-item">
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
          <Text>{currentImageIndex + 1}/{(hotel.images || []).length}</Text>
        </View>
      </View>

      {/* 酒店信息 */}
      <View className="hotel-info">
        <View className="hotel-header">
          <Text className="hotel-name">{hotel.name}</Text>
          <View className="rating">
            <Text className="rating-star">★</Text>
            <Text className="rating-text">{hotel.rating}</Text>
            <Text className="review-count">({hotel.reviewCount}条评价)</Text>
          </View>
        </View>

        <View className="address">
          <Text className="address-icon">📍</Text>
          <Text>{hotel.address}</Text>
        </View>

        {/* 设施标签 */}
        <View className="facilities">
          {facilities.map((facility, index) => (
            <View key={index} className="facility-tag">
              <Text>{facility}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 日历+间夜 Banner */}
      <View className="date-banner" onClick={() => setShowCalendar(true)}>
        <View className="date-banner__left">
          <View className="date-banner__dates">
            <View className="date-banner__date-item">
              <Text className="date-banner__label">入住</Text>
              <Text className="date-banner__value">{checkIn.slice(5)}</Text>
            </View>
            <View className="date-banner__arrow-wrap">
              <Text className="date-banner__nights">共{nights}晚</Text>
              <Text className="date-banner__arrow">→</Text>
            </View>
            <View className="date-banner__date-item">
              <Text className="date-banner__label">离店</Text>
              <Text className="date-banner__value">{checkOut.slice(5)}</Text>
            </View>
          </View>
        </View>
        <View className="date-banner__edit">
          <Text>修改</Text>
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
                <Text className="room-area">{typeof room.area === 'number' ? `${room.area}㎡` : (room.area || '-')}</Text>
                <View className="room-bed">
                  <Text>{room.bedType || room.beds || '-'}</Text>
                  <Text className="max-guests">最多{room.maxGuests ?? room.maxOccupancy ?? 2}人</Text>
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
          <Text className="contact-icon">📞</Text>
          <Text>联系酒店</Text>
        </Button>
      </View>

      {/* 日期选择器 */}
      <DateRangePicker
        visible={showCalendar}
        value={{ checkIn, checkOut }}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowCalendar(false)}
      />
    </View>
  );
}

export default Detail;
