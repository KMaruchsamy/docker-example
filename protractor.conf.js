var glob = require('glob');
var colors = require('colors');
var seleniumPath = './node_modules/gulp-protractor/node_modules/protractor/selenium/';
var seleniumJarPath = '';
var jasmine2reporter = require('jasmine2-reporter').Jasmine2Reporter;
 var options = {
    pendingSpec: false,
    colors: {
      pending: 'orange',
    },
    symbols: {
      pending: '*  '.strikethrough, //strikethrough is a colors module feature 
    }
  };


glob(seleniumPath + '*.jar',
    function(err, files) {
        seleniumJarPath = files[0];
    });

exports.config = {
    directConnect:true,  // will not wait for web driver to start 
    seleniumServerJar: seleniumJarPath,
    framework:'jasmine2',
    capabilities: {
        'browserName': 'chrome'
    },
    // resultJsonOutputFile: './src/test/reporters/',
    jasmineNodeOpts: {
        // showColors: true,
        defaultTimeoutInterval: 60000,
        isVerbose: true
    },
    onPrepare: function () {        
        browser.driver.manage().timeouts().implicitlyWait(60000);
        jasmine.getEnv().addReporter(new jasmine2reporter(options));
    },
    allScriptsTimeout: 30000,
    useAllAngular2AppRoots: true
};
