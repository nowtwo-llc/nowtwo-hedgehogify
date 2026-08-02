const path = require('path');
const webpack = require('webpack');

const TerserPlugin = require('terser-webpack-plugin');

const ENVIRONMENT = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const BUILD_DIR = process.env.BUILD_DIR ? path.resolve(process.env.BUILD_DIR) : path.resolve(__dirname, './build');

const resolve = {
    extensions: ['.ts'],
    alias: {
        '~': path.resolve('./node_modules')
    },
    symlinks: false
};

// Declarations are emitted once by `npm run build:types`. Without this the three
// production compilers would each race to write the same .d.ts files.
const tsRule = {
    test: /\.ts$/,
    use: {
        loader: 'ts-loader',
        options: {
            compilerOptions: {
                declaration: false,
                declarationMap: false
            }
        }
    }
};

const baseConfig = {
    entry: './src/HedgeHogify.ts',
    mode: ENVIRONMENT,
    devtool: 'source-map',
    resolve,
    module: { rules: [tsRule] },
    watchOptions: {
        ignored: ['dist/**', 'example/**', 'node_modules/**']
    }
};

const productionPlugins = () => [
    new webpack.DefinePlugin({
        'process.env': { NODE_ENV: '"production"' }
    })
];

/**
 * UMD bundle — the <script src> / unpkg / jsDelivr entry point. Exposes
 * `HedgeHogify` as a browser global and is what the demo page loads.
 */
const umdConfig = {
    ...baseConfig,
    name: 'umd',
    // Built from src/umd.ts, not src/HedgeHogify.ts: this output copies every
    // export onto the global object, and the default export would land there
    // as `window.default`.
    entry: './src/umd.ts',
    target: ['web', 'es2018'],
    output: {
        path: BUILD_DIR,
        libraryTarget: 'umd',
        globalObject: 'this',
        filename: ENVIRONMENT === 'production' ? 'hedgehogify.min.js' : 'hedgehogify.js'
    },
    plugins: ENVIRONMENT === 'production' ? productionPlugins() : [],
    optimization:
        ENVIRONMENT === 'production'
            ? { minimize: true, minimizer: [new TerserPlugin({ extractComments: false })] }
            : { minimize: false }
};

/**
 * ESM bundle — what bundlers resolve via the "import" condition. Left
 * unminified so downstream tooling can tree-shake and minify it in context.
 */
const esmConfig = {
    ...baseConfig,
    name: 'esm',
    target: ['web', 'es2018'],
    experiments: { outputModule: true },
    output: {
        path: BUILD_DIR,
        filename: 'hedgehogify.mjs',
        library: { type: 'module' },
        environment: { module: true, dynamicImport: true }
    },
    plugins: productionPlugins(),
    optimization: { minimize: false }
};

/**
 * CommonJS bundle — the "require" condition, for Node-based consumers and
 * older bundler setups.
 */
const cjsConfig = {
    ...baseConfig,
    name: 'cjs',
    target: ['web', 'es2018'],
    output: {
        path: BUILD_DIR,
        filename: 'hedgehogify.cjs',
        library: { type: 'commonjs2' }
    },
    plugins: productionPlugins(),
    optimization: { minimize: false }
};

if (ENVIRONMENT === 'production') {
    console.log('Mode: PRODUCTION');
    module.exports = [umdConfig, esmConfig, cjsConfig];
} else {
    console.log('Mode: DEVELOPMENT');
    module.exports = umdConfig;
}
