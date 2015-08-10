var gulp = require('gulp');
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

gulp.task('clean', function (done) {
    del([config.src.build], done);
});

gulp.task('js', function () {
    return gulp.src(config.src.js)
      .pipe(rename({ extname: '' })) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
      .pipe(plumber())
      .pipe(traceur({
          modules: 'instantiate',
          moduleName: true,
          annotations: true,
          types: true,
          memberVariables: true
      }))
      .pipe(rename({ extname: '.js' })) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
      .pipe(gulp.dest(config.src.build));
});

gulp.task('images', function () {
    return gulp.src(config.src.images)
     .pipe(gulp.dest(config.src.build + '/images'));
});

gulp.task('favicons', function () {
    return gulp.src(config.src.favicons)
     .pipe(gulp.dest(config.src.build));
});

gulp.task('html', function () {
    return gulp.src(config.src.html)
      .pipe(gulp.dest(config.src.build));
});

gulp.task('json', function () {
    return gulp.src(config.src.json)
      .pipe(gulp.dest(config.src.build));
});


gulp.task('css', function () {
    return gulp.src(config.src.css)
    .pipe(gulp.dest(config.src.build));
});

gulp.task('libs', ['angular2'], function () {
    var size = require('gulp-size');
    return gulp.src(config.lib)
      .pipe(size({ showFiles: true, gzip: true }))
      .pipe(gulp.dest('build/lib'));
});


gulp.task('angular2', function () {
    var buildConfig = {
        defaultJSExtensions: true,
        paths: {
            "angular2/*": "node_modules/angular2/es6/prod/*.js",
            "rx": "node_modules/angular2/node_modules/rx/dist/rx.js"
        },
        meta: {
            // auto-detection fails to detect properly
            'rx': {
                format: 'cjs' //https://github.com/systemjs/builder/issues/123
            }
        }
    };
    var Builder = require('systemjs-builder');
    var builder = new Builder(buildConfig);
    builder.build('angular2/router', 'build/lib/router.js', {});
    return builder.build('angular2/angular2', 'build/lib/angular2.js', {});
});




gulp.task('build', ['js', 'html','json','css','images','favicons', 'libs']);

gulp.task('play', ['build'], function () {

    var http = require('http');
    var connect = require('connect');
    var serveStatic = require('serve-static');
    var open = require('open');
    var port = 3000;
    var app;

    gulp.watch(config.src.html, ['html']);
    gulp.watch(config.src.js, ['js']);
    gulp.watch(config.src.json, ['json']);
    gulp.watch(config.src.css, ['css']);

    app = connect();

    app.use(serveStatic(__dirname + '/build'));  // serve everything that is static

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

