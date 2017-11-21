import { Component, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
// import * as _ from 'lodash';
import { links } from '../../constants/config';
import { general, login } from '../../constants/error-messages';
// import { Angulartics2On } from 'angulartics2';
import { Response } from '@angular/http';
import { Observable, Subscription } from 'rxjs/Rx';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { LogService } from './../../services/log.service';
// import { TermsOfUseComponent } from './../terms-of-use/terms-of-use.component';

@Component({
    selector: 'login-content',
    // providers: [AuthService, CommonService, LogService],
    templateUrl: './login-content.component.html',
    // directives: [, Angulartics2On, TermsOfUseComponent]
})

export class LoginContentComponent implements OnDestroy {
    apiServer: string;
    nursingITServer: string;
    kaptestServer: string;
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
    site: string;
    atomStudyPlanLink: string;
    pingFederateServer:string;
    constructor(private zone: NgZone, public router: Router, public auth: AuthService, public common: CommonService, private log: LogService) {
        this.apiServer = this.common.getApiServer();
        this.nursingITServer = this.common.getNursingITServer();
        this.kaptestServer = this.common.getKaptestServer();
        this.pingFederateServer = this.common.getPingFederateServer();
        this.sStorage = this.common.getStorage();
        this.institutionRN = 0;
        this.institutionPN = 0;
        this.site = "faculty";
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
                            this.redirectToKaptest(json.UserId, json.Email);
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

   

    redirectToKaptest(userId, email) {
        var facultyAMLoginUrl = this.apiServer + links.api.baseurl + links.api.admin.facultyAMLoginUrl;
        this.auth.getKaptestRedirectURL(facultyAMLoginUrl,userId, email)
            .subscribe(response => {
                if (response.ok) {
                    const redirectUrl = response.json();
                    window.location.href = redirectUrl;
                }
            },
            error => {
                alert('Error !');
            });
    }

    setAtomStudyPlanLink() {
        this.atomStudyPlanLink = this.kaptestServer + links.atomStudyPlan.login.replace('§facultyEmail', this.auth.useremail);
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
                this.institutionRN = +institutionsRN[0];
            if (institutionsPN.length > 0)
                this.institutionPN = +institutionsPN[0];
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
        let re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i;
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
