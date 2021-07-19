'use strict'
const path = require('path')
const { hostConfig } = require('../src/config')

module.exports = {
  dev: {
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      // '/api': {
      //   target: 'http://localhost:8081',
      //   changeOrigin: true,
      //   pathRewrite: {
      //     '^/api': '/api'
      //   }
      // }
    },
    host: 'localhost',
    port: 6067,
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false,
    useEslint: process.env.LINT_ENV !== 'unlint',
    showEslintErrorsInOverlay: false,
    devtool: '#eval-source-map',
    cacheBusting: true,
    cssSourceMap: true
  },
  build: {
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: './',
    productionSourceMap: true,
    devtool: '#source-map',
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
