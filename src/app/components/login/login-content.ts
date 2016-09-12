import {Component, NgZone, OnDestroy} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {NgIf} from '@angular/common';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from 'lodash';
import {links} from '../../constants/config';
import {general, login} from '../../constants/error-messages';
import {TermsOfUse} from '../terms-of-use/terms-of-use';
import {Angulartics2On} from 'angulartics2';
import {Response} from '@angular/http';
import {Observable, Subscription} from 'rxjs/Rx';
import {Log} from '../../services/log';

@Component({
    selector: 'login-content',
    providers: [Auth, Common, Log],
    templateUrl: 'templates/login/login-content.html',
    directives: [ROUTER_DIRECTIVES, Angulartics2On, TermsOfUse]
})

export class LoginContent implements OnDestroy {
    apiServer: string;
    nursingITServer: string;
    sStorage: any;
    institutionRN: number;
    institutionPN: number;
    page: string;
    form: any;
    hdInstitution: any;
    hdToken: any;
    hdURL: any;
    hdExceptionURL: any;
    loginSubscription: Subscription;
    showTerms: boolean = false;
    termSubscription: Subscription;
    userType: string = 'admin';
    isError: boolean = false;
    errorMessage: string;
    model;
    constructor(private zone: NgZone, public router: Router, public auth: Auth, public common: Common, private log: Log) {
        this.apiServer = this.common.getApiServer();
        this.nursingITServer = this.common.getNursingITServer();
        this.sStorage = this.common.getStorage();
        this.institutionRN = 0;
        this.institutionPN = 0;
        this.site ="faculty" ;
    }

    ngOnDestroy(): void {
        if (this.loginSubscription)
            this.loginSubscription.unsubscribe();
        if (this.termSubscription)
            this.termSubscription.unsubscribe();
    }

    onSignIn(txtUserName, txtPassword, rdFaculty, rdStudent, event) {
        event.preventDefault();
        let self = this;
        let useremail = '';
        let password = '';
        if (txtUserName.value !== undefined && txtUserName.value !== '')
            useremail = txtUserName.value.toString().trim();
        password = txtPassword.value;
        if (this.validate(useremail, password)) {
            if (rdFaculty.checked)
                this.userType = 'admin';
            else
                this.userType = 'student';


            let apiURL = this.apiServer + links.api.baseurl + links.api.admin.authenticationapi;
            let loginObservable: Observable<Response> = this.auth.login(apiURL, useremail, password, this.userType);
            this.loginSubscription = loginObservable.subscribe(
                respose => {
                    let json = respose.json();
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
                        self.sStorage.setItem('isenrollmentagreementsigned', json.IsEnrollmentAgreementSigned);
                        self.auth.refresh();
                        if (!json.IsEnrollmentAgreementSigned) {
                            self.showTerms = true;
                            return;
                        }

                        if (this.userType === 'student') {
                            self.prepareRedirectToStudentSite('Login');
                        }
                        else {
                            if (json.TemporaryPassword) {
                                self.router.navigate(['/set-password-first-time']);
                            }
                            else {
                                // self.zone.run(() => {
                                self.router.navigate(['/home']);
                                // });
                            }
                        }
                    }
                    else {
                        this.showError(login.auth_failed);
                        txtPassword.value = '';
                    }
                },
                error => {
                    if (error.status > 0) {
                        this.showError(login.auth_failed);
                        txtPassword.value = '';
                    }
                    else {
                        this.showError(general.exception);
                        txtPassword.value = '';
                    }

                }
            );
        }
        else {
            txtPassword.value = '';
        }

    }

    directToCorrectPage() {        
        if (this.userType === 'student') {
            this.prepareRedirectToStudentSite('Login');
        } else {
            if (this.auth.istemppassword) {
                this.router.navigate(['/set-password-first-time']);
            } else {
                this.router.navigate(['/home']);
            }
        }
    }

    prepareRedirectToStudentSite(returnPage) {
        this.page = 'StudentHome';
        this.form = document.getElementById('myForm');
        this.hdInstitution = document.getElementById('institutionID');
        this.hdToken = document.getElementById('jwtToken');
        this.hdURL = document.getElementById('redirectPage');
        this.hdExceptionURL = document.getElementById('exceptionURL');
        this.checkInstitutions();

        if (this.institutionRN > 0 && this.institutionPN > 0) {
            // open the interstitial page here ...
            // this.router.navigate(['/ChooseInstitution', { page: this.page, idRN: this.institutionRN, idPN: this.institutionPN }]);
            this.router.navigateByUrl(`/choose-institution/${returnPage}/${this.page}/${this.institutionRN}/${this.institutionPN}`);
        }
        else {
            this.redirectToStudentSite();
        }
    }

    resolveExceptionPage(url): string {
        let resolvedURL = url.replace('§environment', this.common.getOrigin());
        return resolvedURL;
    }

    redirectToStudentSite() {
        var serverURL = this.nursingITServer + links.nursingit.landingpage;
        this.hdInstitution.value = (this.institutionRN > 0) ? this.institutionRN : this.institutionPN;
        this.hdToken.value = this.auth.token
        this.hdURL.value = this.page;
        this.hdExceptionURL.value = this.resolveExceptionPage(links.nursingit.exceptionpage);
        this.auth.logout();
        this.form.setAttribute('ACTION', serverURL);
        this.form.submit();

    }

    checkInstitutions() {
        let institutions = _.orderBy(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc');
        if (institutions != null && institutions != undefined) {
            let institutionsRN = _.map(_.filter(institutions, { 'ProgramofStudyName': 'RN' }), 'InstitutionId');
            let institutionsPN = _.map(_.filter(institutions, { 'ProgramofStudyName': 'PN' }), 'InstitutionId');
            if (institutionsRN.length > 0)
                this.institutionRN = institutionsRN[0];
            if (institutionsPN.length > 0)
                this.institutionPN = institutionsPN[0];
        }
    }

    validate(email, password) {
        if (!this.validateEmail(email) && !this.validatePassword(password)) {
            this.showError(login.email_pass_required_validation);
            return false;
        } else if (!this.validateEmail(email)) {
            this.showError(login.email_required_validation);
            return false;
        } else if (!this.validateEmailFormat(email)) {
            this.showError(login.email_format_validation);
            return false;
        } else if (!this.validatePassword(password)) {
            this.showError(login.pass_required_validation);
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

    showError(errorMessage) {
        this.isError = true;
        this.errorMessage = errorMessage;
    }

    closealert(btnClose) {
        this.isError = false;
    }

    RedirectToForgotpassword(event) {
        event.preventDefault();
        this.router.navigate(['/forgot-password']);
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
                    this.directToCorrectPage();
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
