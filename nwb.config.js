const path = require('path');

const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

module.exports = {
    type: 'web-module',
    npm: {
        esModules: false,
        umd: {
            externals: {},
            global: 'HedgeHogify'
        }
    },
    karma: {
        browsers: ['ChromeHeadless'],
        frameworks: ['mocha', 'chai'],
        plugins: ['karma-chai'],
        extra: {
            autoWatch: false,
            colors: true,
            concurrency: 1,
            port: 9876,
            reporters: ['progress'],
            singleRun: true,
            files: [
                // 'dist/hedgehogify.css',
                'dist/hedgehogify.js',
                {
                    included: false,
                    nocache: true,
                    pattern: 'tests/fixtures/**/*',
                    served: true,
                    watched: false
                }
            ],
            client: {
                mocha: {
                    timeout: 6000
                }
            }
        }
    },
    webpack: {
        config(originalConfig) {
            const isDev = process.env.NWB_MODE === 'development';
            process.env.NODE_ENV = isDev ? 'development' : 'production';
            const config = {
                ...originalConfig
            };

            config.mode = isDev ? 'development' : 'production';
            config.entry = [
                // './src/HedgeHogify.css', 
                './src/HedgeHogify.ts'
            ];
            config.optimization = {
                noEmitOnErrors: false
            };
            // config.optimization = {
            //     noEmitOnErrors: false,
            //     minimize: true,
            //     minimizer: [
            //         new TerserJSPlugin({}),
            //         new OptimizeCSSAssetsPlugin({
            //             cssProcessorOptions: {
            //                 discardComments: {
            //                     removeAll: true
            //                 }
            //             }
            //         })
            //     ]
            // };

            // Change output name
            config.output = {
                ...config.output,
                filename: 'hedgehogify.js',
                library: 'HedgeHogify'
            };

            //  Include TS support
            config.resolve.extensions = config.resolve.extensions || ['.js'];
            config.resolve.extensions.push('.ts');
            config.resolve.alias = config.resolve.alias || {};
            config.resolve.alias['~'] = path.resolve('./node_modules');

            config.module.rules.push({
                loader: 'ts-loader',
                options: { allowTsInNodeModules: true },
                test: /\.ts$/
            });

            // Format with prettier
            config.module.rules.push({
                enforce: 'pre',
                exclude: /node_modules/,
                loader: 'eslint-loader',
                test: /\.(js|ts)$/,
                options: {
                    fix: true
                }
            });

            config.devtool = 'source-map';
            return config;
        }
    }
};
