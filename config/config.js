import fs from 'fs';
import path from 'path';
import defaultSettings from './defaultSettings'; // https://umijs.org/config/
import lessToJS from 'less-vars-to-js';

import slash from 'slash2';

import appRoutes from './routes';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import px2vw from 'postcss-px-to-viewport-with-minviewportwidth';

const themeVariables = lessToJS(
  fs.readFileSync(path.resolve(__dirname, '../src/variable.less'), 'utf8'),
  { stripPrefix: true },
);

const { pwa } = defaultSettings; // preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。

const { BUILD_TYPE } = process.env;
const plugins = [
  ['umi-plugin-antd-icon-config', {}],
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      locale: {
        // default false
        enable: true,
        // default zh-CN
        default: 'zh-CN',
        // default true, when it is true, will use `navigator.language` overwrite default
        baseNavigator: true,
      },
      dynamicImport: {
        loadingComponent: '../src/components/PageLoading/index',
        webpackChunkName: true,
        level: 3,
      },
      chunks: ['libs', 'quanta', 'umi'],
      pwa: pwa
        ? {
          workboxPluginMode: 'InjectManifest',
          workboxOptions: {
            importWorkboxFrom: 'local',
          },
        }
        : false, // default close dll, because issue https://github.com/ant-design/ant-design-pro/issues/4665
      // dll features https://webpack.js.org/plugins/dll-plugin/
      // dll: {
      //   include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
      //   exclude: ['@babel/runtime', 'netlify-lambda'],
      // },
    },
  ],
  [
    'umi-plugin-pro-block',
    {
      moveMock: false,
      moveService: false,
      modifyRequest: true,
      autoAddMenu: true,
    },
  ],
];

let routes = [];
routes = appRoutes;

export default {
  history: 'hash',
  chainWebpack(config) {
    config.module.rules.delete('svg');
    config.module
      .rule('svg')
      .test(/\.svg(\?v=\d+\.\d+\.\d+)?$/)
      .use([
        {
          loader: 'babel-loader',
        },
        {
          loader: '@svgr/webpack',
          options: {
            babel: false,
            icon: true,
          },
        },
      ])
      .loader(require.resolve('@svgr/webpack'));
    config.node.merge({
      module: 'empty',
      dgram: 'empty',
      dns: 'mock',
      fs: 'empty',
      http2: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    });
    // 分模块打包
    config.optimization.splitChunks({
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        libs: {
          name: 'libs',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|lodash|redux|react-redux|redux-saga|dva)[\\/]/,
          priority: 12,
        },
        quanta: {
          name: 'quanta',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](@ant-design|antd|quanta-design|moment)[\\/]/,
          priority: 11,
        },
        echarts: {
          name: 'echarts',
          test: /[\\/]node_modules[\\/](echarts)/,
          enforce: true,
          priority: 10,
        },
        antv: {
          name: 'antv',
          test: /[\\/]node_modules[\\/](@antv)/,
          enforce: true,
          priority: 9,
        },
        // ide solidity compiler
        compiler: {
          name: 'compiler',
          test: /[\\/]node_modules[\\/](ethers|@ethersproject|rustbn.js|ace-builds|ethereumjs-common|brace)/,
          enforce: true,
          priority: 8,
        },
        highlight: {
          name: 'highlight',
          test: /[\\/]node_modules[\\/](highlight.js)/,
          enforce: true,
          priority: 7,
        },
      },
    });
    config.plugin('monaco-editor').use(MonacoWebpackPlugin, [
      {
        languages: ['lua'],
      },
    ]);
  },
  uglifyJSOptions(opts) {
    if (BUILD_TYPE === 'RELEASE') {
      opts.uglifyOptions.compress.warnings = true;
      opts.uglifyOptions.compress.drop_debugger = true;
      opts.uglifyOptions.compress.drop_console = true;
    }
    return opts;
  },
  plugins,
  // outputPath: BUILD_TYPE === 'DEBUG' ? './dist/debug' : './dist/app',
  hash: true,
  targets: {
    ie: 11,
    chrome: 49,
    firefox: 45,
    safari: 10,
    edge: 13,
    ios: 10,
  },
  define: {
    PRODUCTION_ENV: BUILD_TYPE === 'RELEASE',
  },
  // umi routes: https://umijs.org/zh/guide/router.html
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: themeVariables,
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (context, _, localName) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }

      const match = context.resourcePath.match(/src(.*)/);

      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = slash(antdProPath)
          .split('/')
          .map(a => a.replace(/([A-Z])/g, '-$1'))
          .map(a => a.toLowerCase());
        return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }

      return localName;
    },
  },
  manifest: {
    basePath: '/',
  },
  proxy: {
    '/api': {
      target: 'http://115.236.33.124:8080/',
      // target: 'http://172.16.13.126:9001/',
      // target: 'http://183.216.186.96:8080/',
      // target: 'http://10.1.40.186:8081/',
      changeOrigin: true,
    },
  },
  extraPostCSSPlugins: [
    px2vw({
      unitToConvert: 'px',
      viewportWidth: 1440,
      minViewportWidth: 1200,
      unitPrecision: 5,
      propList: ['*'],
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      selectorBlackList: ['riskControlBox', 'riskControlTitle', 'riskControlBg'],
      minPixelValue: 1,
      mediaQuery: false,
      replace: true,
      include: [/\/src\/pages\/Federate\/Application\/RiskControl\//],
      exclude: [/node_modules/],
      landscape: false,
    }),
  ],
};
