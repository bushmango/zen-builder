import * as path from 'path'
import * as webpack from 'webpack'

const TsconfigPathsPlugin = null
import { TsConfigPathsPlugin as TsConfigPathsPluginATL } from 'awesome-typescript-loader'

import * as _ from 'lodash'

const useAwesomeTypescriptLoader = true

export function createNodeConfig(options: {
  dirName: string
  isProduction: boolean
  tsConfigFile: string
  outputPath?: string
}) {
  // console.log('options')

  _.defaults(options, {
    isProduction: false,
    outputPath: path.join(options.dirName, '/dist-node'),
  })

  console.log('config', options)

  let entry = ['./runServerUniversal.ts']
  console.log('entry', entry)

  const rules = []

  if (useAwesomeTypescriptLoader) {
    rules.push({
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'awesome-typescript-loader',
          options: {
            useCache: false,
            configFileName: options.tsConfigFile,
          },
        },
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
  // rules.push({ enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' })

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

    plugins: [new webpack.NamedModulesPlugin()],

    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.json'],

      plugins: useAwesomeTypescriptLoader
        ? [
            new TsConfigPathsPluginATL({
              configFileName: options.tsConfigFile,
            }),
          ]
        : [
            new TsconfigPathsPlugin({
              configFile: options.tsConfigFile,
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
    // externals: externals,
  }
  return config
}
