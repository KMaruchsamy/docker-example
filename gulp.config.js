module.exports = function () {
	var config = {
		src: {
			js: 'src/**/*.js',
			html: 'src/**/*.html',
			images: 'src/images/*.*',
			css: 'src/**/*.css',
			json: 'src/**/*.json',
			favicons: 'src/favicons/*.*',
			build: 'build'
		},
		lib: [
			'node_modules/gulp-traceur/node_modules/traceur/bin/traceur-runtime.js',
			'node_modules/systemjs/dist/system-csp-production.src.js',
			'node_modules/systemjs/dist/system-polyfills.js',
			'node_modules/reflect-metadata/Reflect.js',
			'node_modules/whatwg-fetch/fetch.js',
			'node_modules/jwt-decode/build/jwt-decode.js',
			'node_modules/jquery/dist/jquery.min.js',
			'node_modules/jquery/dist/jquery.min.map',
			'src/polyfills/sessionstorage.js',
			'node_modules/lodash/index.js',
			'src/webworkers/logging-worker.js',
			'node_modules/angular2/bundles/angular2.js',
			'node_modules/angular2/bundles/router.dev.js',
			'node_modules/angular2/bundles/http.js'
		],
		jsreview: [
			'./src/app/*.js',
			'./src/components/**/*.js',
			'./src/services/*.js'
		],
		deploy: {
			DEV: {
				backupFolder: '//DWNUXWEB01.kaplaninc.com/d$/Site_Build',
				liveFolder: '//DWNUXWEB01.kaplaninc.com/d$/NursingAdminWeb'
			},
			QA: {
				backupFolder: '//DWNUXWEB01.kaplaninc.com/e$/Site_Build',
				liveFolder: '//DWNUXWEB01.kaplaninc.com/e$/NursingAdminWeb'
			}
		}
	};
	return config;
}