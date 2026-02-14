/**
 * mini-app/src/app.config.ts
 * Taro应用配置文件
 */
import Pages from './app.config.pages';

export default {
  pages: Pages,
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '易宿酒店',
    navigationBarTextStyle: 'black',
    enablePullDownRefresh: false,
  },
  tabBar: {
    color: '#666',
    selectedColor: '#1890ff',
    backgroundColor: '#fafafa',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
      },
      {
        pagePath: 'pages/list/index',
        text: '列表',
      },
    ],
  },
};
