/**
 * mini-app/src/pages/home/index.tsx
 * 首页 - 蓝白简约风（优化版）
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Input, Button, Swiper, SwiperItem, Image } from '@tarojs/components';
import Taro, { useReady } from '@tarojs/taro';
import { useHotelStore } from '@/store/useHotelStore';
import { useLocation } from '@/hooks/useLocation';
import DateRangePicker from '@/components/DateRangePicker';
import CityPicker from '@/components/CityPicker';
import { getCityByLocation } from '@/utils/geocoder';
import { findCityByName, getCityDisplayName } from '@/data/cities';
import { searchHotelsApi } from '@/services/api';
import type { Hotel, HotelQueryParams } from '@shared/types/hotel';
import './index.scss';

// 平台检测
const isH5 = process.env.TARO_ENV === 'h5';

// 快捷标签选项（从后端酒店 tags 字段中选取常用标签）
const QUICK_TAGS = [
  { label: '近地铁', icon: '🚇' },
  { label: '含早餐', icon: '🍳' },
  { label: '有泳池', icon: '🏊' },
  { label: '近景区', icon: '🏞️' },
  { label: '商务首选', icon: '💼' },
  { label: '经济实惠', icon: '💰' },
];

function Home() {
  const { searchParams, setSearchParams, locatedCity, setLocatedCity, setPreloadedHotels } = useHotelStore();
  const { location, getLocation, loading: locationLoading } = useLocation();

  const [keyword, setKeyword] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  // 入场动画状态
  const [isEntering, setIsEntering] = useState(true);
  // 广告酒店列表
  const [bannerHotels, setBannerHotels] = useState<Hotel[]>([]);

  // 获取广告酒店（approved 状态的前5个）
  useEffect(() => {
    const fetchBannerHotels = async () => {
      try {
        const response = await searchHotelsApi({
          page: 1,
          pageSize: 5,
        } as any);
        if (response.success && response.data.length > 0) {
          setBannerHotels(response.data);
        }
      } catch (error) {
        console.log('Fetch banner hotels failed:', error);
      }
    };
    fetchBannerHotels();
  }, []);

  // 定位成功后自动识别城市并选中
  useEffect(() => {
    if (location) {
      const result = getCityByLocation(location.lat, location.lng);
      if (result) {
        setLocatedCity(result);
        // 自动选中定位城市
        setSearchParams({ city: result.city });
      }
    }
  }, [location]);

  // 页面入场动画
  useReady(() => {
    // 延迟关闭入场动画，让页面平滑过渡
    setTimeout(() => {
      setIsEntering(false);
    }, 50);
  });

  // 获取选中城市的显示名称（省份+城市格式）
  const selectedCityDisplay = useMemo(() => {
    if (!searchParams.city) return '全国';
    const cityData = findCityByName(searchParams.city);
    if (cityData) {
      return getCityDisplayName(cityData.name, cityData.province);
    }
    return searchParams.city;
  }, [searchParams.city]);

  // 计算入住天数
  const nights = searchParams.checkIn && searchParams.checkOut
    ? Math.max(1, Math.floor(
        (new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24)
      ))
    : 1;

  // 获取定位
  const handleGetLocation = async () => {
    await getLocation();
    // location 状态更新是异步的，这里用返回值判断
  };

  // 搜索酒店（带预加载）
  const handleSearch = async () => {
    // 如果有关键词，使用关键词搜索（清除城市筛选）
    // 如果没有关键词但有城市，使用城市搜索
    const newParams = {
      keyword: keyword || undefined,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      location: location || searchParams.location,
      city: keyword ? undefined : searchParams.city,
    };

    setSearchParams(newParams);

    // 预加载数据
    try {
      const cleanParams: Partial<HotelQueryParams> = {
        page: 1,
        pageSize: 10,
      };
      Object.entries(newParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          (cleanParams as Record<string, any>)[key] = value;
        }
      });

      const response = await searchHotelsApi(cleanParams as HotelQueryParams);
      if (response.success) {
        setPreloadedHotels(response.data, response.hasMore);
      }
    } catch (error) {
      // 预加载失败不影响跳转，列表页会重新加载
      console.log('Preload failed:', error);
    }

    Taro.navigateTo({ url: '/pages/list/index' });
  };

  // 选择城市（打开城市选择器）
  const handleSelectCity = () => {
    setShowCityPicker(true);
  };

  // 城市选择回调
  const handleCitySelect = (city: string) => {
    setSearchParams({ city });
    setKeyword(''); // 清空关键词搜索
  };

  // 日期选择
  const handleDateConfirm = (data: { checkIn: string; checkOut: string; nights: number }) => {
    setSearchParams({ checkIn: data.checkIn, checkOut: data.checkOut });
    setShowCalendar(false);
  };

  // 热门城市点击（带预加载）
  const handleCityClick = async (city: string) => {
    handleCitySelect(city);

    // 预加载数据
    try {
      const response = await searchHotelsApi({
        city,
        page: 1,
        pageSize: 10,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
      });
      if (response.success) {
        setPreloadedHotels(response.data, response.hasMore);
      }
    } catch (error) {
      console.log('Preload failed:', error);
    }

    Taro.navigateTo({ url: '/pages/list/index' });
  };

  // 快捷标签点击（带标签筛选跳转列表页）
  const handleTagClick = async (tag: string) => {
    // 设置标签筛选
    setSearchParams({ tags: [tag] });

    // 预加载数据
    try {
      const response = await searchHotelsApi({
        tags: [tag],
        page: 1,
        pageSize: 10,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
      } as any);
      if (response.success) {
        setPreloadedHotels(response.data, response.hasMore);
      }
    } catch (error) {
      console.log('Preload failed:', error);
    }

    Taro.navigateTo({ url: '/pages/list/index' });
  };

  // 广告酒店点击
  const handleBannerClick = (hotelId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${hotelId}` });
  };

  return (
    <View className={`home-page ${isEntering ? 'home-page--entering' : 'home-page--entered'}`}>
      {/* 广告 Banner - 展示推荐酒店 */}
      {bannerHotels.length > 0 && (
        <View className="home-page__banner">
          <Swiper
            className="home-page__banner-swiper"
            indicatorDots
            autoplay
            circular
            interval={4000}
            duration={500}
            indicatorColor="rgba(255,255,255,0.5)"
            indicatorActiveColor="#fff"
          >
            {bannerHotels.map((hotel) => (
              <SwiperItem
                key={hotel.id}
                className="home-page__banner-item"
                onClick={() => handleBannerClick(hotel.id)}
              >
                <Image
                  className="home-page__banner-image"
                  src={hotel.images?.[0] || ''}
                  mode="aspectFill"
                />
                <View className="home-page__banner-overlay">
                  <Text className="home-page__banner-name">{hotel.name}</Text>
                  <View className="home-page__banner-info">
                    <Text className="home-page__banner-rating">★ {hotel.rating}</Text>
                    <Text className="home-page__banner-price">¥{hotel.roomTypes?.[0]?.price || '--'}起</Text>
                  </View>
                </View>
              </SwiperItem>
            ))}
          </Swiper>
        </View>
      )}

      {/* 搜索卡片 */}
      <View className="home-page__search-card">
        {/* 酒店位置输入 */}
        <View className="home-page__form-item">
          <View className="home-page__label">
            <Text className="home-page__icon">📍</Text>
            <Text>酒店位置</Text>
          </View>
          <View className="home-page__input-wrap">
            {isH5 ? (
              // H5 使用原生 input
              <input
                className="home-page__native-input"
                placeholder="输入目的地或酒店名称"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            ) : (
              // 小程序使用 Taro Input
              <Input
                className="home-page__input"
                placeholder="输入目的地或酒店名称"
                placeholderClass="home-page__placeholder"
                value={keyword}
                onInput={e => setKeyword(e.detail.value)}
              />
            )}
            <View className="home-page__city-btn" onClick={handleSelectCity}>
              <Text>{selectedCityDisplay}</Text>
            </View>
          </View>
        </View>

        {/* 入住/离店日期 */}
        <View className="home-page__form-item" onClick={() => setShowCalendar(true)}>
          <View className="home-page__label">
            <Text className="home-page__icon">🕐</Text>
            <Text>入住 · 离店</Text>
          </View>
          <View className="home-page__input-wrap">
            {searchParams.checkIn && searchParams.checkOut ? (
              <View className="home-page__date-text">
                <Text>{searchParams.checkIn}</Text>
                <Text style={{ margin: '0 2vw', color: '#9CA3AF' }}>至</Text>
                <Text>{searchParams.checkOut}</Text>
                <Text className="home-page__nights"> · {nights}晚</Text>
              </View>
            ) : (
              <Text className="home-page__placeholder">选择入住和离店日期</Text>
            )}
          </View>
        </View>

        {/* 定位按钮 */}
        <Button
          className="home-page__location-btn"
          loading={locationLoading}
          onClick={handleGetLocation}
        >
          <Text className="home-page__btn-icon">📍</Text>
          <Text>{locatedCity ? locatedCity.displayName : location ? '已获取位置' : '获取当前位置'}</Text>
        </Button>

        {/* 搜索按钮 */}
        <Button className="home-page__search-btn" onClick={handleSearch}>
          <Text className="home-page__search-icon">🔍</Text>
          <Text>搜索酒店</Text>
        </Button>
      </View>

      {/* 快捷标签 */}
      <View className="home-page__tags-section">
        <Text className="home-page__section-title">快捷筛选</Text>
        <View className="home-page__tags-grid">
          {QUICK_TAGS.map((tag) => (
            <View
              key={tag.label}
              className="home-page__tag-item"
              onClick={() => handleTagClick(tag.label)}
            >
              <Text className="home-page__tag-icon">{tag.icon}</Text>
              <Text className="home-page__tag-label">{tag.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 热门城市 */}
      <View className="home-page__hot-section">
        <Text className="home-page__section-title">热门城市</Text>
        <View className="home-page__hot-grid">
          {['北京', '上海', '深圳', '杭州', '成都', '三亚'].map((city) => (
            <View
              key={city}
              className="home-page__hot-item"
              onClick={() => handleCityClick(city)}
            >
              <Text>{city}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 日期选择器 */}
      <DateRangePicker
        visible={showCalendar}
        value={
          searchParams.checkIn && searchParams.checkOut
            ? { checkIn: searchParams.checkIn, checkOut: searchParams.checkOut }
            : undefined
        }
        onConfirm={handleDateConfirm}
        onCancel={() => setShowCalendar(false)}
      />

      {/* 城市选择器 */}
      <CityPicker
        visible={showCityPicker}
        value={searchParams.city}
        locatedCity={locatedCity}
        onSelect={handleCitySelect}
        onClose={() => setShowCityPicker(false)}
      />
    </View>
  );
}

export default Home;
