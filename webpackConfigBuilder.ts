import * as path from 'path'
import * as webpack from 'webpack'

// const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
// const webpack = require('webpack')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const TsconfigPathsPlugin = null
import { TsConfigPathsPlugin as TsConfigPathsPluginATL } from 'awesome-typescript-loader'

import * as _ from 'lodash'

const useAwesomeTypescriptLoader = true
const useReactHotLoader3 = true
const useSass = true
const useCss = true

const externalReact = true

let externals = {}
if (externalReact) {
  externals = {
    react: 'React',
    'react-dom': 'ReactDOM',
  }
}

export function createConfig(options: {
  dirName: string
  isHot?: boolean
  isProduction: boolean
  outputPath?: string
}) {
  // console.log('options')

  _.defaults(options, {
    isProduction: false,
    outputPath: path.join(options.dirName, '/dist'),
    isHot: !options.isProduction,
  })

  console.log('config', options)

  let entry = ['./client/AppIndex.tsx']
  if (options.isHot) {
    entry.unshift('webpack-hot-middleware/client?reload=true')
  }
  if (options.isHot && useReactHotLoader3) {
    entry.unshift('react-hot-loader/patch')
  }
  console.log('entry', entry)

  const rules = []

  if (useCss) {
    rules.push({
      test: /\.css$/,
      use: [
        'css-loader', // translates CSS into CommonJS
      ],
    })
  }
  if (useSass) {
    rules.push({
      test: /\.scss$/,
      use: [
        options.isProduction ? MiniCssExtractPlugin.loader : 'style-loader', // creates style nodes from JS strings
        'css-loader', // translates CSS into CommonJS
        'sass-loader', // compiles Sass to CSS, using Node Sass by default
      ],
    })
  }

  if (useAwesomeTypescriptLoader) {
    rules.push({
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [
        'react-hot-loader/webpack',
        {
          loader: 'awesome-typescript-loader',
          options: {
            useCache: false,
          },
        },

        // Hot loader 4
        // options.isHot ? {
        //   loader: 'babel-loader',
        //   options: {
        //     plugins: [
        //       '@babel/plugin-syntax-typescript',
        //       '@babel/plugin-syntax-decorators',
        //       '@babel/plugin-syntax-jsx',
        //       'react-hot-loader/babel',
        //     ],
        //   },
        // } : undefined,
      ],
    })
  } else {
    // use tsloader
    rules.push({
      test: /\.tsx?$/,
      loaders: ['ts-loader'],
    })
  }

  // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
  rules.push({ enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' })

  const config = {
    entry: entry,
    output: {
      filename: 'bundle.js',
      //path: __dirname + "/dist",
      path: options.outputPath,
      publicPath: '/',
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: options.isProduction ? 'source-map' : 'eval',
    mode: options.isProduction ? 'production' : 'development',

    devServer: options.isHot
      ? {
          contentBase: './dist',
          hot: true,
          historyApiFallback: true,
        }
      : undefined,

    plugins: options.isHot
      ? [
          new HtmlWebpackPlugin({
            title: 'Hot Module Replacement',
            template: 'hot-template.html',
          }),
          new webpack.NamedModulesPlugin(),
          new webpack.optimize.OccurrenceOrderPlugin(true),
          new webpack.HotModuleReplacementPlugin(),
          new webpack.NoEmitOnErrorsPlugin(),
        ]
      : [
          // new CleanWebpackPlugin(['dist']),
          new webpack.NamedModulesPlugin(),
          new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
            chunkFilename: '[id].css',
          }),
        ],

    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.json'],

      plugins: useAwesomeTypescriptLoader
        ? [
            new TsConfigPathsPluginATL({
              configFileName: './tsconfig.json',
            }),
          ]
        : [
            new TsconfigPathsPlugin({
              configFile: './tsconfig.json',
              logLevel: 'info',
              extensions: ['.ts', '.tsx'],
            }),
          ],
    },

    module: {
      rules: rules,
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: externals,
  }
  return config
}
