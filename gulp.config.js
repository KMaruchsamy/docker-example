module.exports = function () {
    var config = {
        app: {
            src: {
                js: 'src/app/**/*.js',
                ts: 'src/app/**/*.ts',
                html: 'src/app/**/*.html',
                images: 'src/app/images/*.*',
                css: 'src/app/**/*.css',
                json: 'src/app/**/*.json',
                favicons: 'src/app/favicons/*.*',
                build: 'build/app'
            },
            lib: [
            // 'node_modules/gulp-traceur/node_modules/traceur/bin/traceur-runtime.js',
                'node_modules/systemjs/dist/system.js',
                'node_modules/systemjs/dist/system-polyfills.js',
                'node_modules/reflect-metadata/Reflect.js',
                'node_modules/whatwg-fetch/fetch.js',
                'node_modules/jwt-decode/build/jwt-decode.js',
                'node_modules/jquery/dist/jquery.min.js',
            // 'node_modules/jquery/dist/jquery.min.map',
                'src/app/polyfills/sessionstorage.js',
                'node_modules/lodash/index.js',
                'src/app/webworkers/logging-worker.js',
                'node_modules/angular2/bundles/angular2.min.js',
                'node_modules/angular2/bundles/angular2.dev.js',
                'node_modules/angular2/bundles/router.dev.js',
                'node_modules/angular2/bundles/http.js',
                'node_modules/angular2/bundles/http.dev.js',
                'node_modules/jasmine-core/lib/jasmine-core/jasmine.css',
                'node_modules/jasmine-core/lib/jasmine-core/jasmine.js',
                'node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js',
                'node_modules/jasmine-core/lib/jasmine-core/boot.js',
                'node_modules/es6-shim/es6-shim.min.js',
                'node_modules/angular2/bundles/angular2-polyfills.js',
                'node_modules/rxjs/bundles/Rx.js',
                'src/app/scripts/ga.js',
                'node_modules/bootstrap-select/dist/js/bootstrap-select.min.js',
                'src/app/plugins/bootstrap-select.js',
                'node_modules/moment/min/moment.min.js',
                'node_modules/bootstrap/js/modal.js',
                'node_modules/bootstrap/js/tooltip.js',
                  'node_modules/bootstrap/js/popover.js',
                'src/app/plugins/bootstrap-editable.min.js',
                'src/app/plugins/tablesaw.js',
                'src/app/plugins/tablesaw-init.js'
                // 'src/app/plugins/bootstrap-datepicker.min.js',
                // 'src/app/plugins/jquery.timepicker.js',
                // 'src/app/plugins/date.js'
            ],
            jsreview: [
                './src/app/app/*.js',
                './src/app/components/**/*.js',
                './src/app/services/*.js'
            ]
        },
        deploy: {
            DEV: {
                backupFolder: '//DWNUXWEB01.kaplaninc.com/d$/Site_Build',
                liveFolder: '//DWNUXWEB01.kaplaninc.com/d$/NursingAdminWeb'
            },
            QA: {
                backupFolder: '//DWNUXWEB01.kaplaninc.com/e$/Site_Build',
                liveFolder: '//DWNUXWEB01.kaplaninc.com/e$/NursingAdminWeb'
            }
        },
        ebsSource: './ebs/',
        ebExtensions: './.ebextensions/'
    };
    return config;
}