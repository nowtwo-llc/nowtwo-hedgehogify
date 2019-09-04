module.exports = (config) => {
    config.set({
        frameworks: ['mocha', 'chai'],
        files: [
            'dist/HedgeHogify.css',
            'dist/HedgeHogify.js',
            'tests/unit/**/*.spec.js',
            {
                pattern: 'tests/files/**/*',
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