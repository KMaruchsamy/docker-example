﻿import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription, Observable} from 'rxjs/Rx';
import {Router, ActivatedRoute} from '@angular/router';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Title} from '@angular/platform-browser';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {Validations} from '../../services/validations';
import * as _ from 'lodash';
import {links, errorcodes} from '../../constants/config';
import {manage_account, general, reset_password_after_login, reset_student_password} from '../../constants/error-messages';
import {Log} from '../../services/log';

@Component({
    selector: 'account',
    providers: [Auth, Common, Validations, Log],
    templateUrl: 'templates/account/account.html',
    directives: [PageHeader, PageFooter]
})

export class Account implements OnInit, OnDestroy {
    apiServer: string;
    sStorage: any;
    saveProfileSubscription: Subscription;
    resetEmailSubscription: Subscription;
    resetPasswordSubscription: Subscription;
    resetStudentPasswordSubscription: Subscription;
    routeSubscription: Subscription;
    errorCodes: any;
    firstName: string;
    lastName: string;
    facultyTitle: string;
    emailId: string;
    schoolName: Array<any>;
    noProfileChanges: boolean = true;
    profileChanged: boolean = false;
    showChangeEmailSection: boolean = false;
    changedEmail: boolean = false;
    showChangeEmailButton: boolean = true;
    changeEmailDisabled: boolean = true;
    passwordReset: boolean = false;
    resetPasswordSuccessMessage: string;
    showHintMessage: boolean = false;
    studentPasswordResetSuccessMessage: string;
    studentPasswordReset: boolean = false;
    studentEmailCleared: boolean = false;
    // error messages
    changeEmailErrorMessage: string;
    changeEmailPasswordErrorMessage: string;
    resetPasswordErrorMessage: string;
    passwordErrorMessage: string;
    sendStudentPasswordErrorMessage: string;
    emailValidationEror: string;
    constructor(private http: Http, public router: Router, private activatedRoute: ActivatedRoute, public auth: Auth, public common: Common, public validations: Validations, public titleService: Title, private log: Log) {
    }

    ngOnDestroy(): void {
        if (this.saveProfileSubscription)
            this.saveProfileSubscription.unsubscribe();
        if (this.resetEmailSubscription)
            this.resetEmailSubscription.unsubscribe();
        if (this.resetPasswordSubscription)
            this.resetPasswordSubscription.unsubscribe();
        if (this.resetStudentPasswordSubscription)
            this.resetStudentPasswordSubscription.unsubscribe();
        if (this.routeSubscription)
            this.routeSubscription.unsubscribe();
    }

    ngOnInit(): void {
        this.errorCodes = errorcodes;
        this.titleService.setTitle('Manage Account – Kaplan Nursing');
        this.sStorage = this.common.getStorage();
        this.apiServer = this.common.getApiServer();
        this.initialize();
        window.scroll(0,0);
    }

    getInitialize() {
        if (this.auth.isAuth()) {
          this.firstName = this.sStorage.getItem('firstname');
          this.lastName = this.sStorage.getItem('lastname');
          this.facultyTitle = this.sStorage.getItem('title');
          this.setInstitutionNames(JSON.parse(this.auth.institutions));
          this.emailId = this.sStorage.getItem('useremail');
        }
        else {
            this.redirectToLogin();
        }

    }

    setInstitutionNames(institutions) {
        if (institutions !== null || institutions !== 'undefined') {
            this.schoolName = _.map(institutions, 'InstitutionNameWithProgOfStudy');
        }
    }

    initialize() {
        let self = this;
        if (this.auth.isAuth()) {
            self.getInitialize();
        }
        else {
            self.redirectToLogin();
        }
    }

    redirectToLogin() {
        this.router.navigateByUrl('/');
    }

    onSubmitSaveProfile(txtFirstname, txtLastname, txtTitle, event) {
        event.preventDefault();
        let self = this;
        let fname = txtFirstname.value;
        let lname = txtLastname.value;
        let title = txtTitle.value;
        let userid = self.auth.userid;
        let email = self.auth.useremail;
        let authheader = self.auth.authheader;
        let apiURL = this.apiServer + links.api.baseurl + links.api.admin.resetprofileapi;
        let saveProfileObservable: Observable<Response> = self.saveProfile(apiURL, authheader, userid, fname, lname, title, email);
        this.saveProfileSubscription = saveProfileObservable
            .map(response => response.status)
            .subscribe(status => {
                if (status.toString() === this.errorCodes.SUCCESS) {
                    this.profileChanged = true;
                    self.sStorage.setItem('firstname', fname);
                    self.sStorage.setItem('lastname', lname);
                    self.sStorage.setItem('title', title);
                    self.getInitialize();
                }
                else if (status.toString() === this.errorCodes.UNAUTHORIZED) {
                    self.redirectToLogin();
                }
                else {
                    console.log('failed because of ' + status + ' error.');
                }
            }, error => console.log(error));
    }

    onCancelSaveProfile(event) {
        event.preventDefault();
        this.getInitialize();
        this.noProfileChanges = true;
    }

    resetProfileFields() {
        this.profileChanged = false;
    }

    onSubmitChangeEmail(txtNewEmailId, txtPassword, event) {
        event.preventDefault();
        let self = this;
        let status = 0;
        let newemailid = txtNewEmailId.value;
        if (this.validations.validateEmailFormat(newemailid)) {
            let userid = this.auth.userid;
            let email = this.auth.useremail;
            let password = txtPassword.value;
            let authheader = 'Bearer ' + this.sStorage.getItem('jwt');
            let security = this.auth.securitylevel;
            let apiURL = this.apiServer + links.api.baseurl + links.api.admin.resetemailapi;
            let resetEmailObservable: Observable<Response> = this.resetEmail(apiURL, authheader, userid, newemailid, security, password);
            this.resetEmailSubscription = resetEmailObservable
                .map(response => {
                    status = response.status;
                    return response.json();
                })
                .subscribe(json => {
                    if (status.toString() === this.errorCodes.SUCCESS) {
                        self.sStorage.setItem('jwt', json.AccessToken);
                        self.sStorage.setItem('useremail', newemailid);
                        self.auth.authheader = 'Bearer ' + json.AccessToken;
                        self.auth.useremail = newemailid
                        this.emailId = newemailid;
                        // clear inputs
                        txtNewEmailId.value = '';
                        txtPassword.value = '';
                        // clear any existing error messages
                        this.changeEmailPasswordErrorMessage = '';
                        this.changeEmailErrorMessage = '';

                        this.changedEmail = true;
                        setTimeout(() => {
                            this.changedEmail = false;
                            this.showChangeEmailSection = false;
                        },3000)
                    }
                    else if (status.toString() === this.errorCodes.API) {
                        if (json.Payload.length > 0) {
                            if (json.Payload[0].Messages.length > 0) {
                                this.changeEmailPasswordErrorMessage = json.Payload[0].Messages[0].toString()
                                txtPassword.value = '';
                            }
                        }
                    }
                    else {
                        this.changeEmailPasswordErrorMessage = general.exception;
                        txtPassword.value = '';
                    }
                },
                error => {
                    if (error.status.toString() === this.errorCodes.API) {
                        if (error.json().Payload.length > 0) {
                            if (error.json().Payload[0].Messages.length > 0) {
                                this.changeEmailPasswordErrorMessage = error.json().Payload[0].Messages[0].toString();
                            }
                        }
                    }
                    else {
                        this.changeEmailPasswordErrorMessage = general.exception;
                    }
                    txtPassword.value = '';
                });
        }
        else {
            txtPassword.value = '';
            this.changeEmailErrorMessage = manage_account.email_format_validation;
        }

    }
    
    showChangeEmail() {
        this.changedEmail = false;
        this.showChangeEmailSection = true;
    }

    onCancelChangeEmail() {
        this.showChangeEmailSection = false;
        this.changeEmailErrorMessage = '';
        this.changeEmailPasswordErrorMessage = '';
    }

    showHint() {
        this.showHintMessage = true;
    }

    onSubmitResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, event) {
        event.preventDefault();
        let currentpassword = txtCurrentPassword.value;
        let newpassword = txtNewPassword.value;
        let confirmpassword = txtConfirmPassword.value;
        let status = 0;
        if (this.validatePassword(newpassword, confirmpassword)) {
            let authheader = this.auth.authheader;
            let userId = this.auth.userid;
            let apiURL = this.apiServer + links.api.baseurl + links.api.admin.resetfacultypasswordafterloginapi;
            let self = this;
            let resetPasswordObservable: Observable<Response> = this.resetPassword(apiURL, authheader, userId, currentpassword, newpassword);
            this.resetPasswordSubscription = resetPasswordObservable
                .map(response => {
                    status = response.status;
                    return response.json();
                })
                .subscribe(json => {
                    if (status.toString() === this.errorCodes.SUCCESS) {
                        this.passwordReset = true;
                        this.showHintMessage = false;
                        this.resetPasswordSuccessMessage = reset_password_after_login.resetpass_success;
                        this.clearResetPasswordInputs(txtCurrentPassword, txtNewPassword, txtConfirmPassword);
                        this.resetPasswordErrorMessage = '';
                    }
                    else if (status.toString() === this.errorCodes.API) {
                        if (json.Payload.length > 0) {
                            if (json.Payload[0].Messages.length > 0) {
                                this.passwordErrorMessage = json.Payload[0].Messages[0].toString();
                                this.clearResetPasswordInputs(txtCurrentPassword, txtNewPassword, txtConfirmPassword);
                            }
                        }
                    }
                    else {
                        this.passwordErrorMessage = general.exception;
                        this.clearResetPasswordInputs(txtCurrentPassword, txtNewPassword, txtConfirmPassword);
                    }
                }, error => {
                    if (error.status.toString() === this.errorCodes.API) {
                        if (error.json().Payload.length > 0) {
                            if (error.json().Payload[0].Messages.length > 0) {
                                this.passwordErrorMessage = error.json().Payload[0].Messages[0].toString();
                                this.clearResetPasswordInputs(txtCurrentPassword, txtNewPassword, txtConfirmPassword);
                            }
                        }
                    }
                    else {
                        this.passwordErrorMessage = general.exception;
                        this.clearResetPasswordInputs(txtCurrentPassword, txtNewPassword, txtConfirmPassword);
                    }

                });
        }
        else {
            this.clearResetPasswordInputs(txtCurrentPassword, txtNewPassword, txtConfirmPassword);
        }
    }

    clearResetPasswordInputs(txtCurrentPassword, txtNewPassword, txtConfirmPassword) {
        txtNewPassword.value = '';
        txtCurrentPassword.value = '';
        txtConfirmPassword.value = '';
    }

    onCancelResetPassword() {
        this.resetPasswordErrorMessage = '';
        this.resetPasswordSuccessMessage = '';
        this.showHintMessage = false;
    }

    onSubmitSendStudentPassword(txtResetStudentPassword, event) {
        event.preventDefault();
        let studentEmailID = txtResetStudentPassword.value;

        if (this.validations.validateEmailFormat(studentEmailID)) {
            let authheader = this.auth.authheader;
            let userId = this.auth.userid;
            let apiURL = this.apiServer + links.api.baseurl + links.api.admin.resetstudentpassword;
            let self = this;
            let status = 0;
            let resetStudentPasswordObservable: Observable<Response> = this.resetStudentPassword(apiURL, authheader, userId, studentEmailID);
            this.resetStudentPasswordSubscription = resetStudentPasswordObservable
                .map(response => {
                    status = response.status;
                    return response.json();
                })
                .subscribe(json => {
                    debugger;
                    if (status.toString() === this.errorCodes.SUCCESS) {
                        this.studentPasswordResetSuccessMessage = reset_student_password.success_message;
                        this.studentPasswordReset = true;
                    }
                    else if (status.toString() === this.errorCodes.API) {
                        if (json.Payload.length > 0) {
                            if (json.Payload[0].Messages.length > 0) {
                                this.sendStudentPasswordErrorMessage = json.Payload[0].Messages[0].toString();
                            }
                        }
                    }
                    else {
                        this.sendStudentPasswordErrorMessage = general.exception;
                    }
                }, error => {
                    if (error.status.toString() === this.errorCodes.API) {
                        if (error.json().Payload.length > 0) {
                            if (error.json().Payload[0].Messages.length > 0) {
                                this.sendStudentPasswordErrorMessage = error.json().Payload[0].Messages[0].toString();
                            }
                        }
                    }
                    else {
                        this.sendStudentPasswordErrorMessage = general.exception;
                    }

                });
        } else {
            this.sendStudentPasswordErrorMessage = manage_account.email_format_validation;
        }
    }

    checkfirstnamelastname() {
        this.profileChanged = false;
        let fname = this.firstName;
        let lname = this.lastName;
        let title = this.facultyTitle;
        if (fname.length > 0 && lname.length > 0) {
            let ofname = this.sStorage.getItem('firstname');
            let olname = this.sStorage.getItem('lastname');
            let otitle = this.sStorage.getItem('title');
            if (!(fname === ofname && lname === olname && title === otitle)) {
                this.noProfileChanges = false;
            } else {
                this.noProfileChanges = true;
            }
        }
        // else {
        //    this.noProfileChanges = true;
        // }
    }

    checkemailpassword(emailValue, passwordValue, $event) {
        this.changedEmail = false;
        let email = emailValue.value;
        let password = passwordValue.value;
        if (email.length > 0 && password.length > 0) {
            this.changeEmailDisabled = false;
        } else {
            this.changeEmailDisabled = true;
        }
    }

    validatePassword(newpassword, confirmpassword) {
        if (!this.validations.comparePasswords(newpassword, confirmpassword)) {
            this.resetPasswordErrorMessage = manage_account.newpass_match;
            return false;
        } else if (!this.validations.validateLength(newpassword)) {
            this.resetPasswordErrorMessage = manage_account.newpass_character_count;
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword) && !this.validations.validateNumberCount(confirmpassword)) {
            this.resetPasswordErrorMessage = manage_account.newpass_number_specialcharacter_validation;
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword)) {
            this.resetPasswordErrorMessage = manage_account.newpass_specialcharacter_validation;
            return false;
        } else if (!this.validations.validateNumberCount(confirmpassword)) {
            this.resetPasswordErrorMessage = manage_account.newpass_number_validation;
            return false;
        }
        return true;
    }

    saveProfile(url, authheader, userid, fname, lname, title, email): Observable<Response> {
        let self = this;
        let headers: Headers = new Headers({
            'Accept': 'application/json',
            'Authorization': authheader,
            'Content-Type': 'application/json'
        });
        let requestOptions: RequestOptions = new RequestOptions({
            headers: headers
        });
        let body: any = JSON.stringify({
            userid: userid,
            Firstname: fname,
            LastName: lname,
            Jobtitle: title,
            Email: email
        });
        return this.http.post(url, body, requestOptions);
    }

    resetEmail(url, authheader, userid, email, security, password): Observable<Response> {
        let self = this;
        let headers: Headers = new Headers({
            'Accept': 'application/json',
            'Authorization': authheader,
            'Content-Type': 'application/json'
        });
        let requestOptions: RequestOptions = new RequestOptions({
            headers: headers
        });
        let body: any = JSON.stringify({
            userid: userid,
            Email: email,
            SecurityLevel: security,
            Password: password
        })
        return this.http.post(url, body, requestOptions);
    }


    resetPassword(url, authheader, userid, currentPassword, newPassword): Observable<Response> {
        let self = this;
        let headers: Headers = new Headers({
            'Accept': 'application/json',
            'Authorization': authheader,
            'Content-Type': 'application/json'
        });
        let requestOptions: RequestOptions = new RequestOptions({
            headers: headers
        });
        let body: any = JSON.stringify({
            userid: userid,
            Password: currentPassword,
            NewPassword: newPassword
        })
        return this.http.post(url, body, requestOptions);
    }


    resetStudentPassword(url, authheader, userid, studentEmail): Observable<Response> {
        let self = this;
        let headers: Headers = new Headers({
            'Accept': 'application/json',
            'Authorization': authheader,
            'Content-Type': 'application/json'
        });
        let requestOptions: RequestOptions = new RequestOptions({
            headers: headers
        });
        let body: any = JSON.stringify({
            userid: userid,
            StudentEmail: studentEmail
        })
        return this.http.post(url, body, requestOptions);
    }
}
