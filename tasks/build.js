var gulp = require('gulp');
var runSequence = require('run-sequence');
var config = require('../gulpnew.config')();
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var inject = require('gulp-inject');


var Builder = require('systemjs-builder');

gulp.task('build.systemjs', function (done) {
    console.log('Building files ..');
        var builder = new Builder();
        builder.loadConfig(config.tmpApp + 'assets/js/' + 'systemjs.conf.js')
            .then(function () {
                var path = config.tmpApp;
                return builder
                    .buildStatic(
                    path + 'bootstrap.js',
                    path + 'bundle.js',
                    config.systemJs.builder);
            })
            .then(function () {
                console.log('Build complete');
                done();
            })
            .catch(function (ex) {
                console.log('error', ex);
                done('Build failed.');
            });
});


gulp.task('build', ['dev'], function (done) {
    runSequence('build.systemjs', 'build.assets', done);
});

/* Concat and minify/uglify all css, js, and copy fonts */
gulp.task('build.assets', function (done) {
    runSequence('clean.build', function () {
        gulp.src(config.app + '**/*.html', {
            base: config.app
        })
            .pipe(gulp.dest(config.build.path));

        gulp.src(config.app + '**/*.css', {
            base: config.app
        })
            .pipe(cssnano())
            .pipe(gulp.dest(config.build.path));

        gulp.src(config.favicons + '**/*.*', {
            base: config.favicons
        })
            .pipe(gulp.dest(config.build.path));

        gulp.src(config.images + '**/*.*', {
            base: config.app
        })
            .pipe(gulp.dest(config.build.path));
      
        gulp.src(config.index)      
            .pipe(inject(
                    gulp.src(config.tmpApp + 'bundle.js', { base: config.tmpApp })
                    .pipe(rev())
                    .pipe(gulp.dest(config.build.path)), { ignorePath: config.build.path, name: 'bundle',removeTags:true }))    
            .pipe(useref())
            .pipe(gulpif('assets/lib.js', uglify()))
            .pipe(gulpif('*.css', cssnano()))
            .pipe(gulpif('!*.html', rev()))
            .pipe(revReplace())             
            .pipe(gulp.dest(config.build.path))
            .on('finish', done);
    });
});

/* Copy fonts in packages */
gulp.task('fonts', function () {
    gulp.src(config.assetsPath.fonts + '**/*.*', {
        base: config.assetsPath.fonts
    })
        .pipe(gulp.dest(config.build.fonts));
    gulp.src([
        'node_modules/font-awesome/fonts/*.*'
    ])
        .pipe(gulp.dest(config.build.fonts));
});

