const path = require('path');
const ora = require('ora');
const dayjs = require('dayjs');
const chalk = require('chalk');
const webpack = require('webpack');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const webpackBaseConfig = require('./webpack.base.conf');
const config = require('./config');
const utils = require('./utils');

let webpackConfig = merge(webpackBaseConfig, {
  mode: 'production',
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    publicPath: config.build.assetsPublicPath || '/',
    filename: utils.assetsPath('js/[name].[contenthash].js'),
    chunkFilename: utils.assetsPath('js/[name].[chunkhash].chunk.js'),
  },
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  optimization: {
    minimize: true,
    runtimeChunk: {
      name: 'runtime'
    },
    moduleIds: 'hashed',
    removeAvailableModules: true
  },
  plugins: [
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env': '"production"'
    }),
    new webpack.BannerPlugin({
      banner: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }),
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[md5:contenthash:hex:8].css'),
      chunkFilename: '[id].[hash].css'
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false }, autoprefixer: { remove: false } }
        : { safe: true, autoprefixer: { remove: false } }
    }),
    new HtmlWebpackPlugin({
      filename: config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: 'auto'
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ],
  stats: {
    colors: true,
    usedExports: true,
  }
});

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin');
  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  );
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

const spinner = ora('building for production...');
spinner.start();

const compiler = webpack(webpackConfig, function(err, stats) {
  spinner.stop();
  if (err) {
    throw err;
  }
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
    timings: true
  }) + '\n\n');

  if (stats.hasErrors()) {
    console.log(chalk.red('  Build failed with errors.\n'))
    process.exit(1)
  }

  console.log(chalk.cyan('  Build complete.\n'))
  console.log(chalk.yellow(
    '  Tip: built files are meant to be served over an HTTP server.\n' +
    '  Opening index.html over file:// won\'t work.\n'
  ))
});
