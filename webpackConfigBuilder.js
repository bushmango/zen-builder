"use strict";
exports.__esModule = true;
var webpack = require("webpack");
// const path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
// const webpack = require('webpack')
// const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
var TsconfigPathsPlugin = null;
var awesome_typescript_loader_1 = require("awesome-typescript-loader");
var _ = require("lodash");
var useAwesomeTypescriptLoader = true;
var useReactHotLoader3 = true;
function createConfig(options) {
    console.log('options');
    _.defaults(options, {
        isProduction: false,
        outputPath: options.dirName + '/dist',
        isHot: !options.isProduction
    });
    console.log('config', options);
    var entry = ['./client/AppIndex.tsx'];
    if (options.isHot) {
        entry.unshift('webpack-hot-middleware/client?reload=true');
    }
    if (options.isHot && useReactHotLoader3) {
        entry.unshift('react-hot-loader/patch');
    }
    console.log('entry', entry);
    var config = {
        entry: entry,
        output: {
            filename: 'bundle.js',
            //path: __dirname + "/dist",
            path: options.outputPath,
            publicPath: '/'
        },
        // Enable sourcemaps for debugging webpack's output.
        devtool: options.isProduction ? 'source-map' : 'eval',
        mode: options.isProduction ? 'production' : 'development',
        devServer: options.isHot
            ? {
                contentBase: './dist',
                hot: true,
                historyApiFallback: true
            }
            : undefined,
        plugins: options.isHot
            ? [
                new HtmlWebpackPlugin({
                    title: 'Hot Module Replacement',
                    template: 'hot-template.html'
                }),
                new webpack.NamedModulesPlugin(),
                new webpack.optimize.OccurrenceOrderPlugin(true),
                new webpack.HotModuleReplacementPlugin(),
                new webpack.NoEmitOnErrorsPlugin(),
            ]
            : [
                // new CleanWebpackPlugin(['dist']),
                new webpack.NamedModulesPlugin(),
            ],
        resolve: {
            extensions: ['.js', '.ts', '.tsx', '.json'],
            plugins: useAwesomeTypescriptLoader
                ? [
                    new awesome_typescript_loader_1.TsConfigPathsPlugin({
                        configFileName: './tsconfig.json'
                    }),
                ]
                : [
                    new TsconfigPathsPlugin({
                        configFile: './tsconfig.json',
                        logLevel: 'info',
                        extensions: ['.ts', '.tsx']
                    }),
                ]
        },
        module: {
            rules: [
                // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
                useAwesomeTypescriptLoader
                    ? {
                        test: /\.tsx?$/,
                        exclude: /node_modules/,
                        use: [
                            'react-hot-loader/webpack',
                            {
                                loader: 'awesome-typescript-loader',
                                options: {
                                    useCache: false
                                }
                            },
                        ]
                    }
                    : {
                        test: /\.tsx?$/,
                        loaders: ['ts-loader']
                    },
                // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
                { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
            ]
        },
        // When importing a module whose path matches one of the following, just
        // assume a corresponding global variable exists and use that instead.
        // This is important because it allows us to avoid bundling all of our
        // dependencies, which allows browsers to cache those libraries between builds.
        externals: {
        //react: "React",
        //"react-dom": "ReactDOM"
        }
    };
    return config;
}
exports.createConfig = createConfig;
