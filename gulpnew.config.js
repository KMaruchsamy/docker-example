var argv = require('yargs').argv;
var environment = argv.env || 'dev';

if (environment === 'dev') {
    var historyApiFallback = require('connect-history-api-fallback');
}

module.exports = function () {
    var root = '',
        src = root + 'src/',
        app = src + 'app/',
        test = src + 'test/',
        tmpApp = src + 'tmp-app/',
        tmpTest = src + 'tmp-test/',
        tmpUnit = tmpApp + '**/*.spec.js',
        tmpHelper = tmpTest + 'test-helpers/',
        testHelper = test + 'test-helpers/',
        e2e = test + 'e2e/',
        tmpE2E = tmpTest + 'e2e/',
        assets = app + 'assets/',
        images = app + 'images/',
        css = app + 'css/',
        favicons = app + 'favicons/',
        assetsPath = {
            styles: assets + 'styles/',
            images: assets + 'images/',
            fonts: assets + 'fonts/',
            scripts: assets + 'js/'
        },

        index = app + 'index.html',
        tsFiles = [
            app + '**/!(*.spec)+(.ts)'
        ],
        tsTestFiles = {
            unit: [app + '**/*.spec.ts'],
            e2e: [e2e + '**/*.ts'],
            helper: [testHelper + '**/*.ts']
        },
        jsFiles = {
            unit: [tmpApp + '**/*.spec.js',tmpApp + '**/*.spec.js.map'],
            e2e: tmpE2E,
            app: tmpApp,
            helpers: tmpHelper
        },
        build = {
            path: 'build/',
            app: 'build/app/',
            fonts: 'build/fonts',
            assetPath: 'build/assets/',
            assets: {
                lib: {
                    js: 'lib.js',
                    css: 'lib.css'
                }
            }
        },
        report = {
            path: 'report/'
        };

    if (environment === 'dev') {
        var browserSync = {
            dev: {
                port: 3000,
                server: {
                    baseDir: './src/tmp-app',
                    middleware: [historyApiFallback()],
                    routes: {
                        "/node_modules": "node_modules",
                        "/bower_components": "bower_components",
                        "/src": "src"
                    }
                }
            },
            prod: {
                port: 3001,
                server: {
                    baseDir: './' + build.path,
                    middleware: [historyApiFallback()]
                }
            }
        };
    }


    var e2eConfig = {
        seleniumTarget: 'http://127.0.0.1:3001'
        // seleniumTarget: 'https://qa-nit.kaplan.com'
    };

    var systemJs = {
        builder: {
            normalize: true,
            minify: true,
            mangle: true,
            runtime: false,
            globalDefs: { DEBUG: false, ENV: 'production' }
        }
    };

    var ebsSource = './ebs/',
        ebExtensions = './.ebextensions/'

    var config = {
        root: root,
        src: src,
        app: app,
        test: test,
        tmpApp: tmpApp,
        tmpTest: tmpTest,
        tmpUnit: tmpUnit,
        tmpE2E: tmpE2E,
        tmpHelper: tmpHelper,
        testHelper: testHelper,
        e2e: e2e,
        e2eConfig: e2eConfig,
        assets: assets,
        index: index,
        build: build,
        report: report,
        assetsPath: assetsPath,
        tsFiles: tsFiles,
        tsTestFiles: tsTestFiles,
        jsFiles: jsFiles,
        systemJs: systemJs,
        images: images,
        css: css,
        favicons: favicons,
        ebsSource: ebsSource,
        ebextensions: ebExtensions
    };

    if (environment === 'dev') {
        config.browserSync = browserSync;
    }

    return config;
};
