const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CachedInputFileSystem, ResolverFactory } = require('enhanced-resolve');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');

const ENVIRONMENT = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const ENVIRONMENT_VARS = {
    development: require('./env.development.json'),
    production: require('./env.production.json')
};
const BUILD_DIR = process.env.BUILD_DIR ? path.resolve(process.env.BUILD_DIR) : path.resolve(__dirname, './build');

const resolveAliases = {
    env: path.resolve(__dirname, `./env.${ENVIRONMENT}.json`)
};

module.exports = {
    entry: './src/HedgeHogify.ts',
    output: {
        path: BUILD_DIR,
        publicPath: BUILD_DIR,
        libraryTarget: 'umd',
        filename: ENVIRONMENT === 'production' ? 'hedgehogify.min.js' : 'hedgehogify.js'
    },
    mode: ENVIRONMENT,
    resolve: {
        extensions: ['.ts', '.css'],
        alias: {
            '~': path.resolve('./node_modules')
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin({
            root: BUILD_DIR,
            verbose: true
        }),
        new MiniCssExtractPlugin({
            filename: ENVIRONMENT === 'production' ? 'hedgehogify.min.css' : 'hedgehogify.css'
        })
    ],
    resolve: {
        alias: resolveAliases,
        symlinks: false
    },
    watchOptions: {
        ignored: [
            'dist/**',
            'example/**',
            'node_modules/**'
        ]
    }
};

if (ENVIRONMENT === 'development') {
    console.log('Mode: DEVELOPMENT');
    module.exports.devtool = 'source-map';
} else if (ENVIRONMENT === 'production') {
    console.log('Mode: PRODUCTION');
    module.exports.devtool = 'source-map';
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        }),
    ]);
    module.exports.optimization = {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    sourceMap: true,
                    ie8: false
                }
            })
        ]
    };
}