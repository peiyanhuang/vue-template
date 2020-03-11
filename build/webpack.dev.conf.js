'use strict'
// 引入必要的模块
const express = require('express');
const webpack = require('webpack');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackDevMiddleware = require('webpack-dev-middleware');
const merge = require('webpack-merge');
const path = require('path');
const fs = require('fs');
const proxyMiddleware = require('http-proxy-middleware');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const config = require('../config')
const utils = require('./utils')

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
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      chunksSortMode: 'auto'
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
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
const proxyTable = {
  '/api': {
    target: 'http://localhost:8081',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api'
    }
  }
};
// proxy api requests
Object.keys(proxyTable).forEach((context) => {
  var options = proxyTable[context];
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

// for browser console output
new webpack.ProgressPlugin((percent, msg, addInfo) => {
  percent = Math.floor(percent * 100);

  if (percent === 100) {
    msg = 'Compilation completed';
  }

  if (addInfo) {
    msg = `${msg} (${addInfo})`;
  }
}).apply(compiler);

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
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    // 发布事件
    hotMiddleware.publish({
      action: 'reload'
    });
    if (cb) {
      cb();
    }
  });
});

const PORT = process.env.PORT || config.dev.port

app.listen(PORT, function (err) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`Listening at http://localhost:${PORT}`);
});
