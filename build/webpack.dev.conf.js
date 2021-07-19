'use strict'
// 引入必要的模块
const express = require('express');
const webpack = require('webpack');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackDevMiddleware = require('webpack-dev-middleware');
const merge = require('webpack-merge');
const path = require('path');
const proxyMiddleware = require('http-proxy-middleware');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const config = require('./config');
const utils = require('./utils');

const PORT = process.env.PORT || config.dev.port

/*
 *  配置 热重载
 */
const baseConfig = require('./webpack.base.conf');
const webpackConfig = merge(baseConfig, {
  mode: 'development',
  devtool: config.dev.devtool,
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env': '"development"'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      chunksSortMode: 'auto'
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
    new OpenBrowserPlugin({ url: `http://${config.dev.host}:${PORT}` })
  ]
});

// 动态向入口配置中注入 webpack-hot-middleware/client
const devClient = './build/dev-client';
Object.keys(webpackConfig.entry).forEach(function (name, i) {
  var extras = [devClient];
  webpackConfig.entry[name] = extras.concat(webpackConfig.entry[name]);
});

// 创建 express
const app = express();

/* proxy */
const proxyTable = config.dev.proxyTable;
// proxy api requests
Object.keys(proxyTable).forEach((context) => {
  let options = proxyTable[context];
  if (typeof options === 'string') {
    options = {
      target: options
    };
  }
  app.use(proxyMiddleware(options.filter || context, options));
});

// BrowserRouter
app.use('/', require('connect-history-api-fallback')());

// 调用webpack并把配置传递过去
let compiler = webpack(webpackConfig);

// for CLI output
new webpack.ProgressPlugin({
  profile: true,
}).apply(compiler);

// console output
// new webpack.ProgressPlugin((percent, msg, addInfo) => {
//   percent = Math.floor(percent * 100);
//   if (percent === 100) {
//     msg = 'Compilation completed';
//   }
//   if (addInfo) {
//     msg = `${msg} (${addInfo})`;
//     console.log(msg)
//   }
// }).apply(compiler);

// 使用 webpack-dev-middleware 中间件
let devMiddleware = webpackDevMiddleware(compiler, {
  publicPath: '/',
  stats: {
    colors: true,
    chunks: false
  }
});
app.use(devMiddleware);

//使用 webpack-hot-middleware
let hotMiddleware = webpackHotMiddleware(compiler);
app.use(hotMiddleware);

// webpack插件，监听html文件改变事件
compiler.hooks.compilation.tap('compilation', function (compilation) {
  HtmlWebpackPlugin.getHooks(compilation).afterEmit.tapAsync(
    'html-webpack-plugin-after-emit',
    function (_data, cb) {
      // 发布事件
      hotMiddleware.publish({
        action: 'reload'
      });
      if (cb) {
        cb();
      }
  });
});

app.listen(PORT, function (err) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`Listening at ${config.dev.host}:${PORT}`);
});
