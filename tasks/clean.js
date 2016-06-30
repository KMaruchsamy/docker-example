var gulp = require('gulp');
var config = require('../gulpnew.config')();
var del = require('del');
var print = require('gulp-print');

/* Run all clean tasks */
gulp.task('clean', ['clean.build', 'clean.report', 'clean.ts']);

/* Clean build folder */
gulp.task('clean.build', function () {
    return del([config.build.path]);
});

/* Clean report folder */
gulp.task('clean.report', function () {
    return del([config.report.path]);
});

/* Clean sass compile */
// gulp.task('clean.sass', function () {
//     return del([config.assetsPath.styles + '**/*.css']);
// });

/* Clean js and map */
gulp.task('clean.ts', function () {
    return del([config.tmpApp, config.tmpTest]); 
});

gulp.task('clean.ts.app', function () {
    del([config.jsFiles.app]).then(paths => {
       // promise ..
    });
});

gulp.task('clean.ts.e2e', function () {
    return del([config.jsFiles.e2e]);
});

gulp.task('clean.ts.unit', function () {
    return del(config.jsFiles.unit);
});

gulp.task('clean.ts.helpers', function () {
    return del([config.jsFiles.helpers]);
});