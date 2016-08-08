var argv = require('yargs').argv;
var environment = argv.env || 'dev';
var gulpif = require('gulp-if');
var runSequence = require('run-sequence');
var gulp = require('gulp');
var config = require('../gulpnew.config')();
var bs = require("browser-sync");
var cssnano = require('gulp-cssnano');
var print = require('gulp-print');
var ts = require('gulp-typescript');
var tslint = require('gulp-tslint');
var sourcemaps = require('gulp-sourcemaps');
var bsIns;

function startBrowsersync(config) {
    bsIns = bs.create();
    bsIns.init(config);
    bsIns.reload();
}

/* Start live server dev mode */
gulp.task('serve.dev', ['dev', 'watch'], function () {
    startBrowsersync(config.browserSync.dev);
});

/* Start live server production mode */
gulp.task('serve.build', ['build'], function () {
    startBrowsersync(config.browserSync.prod);
});


gulp.task('watch', function () {
    gulp.watch(config.app + '**/*.css', function (file) {
        watchCSS(file.path);
        bsIns.reload();
    });

    gulp.watch(config.app + '**/*.html', function (file) {
        watchHTML(file.path);
        bsIns.reload();
    })

    gulp.watch(config.images + '**/*.*', function (file) {
        watchImages(file.path);
        bsIns.reload();
    });

    gulp.watch(config.assets + '**/*.*', function (file) {
        watchImages(file.path);
        bsIns.reload();
    });

    gulp.watch(config.tsFiles, function (file) {
        watchTranspile(file.path, false, config.app, config.tmpApp);
        bsIns.reload();
    });

    gulp.watch(config.tsTestFiles.unit, function (file) {
        watchTranspile(file.path, false, config.app, config.tmpApp);
        bsIns.reload();
    });

    gulp.watch(config.tsTestFiles.e2e, function (file) {
        watchTranspile(file.path, false, config.app, config.tmpApp);
        bsIns.reload();
    });

    gulp.watch(config.tsTestFiles.helper, function (file) {
        watchTranspile(file.path, false, config.app, config.tmpApp);
        bsIns.reload();
    });

});

function watchCSS(files) {
    console.log(files);
    return gulp.src(files, {
        base: config.app
    })
        .pipe(cssnano())
        .pipe(gulp.dest(config.tmpApp));
}

function watchHTML(files) {
    return gulp.src(files, {
        base: config.app,
        outDir: config.tmpApp
    })
        .pipe(gulp.dest(config.tmpApp));
}

function watchImages(files) {
    return gulp.src(files, {
        base: config.app
    })
        .pipe(gulp.dest(config.tmpApp));
}

function watchAssets(files) {
    return gulp.src(files, {
        base: config.app
    })
        .pipe(gulp.dest(config.tmpApp));
}




function watchTranspile(files, watchMode, base, outDir) {
    var inline = !argv.excludeSource;
    watchMode = watchMode || false;

    var tsProject = ts.createProject('tsconfig.json');
    // var allFiles = [].concat(files, typingFiles);
    var res = gulp.src(files, {
        base: base,
        outDir: outDir
    })
        // .pipe(tslint())
        // .pipe(tslint.report('prose', {
        //     summarizeFailureOutput: true,
        //     emitError: !watchMode
        // }))
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
    // .on('error', function () {
    //     if (watchMode) {
    //         return;
    //     }
    //     process.exit(1);
    // });
    return res.js
        .pipe(sourcemaps.write('.', {
            includeContent: inline
        }))
        .pipe(gulp.dest(outDir))

}