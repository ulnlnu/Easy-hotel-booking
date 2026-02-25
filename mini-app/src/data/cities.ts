/**
 * mini-app/src/data/cities.ts
 * 中国主要城市数据（含省份、经纬度范围用于离线定位）
 */

export interface CityData {
  name: string; // 城市名
  province: string; // 省份（直辖市与城市名相同）
  pinyin: string; // 全拼
  firstLetter: string; // 首字母
  /** 大致经纬度范围（用于离线判断） */
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

/** 直辖市列表 */
export const MUNICIPALITIES = ['北京', '上海', '天津', '重庆'];

/** 热门城市列表 */
export const HOT_CITIES: string[] = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '成都',
  '重庆',
  '西安',
  '南京',
  '苏州',
  '武汉',
  '三亚',
  '厦门',
  '青岛',
  '大连',
];

/** 城市数据（按首字母分组） */
export const CITY_GROUPS: Record<string, CityData[]> = {
  A: [
    { name: '安庆', province: '安徽', pinyin: 'anqing', firstLetter: 'A', bounds: { minLat: 29.8, maxLat: 30.7, minLng: 116.9, maxLng: 117.5 } },
    { name: '安阳', province: '河南', pinyin: 'anyang', firstLetter: 'A', bounds: { minLat: 35.8, maxLat: 36.3, minLng: 114.1, maxLng: 114.6 } },
    { name: '鞍山', province: '辽宁', pinyin: 'anshan', firstLetter: 'A', bounds: { minLat: 40.9, maxLat: 41.3, minLng: 122.8, maxLng: 123.2 } },
    { name: '安顺', province: '贵州', pinyin: 'anshun', firstLetter: 'A', bounds: { minLat: 25.8, maxLat: 26.4, minLng: 105.5, maxLng: 106.3 } },
  ],
  B: [
    { name: '北京', province: '北京', pinyin: 'beijing', firstLetter: 'B', bounds: { minLat: 39.4, maxLat: 41.1, minLng: 115.4, maxLng: 117.5 } },
    { name: '保定', province: '河北', pinyin: 'baoding', firstLetter: 'B', bounds: { minLat: 38.5, maxLat: 39.5, minLng: 114.5, maxLng: 115.5 } },
    { name: '包头', province: '内蒙古', pinyin: 'baotou', firstLetter: 'B', bounds: { minLat: 40.4, maxLat: 41.0, minLng: 109.5, maxLng: 110.3 } },
    { name: '北海', province: '广西', pinyin: 'beihai', firstLetter: 'B', bounds: { minLat: 21.2, maxLat: 21.6, minLng: 109.0, maxLng: 109.7 } },
    { name: '宝鸡', province: '陕西', pinyin: 'baoji', firstLetter: 'B', bounds: { minLat: 34.2, maxLat: 34.5, minLng: 106.9, maxLng: 107.4 } },
  ],
  C: [
    { name: '成都', province: '四川', pinyin: 'chengdu', firstLetter: 'C', bounds: { minLat: 30.2, maxLat: 31.0, minLng: 103.5, maxLng: 104.5 } },
    { name: '重庆', province: '重庆', pinyin: 'chongqing', firstLetter: 'C', bounds: { minLat: 28.0, maxLat: 32.2, minLng: 105.3, maxLng: 110.2 } },
    { name: '长沙', province: '湖南', pinyin: 'changsha', firstLetter: 'C', bounds: { minLat: 27.9, maxLat: 28.5, minLng: 112.8, maxLng: 113.5 } },
    { name: '长春', province: '吉林', pinyin: 'changchun', firstLetter: 'C', bounds: { minLat: 43.5, maxLat: 44.1, minLng: 125.1, maxLng: 125.9 } },
    { name: '常州', province: '江苏', pinyin: 'changzhou', firstLetter: 'C', bounds: { minLat: 31.5, maxLat: 32.0, minLng: 119.8, maxLng: 120.4 } },
    { name: '沧州', province: '河北', pinyin: 'cangzhou', firstLetter: 'C', bounds: { minLat: 37.9, maxLat: 38.5, minLng: 116.5, maxLng: 117.3 } },
    { name: '承德', province: '河北', pinyin: 'chengde', firstLetter: 'C', bounds: { minLat: 40.7, maxLat: 41.3, minLng: 117.8, maxLng: 118.4 } },
    { name: '朝阳', province: '辽宁', pinyin: 'chaoyang', firstLetter: 'C', bounds: { minLat: 41.2, maxLat: 41.7, minLng: 120.3, maxLng: 120.8 } },
  ],
  D: [
    { name: '大连', province: '辽宁', pinyin: 'dalian', firstLetter: 'D', bounds: { minLat: 38.7, maxLat: 39.3, minLng: 121.0, maxLng: 122.1 } },
    { name: '东莞', province: '广东', pinyin: 'dongguan', firstLetter: 'D', bounds: { minLat: 22.7, maxLat: 23.2, minLng: 113.6, maxLng: 114.4 } },
    { name: '大同', province: '山西', pinyin: 'datong', firstLetter: 'D', bounds: { minLat: 39.9, maxLat: 40.3, minLng: 113.0, maxLng: 113.8 } },
    { name: '大庆', province: '黑龙江', pinyin: 'daqing', firstLetter: 'D', bounds: { minLat: 45.8, maxLat: 46.5, minLng: 124.8, maxLng: 125.5 } },
    { name: '德州', province: '山东', pinyin: 'dezhou', firstLetter: 'D', bounds: { minLat: 37.2, maxLat: 37.8, minLng: 116.1, maxLng: 116.8 } },
    { name: '敦煌', province: '甘肃', pinyin: 'dunhuang', firstLetter: 'D', bounds: { minLat: 39.8, maxLat: 40.5, minLng: 94.5, maxLng: 95.0 } },
    { name: '大理', province: '云南', pinyin: 'dali', firstLetter: 'D', bounds: { minLat: 25.5, maxLat: 26.0, minLng: 99.8, maxLng: 100.5 } },
  ],
  E: [
    { name: '鄂尔多斯', province: '内蒙古', pinyin: 'eerduosi', firstLetter: 'E', bounds: { minLat: 39.0, maxLat: 40.0, minLng: 109.0, maxLng: 110.0 } },
    { name: '恩施', province: '湖北', pinyin: 'enshi', firstLetter: 'E', bounds: { minLat: 30.0, maxLat: 30.5, minLng: 109.2, maxLng: 109.7 } },
  ],
  F: [
    { name: '福州', province: '福建', pinyin: 'fuzhou', firstLetter: 'F', bounds: { minLat: 25.9, maxLat: 26.3, minLng: 119.1, maxLng: 119.8 } },
    { name: '佛山', province: '广东', pinyin: 'foshan', firstLetter: 'F', bounds: { minLat: 22.9, maxLat: 23.4, minLng: 112.8, maxLng: 113.5 } },
    { name: '抚顺', province: '辽宁', pinyin: 'fushun', firstLetter: 'F', bounds: { minLat: 41.7, maxLat: 42.1, minLng: 123.7, maxLng: 124.2 } },
    { name: '阜阳', province: '安徽', pinyin: 'fuyang', firstLetter: 'F', bounds: { minLat: 32.7, maxLat: 33.1, minLng: 115.7, maxLng: 116.2 } },
  ],
  G: [
    { name: '广州', province: '广东', pinyin: 'guangzhou', firstLetter: 'G', bounds: { minLat: 22.5, maxLat: 23.5, minLng: 113.0, maxLng: 114.0 } },
    { name: '贵阳', province: '贵州', pinyin: 'guiyang', firstLetter: 'G', bounds: { minLat: 26.2, maxLat: 26.8, minLng: 106.4, maxLng: 107.1 } },
    { name: '桂林', province: '广西', pinyin: 'guilin', firstLetter: 'G', bounds: { minLat: 24.9, maxLat: 25.5, minLng: 110.0, maxLng: 110.7 } },
    { name: '赣州', province: '江西', pinyin: 'ganzhou', firstLetter: 'G', bounds: { minLat: 25.6, maxLat: 26.1, minLng: 114.7, maxLng: 115.2 } },
    { name: '广元', province: '四川', pinyin: 'guangyuan', firstLetter: 'G', bounds: { minLat: 32.3, maxLat: 32.7, minLng: 105.7, maxLng: 106.2 } },
  ],
  H: [
    { name: '杭州', province: '浙江', pinyin: 'hangzhou', firstLetter: 'H', bounds: { minLat: 29.9, maxLat: 30.6, minLng: 119.8, maxLng: 120.7 } },
    { name: '哈尔滨', province: '黑龙江', pinyin: 'haerbin', firstLetter: 'H', bounds: { minLat: 45.4, maxLat: 46.1, minLng: 126.3, maxLng: 127.2 } },
    { name: '合肥', province: '安徽', pinyin: 'hefei', firstLetter: 'H', bounds: { minLat: 31.5, maxLat: 32.1, minLng: 117.0, maxLng: 117.6 } },
    { name: '海口', province: '海南', pinyin: 'haikou', firstLetter: 'H', bounds: { minLat: 19.9, maxLat: 20.3, minLng: 110.1, maxLng: 110.7 } },
    { name: '呼和浩特', province: '内蒙古', pinyin: 'huhehaote', firstLetter: 'H', bounds: { minLat: 40.5, maxLat: 41.2, minLng: 111.2, maxLng: 112.2 } },
    { name: '邯郸', province: '河北', pinyin: 'handan', firstLetter: 'H', bounds: { minLat: 36.4, maxLat: 36.9, minLng: 114.2, maxLng: 115.0 } },
    { name: '衡阳', province: '湖南', pinyin: 'hengyang', firstLetter: 'H', bounds: { minLat: 26.7, maxLat: 27.1, minLng: 112.3, maxLng: 112.9 } },
    { name: '惠州', province: '广东', pinyin: 'huizhou', firstLetter: 'H', bounds: { minLat: 22.8, maxLat: 23.3, minLng: 114.2, maxLng: 114.8 } },
    { name: '汉中', province: '陕西', pinyin: 'hanzhong', firstLetter: 'H', bounds: { minLat: 32.9, maxLat: 33.4, minLng: 106.8, maxLng: 107.3 } },
    { name: '湖州', province: '浙江', pinyin: 'huzhou', firstLetter: 'H', bounds: { minLat: 30.6, maxLat: 31.0, minLng: 119.9, maxLng: 120.4 } },
    { name: '菏泽', province: '山东', pinyin: 'heze', firstLetter: 'H', bounds: { minLat: 35.0, maxLat: 35.6, minLng: 115.2, maxLng: 115.9 } },
  ],
  J: [
    { name: '济南', province: '山东', pinyin: 'jinan', firstLetter: 'J', bounds: { minLat: 36.4, maxLat: 37.0, minLng: 116.7, maxLng: 117.5 } },
    { name: '嘉兴', province: '浙江', pinyin: 'jiaxing', firstLetter: 'J', bounds: { minLat: 30.5, maxLat: 31.1, minLng: 120.5, maxLng: 121.2 } },
    { name: '金华', province: '浙江', pinyin: 'jinhua', firstLetter: 'J', bounds: { minLat: 28.8, maxLat: 29.4, minLng: 119.5, maxLng: 120.2 } },
    { name: '江门', province: '广东', pinyin: 'jiangmen', firstLetter: 'J', bounds: { minLat: 22.3, maxLat: 22.7, minLng: 112.9, maxLng: 113.3 } },
    { name: '荆州', province: '湖北', pinyin: 'jingzhou', firstLetter: 'J', bounds: { minLat: 30.1, maxLat: 30.6, minLng: 111.9, maxLng: 112.5 } },
    { name: '吉林', province: '吉林', pinyin: 'jilin', firstLetter: 'J', bounds: { minLat: 43.6, maxLat: 44.1, minLng: 126.3, maxLng: 127.0 } },
    { name: '济宁', province: '山东', pinyin: 'jining', firstLetter: 'J', bounds: { minLat: 35.2, maxLat: 35.7, minLng: 116.4, maxLng: 117.1 } },
    { name: '景德镇', province: '江西', pinyin: 'jingdezhen', firstLetter: 'J', bounds: { minLat: 29.1, maxLat: 29.5, minLng: 117.0, maxLng: 117.5 } },
    { name: '酒泉', province: '甘肃', pinyin: 'jiuquan', firstLetter: 'J', bounds: { minLat: 39.6, maxLat: 40.1, minLng: 98.3, maxLng: 99.0 } },
    { name: '揭阳', province: '广东', pinyin: 'jieyang', firstLetter: 'J', bounds: { minLat: 23.4, maxLat: 23.8, minLng: 116.2, maxLng: 116.8 } },
  ],
  K: [
    { name: '昆明', province: '云南', pinyin: 'kunming', firstLetter: 'K', bounds: { minLat: 24.6, maxLat: 25.3, minLng: 102.4, maxLng: 103.2 } },
    { name: '开封', province: '河南', pinyin: 'kaifeng', firstLetter: 'K', bounds: { minLat: 34.7, maxLat: 35.1, minLng: 114.1, maxLng: 114.7 } },
    { name: '喀什', province: '新疆', pinyin: 'kashi', firstLetter: 'K', bounds: { minLat: 39.3, maxLat: 39.7, minLng: 75.8, maxLng: 76.3 } },
  ],
  L: [
    { name: '兰州', province: '甘肃', pinyin: 'lanzhou', firstLetter: 'L', bounds: { minLat: 35.9, maxLat: 36.3, minLng: 103.5, maxLng: 104.2 } },
    { name: '洛阳', province: '河南', pinyin: 'luoyang', firstLetter: 'L', bounds: { minLat: 34.5, maxLat: 35.0, minLng: 112.2, maxLng: 112.9 } },
    { name: '连云港', province: '江苏', pinyin: 'lianyungang', firstLetter: 'L', bounds: { minLat: 34.4, maxLat: 34.9, minLng: 119.0, maxLng: 119.6 } },
    { name: '临沂', province: '山东', pinyin: 'linyi', firstLetter: 'L', bounds: { minLat: 34.8, maxLat: 35.4, minLng: 118.1, maxLng: 118.8 } },
    { name: '柳州', province: '广西', pinyin: 'liuzhou', firstLetter: 'L', bounds: { minLat: 24.1, maxLat: 24.7, minLng: 109.2, maxLng: 109.8 } },
    { name: '泸州', province: '四川', pinyin: 'luzhou', firstLetter: 'L', bounds: { minLat: 28.7, maxLat: 29.2, minLng: 105.2, maxLng: 105.8 } },
    { name: '廊坊', province: '河北', pinyin: 'langfang', firstLetter: 'L', bounds: { minLat: 39.3, maxLat: 39.8, minLng: 116.5, maxLng: 117.1 } },
    { name: '拉萨', province: '西藏', pinyin: 'lasa', firstLetter: 'L', bounds: { minLat: 29.5, maxLat: 30.1, minLng: 90.9, maxLng: 91.3 } },
    { name: '丽水', province: '浙江', pinyin: 'lishui', firstLetter: 'L', bounds: { minLat: 28.3, maxLat: 28.7, minLng: 119.8, maxLng: 120.4 } },
    { name: '丽江', province: '云南', pinyin: 'lijiang', firstLetter: 'L', bounds: { minLat: 26.7, maxLat: 27.2, minLng: 100.0, maxLng: 100.6 } },
  ],
  M: [
    { name: '绵阳', province: '四川', pinyin: 'mianyang', firstLetter: 'M', bounds: { minLat: 31.3, maxLat: 31.8, minLng: 104.5, maxLng: 105.1 } },
    { name: '茂名', province: '广东', pinyin: 'maoming', firstLetter: 'M', bounds: { minLat: 21.4, maxLat: 21.9, minLng: 110.7, maxLng: 111.3 } },
    { name: '牡丹江', province: '黑龙江', pinyin: 'mudanjiang', firstLetter: 'M', bounds: { minLat: 44.3, maxLat: 44.8, minLng: 129.4, maxLng: 130.1 } },
  ],
  N: [
    { name: '南京', province: '江苏', pinyin: 'nanjing', firstLetter: 'N', bounds: { minLat: 31.7, maxLat: 32.4, minLng: 118.4, maxLng: 119.3 } },
    { name: '南昌', province: '江西', pinyin: 'nanchang', firstLetter: 'N', bounds: { minLat: 28.5, maxLat: 29.0, minLng: 115.7, maxLng: 116.3 } },
    { name: '宁波', province: '浙江', pinyin: 'ningbo', firstLetter: 'N', bounds: { minLat: 29.6, maxLat: 30.1, minLng: 121.2, maxLng: 122.0 } },
    { name: '南宁', province: '广西', pinyin: 'nanning', firstLetter: 'N', bounds: { minLat: 22.6, maxLat: 23.1, minLng: 108.1, maxLng: 108.8 } },
    { name: '南通', province: '江苏', pinyin: 'nantong', firstLetter: 'N', bounds: { minLat: 31.8, maxLat: 32.3, minLng: 120.6, maxLng: 121.3 } },
    { name: '南阳', province: '河南', pinyin: 'nanyang', firstLetter: 'N', bounds: { minLat: 32.8, maxLat: 33.3, minLng: 112.3, maxLng: 113.0 } },
  ],
  P: [
    { name: '平顶山', province: '河南', pinyin: 'pingdingshan', firstLetter: 'P', bounds: { minLat: 33.6, maxLat: 34.1, minLng: 113.0, maxLng: 113.7 } },
    { name: '濮阳', province: '河南', pinyin: 'puyang', firstLetter: 'P', bounds: { minLat: 35.7, maxLat: 36.2, minLng: 114.9, maxLng: 115.6 } },
    { name: '莆田', province: '福建', pinyin: 'putian', firstLetter: 'P', bounds: { minLat: 25.2, maxLat: 25.7, minLng: 118.9, maxLng: 119.5 } },
    { name: '攀枝花', province: '四川', pinyin: 'panzhihua', firstLetter: 'P', bounds: { minLat: 26.4, maxLat: 26.8, minLng: 101.5, maxLng: 102.1 } },
  ],
  Q: [
    { name: '青岛', province: '山东', pinyin: 'qingdao', firstLetter: 'Q', bounds: { minLat: 35.8, maxLat: 36.4, minLng: 119.8, maxLng: 120.8 } },
    { name: '泉州', province: '福建', pinyin: 'quanzhou', firstLetter: 'Q', bounds: { minLat: 24.7, maxLat: 25.3, minLng: 118.3, maxLng: 119.1 } },
    { name: '秦皇岛', province: '河北', pinyin: 'qinhuangdao', firstLetter: 'Q', bounds: { minLat: 39.7, maxLat: 40.2, minLng: 119.3, maxLng: 119.9 } },
    { name: '齐齐哈尔', province: '黑龙江', pinyin: 'qiqihaer', firstLetter: 'Q', bounds: { minLat: 47.1, maxLat: 47.6, minLng: 123.7, maxLng: 124.4 } },
    { name: '清远', province: '广东', pinyin: 'qingyuan', firstLetter: 'Q', bounds: { minLat: 23.5, maxLat: 24.0, minLng: 113.0, maxLng: 113.7 } },
    { name: '曲靖', province: '云南', pinyin: 'qujing', firstLetter: 'Q', bounds: { minLat: 25.3, maxLat: 25.8, minLng: 103.6, maxLng: 104.2 } },
    { name: '衢州', province: '浙江', pinyin: 'quzhou', firstLetter: 'Q', bounds: { minLat: 28.8, maxLat: 29.2, minLng: 118.7, maxLng: 119.2 } },
  ],
  R: [
    { name: '日照', province: '山东', pinyin: 'rizhao', firstLetter: 'R', bounds: { minLat: 35.2, maxLat: 35.7, minLng: 119.2, maxLng: 119.8 } },
    { name: '日喀则', province: '西藏', pinyin: 'rikaze', firstLetter: 'R', bounds: { minLat: 29.1, maxLat: 29.5, minLng: 88.7, maxLng: 89.2 } },
  ],
  S: [
    { name: '上海', province: '上海', pinyin: 'shanghai', firstLetter: 'S', bounds: { minLat: 30.7, maxLat: 31.5, minLng: 120.9, maxLng: 122.0 } },
    { name: '深圳', province: '广东', pinyin: 'shenzhen', firstLetter: 'S', bounds: { minLat: 22.4, maxLat: 22.9, minLng: 113.7, maxLng: 114.6 } },
    { name: '苏州', province: '江苏', pinyin: 'suzhou', firstLetter: 'S', bounds: { minLat: 31.1, maxLat: 31.6, minLng: 120.3, maxLng: 121.0 } },
    { name: '沈阳', province: '辽宁', pinyin: 'shenyang', firstLetter: 'S', bounds: { minLat: 41.6, maxLat: 42.2, minLng: 123.1, maxLng: 123.9 } },
    { name: '石家庄', province: '河北', pinyin: 'shijiazhuang', firstLetter: 'S', bounds: { minLat: 37.9, maxLat: 38.6, minLng: 114.3, maxLng: 115.1 } },
    { name: '三亚', province: '海南', pinyin: 'sanya', firstLetter: 'S', bounds: { minLat: 18.1, maxLat: 18.6, minLng: 109.3, maxLng: 109.9 } },
    { name: '绍兴', province: '浙江', pinyin: 'shaoxing', firstLetter: 'S', bounds: { minLat: 29.8, maxLat: 30.2, minLng: 120.3, maxLng: 120.9 } },
    { name: '汕头', province: '广东', pinyin: 'shantou', firstLetter: 'S', bounds: { minLat: 23.2, maxLat: 23.7, minLng: 116.4, maxLng: 117.0 } },
    { name: '宿迁', province: '江苏', pinyin: 'suqian', firstLetter: 'S', bounds: { minLat: 33.8, maxLat: 34.3, minLng: 118.1, maxLng: 118.8 } },
    { name: '上饶', province: '江西', pinyin: 'shangrao', firstLetter: 'S', bounds: { minLat: 28.3, maxLat: 28.8, minLng: 117.8, maxLng: 118.4 } },
    { name: '十堰', province: '湖北', pinyin: 'shiyan', firstLetter: 'S', bounds: { minLat: 32.4, maxLat: 32.9, minLng: 110.6, maxLng: 111.3 } },
  ],
  T: [
    { name: '天津', province: '天津', pinyin: 'tianjin', firstLetter: 'T', bounds: { minLat: 38.6, maxLat: 39.6, minLng: 116.7, maxLng: 118.0 } },
    { name: '太原', province: '山西', pinyin: 'taiyuan', firstLetter: 'T', bounds: { minLat: 37.6, maxLat: 38.2, minLng: 112.3, maxLng: 113.1 } },
    { name: '唐山', province: '河北', pinyin: 'tangshan', firstLetter: 'T', bounds: { minLat: 39.4, maxLat: 40.0, minLng: 118.0, maxLng: 118.8 } },
    { name: '台州', province: '浙江', pinyin: 'taizhou', firstLetter: 'T', bounds: { minLat: 28.5, maxLat: 29.0, minLng: 121.0, maxLng: 121.7 } },
    { name: '泰安', province: '山东', pinyin: 'taian', firstLetter: 'T', bounds: { minLat: 36.0, maxLat: 36.5, minLng: 117.0, maxLng: 117.7 } },
    { name: '通化', province: '吉林', pinyin: 'tonghua', firstLetter: 'T', bounds: { minLat: 41.6, maxLat: 42.1, minLng: 125.7, maxLng: 126.3 } },
    { name: '铜仁', province: '贵州', pinyin: 'tongren', firstLetter: 'T', bounds: { minLat: 27.6, maxLat: 28.1, minLng: 108.8, maxLng: 109.4 } },
  ],
  W: [
    { name: '武汉', province: '湖北', pinyin: 'wuhan', firstLetter: 'W', bounds: { minLat: 30.1, maxLat: 30.9, minLng: 113.7, maxLng: 114.6 } },
    { name: '无锡', province: '江苏', pinyin: 'wuxi', firstLetter: 'W', bounds: { minLat: 31.3, maxLat: 31.8, minLng: 120.0, maxLng: 120.7 } },
    { name: '温州', province: '浙江', pinyin: 'wenzhou', firstLetter: 'W', bounds: { minLat: 27.8, maxLat: 28.4, minLng: 120.4, maxLng: 121.1 } },
    { name: '乌鲁木齐', province: '新疆', pinyin: 'wulumuqi', firstLetter: 'W', bounds: { minLat: 43.6, maxLat: 44.2, minLng: 87.3, maxLng: 88.0 } },
    { name: '潍坊', province: '山东', pinyin: 'weifang', firstLetter: 'W', bounds: { minLat: 36.5, maxLat: 37.1, minLng: 118.8, maxLng: 119.6 } },
    { name: '威海', province: '山东', pinyin: 'weihai', firstLetter: 'W', bounds: { minLat: 37.3, maxLat: 37.8, minLng: 122.0, maxLng: 122.6 } },
    { name: '芜湖', province: '安徽', pinyin: 'wuhu', firstLetter: 'W', bounds: { minLat: 31.2, maxLat: 31.7, minLng: 118.2, maxLng: 118.8 } },
    { name: '梧州', province: '广西', pinyin: 'wuzhou', firstLetter: 'W', bounds: { minLat: 23.4, maxLat: 23.8, minLng: 111.2, maxLng: 111.8 } },
  ],
  X: [
    { name: '西安', province: '陕西', pinyin: 'xian', firstLetter: 'X', bounds: { minLat: 33.9, maxLat: 34.6, minLng: 108.7, maxLng: 109.2 } },
    { name: '厦门', province: '福建', pinyin: 'xiamen', firstLetter: 'X', bounds: { minLat: 24.3, maxLat: 24.9, minLng: 118.0, maxLng: 118.6 } },
    { name: '徐州', province: '江苏', pinyin: 'xuzhou', firstLetter: 'X', bounds: { minLat: 34.0, maxLat: 34.6, minLng: 117.0, maxLng: 117.8 } },
    { name: '襄阳', province: '湖北', pinyin: 'xiangyang', firstLetter: 'X', bounds: { minLat: 31.9, maxLat: 32.5, minLng: 111.9, maxLng: 112.6 } },
    { name: '湘潭', province: '湖南', pinyin: 'xiangtan', firstLetter: 'X', bounds: { minLat: 27.7, maxLat: 28.1, minLng: 112.7, maxLng: 113.2 } },
    { name: '新乡', province: '河南', pinyin: 'xinxiang', firstLetter: 'X', bounds: { minLat: 35.1, maxLat: 35.6, minLng: 113.6, maxLng: 114.3 } },
    { name: '咸阳', province: '陕西', pinyin: 'xianyang', firstLetter: 'X', bounds: { minLat: 34.2, maxLat: 34.7, minLng: 108.5, maxLng: 109.1 } },
    { name: '西宁', province: '青海', pinyin: 'xining', firstLetter: 'X', bounds: { minLat: 36.5, maxLat: 37.0, minLng: 101.5, maxLng: 102.1 } },
    { name: '西双版纳', province: '云南', pinyin: 'xishuangbanna', firstLetter: 'X', bounds: { minLat: 21.8, maxLat: 22.4, minLng: 100.6, maxLng: 101.3 } },
    { name: '信阳', province: '河南', pinyin: 'xinyang', firstLetter: 'X', bounds: { minLat: 32.0, maxLat: 32.5, minLng: 114.0, maxLng: 114.7 } },
    { name: '许昌', province: '河南', pinyin: 'xuchang', firstLetter: 'X', bounds: { minLat: 33.9, maxLat: 34.4, minLng: 113.7, maxLng: 114.3 } },
  ],
  Y: [
    { name: '烟台', province: '山东', pinyin: 'yantai', firstLetter: 'Y', bounds: { minLat: 37.2, maxLat: 37.8, minLng: 120.9, maxLng: 121.8 } },
    { name: '扬州', province: '江苏', pinyin: 'yangzhou', firstLetter: 'Y', bounds: { minLat: 32.2, maxLat: 32.7, minLng: 119.2, maxLng: 119.9 } },
    { name: '银川', province: '宁夏', pinyin: 'yinchuan', firstLetter: 'Y', bounds: { minLat: 38.2, maxLat: 38.7, minLng: 106.0, maxLng: 106.7 } },
    { name: '宜昌', province: '湖北', pinyin: 'yichang', firstLetter: 'Y', bounds: { minLat: 30.5, maxLat: 31.1, minLng: 111.0, maxLng: 111.7 } },
    { name: '岳阳', province: '湖南', pinyin: 'yueyang', firstLetter: 'Y', bounds: { minLat: 29.2, maxLat: 29.7, minLng: 113.0, maxLng: 113.6 } },
    { name: '盐城', province: '江苏', pinyin: 'yancheng', firstLetter: 'Y', bounds: { minLat: 33.2, maxLat: 33.8, minLng: 120.0, maxLng: 120.7 } },
    { name: '运城', province: '山西', pinyin: 'yuncheng', firstLetter: 'Y', bounds: { minLat: 35.0, maxLat: 35.5, minLng: 110.8, maxLng: 111.5 } },
    { name: '榆林', province: '陕西', pinyin: 'yulin', firstLetter: 'Y', bounds: { minLat: 38.0, maxLat: 38.5, minLng: 109.5, maxLng: 110.2 } },
    { name: '玉林', province: '广西', pinyin: 'yulin', firstLetter: 'Y', bounds: { minLat: 22.5, maxLat: 23.0, minLng: 110.0, maxLng: 110.7 } },
    { name: '宜宾', province: '四川', pinyin: 'yibin', firstLetter: 'Y', bounds: { minLat: 28.6, maxLat: 29.1, minLng: 104.3, maxLng: 105.0 } },
    { name: '阳朔', province: '广西', pinyin: 'yangshuo', firstLetter: 'Y', bounds: { minLat: 24.7, maxLat: 25.1, minLng: 110.3, maxLng: 110.9 } },
  ],
  Z: [
    { name: '郑州', province: '河南', pinyin: 'zhengzhou', firstLetter: 'Z', bounds: { minLat: 34.5, maxLat: 35.0, minLng: 113.4, maxLng: 114.2 } },
    { name: '珠海', province: '广东', pinyin: 'zhuhai', firstLetter: 'Z', bounds: { minLat: 22.0, maxLat: 22.5, minLng: 113.4, maxLng: 114.1 } },
    { name: '中山', province: '广东', pinyin: 'zhongshan', firstLetter: 'Z', bounds: { minLat: 22.3, maxLat: 22.8, minLng: 113.2, maxLng: 113.8 } },
    { name: '株洲', province: '湖南', pinyin: 'zhuzhou', firstLetter: 'Z', bounds: { minLat: 27.7, maxLat: 28.2, minLng: 113.0, maxLng: 113.7 } },
    { name: '淄博', province: '山东', pinyin: 'zibo', firstLetter: 'Z', bounds: { minLat: 36.4, maxLat: 37.0, minLng: 117.6, maxLng: 118.4 } },
    { name: '湛江', province: '广东', pinyin: 'zhanjiang', firstLetter: 'Z', bounds: { minLat: 20.9, maxLat: 21.4, minLng: 110.2, maxLng: 110.9 } },
    { name: '张家界', province: '湖南', pinyin: 'zhangjiajie', firstLetter: 'Z', bounds: { minLat: 29.1, maxLat: 29.6, minLng: 110.2, maxLng: 110.8 } },
    { name: '漳州', province: '福建', pinyin: 'zhangzhou', firstLetter: 'Z', bounds: { minLat: 24.3, maxLat: 24.8, minLng: 117.5, maxLng: 118.2 } },
    { name: '遵义', province: '贵州', pinyin: 'zunyi', firstLetter: 'Z', bounds: { minLat: 27.5, maxLat: 28.0, minLng: 106.7, maxLng: 107.3 } },
    { name: '舟山', province: '浙江', pinyin: 'zhoushan', firstLetter: 'Z', bounds: { minLat: 29.8, maxLat: 30.3, minLng: 122.0, maxLng: 122.6 } },
    { name: '驻马店', province: '河南', pinyin: 'zhumadian', firstLetter: 'Z', bounds: { minLat: 32.9, maxLat: 33.4, minLng: 113.9, maxLng: 114.6 } },
    { name: '肇庆', province: '广东', pinyin: 'zhaoqing', firstLetter: 'Z', bounds: { minLat: 23.0, maxLat: 23.5, minLng: 112.3, maxLng: 113.0 } },
  ],
};

/** 获取所有城市列表（扁平化） */
export const getAllCities = (): CityData[] => {
  const cities: CityData[] = [];
  Object.values(CITY_GROUPS).forEach(group => {
    cities.push(...group);
  });
  return cities;
};

/** 按城市名查找 */
export const findCityByName = (name: string): CityData | undefined => {
  return getAllCities().find(city => city.name === name);
};

/** 获取字母索引列表 */
export const getAlphabetList = (): string[] => {
  return Object.keys(CITY_GROUPS).sort();
};

/** 判断是否为直辖市 */
export const isMunicipality = (cityName: string): boolean => {
  return MUNICIPALITIES.includes(cityName);
};

/**
 * 获取城市显示名称
 * 直辖市显示: "北京市" 或 "上海"
 * 普通城市显示: "广东·深圳"
 */
export const getCityDisplayName = (city: string, province?: string): string => {
  if (isMunicipality(city)) {
    return `${city}市`;
  }
  if (province && province !== city) {
    return `${province}·${city}`;
  }
  return city;
};
