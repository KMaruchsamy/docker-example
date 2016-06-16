import {Component} from 'angular2/core';
import {Router, RouteParams} from 'angular2/router';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {Validations} from '../../services/validations';
import * as _ from '../../lib/index';
import {links, errorcodes} from '../../constants/config';
import {manage_account, general, reset_password_after_login, reset_student_password} from '../../constants/error-messages';

@Component({
    selector: 'account',
    providers: [Auth, Common, Validations],
    templateUrl: 'templates/account/account.html',
    directives: [PageHeader, PageFooter]
})

export class Account {
    apiServer: string;
    sStorage: any;
    constructor(public router: Router, public auth: Auth, public common: Common, public validations: Validations, public routeParams: RouteParams) {
        this.sStorage = this.common.getStorage();
        // this.errorMessages = "";
        // this.successMessage = "";
        // this.getErrorMessages();
        // this.config = "";
        this.apiServer = this.common.getApiServer();
        // this.getConfig();
        this.initialize();
        let scroll = this.routeParams.get('scroll');
        if (scroll) {
            this.scroll(scroll);
        }
        else {
            $(document).scrollTop(0);
        }
    }

    getInitialize() {
        // this.sStorage = this.common.sStorage;
        if (this.auth.isAuth()) {
            $('title').html('Manage Account &ndash; Kaplan Nursing');
            $('#firstName').val(this.sStorage.getItem('firstname'));
            $('#lastName').val(this.sStorage.getItem('lastname'));
            $('#facultyTitle').val(this.sStorage.getItem('title'));
            // this.setInstitutionName(this.sStorage.getItem('institutions'));
            this.setInstitutionNames(JSON.parse(this.auth.institutions));
            $('#emailId').text(this.sStorage.getItem('useremail'));
        }
        else {
            this.redirectToLogin();
        }

    }

    scroll(scroll: string): void {
        var headerHeight = $('header').outerHeight(true) + 15;
        switch (scroll) {
            case "send-student-info":
                $('html, body').animate({
                    scrollTop: $("#sendStudentInfo").offset().top-headerHeight
                }, 750, 'swing');
                break;

            default:
                $(document).scrollTop(0);
                break;
        }
    }

    setInstitutionNames(institutions) {
        if (institutions !== null || institutions !== 'undefined')
            $('#schoolName').html(_.pluck(institutions, 'InstitutionNameWithProgOfStudy').join('<br />'));
    }

    initialize() {
        let self = this;
        if (this.auth.isAuth()) {
            let $btnResetResetPassword = $('#btnResetResetPassword');
            let $successResetPasswordContainer = $('#successResetPasswordContainer');

            let $btnClearResetStudentPassword = $('#btnClearResetStudentPassword');
            let $successResetStudentPasswordContainer = $('#successResetStudentPasswordContainer');

            self.getInitialize();
            self.resetProfileFields();
            self.HideChangeEmail();
            self.initializeResetPassword();
            self.initializeResetStudentPassword();

            $('#divNewPasswordInfo').addClass('hidden');

            $('#firstName').bind('input', function() {
                self.checkfirstnamelastname();
                self.resetProfileFields();
            });
            $('#lastName').bind('input', function() {
                self.checkfirstnamelastname();
                self.resetProfileFields();
            });
            $('#facultyTitle').bind('input', function() {
                self.checkfirstnamelastname();
                self.resetProfileFields();
            });
            $('#emailAddress').bind('input', function() {
                self.checkemailpassword();
            });
            $('#txtPassword').bind('input', function() {
                self.checkemailpassword();
            });
            $('#currentPassword').bind('input', function() {
                self.checkpasswordlength();
                if ($btnResetResetPassword.hasClass('hidden'))
                    self.resetSuccess($btnResetResetPassword, $successResetPasswordContainer);
            });
            $('#newPassword').focus(function() {
                $('#divNewPasswordInfo').slideDown('fast', function() {
                    $(this).removeClass('hidden');
                });
            });
            $('#newPassword').bind('input', function() {
                self.checkpasswordlength();
                if ($btnResetResetPassword.hasClass('hidden'))
                    self.resetSuccess($btnResetResetPassword, $successResetPasswordContainer);
            });
            $('#confirmNewPassword').bind('input', function() {
                self.checkpasswordlength();
                if ($btnResetResetPassword.hasClass('hidden'))
                    self.resetSuccess($btnResetResetPassword, $successResetPasswordContainer);
            });
            $('#resetStudentPassword').bind('input', function() {
                self.checkstudentemail();
                if ($btnClearResetStudentPassword.hasClass('hidden'))
                    self.resetSuccess($btnClearResetStudentPassword, $successResetStudentPasswordContainer);
            });
        }
        else {
            self.redirectToLogin();
        }
    }



    redirectToLogin() {
        this.router.parent.navigateByUrl('/');
    }

    onSubmitSaveProfile(txtFirstname, txtLastname, txtTitle, btnSaveProfile, resetSaveProfile, successContainer, event) {
        event.preventDefault();
        let self = this;
        let fname = txtFirstname.value;
        let lname = txtLastname.value;
        let title = txtTitle.value;
        let userid = self.auth.userid;
        let email = self.auth.useremail;
        let authheader = self.auth.authheader;
        let apiURL = this.apiServer + links.api.baseurl + links.api.admin.resetprofileapi;
        let promise = self.saveProfile(apiURL, authheader, userid, fname, lname, title, email);
        promise.then(function(response) {
            return response.status;
        }).then(function(status) {
            if (status.toString() === errorcodes.SUCCESS) {
                self.showSuccess(resetSaveProfile, successContainer, btnSaveProfile);
                self.sStorage.setItem('firstname', fname);
                self.sStorage.setItem('lastname', lname);
                self.sStorage.setItem('title', title);
                self.getInitialize();
            }
            else if (status.toString() === errorcodes.UNAUTHORIZED) {
                self.redirectToLogin();
            }
            else {
                console.log('failed because of ' + status + ' error.');
            }
        }).catch(function(ex) {
            console.log('Exception');
        });
    }

    onCancelSaveProfile(btnSaveProfile, event) {
        event.preventDefault();
        this.getInitialize();
        $(btnSaveProfile).attr("disabled", "true");
        $(btnSaveProfile).attr("aria-disabled", "true");
    }

    resetProfileFields() {
        $('#profilecancel').removeClass('hidden');
        $('#successmsg').addClass('hidden');
    }

    onSubmitChangeEmail(txtNewEmailId, txtPassword, btnChangeEmail, resetEmailSave, SuccessEmailContainer, EmailErrorContainer, PasswordErrorContainer, event) {
        event.preventDefault();
        let self = this;
        let status = 0;
        let newemailid = txtNewEmailId.value;
        this.clearError(EmailErrorContainer, SuccessEmailContainer, 1);
        this.clearError(PasswordErrorContainer, SuccessEmailContainer, 2);
        if (this.validateEmail(newemailid, SuccessEmailContainer, EmailErrorContainer, 0)) {
            let userid = this.auth.userid;
            let email = this.auth.useremail;
            let password = txtPassword.value;
            let authheader = 'Bearer ' + this.sStorage.getItem('jwt');
            let security = this.auth.securitylevel;
            let apiURL = this.apiServer + links.api.baseurl + links.api.admin.resetemailapi;
            let promise = this.resetEmail(apiURL, authheader, userid, newemailid, security, password);
            promise.then(function(response) {
                status = response.status;
                return response.json();
            }).then(function(json) {
                if (status.toString() === errorcodes.SUCCESS) {
                    self.showSuccess(resetEmailSave, SuccessEmailContainer, btnChangeEmail);
                    self.sStorage.setItem('jwt', json.AccessToken);
                    self.sStorage.setItem('useremail', newemailid);
                    self.auth.authheader = 'Bearer ' + json.AccessToken;
                    self.auth.useremail = newemailid
                    $('#emailId').text(newemailid);
                    txtNewEmailId.value = '';
                    // self.getInitialize();
                    setTimeout(function() {
                        $("#changeEmailFormSubmittable").slideUp("slow", function() {
                            $('#changeEmailFormSubmittable').addClass('hidden');
                            $('#showChangeEmail').removeClass('hidden');
                        });
                    }, 3000);
                }
                else if (status.toString() === errorcodes.API) {
                    if (json.Payload.length > 0) {
                        if (json.Payload[0].Messages.length > 0) {
                            self.showError(json.Payload[0].Messages[0].toString(), PasswordErrorContainer, 2);
                        }
                    }
                }
                else {
                    self.showError(general.exception, PasswordErrorContainer, 2);
                }

                txtPassword.value = '';
            }).catch(function(ex) {
                self.showError(general.exception, PasswordErrorContainer, 2);
                txtPassword.value = '';
            });
        }
        else {
            txtPassword.value = '';
        }

    }

    showChangeEmail(btnShowChangeEmail, txtNewEmailId, txtPassword, btnChangeEmail, $event) {
        $('#successemailmsg').addClass('hidden');
        // $('#changeEmailFormSubmittable').show().removeClass('hidden');
        $('#changeEmailFormSubmittable').slideDown('fast', function() {
            $(this).removeClass('hidden');
        });
        $(btnShowChangeEmail).addClass('hidden');
        $('#resetEmailSave').removeClass('hidden');

        txtNewEmailId.value = "";
        txtPassword.value = "";
        $(btnChangeEmail).attr("disabled", "true");
        $(btnChangeEmail).attr("aria-disabled", "true");
        $('#spnEmailErrorMessage').text('');
        $('#spnPasswordErrorMessage').text('');
    }

    HideChangeEmail() {
        $('#changeEmailFormSubmittable').addClass('hidden');
        $('#showChangeEmail').removeClass('hidden');
        $('#successemailmsg').addClass('hidden');
    }

    onCancelChangeEmail(txtNewEmailId, txtPassword, btnChangeEmail, event) {
        $('#showChangeEmail').removeClass('hidden');
        txtNewEmailId.value = "";
        txtPassword.value = "";
        $(btnChangeEmail).attr("disabled", "true");
        $(btnChangeEmail).attr("aria-disabled", "true");
        $('#spnEmailErrorMessage').text('');
        $('#spnPasswordErrorMessage').text('');
        // $('#changeEmailFormSubmittable').hide().addClass('hidden');
        $('#changeEmailFormSubmittable').slideUp('fast', function() {
            $(this).addClass('hidden');
        });
    }





    onSubmitResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword, btnResetResetPassword, CurrentPasswordErrorContainer, ResetPasswordErrorContainer, SuccessResetPasswordContainer, event) {
        event.preventDefault();
        let currentpassword = txtCurrentPassword.value;
        let newpassword = txtNewPassword.value;
        let confirmpassword = txtConfirmPassword.value;
        let status = 0;
        if (this.validatePassword(newpassword, confirmpassword, ResetPasswordErrorContainer, SuccessResetPasswordContainer)) {
            let authheader = this.auth.authheader;
            let userId = this.auth.userid;
            let apiURL = this.apiServer + links.api.baseurl + links.api.admin.resetfacultypasswordafterloginapi;
            let self = this;
            let resetPasswordPromise = this.resetPassword(apiURL, authheader, userId, currentpassword, newpassword);
            resetPasswordPromise.then(function(response) {
                status = response.status;
                return response.json();
            }).then(function(json) {
                if (status.toString() === errorcodes.SUCCESS) {
                    $('#divNewPasswordInfo').slideUp('fast', function() {
                        $(this).addClass('hidden');
                    });
                    SuccessResetPasswordContainer.innerHTML = reset_password_after_login.resetpass_success;
                    self.showSuccess(btnResetResetPassword, SuccessResetPasswordContainer, btnResetPassword);
                    self.clearResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword);
                }
                else if (status.toString() === errorcodes.API) {
                    if (json.Payload.length > 0) {
                        if (json.Payload[0].Messages.length > 0) {
                            self.showError(json.Payload[0].Messages[0].toString(), ResetPasswordErrorContainer, 4);
                            self.clearResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword);
                        }
                    }
                }
                else {
                    self.showError(general.exception, ResetPasswordErrorContainer, 4);
                    self.clearResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword);
                }
            }).catch(function(ex) {
                self.showError(general.exception, ResetPasswordErrorContainer, 4);
                self.clearResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword);
            });
        }
        else {
            this.clearResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword);
        }
    }


    initializeResetPassword() {
        $('#spnCurrentPasswordErrorMessage').text('');
        $('#spnResetPasswordErrorMessage').text('');
        $('#errorResetPasswordContainer').addClass('hidden');
        $('#successResetPasswordContainer').addClass('hidden');
        $('#currentPassword').val('');
        $('#newPassword').val('');
        $('#confirmPassword').val('');
        $('#btnResetPassword').attr("disabled", "true");
        $('#btnResetPassword').attr("aria-disabled", "true");
        $('#btnResetResetPassword').removeClass('hidden');
    }

    clearResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword) {
        txtNewPassword.value = '';
        txtCurrentPassword.value = '';
        txtConfirmPassword.value = '';
        $(btnResetPassword).attr("disabled", "true");
        $(btnResetPassword).attr("aria-disabled", "true");
    }


    onCancelResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword, event) {
        event.preventDefault();
        this.clearResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword);
        $('#spnCurrentPasswordErrorMessage').text('');
        $('#spnResetPasswordErrorMessage').text('');
        $('#divNewPasswordInfo').slideUp('fast', function() {
            $(this).addClass('hidden');
        });
    }


    initializeResetStudentPassword() {
        let $btnStudentReset = $('#btnStudentReset');
        let $btnClearResetStudentPassword = $('#btnClearResetStudentPassword');
        let $spnResetStudentPasswordErrorMessage = $('#spnResetStudentPasswordErrorMessage');
        let $resetstudentpasswordErrorcontainer = $spnResetStudentPasswordErrorMessage.parent('.error');
        $btnStudentReset.attr("disabled", "true");
        $btnStudentReset.attr("aria-disabled", "true");
        $btnClearResetStudentPassword.removeClass('hidden');
        $('#resetStudentPassword').val('');
        $spnResetStudentPasswordErrorMessage.text('');
        if ($resetstudentpasswordErrorcontainer.length > 0)
            $resetstudentpasswordErrorcontainer.addClass('hidden');
        $('#successResetStudentPasswordContainer').addClass('hidden');
    }

    onSubmitResetStudentPassword(txtResetStudentPassword, btnResetStudentPassword, resetStudentPasswordErrorContainer, successResetStudentPasswordContainer, btnClearResetStudentPassword, event) {
        event.preventDefault();
        this.clearError(resetStudentPasswordErrorContainer, successResetStudentPasswordContainer, 5);
        let studentEmailID = txtResetStudentPassword.value;
        if (this.validateEmail(studentEmailID, successResetStudentPasswordContainer, resetStudentPasswordErrorContainer, 1)) {
            let authheader = this.auth.authheader;
            let userId = this.auth.userid;
            let apiURL = this.apiServer + links.api.baseurl + links.api.admin.resetstudentpassword;
            let self = this;
            let status = 0;
            let resetStudentPasswordPromise = this.resetStudentPassword(apiURL, authheader, userId, studentEmailID);
            resetStudentPasswordPromise.then(function(response) {
                status = response.status;
                return response.json();
            }).then(function(json) {
                if (status.toString() === errorcodes.SUCCESS) {
                    successResetStudentPasswordContainer.innerHTML = reset_student_password.success_message;
                    self.showSuccess(btnClearResetStudentPassword, successResetStudentPasswordContainer, btnResetStudentPassword);
                    self.clearResetStudentPassword(txtResetStudentPassword, btnResetStudentPassword);
                }
                else if (status.toString() === errorcodes.API) {
                    if (json.Payload.length > 0) {
                        if (json.Payload[0].Messages.length > 0) {
                            self.showError(json.Payload[0].Messages[0].toString(), resetStudentPasswordErrorContainer, 5);
                            self.clearResetStudentPassword(txtResetStudentPassword, null);
                        }
                    }
                }
                else {
                    self.showError(general.exception, resetStudentPasswordErrorContainer, 5);
                    self.clearResetStudentPassword(txtResetStudentPassword, null);
                }
            }).catch(function(ex) {
                self.showError(general.exception, resetStudentPasswordErrorContainer, 5);
                self.clearResetStudentPassword(txtResetStudentPassword, null);
            });
        }
    }

    clearResetStudentPassword(txtResetStudentPassword, btnClearResetStudentPassword) {
        txtResetStudentPassword.value = '';
        if (btnClearResetStudentPassword) {
            $(btnClearResetStudentPassword).attr("disabled", "true");
            $(btnClearResetStudentPassword).attr("aria-disabled", "true");
        }

    }

    onCancelResetStudentPassword(txtResetStudentPassword, btnResetStudentPassword, event) {
        txtResetStudentPassword.value = "";
        $(btnResetStudentPassword).attr("disabled", "true");
        $(btnResetStudentPassword).attr("aria-disabled", "true");
        $('#spnResetStudentPasswordErrorMessage').text('');
    }

    checkfirstnamelastname() {
        let fname = $('#firstName').val();
        let lname = $('#lastName').val();
        let title = $('#facultyTitle').val();
        if (fname.length > 0 && lname.length > 0) {
            // this.sStorage = this.common.sStorage;
            let ofname = this.sStorage.getItem('firstname');
            let olname = this.sStorage.getItem('lastname');
            let otitle = this.sStorage.getItem('title');
            if (!(fname === ofname && lname === olname && title === otitle)) {
                $('#btnProfileSave').removeAttr("disabled");
                $('#btnProfileSave').attr("aria-disabled", "false");
            }
            else {
                $('#btnProfileSave').attr("disabled", "true");
                $('#btnProfileSave').attr("aria-disabled", "true");
            }
        }
        else {
            $('#btnProfileSave').attr("disabled", "true");
            $('#btnProfileSave').attr("aria-disabled", "true");
        }
    }

    checkemailpassword() {
        let email = $('#emailAddress').val();
        let password = $('#txtPassword').val();
        if (email.length > 0 && password.length > 0) {
            $('#ChangeEmail').removeAttr("disabled");
            $('#ChangeEmail').attr("aria-disabled", "false");
        }
        else {
            $('#ChangeEmail').attr("disabled", "true");
            $('#ChangeEmail').attr("aria-disabled", "true");
        }
    }

    checkpasswordlength() {
        let currentpassword = $('#currentPassword').val();
        let newpassword = $('#newPassword').val();
        let cpassword = $('#confirmNewPassword').val();
        if (currentpassword.length > 0 && newpassword.length > 0 && cpassword.length > 0) {
            $('#btnResetPassword').removeAttr("disabled");
            $('#btnResetPassword').attr("aria-disabled", "false");
        }
        else {
            $('#btnResetPassword').attr("disabled", "true");
            $('#btnResetPassword').attr("aria-disabled", "true");
        }
    }

    checkstudentemail() {
        let email = $('#resetStudentPassword').val();
        if (email.length > 0) {
            $('#btnStudentReset').removeAttr("disabled");
            $('#btnStudentReset').attr("aria-disabled", "false");
        }
        else {
            $('#btnStudentReset').attr("disabled", "true");
            $('#btnStudentReset').attr("aria-disabled", "true");
        }
    }

    validateEmail(email, successContainer, errorContainer, flag) {
        if (!this.validations.validateValidEmailId(email)) {
            if (flag == 0) {
                this.showError(manage_account.email_format_validation, errorContainer, 1);
            }
            else {
                this.showError(manage_account.email_format_validation, errorContainer, 5);
            }

            return false;
        }
        return true;
    }

    validatePassword(newpassword, confirmpassword, errorContainer, successContainer) {
        this.clearError(errorContainer, successContainer, 4);
        if (!this.validations.comparePasswords(newpassword, confirmpassword)) {
            this.showError(manage_account.newpass_match, errorContainer, 4);
            return false;
        } else if (!this.validations.validateLength(newpassword)) {
            this.showError(manage_account.newpass_character_count, errorContainer, 4);
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword) && !this.validations.validateNumberCount(confirmpassword)) {
            this.showError(manage_account.newpass_number_specialcharacter_validation, errorContainer, 4);
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword)) {
            this.showError(manage_account.newpass_specialcharacter_validation, errorContainer, 4);
            return false;
        } else if (!this.validations.validateNumberCount(confirmpassword)) {
            this.showError(manage_account.newpass_number_validation, errorContainer, 4);
            return false;
        }
        return true;
    }

    clearError(errorContainer, successContainer, fieldcount) {
        $(successContainer).addClass("hidden");
        let $container;
        switch (fieldcount) {
            case 1:
                $container = $(errorContainer).find('#spnEmailErrorMessage');
                break;
            case 2:
                $container = $(errorContainer).find('#spnPasswordErrorMessage');
                break;
            case 3:
                $container = $(errorContainer).find('#spnCurrentPasswordErrorMessage');
                break;
            case 4:
                $container = $(errorContainer).find('#spnResetPasswordErrorMessage');
                break;
            case 5:
                $container = $(errorContainer).find('#spnResetStudentPasswordErrorMessage');
                break;
        }
        let $outerContainer = $(errorContainer);
        $container.html('');
        $outerContainer.addClass('hidden');
    }

    showError(errorMessage, errorContainer, fieldcount) {
        let $container = "";
        switch (fieldcount) {
            case 1:
                $container = $(errorContainer).find('#spnEmailErrorMessage');
                break;
            case 2:
                $container = $(errorContainer).find('#spnPasswordErrorMessage');
                break;
            case 3:
                $container = $(errorContainer).find('#spnCurrentPasswordErrorMessage');
                break;
            case 4:
                $container = $(errorContainer).find('#spnResetPasswordErrorMessage');
                break;
            case 5:
                $container = $(errorContainer).find('#spnResetStudentPasswordErrorMessage');
                break;
        }

        let $outerContainer = $(errorContainer);
        $container.html(errorMessage);
        $outerContainer.removeClass('hidden');
    }

    resetSuccess($resetLink, $successContainer) {
        $resetLink.removeClass('hidden');
        $successContainer.addClass('hidden');
    }

    showSuccess(resetLink, successContainer, btnSave) {
        $(resetLink).addClass('hidden');
        $(btnSave).attr("disabled", "true");
        $(btnSave).attr("aria-disabled", "true");
        $(successContainer).removeClass('hidden');
    }

    saveProfile(url, authheader, userid, fname, lname, title, email) {
        return fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authheader
            },
            body: JSON.stringify({
                userid: userid,
                Firstname: fname,
                LastName: lname,
                Jobtitle: title,
                Email: email
            })
        });
    }

    resetEmail(url, authheader, userid, email, security, password) {
        return fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authheader
            },
            body: JSON.stringify({
                userid: userid,
                Email: email,
                SecurityLevel: security,
                Password: password
            })
        });
    }


    resetPassword(url, authheader, userid, currentPassword, newPassword) {
        return fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authheader
            },
            body: JSON.stringify({
                userid: userid,
                Password: currentPassword,
                NewPassword: newPassword
            })
        });
    }


    resetStudentPassword(url, authheader, userid, studentEmail) {
        return fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authheader
            },
            body: JSON.stringify({
                userid: userid,
                StudentEmail: studentEmail
            })
        });
    }
}