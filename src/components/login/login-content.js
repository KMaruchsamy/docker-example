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
    }

    getErrorMessages() {
        let self = this;
        this.common.getErrorMessages().then(function (response) {
            return response.json()
        }).then(function (json) {
            console.log('parsed json', json)
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
            console.log('parsed json', json)
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

            if (userType === 'admin') {
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
                        let name = self.getInstitutions(json.Institutions);
                        self.sStorage.setItem('institutions', name);
                        self.sStorage.setItem('securitylevel', json.SecurityLevel);
                        if (json.TemporaryPassword) {
                            self.router.parent.navigate('/set-password-first-time');
                        }
                        else {
                            self.router.parent.navigate('/');
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
                $('<form action=' + this.nursingITServer + 's_login.aspx?facultylogin=1 method="POST" target="_blank">' +
                    '<input type="hidden" name="useremail" value="' + useremail + '">' +
                    '<input type="hidden" name="password" value="' + password + '">' +
                    '</form>').submit();
            }


        }
        else {
            txtPassword.value = '';
        }

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
        this.router.parent.navigate('/forgot-password');
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




