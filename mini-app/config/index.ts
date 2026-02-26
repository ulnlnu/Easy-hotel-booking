import path from 'path';

// 根据编译平台设置不同的输出目录
const outputRoot = process.env.TARO_ENV === 'h5' ? 'dist/h5' : 'dist/weapp';

const config = {
  projectName: 'trip-mini-app',
  date: '2025-1-1',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1
  },
  sourceRoot: 'src',
  outputRoot,
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false
    }
  },
  cache: {
    enable: false
  },
  // 小程序端：禁用 pxtransform，使用 vw 单位（与 H5 统一）
  mini: {
    postcss: {
      pxtransform: {
        enable: false  // 禁用转换，保留 vw 单位
      }
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@', path.resolve(__dirname, '..', 'src'));
      chain.resolve.alias.set('@shared', path.resolve(__dirname, '../../shared'));

      // 让 webpack 处理 shared 目录中的 TypeScript 文件
      chain.module.rule('shared-typescript')
        .test(/\.(ts|tsx)$/)
        .include.add(path.resolve(__dirname, '../../shared'))
        .end()
        .use('babel-loader')
        .loader('babel-loader')
        .options({
          presets: [
            ['@babel/preset-env', { targets: { browsers: ['> 1%', 'last 2 versions', 'not ie <= 11'] } }],
            ['@babel/preset-react', { runtime: 'automatic' }],
            '@babel/preset-typescript'
          ]
        });
    }
  },
  // H5端：禁用 pxtransform，直接使用标准 CSS 尺寸
  h5: {
    port: 10086,
    publicPath: '/',
    staticDirectory: 'static',
    htmlPluginOption: {
      template: path.join(__dirname, '../src/index.html')
    },
    router: {
      mode: 'browser'
    },
    devServer: {
      port: 10086,
      host: 'localhost',
      hot: true,
      open: false,
      historyApiFallback: true,  // 支持 SPA 路由刷新
      client: {
        overlay: {
          errors: true,      // 只显示错误
          warnings: false,   // 隐藏警告
        }
      }
    },
    esnextModules: ['@nutui'],
    postcss: {
      pxtransform: {
        enable: false  // 禁用 px 转换
      }
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@', path.resolve(__dirname, '..', 'src'));
      chain.resolve.alias.set('@shared', path.resolve(__dirname, '../../shared'));

      // 让 webpack 处理 shared 目录中的 TypeScript 文件
      chain.module.rule('shared-typescript')
        .test(/\.(ts|tsx)$/)
        .include.add(path.resolve(__dirname, '../../shared'))
        .end()
        .use('babel-loader')
        .loader('babel-loader')
        .options({
          presets: [
            ['@babel/preset-env', { targets: { browsers: ['> 1%', 'last 2 versions', 'not ie <= 11'] } }],
            ['@babel/preset-react', { runtime: 'automatic' }],
            '@babel/preset-typescript'
          ]
        });

      // 忽略 Taro 框架内部的 webpackExports 警告
      chain.set('ignoreWarnings', [
        /webpackExports/,
        /asset size limit/,
        /entrypoint size limit/
      ]);

      // React Refresh 热更新
      if (process.env.NODE_ENV === 'development') {
        chain.plugin('react-refresh').use(require('@pmmmwh/react-refresh-webpack-plugin'), [{
          overlay: {
            entry: false,  // 禁用默认 overlay，使用 Taro 的
          }
        }]);
      }
    }
  }
};

export default config;
