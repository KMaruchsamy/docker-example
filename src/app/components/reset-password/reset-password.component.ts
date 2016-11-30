import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { Response, RequestOptions } from '@angular/http';
import { Observable, Subscription } from 'rxjs/Rx';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common';
// import {TermsOfUse} from '../terms-of-use/terms-of-use';
// import {AuthService} from '../../services/auth';
// import {CommonService} from '../../services/common';
// import {PasswordHeader} from '../password/password-header';
// import {ValidationsService} from '../../services/validations';
import { links, errorcodes } from '../../constants/config';
import { general, reset_password, temp_password, login } from '../../constants/error-messages';
// import {LogService} from '../../services/log.service.service';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { ValidationsService } from './../../services/validations.service';
import { LogService } from './../../services/log.service';
import { TermsOfUseComponent } from './../terms-of-use/terms-of-use.component';
// import * as CryptoJS from 'crypto-js';

@Component({
    selector: 'reset-password',
    // providers: [AuthService, CommonService, ValidationsService, LogService],
    templateUrl: './reset-password.component.html',
    // directives: [PasswordHeaderComponent, TermsOfUseComponent]
})

export class ResetPasswordComponent implements OnInit, OnDestroy {
    apiServer: string;
    sStorage: any;
    temporaryPasswordSubscription: Subscription;
    authenticateSubscription: Subscription;
    errorCodes: any;
    showTerms: boolean = false;
    termSubscription: Subscription;
    errorMessage: string;
    resetSuccess: boolean = false;
    invalidLength: boolean = true;
    constructor(public router: Router, public auth: AuthService, public common: CommonService, public location: Location, public validations: ValidationsService, public titleService: Title, private log: LogService) {

    }

    ngOnDestroy(): void {
        if (this.temporaryPasswordSubscription)
            this.temporaryPasswordSubscription.unsubscribe();
        if (this.authenticateSubscription)
            this.authenticateSubscription.unsubscribe();
        if (this.termSubscription)
            this.termSubscription.unsubscribe();
    }

    ngOnInit(): void {
        this.errorCodes = errorcodes;
        this.apiServer = this.common.getApiServer();
        this.initialize();
        this.sStorage = this.common.getStorage();
        this.titleService.setTitle('Reset Password – Kaplan Nursing');
    }

    initialize() {
        window.scroll(0, 0);
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

            let decryptedId = this.common.decryption(encryptedId);
            let decryptedTime = this.common.decryption(encryptedExpiry);

            let currentTime: any = new Date();
            // let isExpire: any = new Date(decryptedTime) - currentTime;
            let isExpire: boolean = moment(decryptedTime).isBefore(currentTime);
            let status:number = 0;

            if (isExpire) {
                this.router.navigate(['/reset-password/expired']);
            }
            // else if (isExpire.toString() === "NaN")
            // { alert('Please refresh the page and try once again.'); }
            else {

                let apiURL = this.apiServer + links.api.baseurl + links.api.admin.settemporarypasswordapi;
                let temporaryPasswordObservable: Observable<Response> = this.auth.settemporarypassword(apiURL, decryptedId, newpassword);
                this.temporaryPasswordSubscription = temporaryPasswordObservable
                    .map(response => {
                        status = response.status;
                        return response.json();
                    })
                    .subscribe(json => {
                        if (status.toString() === self.errorCodes.SUCCESS) {
                            txtnPassword.value = "";
                            txtcPassword.value = "";
                            self.AuthanticateUser(decryptedId, newpassword, 'admin', errorContainer);
                            this.resetSuccess = true;
                        }
                        else if (status.toString() === self.errorCodes.API) {
                            if (json.Payload.length > 0) {
                                if (json.Payload[0].Messages.length > 0) {
                                    this.errorMessage = json.Payload[0].Messages[0].toString();
                                    self.clearPasswords(txtnPassword, txtcPassword);
                                }
                            }
                        }
                        else {
                            this.errorMessage = general.exception;
                            self.clearPasswords(txtnPassword, txtcPassword);
                        }
                    }, error => {
                        if (error.status.toString() === this.errorCodes.API) {
                            if (error.json().Payload && error.json().Payload.length > 0) {
                                if (error.json().Payload[0].Messages.length > 0) {
                                    this.errorMessage = error.json().Payload[0].Messages[0].toString();
                                    self.clearPasswords(txtnPassword, txtcPassword);
                                }
                            }
                        }
                        else {
                            this.errorMessage = general.exception, errorContainer;
                            self.clearPasswords(txtnPassword, txtcPassword);
                        }
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

    redirect(event) {
        event.preventDefault();
        if (!this.auth.isEnrollmentAgreementSigned) {
            this.showTerms = true;
            return;
        } else {
            this.router.navigate(['/home']);
        }
    }

    saveAcceptedTerms() {
        let apiURL = `${this.common.getApiServer()}${links.api.baseurl}${links.api.admin.terms}?email=${this.auth.useremail}&isChecked=true`;
        let termsObservable: Observable<Response> = this.auth.saveAcceptedTerms(apiURL);

        this.termSubscription = termsObservable.subscribe(
            respose => {
                if (respose.ok) {
                    this.showTerms = false;
                    this.sStorage.setItem('isenrollmentagreementsigned', true);
                    this.auth.isEnrollmentAgreementSigned = true;
                    this.router.navigate(['/home']);
                }

            }, error => console.log(error))
    }

    confirm(e) {
        this.saveAcceptedTerms();
    }

    onCancel(e) {
        this.showTerms = false;
        this.router.navigate(['/logout']);
    }

    // route(path, e) {
    //     this.utility.route(path, this.router, e);
    // }
    validate(newpassword, confirmpassword, btnResetPassword, lnkhomeredirect, errorContainer, successContainer) {
        this.clearError();
        if (!this.validations.comparePasswords(newpassword, confirmpassword)) {
            this.errorMessage = reset_password.newpass_match;
            return false;
        } else if (!this.validations.validateLength(newpassword)) {
            this.errorMessage = reset_password.newpass_character_count;
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword) && !this.validations.validateNumberCount(confirmpassword)) {
            this.errorMessage = reset_password.newpass_number_specialcharacter_validation;
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword)) {
            this.errorMessage = reset_password.newpass_specialcharacter_validation;
            return false;
        } else if (!this.validations.validateNumberCount(confirmpassword)) {
            this.errorMessage = reset_password.newpass_number_validation;
            return false;
        }
        return true;
    }

    clearError() {
        this.errorMessage = '';
    }

    checkpasswordlength(txtnewpassword, txtConfirmPassword, event) {
        let newpassword = txtnewpassword.value;
        let confirmpassword = txtConfirmPassword.value;
        if (newpassword.length > 0 && confirmpassword.length > 0) {
            this.invalidLength = false;
        }
        else {
            this.invalidLength = true;
        }
    }

    // decryption(strToDecrypt) {
    //     let key = CryptoJS.enc.Base64.parse("MTIzNDU2NzgxMjM0NTY3OA==");
    //     let iv = CryptoJS.enc.Base64.parse("EBESExQVFhcYGRobHB0eHw==");
    //     // let addedEscapeIntoStr = unescape(strToDecrypt).replace(/#/g, "/").replace(/~/g, "=");
    //     let decodedString = decodeURIComponent(strToDecrypt);
    //     let decryptedStr = CryptoJS.AES.decrypt(decodedString, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
    //     return decryptedStr;
    // }

    AuthanticateUser(useremail, password, userType, errorContainer) {
        let self = this;
        let apiURL = this.apiServer + links.api.baseurl + links.api.admin.authenticationapi;
        let authenticateObservable: Observable<Response> = this.auth.login(apiURL, useremail, password, userType);
        this.authenticateSubscription = authenticateObservable
            .map(response => response.json())
            .subscribe(function (json) {
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
                    self.sStorage.setItem('isenrollmentagreementsigned', json.IsEnrollmentAgreementSigned);
                    self.auth.refresh();
                }
                else {
                    this.errorMessage = login.auth_failed;
                }
            }, error => {
                this.errorMessage = general.exception, errorContainer;
            });
    }

}
