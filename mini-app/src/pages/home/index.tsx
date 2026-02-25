/**
 * mini-app/src/pages/home/index.tsx
 * 首页 - 蓝白简约风（优化版）
 */

import { useState, useEffect, useMemo } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useHotelStore } from '@/store/useHotelStore';
import { useLocation } from '@/hooks/useLocation';
import DateRangePicker from '@/components/DateRangePicker';
import CityPicker from '@/components/CityPicker';
import { getCityByLocation } from '@/utils/geocoder';
import { findCityByName, getCityDisplayName } from '@/data/cities';
import './index.scss';

// 平台检测
const isH5 = process.env.TARO_ENV === 'h5';

function Home() {
  const { searchParams, setSearchParams, locatedCity, setLocatedCity } = useHotelStore();
  const { location, getLocation, loading: locationLoading } = useLocation();

  const [keyword, setKeyword] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

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

  // 搜索酒店
  const handleSearch = () => {
    // 如果有关键词，使用关键词搜索（清除城市筛选）
    // 如果没有关键词但有城市，使用城市搜索
    setSearchParams({
      keyword: keyword || undefined,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      location: location || searchParams.location,
      city: keyword ? undefined : searchParams.city,
    });
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

  // 热门城市点击
  const handleCityClick = (city: string) => {
    handleCitySelect(city);
    Taro.navigateTo({ url: '/pages/list/index' });
  };

  return (
    <View className="home-page">
      {/* 顶部品牌区 */}
      <View className="home-page__header">
        <View className="home-page__brand">
          <View className="home-page__logo">
            <View className="home-page__logo-icon">
              <Text style={{ fontSize: '28px', color: '#fff' }}>易</Text>
            </View>
          </View>
          <Text className="home-page__title">易宿酒店</Text>
          <Text className="home-page__subtitle">发现美好住宿体验</Text>
        </View>
      </View>

      {/* 搜索卡片 */}
      <View className="home-page__search-card">
        {/* 目的地输入 */}
        <View className="home-page__form-item">
          <View className="home-page__label">
            <Text className="home-page__icon">📍</Text>
            <Text>目的地</Text>
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
