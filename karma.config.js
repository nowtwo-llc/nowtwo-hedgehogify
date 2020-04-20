module.exports = (config) => {
    config.set({
        frameworks: ['mocha', 'chai'],
        files: [
            'dist/hedgehogify.css',
            'dist/hedgehogify.js',
            'tests/unit/**/*.spec.js',
            {
                pattern: 'tests/**/*',
                watched: false,
                included: false,
                served: true,
                nocache: true
            }
        ],
        proxies: {
        },
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['ChromeHeadless'],
        autoWatch: false
    })
}