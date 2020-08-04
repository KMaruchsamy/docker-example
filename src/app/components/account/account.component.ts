import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { links, errorcodes } from '../../constants/config';
import { manage_account, general, reset_password_after_login, reset_student_password } from '../../constants/error-messages';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { ValidationsService } from './../../services/validations.service';
import { LogService } from './../../services/log.service';
@Component({
    selector: 'account',
    templateUrl: './account.component.html',
})

export class AccountComponent implements OnInit, OnDestroy {
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
    resetNewPasswordErrorMessage: string;
    currentPasswordErrorMessage: string;
    sendStudentPasswordErrorMessage: string;
    emailValidationEror: string;
    currentPasswordModel: string;
    newPasswordModel: string;
    confirmPasswordModel: string;
    emailText: string;
    examityEncryptedUserId: string;
    ItSecurityEnabled: boolean = false;
    examityServer:string;
    examityLoginURL:string;
    constructor(private http: HttpClient, public router: Router, private activatedRoute: ActivatedRoute, public auth: AuthService, public common: CommonService, public validations: ValidationsService, public titleService: Title, private log: LogService) {
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
        this.ItSecurityEnabled = this.auth.isExamityEnabled();
        this.errorCodes = errorcodes;
        this.titleService.setTitle('Manage Account – Kaplan Nursing');
        this.sStorage = this.common.getStorage();
        this.apiServer = this.common.getApiServer();
        this.examityServer = this.common.getExamityServer();
        this.initialize();
        window.scroll(0, 0);
    }

    getInitialize() {
        if (this.auth.isAuth()) {
            this.firstName = this.sStorage.getItem('firstname');
            this.lastName = this.sStorage.getItem('lastname');
            this.facultyTitle = this.sStorage.getItem('title');
            this.setInstitutionNames(JSON.parse(this.auth.institutions));
            this.emailId = this.sStorage.getItem('useremail');
            this.examityLoginURL = this.examityServer + links.examity.login;
        }
        else {
            this.redirectToLogin();
        }

    }

    setInstitutionNames(institutions) {
        if (institutions !== null || institutions !== 'undefined') {
            this.schoolName = (_.map(institutions, 'InstitutionNameWithProgOfStudy')).sort();
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
        let saveProfileObservable  = self.saveProfile(apiURL, authheader, userid, fname, lname, title, email);
        this.saveProfileSubscription = saveProfileObservable
            .map(response => response.status)
            .subscribe(status => {
                if (status.toString() === this.errorCodes.SUCCESS) {
                    this.profileChanged = true;
                    self.sStorage.setItem('firstname', fname);
                    self.sStorage.setItem('lastname', lname);
                    self.sStorage.setItem('title', title);
                    self.auth.updateUsername(fname,lname);
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
        // clear any existing error messages
        this.changeEmailPasswordErrorMessage = '';
        this.changeEmailErrorMessage = '';
        if (this.validations.validateEmailFormat(newemailid)) {
            let userid = this.auth.userid;
            let email = this.auth.useremail;
            let password = txtPassword.value;
            let authheader = 'Bearer ' + this.sStorage.getItem('jwt');
            let security = this.auth.securitylevel;
            let apiURL = this.apiServer + links.api.baseurl + links.api.admin.resetemailapi;
            let resetEmailObservable  = this.resetEmail(apiURL, authheader, userid, newemailid, security, password);
            this.resetEmailSubscription = resetEmailObservable
                .map(response => {
                    status = response.status;
                    return response.body;
                })
                .subscribe((json: any) => {
                    if (status.toString() === this.errorCodes.SUCCESS) {
                        self.sStorage.setItem('jwt', json.AccessToken);
                        self.sStorage.setItem('useremail', newemailid);
                        // self.auth.authheader = 'Bearer ' + json.AccessToken;
                        self.auth.useremail = newemailid
                        this.emailId = newemailid;
                        // clear inputs
                        txtNewEmailId.value = '';
                        txtPassword.value = '';
                        this.changedEmail = true;
                        setTimeout(() => {
                            this.changedEmail = false;
                            this.showChangeEmailSection = false;
                        }, 3000)
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
                        if (error.error.Payload.length > 0) {
                            if (error.error.Payload[0].Messages.length > 0) {
                                this.changeEmailPasswordErrorMessage = error.error.Payload[0].Messages[0].toString();
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
            this.resetNewPasswordErrorMessage = '';
            let authheader = this.auth.authheader;
            let userId = this.auth.userid;
            let apiURL = this.apiServer + links.api.baseurl + links.api.admin.resetfacultypasswordafterloginapi;
            let self = this;
            let resetPasswordObservable  = this.resetPassword(apiURL, authheader, userId, currentpassword, newpassword);
            this.resetPasswordSubscription = resetPasswordObservable
                .map(response => {
                    status = response.status;
                    return response.body;
                })
                .subscribe((json: any) => {
                    if (status.toString() === this.errorCodes.SUCCESS) {
                        this.passwordReset = true;
                        this.showHintMessage = false;
                        this.resetPasswordSuccessMessage = reset_password_after_login.resetpass_success;
                        this.clearResetPasswordInputs(txtCurrentPassword, txtNewPassword, txtConfirmPassword);
                    }
                    else if (status.toString() === this.errorCodes.API) {
                        if (json.Payload.length > 0) {
                            if (json.Payload[0].Messages.length > 0) {
                                // Update API to return different error codes for current and new password errors so they can show below appropriate inputs
                                // this.currentPasswordErrorMessage = json.Payload[0].Messages[0].toString();
                                this.resetNewPasswordErrorMessage = json.Payload[0].Messages[0].toString();
                                this.clearResetPasswordInputs(txtCurrentPassword, txtNewPassword, txtConfirmPassword);
                            }
                        }
                    }
                    else {
                        // Update API to return different error codes for current and new password errors so they can show below appropriate inputs
                        // this.currentPasswordErrorMessage = general.exception;
                        this.resetNewPasswordErrorMessage = general.exception;
                        this.clearResetPasswordInputs(txtCurrentPassword, txtNewPassword, txtConfirmPassword);
                    }
                }, error => {
                    if (error.status.toString() === this.errorCodes.API) {
                        if (error.error.Payload.length > 0) {
                            if (error.error.Payload[0].Messages.length > 0) {
                                // Update API to return different error codes for current and new password errors so they can show below appropriate inputs
                                // this.currentPasswordErrorMessage = '';
                                this.resetNewPasswordErrorMessage = error.error.Payload[0].Messages[0].toString();
                                this.clearResetPasswordInputs(txtCurrentPassword, txtNewPassword, txtConfirmPassword);
                            }
                        }
                    }
                    else {
                        // Update API to return different error codes for current and new password errors so they can show below appropriate inputs
                        // this.currentPasswordErrorMessage = '';
                        this.resetNewPasswordErrorMessage = general.exception;
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
        this.resetNewPasswordErrorMessage = '';
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
            let resetStudentPasswordObservable  = this.resetStudentPassword(apiURL, authheader, userId, studentEmailID);
            this.resetStudentPasswordSubscription = resetStudentPasswordObservable
                .map(response => {
                    status = response.status;
                    return response.body;
                })
                .subscribe((json: any) => {
                    if (status.toString() === this.errorCodes.SUCCESS) {
                        this.studentPasswordResetSuccessMessage = reset_student_password.success_message;
                        this.studentPasswordReset = true;
                        this.sendStudentPasswordErrorMessage = '';
                    }
                    else if (status.toString() === this.errorCodes.API) {
                        if (json.Payload.length > 0) {
                            if (json.Payload[0].Messages.length > 0) {
                                this.sendStudentPasswordErrorMessage = json.Payload[0].Messages[0].toString();
                                this.studentPasswordReset = false;
                            }
                        }
                    }
                    else {
                        this.sendStudentPasswordErrorMessage = general.exception;
                    }
                }, error => {
                    if (error.status.toString() === this.errorCodes.API) {
                        if (error.error.Payload.length > 0) {
                            if (error.error.Payload[0].Messages.length > 0) {
                                this.sendStudentPasswordErrorMessage = error.error.Payload[0].Messages[0].toString();
                            }
                        }
                    }
                    else {
                        this.sendStudentPasswordErrorMessage = general.exception;
                    }
                    this.studentPasswordReset = false;
                });
        } else {
            this.sendStudentPasswordErrorMessage = manage_account.email_format_validation;
            this.studentPasswordReset = false;
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
        // clear current password error message
        this.currentPasswordErrorMessage = '';
        // validate new passwords
        if (!this.validations.comparePasswords(newpassword, confirmpassword)) {
            this.resetNewPasswordErrorMessage = manage_account.newpass_match;
            return false;
        } else if (!this.validations.validateLength(newpassword)) {
            this.resetNewPasswordErrorMessage = manage_account.newpass_character_count;
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword) && !this.validations.validateNumberCount(confirmpassword)) {
            this.resetNewPasswordErrorMessage = manage_account.newpass_number_specialcharacter_validation;
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword)) {
            this.resetNewPasswordErrorMessage = manage_account.newpass_specialcharacter_validation;
            return false;
        } else if (!this.validations.validateNumberCount(confirmpassword)) {
            this.resetNewPasswordErrorMessage = manage_account.newpass_number_validation;
            return false;
        }
        return true;
    }

    saveProfile(url, authheader, userid, fname, lname, title, email) {
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Authorization': authheader,
            'Content-Type': 'application/json'
        });
        let requestOptions = {
            headers: headers,
            observe: 'response' as const
        };
        let body: any = JSON.stringify({
            userid: userid,
            Firstname: fname,
            LastName: lname,
            Jobtitle: title,
            Email: email
        });
        return this.http.post(url, body, requestOptions);
    }

    resetEmail(url, authheader, userid, email, security, password)  {
        const headers= new HttpHeaders({
            'Accept': 'application/json',
            'Authorization': authheader,
            'Content-Type': 'application/json'
        });
        let requestOptions = {
            headers: headers,
            observe: 'response' as const
        };
        let body: any = JSON.stringify({
            userid: userid,
            Email: email,
            SecurityLevel: security,
            Password: password
        })
        return this.http.post(url, body, requestOptions);
    }


    resetPassword(url, authheader, userid, currentPassword, newPassword)  {
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Authorization': authheader,
            'Content-Type': 'application/json'
        });
        let requestOptions = {
            headers: headers,
            observe: 'response' as const
        };
        let body: any = JSON.stringify({
            userid: userid,
            Password: currentPassword,
            NewPassword: newPassword
        })
        return this.http.post(url, body, requestOptions);
    }


    resetStudentPassword(url, authheader, userid, studentEmail)  {
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Authorization': authheader,
            'Content-Type': 'application/json'
        });
        let requestOptions = {
            headers: headers,
            observe: 'response' as const
        };
        let body: any = JSON.stringify({
            userid: userid,
            StudentEmail: studentEmail
        })
        return this.http.post(url, body, requestOptions);
    }

    onClickExamityProfile(ssologin, encryptedUsername_val): void {
        let facultyAPIUrl = this.resolveFacultyURL(`${this.common.apiServer}${links.api.baseurl}${links.api.admin.examityProfileapi}`);
        let examityObservable  = this.setFacultyProfileInExamity(facultyAPIUrl);
        examityObservable.subscribe(response => {
            this.examityEncryptedUserId = response.body.toString();
            encryptedUsername_val.value = this.examityEncryptedUserId
                    ssologin.submit();
        }, error => console.log(error));
    }

    setFacultyProfileInExamity(url: string)  {
        let self = this;
         const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': self.auth.authheader
        });
        let options = {
            headers: headers,
            observe: 'response' as const
        }
        return this.http.get(url, options);
    }

    resolveFacultyURL(url: string): string {
        return url.replace('§adminId', this.auth.userid.toString());
    }

}
