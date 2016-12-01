import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable, Subscription } from 'rxjs/Rx'
import { Title } from '@angular/platform-browser';
// import {CommonService} from '../../services/common';
// import {PasswordHeader} from '../password/password-header';
// import {ValidationsService} from '../../services/validations';
import { links, errorcodes } from '../../constants/config';
import { general, forgot_password } from '../../constants/error-messages';
import { CommonService } from './../../services/common.service';
import { ValidationsService } from './../../services/validations.service';
// import { PasswordHeaderComponent } from './password-header.component';
// import * as CryptoJS from 'crypto-js';

@Component({
    selector: 'forgot-password',
    // providers: [ValidationsService],
    templateUrl: './forgot-password.component.html',
    // directives: [PasswordHeaderComponent]
})

export class ForgotPasswordComponent implements OnInit, OnDestroy {
    // errorMessages:any;
    // successMessage:string;
    // config:any;
    apiServer: string;
    forgotPasswordSubscription: Subscription;
    errorCodes: any;
    errorMessage: string;
    constructor(private http: Http, public router: Router, public common: CommonService, public validations: ValidationsService, public titleService: Title) {

    }

    ngOnDestroy(): void {
        if (this.forgotPasswordSubscription)
            this.forgotPasswordSubscription.unsubscribe();
    }

    ngOnInit(): void {
        this.errorCodes = errorcodes;
        this.titleService.setTitle('Forgot Password – Kaplan Nursing');
        this.apiServer = this.common.getApiServer();
        this.initialize();
    }

    initialize(): void {
        window.scroll(0, 0);
    }

    onForgotPassword(txtEmailId, btnSend, errorContainer, event) {
        event.preventDefault();
        let self = this;
        let emailid = txtEmailId.value;

        let encryptedId = this.common.getEncryption(emailid);

        let expiryhour = parseInt(links.resetemailexpire.expirytime); // Default expiry hour is 8 hours. To change hours go to config.json & change expirytime...
        let currentTime = new Date();
        let expiryTime = new Date(currentTime.getTime() + (expiryhour * 60 * 60 * 1000));     // converting hours to milliseconds and adding to Date

        // Expiry Time Encryption
        let encryptedTime = this.common.getEncryption(expiryTime.toString());

        if (this.validate(emailid, errorContainer)) {
            let apiURL = this.apiServer + links.api.baseurl + links.api.admin.forgotpasswordapi;
            let forgotPasswordObservable: Observable<Response> = this.forgotpassword(apiURL, emailid, encryptedId, encryptedTime);
            this.forgotPasswordSubscription = forgotPasswordObservable
                .map(response => response.status)
                .subscribe(status => {
                    if (status.toString() === self.errorCodes.SUCCESS) {
                        self.router.navigate(['/forgot-password/confirmation']);
                    }
                    else if (status.toString() === self.errorCodes.SERVERERROR) {
                        this.errorMessage = forgot_password.failed_sent_mail;
                    }
                    else {
                        this.errorMessage = forgot_password.invalid_emailid;
                    }
                }, error => {
                    if (error.status.toString() === self.errorCodes.SERVERERROR) {
                        this.errorMessage = forgot_password.failed_sent_mail;
                    }
                    else
                        this.errorMessage = forgot_password.invalid_emailid, errorContainer;
                });
        }
    }
    RedirectToLogin(event) {
        event.preventDefault();
        this.router.navigate(['/']);
    }

    validate(emailId, errorContainer) {
        this.clearError(errorContainer);

        if (!this.validations.validateEmailFormat(emailId)) {
            this.errorMessage = forgot_password.email_format_validation;
            return false;
        }
        return true;
    }

    clearError(errorContainer) {
        this.errorMessage = '';
    }

    // getEncryption(strToEncrypt) {
    //     let key = CryptoJS.enc.Base64.parse("MTIzNDU2NzgxMjM0NTY3OA==");
    //     let iv = CryptoJS.enc.Base64.parse("EBESExQVFhcYGRobHB0eHw==");
    //     let encryptedStr = CryptoJS.AES.encrypt(strToEncrypt, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString();
    //     // let replaceEscapeFromStr = encryptedStr.replace(/\//g, "#").replace(/=/g,"~");
    //     return encodeURIComponent(encryptedStr);
    // }

    forgotpassword(url, useremail, encryptedUserEmail, expiryTime): Observable<Response> {
        let self = this;
        let headers: Headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        });
        let requestOptions: RequestOptions = new RequestOptions({
            headers: headers
        });
        let body: any = JSON.stringify({
            useremail: useremail,
            encrypteduseremail: encryptedUserEmail,
            expirytime: expiryTime
        })
        return this.http.post(url, body, requestOptions);
    }
}
