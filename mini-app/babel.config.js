// babel.config.js
// Taro 项目的 Babel 配置

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: ['> 1%', 'last 2 versions', 'not ie <= 11']
      }
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'  // 自动导入 React
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    // 开发环境启用 React Fast Refresh
    isDev && require.resolve('react-refresh/babel')
  ].filter(Boolean)
};
