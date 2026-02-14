/**
 * mini-app/src/pages/home/index.tsx
 * 首页/查询页
 */

import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Search, Location, Clock } from '@nutui/icons-react-taro';
import { useHotelStore } from '@/store/useHotelStore';
import { useLocation } from '@/hooks/useLocation';
import './index.scss';

function Home() {
  const { searchParams, setSearchParams } = useHotelStore();
  const { location, getLocation, loading: locationLoading } = useLocation();

  const [keyword, setKeyword] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  /**
   * 获取定位
   */
  const handleGetLocation = async () => {
    await getLocation();
    if (location) {
      // 定位成功，跳转到列表页
      Taro.navigateTo({
        url: '/pages/list/index',
      });
    }
  };

  /**
   * 搜索酒店
   */
  const handleSearch = () => {
    setSearchParams({
      keyword,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      location: location || undefined,
    });

    Taro.navigateTo({
      url: '/pages/list/index',
    });
  };

  /**
   * 选择城市
   */
  const handleSelectCity = () => {
    Taro.showToast({
      title: '城市选择功能开发中',
      icon: 'none',
    });
  };

  /**
   * 选择日期
   */
  const handleSelectDate = () => {
    setShowCalendar(true);
  };

  return (
    <View className="home-page">
      {/* 头部背景 */}
      <View className="home-header">
        <View className="header-content">
          <Text className="title">易宿酒店</Text>
          <Text className="subtitle">发现美好住宿</Text>
        </View>
      </View>

      {/* 搜索表单 */}
      <View className="search-form">
        {/* 目的地/关键词 */}
        <View className="form-item">
          <View className="item-label">
            <Location size="16" />
            <Text>目的地</Text>
          </View>
          <View className="item-input">
            <Input
              placeholder="输入目的地或酒店名称"
              value={keyword}
              onInput={e => setKeyword(e.detail.value)}
              placeholderClass="input-placeholder"
            />
            <View className="city-btn" onClick={handleSelectCity}>
              <Text>{searchParams.city || '全国'}</Text>
            </View>
          </View>
        </View>

        {/* 入住/离店日期 */}
        <View className="form-item" onClick={handleSelectDate}>
          <View className="item-label">
            <Clock size="16" />
            <Text>入住离店</Text>
          </View>
          <View className="item-input">
            <Text className="date-text">
              {searchParams.checkIn ? (
                <>
                  {searchParams.checkIn} 至 {searchParams.checkOut}
                  {'\n'}
                  <Text className="nights">
                    {searchParams.checkOut && searchParams.checkIn
                      ? Math.max(
                          1,
                          Math.floor(
                            ((new Date(searchParams.checkOut).getTime() -
                              new Date(searchParams.checkIn).getTime()) /
                              (1000 * 60 * 60 * 24))
                          )
                        )
                      : 1}
                    晚
                  </Text>
                </>
              ) : (
                <Text className="placeholder">选择入住和离店日期</Text>
              )}
            </Text>
          </View>
        </View>

        {/* 定位按钮 */}
        <View className="location-section">
          <Button
            className="location-btn"
            loading={locationLoading}
            onClick={handleGetLocation}
          >
            <Location size="14" />
            <Text>获取当前位置</Text>
          </Button>
        </View>

        {/* 搜索按钮 */}
        <Button type="primary" className="search-btn" onClick={handleSearch}>
          <Search size="18" />
          <Text>搜索酒店</Text>
        </Button>
      </View>

      {/* 热门推荐 */}
      <View className="hot-section">
        <View className="section-header">
          <Text className="section-title">热门推荐</Text>
        </View>
        <View className="hot-list">
          {['北京', '上海', '广州', '深圳', '杭州', '成都'].map((city, index) => (
            <View
              key={index}
              className="hot-item"
              onClick={() => {
                setSearchParams({ city });
                setKeyword('');
                Taro.navigateTo({
                  url: '/pages/list/index',
                });
              }}
            >
              <Text>{city}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default Home;
