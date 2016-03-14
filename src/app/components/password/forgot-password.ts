﻿import {Component} from 'angular2/core';
import {Router} from 'angular2/router';
import {Common} from '../../services/common';
import {PasswordHeader} from '../password/password-header';
import {Validations} from '../../services/validations';
import {Logger} from '../../scripts/logger';
import {links, errorcodes} from '../../constants/config';
import {general, forgot_password} from '../../constants/error-messages';

@Component({
    selector: 'forgot-password',
    providers: [Common,Validations,Logger],
    templateUrl: '../../templates/password/forgot-password.html',
    directives: [PasswordHeader]
})

export class ForgotPassword {
    // errorMessages:any;
    // successMessage:string;
    // config:any;
    apiServer:string;
    constructor(public router: Router,public common: Common,public validations:Validations,public logger:Logger) {
        this.validations=validations;
        this.apiServer = this.common.getApiServer();
        this.initialize();
        this.reset();
        this.logger = logger;
    }

    initialize():void {
        $(document).scrollTop(0);
        $('title').html('Forgot Password &ndash; Kaplan Nursing');
        let self = this;
        $('#forgotPassword').bind('input', function() {
           self.checkpasswordlength();
        });
    }

    reset() {
        $('#forgotPassword').val('');
        $('.error').hide();
        $('#btnSend').attr("disabled", "true");
        $('#btnSend').attr("aria-disabled", "true");
    }
    
    onForgotPassword(txtEmailId, btnSend, errorContainer, event) {
        event.preventDefault();
        let self = this;
        let emailid = txtEmailId.value;

        let encryptedId = this.getEncryption(emailid);

        let expiryhour=parseInt(links.resetemailexpire.expirytime); // Default expiry hour is 2 hours. To change hours go to config.json & change expirytime...
        let currentTime = new Date();
        let expiryTime = new Date(currentTime.getTime() + (expiryhour * 60 * 60 * 1000));     // converting hours to milliseconds and adding to Date
                
        // Expiry Time Encryption
        let encryptedTime = this.getEncryption(expiryTime.toString());
        
        if (this.validate(emailid, errorContainer)) {
            let apiURL = this.apiServer + links.api.baseurl + links.api.admin.forgotpasswordapi;
            let promise = this.forgotpassword(apiURL, emailid, encryptedId, encryptedTime);
            promise.then(function (response) {
                return response.status;
            }).then(function (status) {
                if (status.toString()===errorcodes.SUCCESS) {
                    self.router.parent.navigateByUrl('/forgot-password-confirmation');
                }
                else if (status.toString()===errorcodes.SERVERERROR) {
                    self.showError(forgot_password.failed_sent_mail, errorContainer);
                }
                else {
                    self.showError(forgot_password.invalid_emailid, errorContainer);
                }
            }).catch(function (ex) {
                self.showError(general.exception, errorContainer);
            });
        }
    }
    RedirectToLogin(event) {
        event.preventDefault();
        this.router.parent.navigateByUrl('/');
    }

    validate(emailId, errorContainer) {
        this.clearError(errorContainer);

        if (!this.validations.validateValidEmailId(emailId)) {
            this.showError(forgot_password.email_format_validation, errorContainer);
            return false;
        }
        return true;
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
   
    checkpasswordlength() {
        let password = $('#forgotPassword').val();
        if (password.length > 0) {
            $('#btnSend').removeAttr("disabled");
            $('#btnSend').attr("aria-disabled", "false");
        }
        else {
            $('#btnSend').attr("disabled", "true");
            $('#btnSend').attr("aria-disabled", "true");
        }
    }
    getEncryption(strToEncrypt) {
        let key = CryptoJS.enc.Base64.parse("MTIzNDU2NzgxMjM0NTY3OA==");
        let iv = CryptoJS.enc.Base64.parse("EBESExQVFhcYGRobHB0eHw==");
        let encryptedStr = CryptoJS.AES.encrypt(strToEncrypt, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString();
        // let replaceEscapeFromStr = encryptedStr.replace(/\//g, "#").replace(/=/g,"~");
        return encodeURIComponent(encryptedStr);
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