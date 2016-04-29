﻿var gulp = require('gulp');
var del = require('del');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var traceur = require('gulp-traceur');
var rework = require('rework');
var npmRework = require('rework-npm');
var path = require('path');
var fs = require('fs');
var mkpath = require('mkpath');
var config = require('./gulp.config')();
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var jsstylish = require('jshint-stylish');
var util = require('gulp-util');
var gulpprint = require('gulp-print');
var gulpif = require('gulp-if');
var args = require('yargs').argv;
var moment = require('moment');
var robocopy = require('robocopy');
var typescript = require('gulp-typescript');
var tscConfig = require('./tsconfig.json');
var tslint = require('gulp-tslint');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var plugins = require('gulp-load-plugins')({lazy: true});
var env = process.env.NODE_ENV || 'qa';
var app_version = process.env.app_version || 'stg_v0';
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var minifyHTML = require('gulp-htmlmin');

gulp.task('clean', function (done) {
    del([config.app.src.build], done);
});

gulp.task('ts', function () {
    var tsResult = gulp
        .src([config.app.src.ts])
        .pipe(sourcemaps.init())
        .pipe(typescript(tscConfig.compilerOptions));
    return tsResult.js
        //.pipe(uglify({mangle:false}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.app.src.build));
});

gulp.task('js', function () {
    var tsResult = gulp
        .src([config.app.src.js])
        .pipe(typescript(tscConfig.compilerOptions));
    return tsResult.js
        //.pipe(uglify({mangle:false}))
        .pipe(gulp.dest(config.app.src.build));
});

gulp.task('images', function () {
    return gulp.src(config.app.src.images)
     .pipe(gulp.dest(config.app.src.build + '/images'));
});

gulp.task('favicons', function () {
    return gulp.src(config.app.src.favicons)
     .pipe(gulp.dest(config.app.src.build));
});

gulp.task('html', function () {
    return gulp.src(config.app.src.html)
    //   .pipe(minifyHTML({collapseWhitespace: true}))
      .pipe(gulp.dest(config.app.src.build));
});

gulp.task('json', function () {
    return gulp.src(config.app.src.json)
      .pipe(gulp.dest(config.app.src.build));
});


gulp.task('css', function () {
    return gulp.src(config.app.src.css)
    .pipe(csso())
    .pipe(gulp.dest(config.app.src.build));
});

gulp.task('libs', function () {
    console.log('Branch : ' + args.branch );
    var size = require('gulp-size');
    return gulp.src(config.app.lib)
        .pipe(size({ showFiles: true, gzip: true }))
        //.pipe(uglify({mangle:false}))
        .pipe(gulp.dest('build/app/lib'));
});

gulp.task('ts-lint', function () {
    return gulp.src(config.app.src.ts)
        .pipe(tslint())
        .pipe(tslint.report('prose', {
            emitError: false
        }));
});

gulp.task('build', function (done) {
    runSequence('clean',
        ['ts', 'js', 'html', 'json', 'css', 'images', 'favicons', 'libs'],
        done
        );
});

// To run: NODE_ENV=staging gulp prepare_config
gulp.task('prepare_config', function () {
    gulp.src('ebs/resources_' + env + '.config')
        .pipe(plugins.rename({
            dirname: '',
            basename: 'resources',
            extname: '.config'
        }))
        .pipe(gulp.dest(config.ebExtensions));

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
            config.ebExtensions + 'resources.config'], { base: "." })
        .pipe(plugins.zip('nursing-adminapp-' + app_version + '.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('play', ['build'], function () {

    var http = require('http');
    var connect = require('connect');
    var serveStatic = require('serve-static');
    var open = require('open');
    var port = 3000;
    var app;

    gulp.watch(config.app.src.html, ['html']);
    gulp.watch(config.app.src.ts, ['ts']);
    gulp.watch(config.app.src.js, ['js']);
    gulp.watch(config.app.src.json, ['json']);
    gulp.watch(config.app.src.css, ['css']);

    app = connect();

    app.use(serveStatic(__dirname + '/build/app'));  // serve everything that is static

    http.createServer(app).listen(port, function () {
        console.log('\n', 'Server listening on port', port, '\n')
        open('http://localhost:' + port);
    });
});


gulp.task('review',function(){
    log('Analysing source with JSHINT and JSCS');
    gulp
        .src(config.jsreview)
        .pipe(gulpprint())
        .pipe(jscs())
        .pipe(jshint())
        .pipe(jshint.reporter(jsstylish,{verbose:true}))
        .pipe(jshint.reporter('fail'));
});


var liveFolder ='';
var backupFolder ='';

gulp.task('backup',['build'], function() {
    log('Backuping the current build');

    if (args.branch === "refs/heads/dev") {
        liveFolder=config.deploy.DEV.liveFolder;
        backupFolder = config.deploy.DEV.backupFolder;
    }
    else if (args.branch === "refs/heads/qa") {
        liveFolder=config.deploy.QA.liveFolder;
        backupFolder = config.deploy.QA.backupFolder;
    }

    util.log(liveFolder);
    util.log(backupFolder);
       return robocopy({
        source: liveFolder,
        destination: backupFolder + '/build_'+ moment().format('MM_DD_YYYY_h_mm_ss_a'),
        files: ['*.*'],
        copy: {
            subdirs:true,
            emptySubdirs:true,
            mirror: true,
            multiThreaded:true
        },
        file: {
            excludeFiles: ['packages.config'],
            excludeDirs: ['obj', 'Properties'],
        },
        retry: {
            count: 2,
            wait: 3
        }
    })
    .fail(function(e) {
          log('Backup failed ..');
    });

});

gulp.task('copy',['backup'], function() {
    log('Deploying the new version');
    log(liveFolder);
    log(backupFolder);
    return robocopy({
        source: config.app.src.build,
        destination: liveFolder,
        files: ['*.*'],
        copy: {
            subdirs:true,
            emptySubdirs:true,
            mirror: true,
            multiThreaded:true
        },
        file: {
            excludeFiles: ['packages.config'],
            excludeDirs: ['obj', 'Properties'],
        },
        retry: {
            count: 2,
            wait: 3
        }
    })
    .fail(function(e) {
        log('Deployment failed ..');
    });
});

gulp.task('deploy', ['copy']);

gulp.task('debug',function(){
    var http = require('http');
    var connect = require('connect');
    var serveStatic = require('serve-static');
    var open = require('open');
    var port = 3002;
    var app;

    gulp.watch(config.app.src.html, ['html']);
    gulp.watch(config.app.src.js, ['js']);
    gulp.watch(config.app.src.json, ['json']);
    gulp.watch(config.app.src.css, ['css']);

    app = connect();

    app.use(serveStatic(__dirname + '/build/app'));  // serve everything that is static

    http.createServer(app).listen(port, function () {
        console.log('\n', 'Server listening on port', port, '\n')
        open('http://localhost:' + port);
    });
});


gulp.task('test',['build'],function(){
    var http = require('http');
    var connect = require('connect');
    var serveStatic = require('serve-static');
    var open = require('open');
    var port = 3001;
    var app;

    gulp.watch(config.app.src.html, ['html']);
    gulp.watch(config.app.src.js, ['js']);
    gulp.watch(config.app.src.json, ['json']);
    gulp.watch(config.app.src.css, ['css']);

    app = connect();

    app.use(serveStatic(__dirname + '/build/app'));  // serve everything that is static

    http.createServer(app).listen(port, function () {
        console.log('\n', 'Server listening on port', port, '\n')
        open('http://localhost:' + port +'/test.html');
    });
})


// FUNCTIONS

function log(message){
    if(typeof(message)==='object'){
        for(var item in message){
            if(message.hasOwnProperty(item))
                util.log(util.colors.green(message[item]));
        }
    }
    else
        util.log(util.colors.green(message));
}
