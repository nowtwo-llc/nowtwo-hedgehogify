const path = require('path');

const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

const BUILD_DIR = process.env.BUILD_DIR ? path.resolve(process.env.BUILD_DIR) : path.resolve(__dirname, './dist');
const ENVIRONMENT = process.env.NODE_ENV;

module.exports = {
    entry: './src/HedgeHogify.ts',
    output: {
        path: BUILD_DIR,
        publicPath: BUILD_DIR,
        library: 'Fireworksify',
        libraryTarget: 'umd',
        filename: ENVIRONMENT === 'production' ? 'hedgehogify.min.js' : 'hedgehogify.js',
        umdNamedDefine: true
    },
    resolve: {
        extensions: ['.ts', '.css'],
        alias: {
            '~': path.resolve('./node_modules')
        }
    },
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader' },
            { test: /\.css$/, use: [ MiniCSSExtractPlugin.loader, 'css-loader'] }
        ]
    },
    plugins: [
        new MiniCSSExtractPlugin({
            filename: ENVIRONMENT === 'production' ? 'hedgehogify.min.css' : 'hedgehogify.css',
        })
    ],
    watchOptions: {
        ignored: [
            'dist/**', 
            'example/**', 
            'node_modules/**'
        ]
    }    
};

if (ENVIRONMENT === 'development') {
    module.exports.mode = 'development';
    module.exports.optimization = {
        minimizer: [
            new TerserJSPlugin({}),
            new OptimizeCSSAssetsPlugin({})
        ]
    };
} else if (ENVIRONMENT === 'production') {
    module.exports.mode = 'production';
    module.exports.optimization = {
        minimize: true,
        minimizer: [
            new TerserJSPlugin({}),
            new OptimizeCSSAssetsPlugin({
                cssProcessorOptions: {
                    discardComments: {
                        removeAll: true
                    }
                }
            })
        ]
    };
}
