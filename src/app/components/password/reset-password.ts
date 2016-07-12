import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router-deprecated';
import {Title} from '@angular/platform-browser';
import {Location} from '@angular/common';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {PasswordHeader} from '../password/password-header';
import {Validations} from '../../services/validations';
import {links,errorcodes} from '../../constants/config';
import {general,reset_password,temp_password,login} from '../../constants/error-messages';

@Component({
    selector: 'reset-password',
    providers: [Auth, Common, Validations],
    templateUrl: 'templates/password/reset-password.html',
    directives: [PasswordHeader, RouterLink]
})

export class ResetPassword implements OnInit {
    // errorMessages: any;
    // successMessage: string;
    // config: any;
    apiServer: string;
    sStorage: any;
    constructor(public router: Router, public auth: Auth, public common: Common, public location: Location, public validations: Validations, public titleService: Title) {
        this.apiServer = this.common.getApiServer();
        this.initialize();
        this.sStorage = this.common.getStorage();
    }

    ngOnInit(): void {
        this.titleService.setTitle('Reset Password – Kaplan Nursing');
    }

    initialize() {
        $(document).scrollTop(0);
    }
    
    onResetPassword(txtnPassword, txtcPassword, btnResetPassword, lnkhomeredirect, errorContainer, successcontainer, event) {
        event.preventDefault();
        let self = this;
        let newpassword = txtnPassword.value;
        let confirmpassword = txtcPassword.value;
        if (this.validate(newpassword, confirmpassword, btnResetPassword, lnkhomeredirect, errorContainer, successcontainer)) {
            let url = this.location.path();
            let encryptedExpiry = url.substr(url.lastIndexOf('/') + 1);
            let urlOnlyId = url.substr(0, url.lastIndexOf('/'));
            let encryptedId = urlOnlyId.substr(urlOnlyId.lastIndexOf('/') + 1);

            let decryptedId = this.decryption(encryptedId);
            let decryptedTime = this.decryption(encryptedExpiry);

            let currentTime: any = new Date();
            let isExpire: any = new Date(decryptedTime) - currentTime;
            let status = '';

            if (isExpire < 0)
            {
                this.router.parent.navigateByUrl('/reset-password-expired');
            }
            else if (isExpire.toString() === "NaN")
            { alert('Please refresh the page and try once again.'); }
            else {

                let apiURL = this.apiServer + links.api.baseurl + links.api.admin.settemporarypasswordapi;
                let promise = this.auth.settemporarypassword(apiURL, decryptedId, newpassword);
                promise.then(function(response) {
                    status = response.status;
                    return response.json();
                }).then(function(json) {
                    if (status.toString() === errorcodes.SUCCESS) {
                        txtnPassword.value = "";
                        txtcPassword.value = "";
                        self.AuthanticateUser(decryptedId, newpassword, 'admin', errorContainer);
                        self.showSuccess(successcontainer, lnkhomeredirect, btnResetPassword);
                    }
                    else if (status.toString() === errorcodes.API) {
                        if (json.Payload.length > 0) {
                            if (json.Payload[0].Messages.length > 0) {
                                self.showError(json.Payload[0].Messages[0].toString(), errorContainer);
                                self.clearPasswords(txtnPassword, txtcPassword);
                            }
                        }
                    }
                    else {
                        self.showError(general.exception, errorContainer);
                        self.clearPasswords(txtnPassword, txtcPassword);
                    }
                }).catch(function(ex) {
                    self.showError(general.exception, errorContainer);
                    self.clearPasswords(txtnPassword, txtcPassword);
                });
            }
        }
        else {
            self.clearPasswords(txtnPassword, txtcPassword);
        }
    }

    clearPasswords(txtnPassword, txtcPassword) {
        txtnPassword.value = '';
        txtcPassword.value = '';
    }
    
    RedirectToLogin(event) {
        event.preventDefault();
        this.router.parent.navigateByUrl('/');
    }
    
    // route(path, e) {
    //     this.utility.route(path, this.router, e);
    // }
    validate(newpassword, confirmpassword, btnResetPassword, lnkhomeredirect, errorContainer, successContainer) {
        this.clearError(errorContainer, successContainer, lnkhomeredirect);
        if (!this.validations.comparePasswords(newpassword, confirmpassword)) {
            this.showError(reset_password.newpass_match, errorContainer);
            return false;
        } else if (!this.validations.validateLength(newpassword)) {
            this.showError(reset_password.newpass_character_count, errorContainer);
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword) && !this.validations.validateNumberCount(confirmpassword)) {
            this.showError(reset_password.newpass_number_specialcharacter_validation, errorContainer);
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword)) {
            this.showError(reset_password.newpass_specialcharacter_validation, errorContainer);
            return false;
        } else if (!this.validations.validateNumberCount(confirmpassword)) {
            this.showError(reset_password.newpass_number_validation, errorContainer);
            return false;
        }
        return true;
    }

    clearError(errorContainer, successContainer, lnkhomeredirect) {
        $(lnkhomeredirect).css("display", "none");
        $(successContainer).css("display", "none");
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
    showSuccess(successContainer, lnkhomeredirect, btnResetPassword) {
        $(lnkhomeredirect).css("display", "block");
        $(btnResetPassword).attr("disabled", "true");
        $(btnResetPassword).attr("aria-disabled", "true");
        $(successContainer).css("display", "inline-block");
    }
    checkpasswordlength(txtnewpassword, txtConfirmPassword, btnResetPassword, event) {
        let newpassword = txtnewpassword.value;
        let confirmpassword = txtConfirmPassword.value;
        if (newpassword.length > 0 && confirmpassword.length > 0) {
            $(btnResetPassword).removeAttr("disabled");
            $(btnResetPassword).attr("aria-disabled", "false");
        }
        else {
            $(btnResetPassword).attr("disabled", "true");
            $(btnResetPassword).attr("aria-disabled", "true");
        }
    }
    decryption(strToDecrypt) {
        let key = CryptoJS.enc.Base64.parse("MTIzNDU2NzgxMjM0NTY3OA==");
        let iv = CryptoJS.enc.Base64.parse("EBESExQVFhcYGRobHB0eHw==");
        // let addedEscapeIntoStr = unescape(strToDecrypt).replace(/#/g, "/").replace(/~/g, "=");
        let decodedString = decodeURIComponent(strToDecrypt);
        let decryptedStr = CryptoJS.AES.decrypt(decodedString, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
        return decryptedStr;
    }
    AuthanticateUser(useremail, password, userType, errorContainer) {
        let self = this;
        let apiURL = this.apiServer + links.api.baseurl + links.api.admin.authenticationapi;
        let promise = this.auth.login(apiURL, useremail, password, userType);
        promise.then(function(response) {
            return response.json();
        }).then(function(json) {
            if (json.AccessToken != null && json.AccessToken != '') {
                self.sStorage.setItem('jwt', json.AccessToken);
                self.sStorage.setItem('useremail', json.Email);
                self.sStorage.setItem('istemppassword', json.TemporaryPassword);
                self.sStorage.setItem('userid', json.UserId);
                self.sStorage.setItem('firstname', json.FirstName);
                self.sStorage.setItem('lastname', json.LastName);
                self.sStorage.setItem('title', json.JobTitle);
                // let name = self.getInstitutions(json.Institutions);
                // self.sStorage.setItem('institutions', name);
                self.sStorage.setItem('institutions', JSON.stringify(json.Institutions));
                self.sStorage.setItem('securitylevel', json.SecurityLevel);
            }
            else {
                self.showError(login.auth_failed, errorContainer);
            }
        }).catch(function(ex) {
            self.showError(general.exception, errorContainer);
        });
    }
}