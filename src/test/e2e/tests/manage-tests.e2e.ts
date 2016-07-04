describe("Manage tests", () => {

    beforeAll(function (done) {
        browser.get('/')
            .then(() => {
                browser.driver.manage().window().maximize();
                done();
            });
    });

    it("Match the title for manage tests", () => {
        let email = element(by.css('#username'));
        let password = element(by.css('#password'));
        email.sendKeys('qainsadmin@kaplan.com');
        password.sendKeys('kaplan#1');
        element(by.css('#faculty-signin')).click();
        browser.waitForAngular();
        browser.driver.sleep(1000);
        browser.driver.getTitle().then((title) => {
            console.log('.................');
            console.log(title);
            expect(title).toMatch('Home');
        });
        element(by.linkText('Main Menu')).click();
        element(by.css('.test-icon')).click();
        let rowCount = 0;
        console.log('row count ..');
        browser.sleep(3000);
    });


});