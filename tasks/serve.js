var argv = require('yargs').argv;
var environment = argv.env || 'dev';
var runSequence = require('run-sequence');
if (environment === 'dev') {
    var gulp = require('gulp');
    var config = require('../gulpnew.config')();
    var bs = require("browser-sync");

    function startBrowsersync(config) {
        bsIns = bs.create();
        bsIns.init(config);
        bsIns.reload();
    }

    /* Start live server dev mode */
    gulp.task('serve.dev', ['dev'], function () {
        startBrowsersync(config.browserSync.dev);
    });

    /* Start live server production mode */
    gulp.task('serve.build', ['build'], function () {
        startBrowsersync(config.browserSync.prod);
    });
}