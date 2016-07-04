import {Component, View} from '@angular/core';
import {Router, RouterLink} from '@angular/router-deprecated';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {PasswordHeader} from '../password/password-header';
import {Validations} from '../../services/validations';
import {links,errorcodes} from '../../constants/config';
import {temp_password,general} from '../../constants/error-messages';

@Component({
    selector: 'set-password-first-time',
    providers: [Auth, Common, Validations],
    templateUrl: 'templates/password/set-password-first-time.html',
    directives: [PasswordHeader, RouterLink]
})

export class SetPasswordFirstTime {
    apiServer:string;
    sStorage:any;
    constructor(public router: Router,public auth: Auth,public common: Common,public validations: Validations) {
        this.apiServer = this.common.getApiServer();
        this.reset();
        this.initialize();
        this.sStorage = this.common.getStorage();
    }

    initialize() {
        $('title').html('Change Password &ndash; Kaplan Nursing');
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

    onSetPasswordFirstTime(txtnPassword, txtcPassword, btnSetPassword, lnkhomeredirect, errorContainer, successcontainer, event) {
        event.preventDefault();
        let self = this;
        let emailid = self.auth.useremail;
        let newpassword = txtnPassword.value;
        let confirmpassword = txtcPassword.value;
        let status = '';
        if (this.validate(newpassword, confirmpassword, btnSetPassword, lnkhomeredirect, errorContainer, successcontainer)) {
            let apiURL = this.apiServer + links.api.baseurl + links.api.admin.settemporarypasswordapi;
            let promise = this.auth.settemporarypassword(apiURL, emailid, newpassword);
            promise.then(function (response) {
                status = response.status;
                return response.json();
            }).then(function (json) {
                if (status.toString() === errorcodes.SUCCESS) {
                    txtnPassword.value = "";
                    txtcPassword.value = "";
                    self.sStorage.setItem('istemppassword', false);
                    self.showSuccess(successcontainer, lnkhomeredirect, btnSetPassword);
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
            }).catch(function (ex) {
                self.showError(general.exception, errorContainer);
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
        this.router.parent.navigateByUrl('/');
    }
    RedirectToHome(event) {
        event.preventDefault();
        this.router.parent.navigateByUrl('/home');
    }

    validate(newpassword, confirmpassword, btnSetPassword, lnkhomeredirect, errorContainer, successContainer) {
        this.clearError(errorContainer, successContainer, lnkhomeredirect);
        if (!this.validations.comparePasswords(newpassword, confirmpassword)) {
            this.showError(temp_password.newpass_match, errorContainer);
            return false;
        } else if (!this.validations.validateLength(newpassword)) {
            this.showError(temp_password.newpass_character_count, errorContainer);
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword) && !this.validations.validateNumberCount(confirmpassword)) {
            this.showError(temp_password.newpass_number_specialcharacter_validation, errorContainer);
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword)) {
            this.showError(temp_password.newpass_specialcharacter_validation, errorContainer);
            return false;
        } else if (!this.validations.validateNumberCount(confirmpassword)) {
            this.showError(temp_password.newpass_number_validation, errorContainer);
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