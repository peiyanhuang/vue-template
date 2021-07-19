'use strict'
const path = require('path');
const webpack = require('webpack');
const config = require('./config');
const utils = require('./utils');
const vueLoaderConfig = require('./vue-loader.conf');

function resolve (dir) {
  return path.resolve(__dirname, dir)
}

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('../src'), resolve('../test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

module.exports = {
	devtool: 'source-map',
	entry: {
		app: resolve('../src/main.js')
	},
	output: {
		path: config.build.assetsRoot,
		publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath,
		filename: '[name].js',
	},
	resolve: {
		extensions: ['.js', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('../src'),
    }
	},
	module: {
		rules: [
    ...(config.dev.useEslint ? [createLintingRule()] : []),
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: vueLoaderConfig
    }, {
      test: /\.js$/,
      loader: 'babel-loader'
    }, {
			test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
			loader: 'url-loader',
			options: {
				limit: 10 * 1024,
				name:utils.assetsPath('img/[name].[hash:8].[ext]')
			}
		}, {
			test: /\.(woff|woff2|eot|ttf|otf)$/,
			loader: 'url-loader',
			options: {
				name: utils.assetsPath('fonts/[name].[hash:8].[ext]')
			}
		}]
	},
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
};
