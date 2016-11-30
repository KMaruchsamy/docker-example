var argv = require('yargs').argv;
var runSequence = require('run-sequence');
var gulp = require('gulp');
var bs = require("browser-sync");
var config = require('./gulp.config')();
var open = require('open');
var print = require('gulp-print');
var bsIns;

function startBrowsersync(config) {
    bsIns = bs.create();
    bsIns.init(config);
    bsIns.reload();
}

var shell = require('gulp-shell')
gulp.task('ngbuild', shell.task(['ng build --prod --aot']));

gulp.task('build', ['ngbuild']);


gulp.task('serve.build',['build'], function () {
    startBrowsersync(config.browserSync.prod);
});



