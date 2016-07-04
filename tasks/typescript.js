var gulp = require('gulp');
var config = require('../gulpnew.config')();
var ts = require('gulp-typescript');
var tslint = require('gulp-tslint');
var sourcemaps = require('gulp-sourcemaps');
var argv = require('yargs').argv;
var print = require('gulp-print');
var runSequence = require('run-sequence');

/* Initialize TS Project */
var typingFiles = [
    'typings/index.d.ts',
    'manual_typings/**/*.d.ts'
];
var tsUnitFiles = [].concat(config.tsTestFiles.unit, config.tsTestFiles.helper);
var tsE2EFiles = [].concat(config.tsTestFiles.e2e, config.tsTestFiles.helper);
var tsFiles = [].concat(config.tsFiles, tsUnitFiles, tsE2EFiles);

/* Watch changed typescripts file and compile it */
gulp.task('watch-ts', function () {
    return gulp.watch(tsFiles, function (file) {
        console.log('Compiling ' + file.path + '...');
        return compileTs(file.path, true);
    });
});

/* Compile typescripts */
gulp.task('tsc', ['clean.ts'], function (done) {
    runSequence('tsc.app','tsc.unit','tsc.e2e','tsc.helpers', function () {
        done();
    });
});

gulp.task('tsc.app' ,['clean.ts.app'], function () {
        return transpile(config.tsFiles, false, config.app, config.tmpApp);
});

gulp.task('tsc.unit',['clean.ts.unit'], function () {
        return transpile(config.tsTestFiles.unit, false, config.app, config.tmpApp);
});

gulp.task('tsc.e2e',['clean.ts.e2e'], function () {
        return transpile(config.tsTestFiles.e2e, false, config.test, config.tmpTest);
});

gulp.task('tsc.helpers', ['clean.ts.helpers'], function () {
    return transpile(config.tsTestFiles.helper, false, config.test, config.tmpTest);
});

/* Lint typescripts */
gulp.task('tslint', function () {
    return lintTs(tsFiles);
});

gulp.task('tslint.app', function () {
    return lintTs(config.tsFiles);
});

gulp.task('tslint.unit', function () {
    return lintTs(tsUnitFiles);
});

gulp.task('tslint.e2e', function () {
    return lintTs(tsE2EFiles);
});

function lintTs(files) {
    return gulp.src(files)
        .pipe(tslint())
        .pipe(tslint.report('prose', {
          summarizeFailureOutput: true
        }));
}

function transpile(files, watchMode, base, outDir){
    var inline = !argv.excludeSource;
    watchMode = watchMode || false;

    var tsProject = ts.createProject('tsconfig.json');
    var allFiles = [].concat(files, typingFiles);
    var res = gulp.src(allFiles, {
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



