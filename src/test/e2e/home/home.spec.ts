describe('Home page', () => {
    beforeAll(function (done) {
        browser.get('/')
            .then(() => {
                browser.driver.manage().window().maximize();
                done();
            });
    });
    it('should have image', () => {
        let ng2Img = element(by.css('img'));
        expect(ng2Img.isDisplayed()).toBeTruthy();

        let email = element(by.css('#username'));
        let password = element(by.css('#password'));
        email.sendKeys('qainsadmin@kaplan.com');
        password.sendKeys('kaplan#1');
        element(by.css('#faculty-signin')).click();
        browser.driver.sleep(1000);
        browser.waitForAngular();
        browser.driver.getTitle().then((title) => {
            console.log('.................');
            console.log(title);
            expect(title).toMatch('Home');
        });

        element(by.linkText('Main Menu')).click();
        element(by.css('a.manage-icon')).click();
        let firstName = element(by.css('#firstName'));
        let lastName = element(by.css('#lastName'));
        let facultyTitle = element(by.css('#facultyTitle'));
        let profileCancel = element(by.css('#profilecancel'));
        let btnProfileSave = element(by.css('#btnProfileSave'));
        let successmsg = element(by.css('#successmsg'));

        firstName.clear();
        firstName.sendKeys('FN');
        lastName.clear();
        lastName.sendKeys('LN');
        facultyTitle.clear();
        facultyTitle.sendKeys('AP');
        profileCancel.click();

        firstName.clear();
        firstName.sendKeys('first name');
        lastName.clear();
        lastName.sendKeys('last name');
        facultyTitle.clear();
        facultyTitle.sendKeys('faculty title');
        btnProfileSave.click();
        browser.waitForAngular();
        successmsg.getText().then((text) => {
            expect(text).toContain('Your changes have been saved');
        });


        firstName.clear();
        firstName.sendKeys('QAInsAdmin FN');
        lastName.clear();
        lastName.sendKeys('QAInsAdmin LN');
        facultyTitle.clear();
        facultyTitle.sendKeys('Assistant Professor Updated');
        btnProfileSave.click();
        browser.waitForAngular();
        successmsg.getText().then((text) => {
            expect(text).toContain('Your changes have been saved');
        });


        // browser.driver.getCurrentUrl().then((url) => {
        //     console.log('.................');
        //     console.log(url);
        //     expect(url).toMatch('/home');
        // });
        // browser.sleep(5000);





        console.log('done!');
    });
});
