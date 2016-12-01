var historyApiFallback = require('connect-history-api-fallback');
module.exports = function () {
    var browserSync = {
        prod: {
            port: 3001,
            server: {
                baseDir: './build',
                middleware: [historyApiFallback()]
            }
        }
    };

    var build = './build/';
    var favicons = './build/assets/favicons/**/*.*';    
    var config = {
        build: build,
        browserSync: browserSync,
        favicons:favicons
    };


    return config;
}
