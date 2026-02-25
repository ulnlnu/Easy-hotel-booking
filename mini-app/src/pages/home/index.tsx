/**
 * mini-app/src/pages/home/index.tsx
 * 首页 - 蓝白简约风（优化版）
 */

import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useHotelStore } from '@/store/useHotelStore';
import { useLocation } from '@/hooks/useLocation';
import DateRangePicker from '@/components/DateRangePicker';
import './index.scss';

// 平台检测
const isH5 = process.env.TARO_ENV === 'h5';

function Home() {
  const { searchParams, setSearchParams } = useHotelStore();
  const { location, getLocation, loading: locationLoading } = useLocation();

  const [keyword, setKeyword] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  // 计算入住天数
  const nights = searchParams.checkIn && searchParams.checkOut
    ? Math.max(1, Math.floor(
        (new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24)
      ))
    : 1;

  // 获取定位
  const handleGetLocation = async () => {
    await getLocation();
    if (location) {
      Taro.showToast({ title: '定位成功', icon: 'success' });
      setSearchParams({ ...searchParams, location });
    } else {
      Taro.showToast({ title: '定位失败，请检查权限', icon: 'none' });
    }
  };

  // 搜索酒店（清除之前的城市筛选）
  const handleSearch = () => {
    setSearchParams({
      keyword,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      location: location || searchParams.location,
      city: undefined, // 清除城市筛选，使用关键词搜索
    });
    Taro.navigateTo({ url: '/pages/list/index' });
  };

  // 选择城市
  const handleSelectCity = () => {
    Taro.showToast({ title: '城市选择功能开发中', icon: 'none' });
  };

  // 日期选择
  const handleDateConfirm = (data: { checkIn: string; checkOut: string; nights: number }) => {
    setSearchParams({ checkIn: data.checkIn, checkOut: data.checkOut });
    setShowCalendar(false);
  };

  // 热门城市点击
  const handleCityClick = (city: string) => {
    setSearchParams({ city });
    setKeyword('');
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
              <Text>{searchParams.city || '全国'}</Text>
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
          <Text>{location ? '已获取位置' : '获取当前位置'}</Text>
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
    </View>
  );
}

export default Home;
