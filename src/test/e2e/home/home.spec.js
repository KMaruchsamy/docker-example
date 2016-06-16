describe('Home page', function () {
    beforeAll(function (done) {
        browser.get('/')
            .then(function () {
                browser.driver.manage().window().maximize();
                done();
            });
    });

    it('should have image', function () {
        let ng2Img = element(by.css('img'));
        expect(ng2Img.isDisplayed()).toBeTruthy();
        
        element(by.css('.help-link')).click();
        browser.waitForAngular(); 
        browser.driver.getCurrentUrl().then(function (url) {
         console.log('.................');
            console.log(url);
            expect(url).toMatch('/help');   
        });
        

        element(by.linkText('Back to Sign In page')).click();
        browser.waitForAngular(); 
        browser.driver.getCurrentUrl().then(function (url) {
            console.log('.................');
            console.log(url);
            expect(url).toMatch('/');
        });


        var email = element(by.css('#username'));
        var password = element(by.css('#password'));
        email.sendKeys('qainsadmin@kaplan.com');
        password.sendKeys('kaplan#1');
        element(by.css('#faculty-signin')).click();

        browser.driver.sleep(1000);
        browser.waitForAngular();
        browser.getTitle().then(function (title) {
            console.log('.................');
            console.log(title);
            expect(title).toMatch('Home');
        });
        browser.driver.getCurrentUrl().then(function (url) {
            console.log('.................');
            console.log(url);
            expect(url).toMatch('/home');
        });
        // browser.sleep(5000);
        console.log('done!');

    });




});
