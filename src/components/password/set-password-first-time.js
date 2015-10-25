import {Component, View} from 'angular2/angular2';
import {Router, RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {PasswordHeader} from '../password/password-header';
import {Validations} from '../../services/validations';

@Component({
    selector: 'set-password-first-time',
    viewBindings: [Auth, Common, Validations]
})
@View({
    templateUrl: '../../templates/password/set-password-first-time.html',
    directives: [PasswordHeader, RouterLink]
})

export class SetPasswordFirstTime {
    constructor(router: Router, auth: Auth, common: Common, validations: Validations) {
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
        this.reset();
        this.initialize();
        this.sStorage = this.common.sStorage;
    }

    initialize() {
        $('title').html('Kaplan Nursing | Change Password');
    }

    reset() {
        $('#newPassword').val('');
        $('#passwordConfirmation').val('');
        $('.error').hide();
        $('#homelink').css("display", "none");
        $('#successmsg').css("display", "none");
        $('#resetPassword').attr("disabled", "true");
        $('#resetPassword').attr("aria-disabled", "true");
    }

    getErrorMessages() {
        let self = this;
        this.common.getErrorMessages().then(function (response) {
            return response.json();
        }).then(function (json) {
            self.errorMessages = json;
            self.successMessage = json;
        }).catch(function (ex) {
            console.log('parsing failed', ex);
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
    onSetPasswordFirstTime(txtnPassword, txtcPassword, btnSetPassword, lnkhomeredirect, errorContainer, successcontainer, event) {
        event.preventDefault();
        let self = this;
        let emailid = self.auth.useremail;
        let newpassword = txtnPassword.value;
        let confirmpassword = txtcPassword.value;
        let status = '';
        if (this.validate(newpassword, confirmpassword, btnSetPassword, lnkhomeredirect, errorContainer, successcontainer)) {
            let apiURL = this.apiServer + this.config.links.api.baseurl + this.config.links.api.admin.settemporarypasswordapi;
            let promise = this.auth.settemporarypassword(apiURL, emailid, newpassword);
            promise.then(function (response) {
                status = response.status;
                return response.json();
            }).then(function (json) {
                if (status.toString() === self.config.errorcode.SUCCESS) {
                    txtnPassword.value = "";
                    txtcPassword.value = "";
                    self.sStorage.setItem('istemppassword', false);
                    self.showSuccess(successcontainer, lnkhomeredirect, btnSetPassword);
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
    RedirectToHome(event) {
        event.preventDefault();
        this.router.parent.navigateByUrl('/home');
    }

    validate(newpassword, confirmpassword, btnSetPassword, lnkhomeredirect, errorContainer, successContainer) {
        this.clearError(errorContainer, successContainer, lnkhomeredirect);
        if (!this.validations.comparePasswords(newpassword, confirmpassword)) {
            this.showError(this.errorMessages.temp_password.newpass_match, errorContainer);
            return false;
        } else if (!this.validations.validateLength(newpassword)) {
            this.showError(this.errorMessages.temp_password.newpass_character_count, errorContainer);
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword) && !this.validations.validateNumberCount(confirmpassword)) {
            this.showError(this.errorMessages.temp_password.newpass_number_specialcharacter_validation, errorContainer);
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword)) {
            this.showError(this.errorMessages.temp_password.newpass_specialcharacter_validation, errorContainer);
            return false;
        } else if (!this.validations.validateNumberCount(confirmpassword)) {
            this.showError(this.errorMessages.temp_password.newpass_number_validation, errorContainer);
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
    showSuccess(successContainer, lnkhomeredirect, btnSetPassword) {
        $(lnkhomeredirect).css("display", "block");
        $(btnSetPassword).attr("disabled", "true");
        $(btnSetPassword).attr("aria-disabled", "true");
        $(successContainer).css("display", "inline-block");
    }
    checkpasswordlength(txtNewpassword, txtConfirmPassword, btnSetPassword, event) {
        let newpassword = txtNewpassword.value;
        let confirmpassword = txtConfirmPassword.value;
        if (newpassword.length > 0 && confirmpassword.length > 0) {
            $(btnSetPassword).removeAttr("disabled");
            $(btnSetPassword).attr("aria-disabled", "false");
        }
        else {
            $(btnSetPassword).attr("disabled", "true");
            $(btnSetPassword).attr("aria-disabled", "true");
        }
    }
}