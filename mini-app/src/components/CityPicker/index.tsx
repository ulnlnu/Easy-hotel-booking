/**
 * mini-app/src/components/CityPicker/index.tsx
 * 城市选择器弹窗组件
 */

import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { HOT_CITIES, CITY_GROUPS, getAlphabetList, type CityData } from '@/data/cities';
import './index.scss';

// 平台检测
const isH5 = process.env.TARO_ENV === 'h5';

interface CityPickerProps {
  visible: boolean;
  /** 当前选中的城市 */
  value?: string;
  /** 定位识别的城市信息（通过GPS获得） */
  locatedCity?: {
    city: string;
    province: string;
    displayName: string;
  } | null;
  /** 选择城市回调 */
  onSelect: (city: string) => void;
  /** 关闭回调 */
  onClose: () => void;
}

function CityPicker({ visible, value, locatedCity, onSelect, onClose }: CityPickerProps) {
  // 获取定位城市的显示名称
  const locatedCityName = locatedCity?.city || null;
  const locatedCityDisplay = locatedCity?.displayName || locatedCity?.city || null;
  const [searchKeyword, setSearchKeyword] = useState('');
  const [scrollIntoView, setScrollIntoView] = useState('');

  // 字母索引列表
  const alphabetList = getAlphabetList();

  // 搜索结果
  const searchResults = useMemo(() => {
    if (!searchKeyword.trim()) return [];

    const keyword = searchKeyword.toLowerCase().trim();
    const results: CityData[] = [];

    Object.values(CITY_GROUPS).forEach(cities => {
      cities.forEach(city => {
        // 匹配城市名或拼音
        if (
          city.name.includes(keyword) ||
          city.pinyin.includes(keyword) ||
          city.firstLetter.toLowerCase() === keyword
        ) {
          results.push(city);
        }
      });
    });

    return results.slice(0, 20); // 限制结果数量
  }, [searchKeyword]);

  // 滚动到指定字母分组
  const scrollToLetter = (letter: string) => {
    // 使用时间戳确保每次都能触发滚动（相同值不会触发）
    setScrollIntoView(`section-${letter}-${Date.now()}`);
    // 短暂延迟后设置正确的ID
    setTimeout(() => {
      setScrollIntoView(`section-${letter}`);
    }, 50);
  };

  // 选择城市
  const handleSelectCity = (city: string) => {
    onSelect(city);
    onClose();
  };

  // 关闭弹窗
  const handleClose = () => {
    setSearchKeyword('');
    onClose();
  };

  if (!visible) return null;

  return (
    <View className="citypicker-container">
      {/* 遮罩层 */}
      <View className="citypicker-mask" onClick={handleClose} />

      {/* 弹窗内容 */}
      <View className="citypicker-content">
        {/* 顶部栏 */}
        <View className="citypicker-header">
          <Text className="citypicker-title">选择城市</Text>
          <View className="citypicker-close" onClick={handleClose}>
            <Text>×</Text>
          </View>
        </View>

        {/* 搜索框 */}
        <View className="citypicker-search">
          <Text className="citypicker-search-icon">🔍</Text>
          {isH5 ? (
            <input
              className="citypicker-search-input"
              placeholder="搜索城市（支持拼音）"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
            />
          ) : (
            <Input
              className="citypicker-search-input"
              placeholder="搜索城市（支持拼音）"
              placeholderClass="citypicker-search-placeholder"
              value={searchKeyword}
              onInput={e => setSearchKeyword(e.detail.value)}
            />
          )}
          {searchKeyword && (
            <View className="citypicker-search-clear" onClick={() => setSearchKeyword('')}>
              <Text>×</Text>
            </View>
          )}
        </View>

        {/* 内容区域 */}
        <ScrollView
          scrollY
          className="citypicker-body"
          scrollIntoView={scrollIntoView}
          scrollWithAnimation
        >
          {/* 搜索结果 */}
          {searchKeyword.trim() && (
            <View className="citypicker-section">
              <View className="citypicker-section-title">
                <Text>搜索结果</Text>
              </View>
              <View className="citypicker-city-list">
                {searchResults.length > 0 ? (
                  searchResults.map(city => (
                    <View
                      key={city.name}
                      className={`citypicker-city-item ${value === city.name ? 'active' : ''}`}
                      onClick={() => handleSelectCity(city.name)}
                    >
                      <Text>{city.name}</Text>
                    </View>
                  ))
                ) : (
                  <View className="citypicker-empty">
                    <Text>未找到匹配的城市</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* 无搜索时显示完整列表 */}
          {!searchKeyword.trim() && (
            <>
              {/* 定位城市 */}
              {locatedCityDisplay && (
                <View className="citypicker-section">
                  <View className="citypicker-section-title">
                    <Text className="citypicker-location-icon">📍</Text>
                    <Text>当前定位</Text>
                  </View>
                  <View className="citypicker-city-list">
                    <View
                      className={`citypicker-city-item located ${value === locatedCityName ? 'active' : ''}`}
                      onClick={() => handleSelectCity(locatedCityName!)}
                    >
                      <Text>{locatedCityDisplay}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* 热门城市 */}
              <View className="citypicker-section">
                <View className="citypicker-section-title">
                  <Text>热门城市</Text>
                </View>
                <View className="citypicker-hot-grid">
                  {HOT_CITIES.map(city => (
                    <View
                      key={city}
                      className={`citypicker-hot-item ${value === city ? 'active' : ''}`}
                      onClick={() => handleSelectCity(city)}
                    >
                      <Text>{city}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 字母分组城市列表 */}
              {alphabetList.map(letter => (
                <View key={letter} id={`section-${letter}`} className="citypicker-section">
                  <View className="citypicker-section-title citypicker-letter-title">
                    <Text>{letter}</Text>
                  </View>
                  <View className="citypicker-city-list">
                    {CITY_GROUPS[letter]?.map(city => (
                      <View
                        key={city.name}
                        className={`citypicker-city-item ${value === city.name ? 'active' : ''}`}
                        onClick={() => handleSelectCity(city.name)}
                      >
                        <Text>{city.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>

        {/* 右侧字母索引（无搜索时显示） */}
        {!searchKeyword.trim() && (
          <View className="citypicker-alphabet">
            {alphabetList.map(letter => (
              <View
                key={letter}
                className="citypicker-alphabet-item"
                onClick={() => scrollToLetter(letter)}
              >
                <Text>{letter}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default CityPicker;
