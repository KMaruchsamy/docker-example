/// <reference path="../../../typings/jquery/jquery.d.ts"/>

import {View, Component} from 'angular2/angular2';
import {Router, RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from '../../lib/index';


@Component({
    selector: 'login-content',
    viewBindings: [Auth, Common]
})
@View({
    templateUrl: '../../templates/login/login-content.html',
    directives: [RouterLink]
})

export class LoginContent {
    constructor(router: Router, auth: Auth, common: Common) {
        this.router = router;
        this.auth = auth;
        this.common = common;
        this.errorMessages = '';
        this.config = '';
        this.apiServer = '';
        this.nursingITServer = '';
        this.getErrorMessages();
        this.getConfig();
        this.sStorage = this.common.sStorage;
        this.institutionRN = 0;
        this.institutionPN = 0;
    }

    getErrorMessages() {
        let self = this;
        this.common.getErrorMessages().then(function (response) {
            return response.json()
        }).then(function (json) {
            self.errorMessages = json
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
            self.getNursingITServer();
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

    getNursingITServer() {
        let configJSON = this.config;
        if (location.hostname.indexOf('localhost') > -1)
            this.nursingITServer = configJSON.links.nursingit.local.server;
        if (location.hostname.indexOf('dev') > -1)
            this.nursingITServer = configJSON.links.nursingit.dev.server;
        if (location.hostname.indexOf('qa') > -1)
            this.nursingITServer = configJSON.links.nursingit.qa.server;
    }


    onSignIn(txtUserName, txtPassword, rdFaculty, rdStudent, errorContainer, btnSignIn, event) {
        event.preventDefault();
        let self = this;
        let useremail = txtUserName.value;
        let password = txtPassword.value;
        if (this.validate(useremail, password, errorContainer)) {
            let userType = '';
            if (rdFaculty.checked)
                userType = 'admin';
            else
                userType = 'student';

            let apiURL = this.apiServer + this.config.links.api.baseurl + this.config.links.api.admin.authenticationapi;
            let promise = this.auth.login(apiURL, useremail, password, userType);
            promise.then(function (response) {
                return response.json();
            }).then(function (json) {
                if (json.AccessToken != null && json.AccessToken != '') {
                    self.sStorage.setItem('jwt', json.AccessToken);
                    self.sStorage.setItem('useremail', json.Email);
                    self.sStorage.setItem('istemppassword', json.TemporaryPassword);
                    self.sStorage.setItem('userid', json.UserId);
                    self.sStorage.setItem('firstname', json.FirstName);
                    self.sStorage.setItem('lastname', json.LastName);
                    self.sStorage.setItem('title', json.JobTitle);
                    self.sStorage.setItem('institutions', JSON.stringify(json.Institutions));
                    self.sStorage.setItem('securitylevel', json.SecurityLevel);
                    self.sStorage.setItem('username', json.UserName);
                    self.sStorage.setItem('password', password);
                    self.auth.refresh();
                    if (userType === 'student') {
                        self.prepareRedirectToStudentSite('Login');
                    }
                    else {
                        if (json.TemporaryPassword) {
                            self.router.parent.navigateByUrl('/set-password-first-time');
                        }
                        else {
                            self.router.parent.navigateByUrl('/');
                        }
                    }
                }
                else {
                    self.showError(self.errorMessages.login.auth_failed, errorContainer);
                    txtPassword.value = '';
                }
            }).catch(function (ex) {
                self.showError(self.errorMessages.general.exception, errorContainer);
                txtPassword.value = '';
            });
        }
        else {
            txtPassword.value = '';
        }

    }

    prepareRedirectToStudentSite(returnPage) {
        this.page = 'StudentHome';
        this.form = document.getElementById('myForm');
        this.hdInstitution = document.getElementById('institutionID');
        this.hdToken = document.getElementById('jwtToken');
        this.hdURL = document.getElementById('redirectPage');
        this.checkInstitutions();

        if (this.institutionRN > 0 && this.institutionPN > 0) {
            // open the interstitial page here ...
            // this.router.parent.navigate(['/ChooseInstitution', { page: this.page, idRN: this.institutionRN, idPN: this.institutionPN }]);
            this.router.parent.navigateByUrl(`/choose-institution/${returnPage}/${this.page}/${this.institutionRN}/${this.institutionPN}`);
        }
        else {
            this.redirectToStudentSite();
        }
    }

    redirectToStudentSite() {
        var serverURL = this.common.nursingITServer + this.common.config.links.nursingit.landingpage;
        this.hdInstitution.value = (this.institutionRN > 0) ? this.institutionRN : this.institutionPN;
        this.hdToken.value = this.auth.token
        this.hdURL.value = this.page;
        console.log(this.hdInstitution.value);
        this.auth.logout();
        $(this.form).attr('ACTION', serverURL).submit();
       
    }

    checkInstitutions() {
        let institutions = _.sortByOrder(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc');
        if (institutions != null && institutions != 'undefined') {
            let institutionsRN = _.pluck(_.filter(institutions, { 'ProgramofStudyName': 'RN' }), 'InstitutionId');
            let institutionsPN = _.pluck(_.filter(institutions, { 'ProgramofStudyName': 'PN' }), 'InstitutionId');
            if (institutionsRN.length > 0)
                this.institutionRN = institutionsRN[0];
            if (institutionsPN.length > 0)
                this.institutionPN = institutionsPN[0];
        }
    }

    validate(email, password, errorContainer) {
        if (!this.validateEmail(email) && !this.validatePassword(password)) {
            this.showError(this.errorMessages.login.email_pass_required_validation, errorContainer);
            return false;
        } else if (!this.validateEmail(email)) {
            this.showError(this.errorMessages.login.email_required_validation, errorContainer);
            return false;
        } else if (!this.validateEmailFormat(email)) {
            this.showError(this.errorMessages.login.email_format_validation, errorContainer);
            return false;
        } else if (!this.validatePassword(password)) {
            this.showError(this.errorMessages.login.pass_required_validation, errorContainer);
            return false;
        }

        return true;
    }

    validatePassword(password) {
        if (password === null || password === '')
            return false;
        return true;
    }

    validateEmail(email) {
        if (email === null || email === '')
            return false;
        return true;
    }

    validateEmailFormat(email) {
        let re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
    }

    clearError(errorContainer) {
        let $container = $(errorContainer).find('span#spnErrorMessage');
        let $outerContainer = $(errorContainer);
        $container.html('');
        $outerContainer.addClass('hidden');
    }

    showError(errorMessage, errorContainer) {
        this.clearError(errorContainer);
        let $container = $(errorContainer).find('span#spnErrorMessage');
        let $outerContainer = $(errorContainer);
        $container.html(errorMessage);
        $outerContainer.removeClass('hidden').show();
    }

    closealert(btnClose) {
        $(btnClose).closest('div.alert').fadeOut(function () {
            $(this).addClass('hidden');
        });
    }
    RedirectToForgotpassword(event) {
        event.preventDefault();
        this.router.parent.navigateByUrl('/forgot-password');
    }

    radioChanged(elem, otherElem) {
        let $elem = $(elem);
        let $otherElem = $(otherElem);
        if ($elem.is(':checked')) {
            $elem.attr('aria-checked', true).attr('checked', true);
            $otherElem.attr('aria-checked', false).removeAttr('checked');
        }
        else {
            $elem.attr('aria-checked', false).removeAttr('checked');
            $otherElem.attr('aria-checked', true).attr('checked', true);;
        }

    }
}




