import {Component, View} from 'angular2/angular2';
import {Router, Location, RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {PasswordHeader} from '../password/password-header';
import {Validations} from '../../services/validations';

@Component({
    selector: 'reset-password',
    viewBindings: [Auth, Common, Validations]
})
@View({
    templateUrl: '../../templates/password/reset-password.html',
    directives: [PasswordHeader, RouterLink]
})

export class ResetPassword {
    constructor(router: Router, auth: Auth, common: Common, location: Location, validations: Validations) {
        this.location = location;
        this.router = router;
        this.auth = auth;
        this.common = common;
        this.validations = validations;
        this.errorMessages = "";
        this.successMessage = "";
        this.getErrorMessages();
        this.config = "";
        this.apiServer = "";
        this.getConfig();
        this.initialize();
        this.sStorage = this.common.sStorage;
    }

    initialize() {
        $('title').html('Reset Password  |  Kaplan Nursing');
    }

    getErrorMessages() {
        let self = this;
        this.common.getErrorMessages().then(function (response) {
            return response.json()
        }).then(function (json) {
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

            let currentTime = new Date();
            let isExpire = new Date(decryptedTime) - currentTime;
            let status = '';

            if (isExpire < 0)
            { alert('Page has been expired!'); }
            else if (isExpire.toString() === "NaN")
            { alert('Please refresh the page and try once again.'); }
            else {

                let apiURL = this.apiServer + this.config.links.api.baseurl + this.config.links.api.admin.settemporarypasswordapi;
                let promise = this.auth.settemporarypassword(apiURL, decryptedId, newpassword);
                promise.then(function (response) {
                    status = response.status;
                    return response.json();
                }).then(function (json) {
                    if (status.toString() === self.config.errorcode.SUCCESS) {
                        txtnPassword.value = "";
                        txtcPassword.value = "";
                        self.AuthanticateUser(decryptedId, newpassword, 'admin');
                        self.showSuccess(successcontainer, lnkhomeredirect, btnResetPassword);
                    }
                    else if (status.toString() === self.config.errorcode.API) {
                        if (json.Payload.length > 0) {
                            if (json.Payload[0].Messages.length > 0) {
                                self.showError(json.Payload[0].Messages[0].toString(), errorContainer);  
                                self.clearPasswords(txtnPassword, txtcPassword);                              
                            }
                        }
                    }
                    else {
                        self.showError(self.errorMessages.temp_password.valid_emailid, errorContainer);
                        self.clearPasswords(txtnPassword, txtcPassword);
                    }
                }).catch(function (ex) {
                    self.showError(self.errorMessages.general.exception, errorContainer);
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
        this.router.parent.navigateByUrl('/login');
    }
    route(path, e) {
        this.utility.route(path, this.router, e);
    }
    validate(newpassword, confirmpassword, btnResetPassword, lnkhomeredirect, errorContainer, successContainer) {
        this.clearError(errorContainer, successContainer, lnkhomeredirect);
        if (!this.validations.comparePasswords(newpassword, confirmpassword)) {
            this.showError(this.errorMessages.reset_password.newpass_match, errorContainer);
            return false;
        } else if (!this.validations.validateLength(newpassword)) {
            this.showError(this.errorMessages.reset_password.newpass_character_count, errorContainer);
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword) && !this.validations.validateNumberCount(confirmpassword)) {
            this.showError(this.errorMessages.reset_password.newpass_number_specialcharacter_validation, errorContainer);
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword)) {
            this.showError(this.errorMessages.reset_password.newpass_specialcharacter_validation, errorContainer);
            return false;
        } else if (!this.validations.validateNumberCount(confirmpassword)) {
            this.showError(this.errorMessages.reset_password.newpass_number_validation, errorContainer);
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
        let addedEscapeIntoStr = unescape(strToDecrypt).replace(/#/g, "/").replace(/~/g, "=");
        let decryptedStr = CryptoJS.AES.decrypt(addedEscapeIntoStr, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
        return decryptedStr;
    }
    AuthanticateUser(useremail, password, userType) {
        let self = this;
        let apiURL = this.apiServer + this.config.links.api.baseurl + this.config.links.api.admin.authenticationapi;
        let promise = this.auth.login(apiURL, useremail, password, userType);
        promise.then(function (response) {
            return response.json();
        }).then(function (json) {
            if (json.AccessToken != null && json.AccessToken != '') {
                // if (self.common.isPrivateBrowsing()) {
                //     this.sStorage = window.sessionStorage.__proto__;                        
                // }                  
                self.sStorage.setItem('jwt', json.AccessToken);
                self.sStorage.setItem('useremail', json.Email);
                self.sStorage.setItem('istemppassword', json.TemporaryPassword);
                self.sStorage.setItem('userid', json.UserId);
                self.sStorage.setItem('firstname', json.FirstName);
                self.sStorage.setItem('lastname', json.LastName);
                self.sStorage.setItem('title', json.JobTitle);
                let name = self.getInstitutions(json.Institutions);
                self.sStorage.setItem('institutions', name);
                self.sStorage.setItem('securitylevel', json.SecurityLevel);
            }
            else {
                self.showError(self.errorMessages.login.auth_failed, errorContainer);
            }
        }).catch(function (ex) {
            self.showError(self.errorMessages.general.exception, errorContainer);
        });
    }
    getInstitutions(institutionarr) {
        var len1 = institutionarr.length;
        var name = "";
        for (var i = 0; i < len1; i++) {
            if (institutionarr[i].InstitutionNameWithProgOfStudy != "") {
                if (name === "")
                    name = institutionarr[i].InstitutionNameWithProgOfStudy + '|';
                else
                    name = name + institutionarr[i].InstitutionNameWithProgOfStudy + '|';
            }
        }
        if (name != null && name != "") {
            if (name.indexOf('|') > 0) {
                name = name.substr(0, name.lastIndexOf('|'));
            }
        }
        return name;
    }
}