import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { links, errorcodes } from '../../constants/config';
import { general, reset_password, login } from '../../constants/error-messages';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { ValidationsService } from './../../services/validations.service';

@Component({
    selector: 'reset-password',
    templateUrl: './reset-password.component.html'
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
    constructor(public router: Router, public auth: AuthService, public common: CommonService, public location: Location, public validations: ValidationsService, public titleService: Title) {

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

    onResetPassword(txtnPassword, txtcPassword, errorContainer, event) {
        event.preventDefault();
        let self = this;
        let newpassword = txtnPassword.value;
        let confirmpassword = txtcPassword.value;
        if (this.validate(newpassword, confirmpassword)) {
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
                let temporaryPasswordObservable  = this.auth.settemporarypassword(apiURL, decryptedId, newpassword);
                this.temporaryPasswordSubscription = temporaryPasswordObservable
                    .map(response => {
                        status = response.status;
                        return response.body;
                    })
                    .subscribe((json: any) => {
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
                            if (error.error.Payload && error.error.Payload.length > 0) {
                                if (error.error.Payload[0].Messages.length > 0) {
                                    this.errorMessage = error.error.Payload[0].Messages[0].toString();
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
        let termsObservable  = this.auth.saveAcceptedTerms(apiURL);

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
    validate(newpassword, confirmpassword) {
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
        let authenticateObservable  = this.auth.login(apiURL, useremail, password, userType);
        this.authenticateSubscription = authenticateObservable
            .map(response => response.body)
            .subscribe(function (json: any) {
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
