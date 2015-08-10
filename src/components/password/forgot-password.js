import {Component, View} from 'angular2/angular2';
import {Router} from 'angular2/router';
import {Common} from '../../services/common';
import {PasswordHeader} from '../password/password-header';

@Component({
    selector: 'forgot-password',
    viewInjector: [Common]
})
@View({
    templateUrl: '../../templates/password/forgot-password.html',
    directives: [PasswordHeader]
})

export class ForgotPassword {
    constructor(router: Router, common: Common) {
        this.router = router;
        this.common = common;
        this.errorMessages = "";
        this.successMessage = "";
        this.getErrorMessages();
        this.config = "";
        this.apiServer = "";
        this.getConfig();
        this.initialize();
        this.reset();
    }

    initialize() {
        $('title').html('Kaplan Nursing | Forgot Password');
    }

    reset() {
        $('#forgotPassword').val('');
        $('.error').hide();
        $('#btnSend').attr("disabled", "true");
        $('#btnSend').attr("aria-disabled", "true");
    }

    getErrorMessages() {
        let self = this;
        this.common.getErrorMessages().then(function (response) {
            return response.json()
        }).then(function (json) {
            console.log('parsed json', json)
            self.errorMessages = json
            self.successMessage = json
        }).catch(function (ex) {
            console.log('parsing failed', ex)
        });
    }
    getConfig() {
        let self = this;
        this.common.getConfig().then(function (response) {
            return response.json()
        }).then(function (json) {
            console.log('parsed json', json)
            self.config = json
            self.getApiServer();
        }).catch(function (ex) {
            console.log('parsing failed', ex)
        });
    }
    getApiServer() {
        let configJSON = this.config;
        if (location.hostname.indexOf('localhost') > -1)
            this.apiServer = configJSON.links.api.local.server;
        if (location.hostname.indexOf('dev') > -1)
            this.apiServer = configJSON.links.api.dev.server;
        if (location.hostname.indexOf('qa') > -1)
            this.apiServer = configJSON.links.api.qa.server;
    }
    onForgotPassword(txtEmailId, btnSend, errorContainer, event) {
        event.preventDefault();
        let self = this;
        let emailid = txtEmailId.value;

        let encryptedId = this.getEncryption(emailid);

        let currentTime = new Date();
        let expiryTime = new Date(currentTime.getTime() + (24 * 60 * 60 * 1000));     // converting 24 hours to milliseconds and adding to Date
                
        // Expiry Time Encryption
        let encryptedTime = this.getEncryption(expiryTime.toString());

        if (this.validate(emailid, errorContainer)) {
            let apiURL = this.apiServer + this.config.links.api.baseurl + this.config.links.api.admin.forgotpasswordapi;
            let promise = this.forgotpassword(apiURL, emailid, encryptedId, encryptedTime);
            promise.then(function (response) {
                return response.status;
            }).then(function (status) {
                if (status === 200) {
                    self.router.parent.navigate('/forgot-password-confirmation');
                }
                else if (status === 500) {
                    self.showError(self.errorMessages.forgot_password.failed_sent_mail, errorContainer);
                }
                else {
                    self.showError(self.errorMessages.forgot_password.invalid_emailid, errorContainer);
                }
            }).catch(function (ex) {
                self.showError(self.errorMessages.general.exception, errorContainer);
            });
        }
    }
    RedirectToLogin(event) {
        event.preventDefault();
        this.router.parent.navigate('/login');
    }

    validate(emailId, errorContainer) {
        this.clearError(errorContainer);

        if (!this.validateValidEmailId(emailId)) {
            this.showError(this.errorMessages.forgot_password.invalid_emailid, errorContainer);
            return false;
        }
        return true;
    }

    validateValidEmailId(emailId) {
        var regexItem = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
        return regexItem.test(emailId);
    }
    clearError(errorContainer) {
        let $container = $(errorContainer).find('span#spnErrorMessage');
        let $outerContainer = $(errorContainer);
        $container.html('');
        $outerContainer.hide();
    }

    showError(errorMessage, errorContainer) {
        let $container = $(errorContainer).find('span#spnErrorMessage');
        let $outerContainer = $(errorContainer);
        $container.html(errorMessage);
        $outerContainer.show();
    }
    checkpasswordlength(txtforgotpassword, btnsend, event) {
        let password = txtforgotpassword.value;
        if (password.length > 0) {
            $(btnsend).removeAttr("disabled");
            $(btnsend).attr("aria-disabled", "false");
        }
        else {
            $(btnsend).attr("disabled", "true");
            $(btnsend).attr("aria-disabled", "true");
        }
    }

    getEncryption(strToEncrypt) {
        let key = CryptoJS.enc.Base64.parse("#base64Key#");
        let iv = CryptoJS.enc.Base64.parse("#base64IV#");
        let encryptedStr = CryptoJS.AES.encrypt(strToEncrypt, key, { iv: iv }).toString();
        let replaceEscapeFromStr = encryptedStr.replace(/\//g, "#");
        return replaceEscapeFromStr;
    }

    forgotpassword(url, useremail, encryptedUserEmail, expiryTime) {
        return fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                useremail: useremail,
                encrypteduseremail: encryptedUserEmail,
                expirytime: expiryTime
            })
        });
    }
}