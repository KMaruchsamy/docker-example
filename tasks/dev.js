var gulp = require('gulp');
var config = require('../gulpnew.config')();
var cssnano = require('gulp-cssnano');
var print = require('gulp-print');
var runSequence = require('run-sequence');

gulp.task('html', function () {
    return gulp.src(config.app + '**/*.html', {
        base: config.app,
        outDir: config.tmpApp
    })
        .pipe(gulp.dest(config.tmpApp));
});

gulp.task('css', function () {
    return gulp.src(config.app + '**/*.css', {
        base: config.app
    })
        .pipe(cssnano())
        .pipe(gulp.dest(config.tmpApp));
});

gulp.task('favicons', function () {
    return gulp.src(config.favicons + '**/*.*', {
        base: config.favicons
    })
        .pipe(gulp.dest(config.tmpApp));
});

gulp.task('images', function () {
    return gulp.src(config.images + '**/*.*', {
        base: config.app
    })
        .pipe(gulp.dest(config.tmpApp));
});


gulp.task('assets', function () {
    return gulp.src(config.assets + '**/*.*', {
        base: config.app
    })
        .pipe(gulp.dest(config.tmpApp));
});


gulp.task('dev', function (done) {
    runSequence('tsc', 'css', 'images', 'favicons', 'html', 'assets', function () {
        console.log('Dev complete..');
        done();
    });
});
