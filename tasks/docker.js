var gulp = require('gulp');
var config = require('./gulp.config')();
var rename = require('gulp-rename');
var plugins = require('gulp-load-plugins')({ lazy: true });
var app_version = process.env.app_version || 'stg_v0';
var env = process.env.NODE_ENV || 'qa';


// To run: NODE_ENV=staging gulp prepare_config
gulp.task('prepare_config', function () {
    gulp.src('ebs/resources_' + env + '.config')
        .pipe(plugins.rename({
            dirname: '',
            basename: 'resources',
            extname: '.config'
        }))
        .pipe(gulp.dest('.ebextensions'));

    gulp.src('ebs/Dockerrun_' + env + '.aws.json')
        .pipe(plugins.rename({
            dirname: '',
            basename: 'Dockerrun.aws',
            extname: '.json'
        }))
        .pipe(gulp.dest('.'));
});

// To run: app_version=qa_v4 gulp create_zip
gulp.task('create_zip', function(){
    gulp.src(['./Dockerrun.aws.json',
            '.ebextensions/resources.config'], { base: "." })
        .pipe(plugins.zip('nursing-adminapp-' + app_version + '.zip'))
        .pipe(gulp.dest('dist'));
});

// To run: NODE_ENV=multi gulp prepare_multi_config
gulp.task('prepare_multi_config', function () {
    gulp.src('ebs_multi/resources_' + env + '.config')
        .pipe(plugins.rename({
            dirname: '',
            basename: 'resources',
            extname: '.config'
        }))
        .pipe(gulp.dest('.ebextensions'));

    gulp.src('ebs_multi/Dockerrun_' + env + '.aws.json')
        .pipe(plugins.rename({
            dirname: '',
            basename: 'Dockerrun.aws',
            extname: '.json'
        }))
        .pipe(gulp.dest('.'));
});