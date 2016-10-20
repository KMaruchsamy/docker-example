import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {Http, Response, RequestOptions} from '@angular/http';
import {Observable, Subscription} from 'rxjs/Rx';
import {Location} from '@angular/common';
import {NgIf} from '@angular/common';
import {Title} from '@angular/platform-browser';
// import {AuthService} from '../../services/auth';
// import {CommonService} from '../../services/common';
// import {PasswordHeader} from '../password/password-header';
// import {ValidationsService} from '../../services/validations';
import {links, errorcodes} from '../../constants/config';
import {temp_password, general, login} from '../../constants/error-messages';
// import {TermsOfUse} from '../terms-of-use/terms-of-use';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { ValidationsService } from './../../services/validations.service';
import { LogService } from './../../services/log.service';
import { PasswordHeaderComponent } from './password-header.component';
import { TermsOfUseComponent } from './../terms-of-use/terms-of-use.component';

@Component({
    selector: 'set-password-first-time',
    providers: [AuthService, CommonService, ValidationsService, LogService],
    templateUrl: 'components/password/set-password-first-time.component.html',
    directives: [PasswordHeaderComponent, ROUTER_DIRECTIVES, TermsOfUseComponent]
})

export class SetPasswordFirstTimeComponent implements OnInit, OnDestroy {
    apiServer: string;
    sStorage: any;
    temproaryPasswordSubscription: Subscription;
    errorCodes: any;
    showTerms: boolean = false;
    setPasswordSuccess: boolean = false;
    termSubscription: Subscription;
    authenticateSubscription: Subscription;
    errorMessage: string;
    invalidLength: boolean = true;
    constructor(public router: Router, public auth: AuthService, public location: Location, public common: CommonService, public validations: ValidationsService, public titleService: Title, public log: LogService) {

    }

    ngOnDestroy(): void {
        if (this.temproaryPasswordSubscription)
            this.temproaryPasswordSubscription.unsubscribe();
        if (this.termSubscription)
            this.termSubscription.unsubscribe();
        if (this.authenticateSubscription)
            this.authenticateSubscription.unsubscribe();
    }

    ngOnInit(): void {
        this.errorCodes = errorcodes;
        this.apiServer = this.common.getApiServer();
        this.sStorage = this.common.getStorage();
        this.titleService.setTitle('Set Password First Time– Kaplan Nursing');
        this.initialize();
    }

    initialize() {
        window.scroll(0, 0);
    }

    onSetPasswordFirstTime(txtnPassword, txtcPassword, errorContainer, event) {
        event.preventDefault();
        let self = this;
        let newpassword = txtnPassword.value;
        let confirmpassword = txtcPassword.value;
        let status = '';
        if (this.validate(newpassword, confirmpassword)) {
            let url = this.location.path();
            let encryptedId = url.substr(url.lastIndexOf('/') + 1);
            encryptedId = encryptedId.replace(/_/g, '/');
            let email = this.common.decryption(encryptedId);

            let apiURL = this.apiServer + links.api.baseurl + links.api.admin.settemporarypasswordapi;
            let temproaryPasswordSubscription: Observable<Response> = this.auth.settemporarypassword(apiURL, email, newpassword);
            temproaryPasswordSubscription
                .map(response => {
                    status = response.status;
                    return response.json();
                })
                .subscribe(function (json) {
                    if (status.toString() === self.errorCodes.SUCCESS) {
                        txtnPassword.value = "";
                        txtcPassword.value = "";
                        self.AuthanticateUser(email, newpassword, 'admin', errorContainer);
                        self.setPasswordSuccess = true;
                    }
                    else if (status.toString() === this.errorCodes.API) {
                        if (json.Payload.length > 0) {
                            if (json.Payload[0].Messages.length > 0) {
                                self.showError(json.Payload[0].Messages[0].toString());
                                self.clearPasswords(txtnPassword, txtcPassword);
                            }
                        }
                    }
                    else {
                        self.showError(general.exception);
                        self.clearPasswords(txtnPassword, txtcPassword);
                    }
                }, error => {
                    if (error.status.toString() === this.errorCodes.API) {
                        if (error.json().Payload.length > 0) {
                            if (error.json().Payload[0].Messages.length > 0) {
                                self.showError(error.json().Payload[0].Messages[0].toString());
                                self.clearPasswords(txtnPassword, txtcPassword);
                            }
                        }
                    }
                    else {
                        self.showError(general.exception);
                        self.clearPasswords(txtnPassword, txtcPassword);
                    }

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

    validate(newpassword, confirmpassword) {
        this.clearError();
        if (!this.validations.comparePasswords(newpassword, confirmpassword)) {
            this.showError(temp_password.newpass_match);
            return false;
        } else if (!this.validations.validateLength(newpassword)) {
            this.showError(temp_password.newpass_character_count);
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword) && !this.validations.validateNumberCount(confirmpassword)) {
            this.showError(temp_password.newpass_number_specialcharacter_validation);
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword)) {
            this.showError(temp_password.newpass_specialcharacter_validation);
            return false;
        } else if (!this.validations.validateNumberCount(confirmpassword)) {
            this.showError(temp_password.newpass_number_validation);
            return false;
        }

        return true;
    }

    clearError() {
        this.errorMessage = "";
    }

    showError(errorMessage) {
        this.errorMessage = errorMessage;
    }
    checkpasswordlength(txtNewpassword, txtConfirmPassword, event) {
        let newpassword = txtNewpassword.value;
        let confirmpassword = txtConfirmPassword.value;
        if (newpassword.length > 0 && confirmpassword.length > 0)
            this.invalidLength = false;
        else
            this.invalidLength = true;
    }
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

    ShowTermsConditions(event) {
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
}