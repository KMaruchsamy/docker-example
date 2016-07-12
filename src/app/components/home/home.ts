import {Component, Injector, Inject, OnInit} from '@angular/core';
import {NgIf, Location} from '@angular/common';
import {Router, RouterLink, CanActivate} from '@angular/router-deprecated';
import {Title} from '@angular/platform-browser';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {DashboardHeader} from './dashboard-header';
import {DashboardPod1} from './dashboard-pod1';
import {DashboardPod2} from './dashboard-pod2';
import {DashboardPod3} from './dashboard-pod3';
import {DashboardPod4} from './dashboard-pod4';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from 'lodash';    
import {ProfileModel} from '../../models/profile-model';
import {Profile} from './profile';
import {HomeService} from '../../services/home-service';
import {links} from '../../constants/config';
import {Angulartics2On} from 'angulartics2';
import {TestService} from '../../services/test.service';
import {TestScheduleModel} from '../../models/testSchedule.model';

@Component({
    selector: 'home',
    providers: [Auth, Common, HomeService, TestService, TestScheduleModel],
    templateUrl: 'templates/home/home.html',
    directives: [PageHeader, PageFooter, NgIf, DashboardHeader, DashboardPod1, DashboardPod2, DashboardPod3, DashboardPod4, Profile, RouterLink, Angulartics2On]
})
@CanActivate((next, prev) => {
    // let authInjector = Injector.resolveAndCreate([Auth]);
    // let auth = authInjector.get(Auth);
    // return auth.isAuth();
    
    return true;
})
export class Home implements OnInit {
    // profiles: Array<ProfileModel>;
    programId: number;
    institutionRN: number;
    institutionPN: number;
    page: string;
    form: any;
    hdInstitution: any;
    hdToken: any;
    hdURL: any;
    hdpage: any;
    hdExceptionURL: any;
    apiServer: string;
    nursingITServer: string;
    accountManagerProfile: ProfileModel;
    nurseConsultantProfile: ProfileModel;
    testTypeId: number;
    institutionID: number;
    constructor(public router: Router, public auth: Auth, public location: Location, public common: Common, public homeService: HomeService, public testService: TestService, public testScheduleModel:TestScheduleModel, public titleService: Title) {
       
    }

    ngOnInit(): void {
        this.apiServer = this.common.getApiServer();
        this.nursingITServer = this.common.getNursingITServer();
        this.redirectToPage();
        this.initialize();
        // this.profiles = [];
        let self = this;
        this.accountManagerProfile = {};
        this.nurseConsultantProfile = {};
        this.loadProfiles(self);
        this.checkInstitutions();
        $(document).scrollTop(0);
        this.titleService.setTitle('Faculty Home – Kaplan Nursing');
    }

    loadProfiles(self): void {
        let institutionID = this.getLatestInstitution();
        if (institutionID > 0) {
            let url = this.apiServer + links.api.baseurl + links.api.admin.profilesapi + '?institutionId=' + institutionID;
            let profilePromise = this.homeService.getProfiles(url);
            profilePromise.then((response) => {
                return response.json();
            })
                .then((json) => {
                    self.bindToModel(self, json);
                })
                .catch((error) => {
                    alert(error);
                });
        }
        else {
            this.accountManagerProfile = new ProfileModel(null, null, 'ACCOUNTMANAGER', null, null, null, null, null, null, null, null, null, null, null);
            this.nurseConsultantProfile = new ProfileModel(null, null, 'NURSECONSULTANT', null, null, null, null, null, null, null, null, null, null, null);
        }
    }

    bindToModel(self, json): void {
        if (json) {
            _.forEach(json, function(profile, key) {
                if (profile && profile.KaplanAdminTypeName !== undefined) {
                    if (profile.KaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER') {
                        self.accountManagerProfile = self.homeService.bindToModel(profile);
                    }
                    else {
                        self.nurseConsultantProfile = self.homeService.bindToModel(profile);
                    }
                }
            });
        }
        if (!self.accountManagerProfile.kaplanAdminTypeId)
            self.accountManagerProfile = new ProfileModel(null, null, 'ACCOUNTMANAGER', null, null, null, null, null, null, null, null, null, null, null);
        if (!self.nurseConsultantProfile.kaplanAdminTypeId)
            self.nurseConsultantProfile = new ProfileModel(null, null, 'NURSECONSULTANT', null, null, null, null, null, null, null, null, null, null, null);
    }

    redirectToPage(): void {
        if (this.location.path().search("first") > 0) {
            if (this.auth.istemppassword && this.auth.isAuth())
                this.router.parent.navigateByUrl('/');
        }
        else if (!this.auth.isAuth())
            this.router.parent.navigateByUrl('/');
    }

    initialize(): void {
        this.programId = 0;
        this.institutionRN = 0;
        this.institutionPN = 0;
        this.page = null;
        this.form = null;
        this.hdInstitution = null;
        this.hdToken = null;
        this.hdURL = null;
        this.hdpage = null;
        this.testTypeId = 1;
        this.institutionID = 0;
          }

    redirectToLogin(event): void {
        event.preventDefault();
        this.router.parent.navigateByUrl('/');
    }

    redirectToRoute(route: string): boolean {
        this.checkInstitutions();
        if (this.institutionRN > 0 && this.institutionPN > 0) {
            this.router.parent.navigateByUrl(`/choose-institution/Home/${route}/${this.institutionRN}/${this.institutionPN}`);
        }
        else {
            if (this.programId > 0) {
                this.apiServer = this.common.getApiServer();
                if (this.institutionRN == 0) {
                    this.institutionID = this.institutionPN;
                }
                else {
                    this.institutionID = this.institutionRN;
                }
                
                let subjectsURL = this.resolveSubjectsURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.subjects}`);
                let subjectsPromise = this.testService.getSubjects(subjectsURL);
                subjectsPromise.then((response) => {
                    if (response.status !== 400) {
                        return response.json();
                    }
                    return [];
                })
                    .then((json) => {
                        if (json.length === 0) {
                            window.open('/accounterror');
                        }
                        else {
                            this.router.parent.navigateByUrl(`/tests/choose-test/${(this.institutionPN === 0 ? this.institutionRN : this.institutionPN)}`);
                        }
                    });
            }
            else {
                window.open('/accounterror');
            }
        }
       return false;
    }

    resolveSubjectsURL(url: string): string {
        return url.replace('§institutionid', this.institutionID.toString()).replace('§testtype', this.testTypeId.toString());
    }

    prepareRedirectToStudentSite(page, form, hdInstitution, hdToken, hdURL, hdExceptionURL): boolean {
        this.page = page;
        this.form = form;
        this.hdInstitution = hdInstitution;
        this.hdToken = hdToken;
        this.hdURL = hdURL;
        this.hdExceptionURL = hdExceptionURL;
        // this.checkInstitutions();

        if (this.institutionRN > 0 && this.institutionPN > 0) {
            // open the interstitial page here ...
            // this.router.parent.navigate(['/ChooseInstitution', { page: this.page, idRN: this.institutionRN, idPN: this.institutionPN }]);
            if (this.page.toUpperCase() === 'CASESTUDIES')
                this.redirectToStudentSite();
            else
                this.router.parent.navigateByUrl(`/choose-institution/Home/${this.page}/${this.institutionRN}/${this.institutionPN}`);
        }
        else {
            this.redirectToStudentSite();
        }
        return false
    }

    resolveExceptionPage(url): string { 
        let resolvedURL = url.replace('§environment', this.common.getOrigin());
        return resolvedURL;
    }


    redirectToStudentSite(): void {
        var serverURL = this.nursingITServer + links.nursingit.landingpage;
        this.hdInstitution.value = (this.institutionRN > 0) ? this.institutionRN : this.institutionPN;
        this.hdToken.value = this.auth.token
        this.hdURL.value = this.page;
        this.hdExceptionURL.value = this.resolveExceptionPage(links.nursingit.exceptionpage);
        $(this.form).attr('ACTION', serverURL).submit();
    }

    getLatestInstitution(): number {
        if (this.auth.institutions != null && this.auth.institutions != 'undefined') {
            let latestInstitution = _.first(_.orderBy(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc'))
            if (latestInstitution)
                return latestInstitution.InstitutionId;
        }
        return 0;
    }

    checkInstitutions(): void {
        let institutions = _.orderBy(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc');
        if (institutions != null && institutions != undefined) {
            let institutionsRN = _.map(_.filter(institutions, { 'ProgramofStudyName': 'RN' }), 'InstitutionId');
            let institutionsPN = _.map(_.filter(institutions, { 'ProgramofStudyName': 'PN' }), 'InstitutionId');
            let programId = _.map(institutions, 'ProgramId');
            if (programId.length > 0)
                this.programId = programId[0];
            if (institutionsRN.length > 0)
                this.institutionRN = institutionsRN[0];
            if (institutionsPN.length > 0)
                this.institutionPN = institutionsPN[0];
        }
    }

    prepareRedirectToReports(page, form, hdToken, hdpage, hdExceptionURL): boolean {
        this.page = page;
        this.form = form;
        this.hdToken = hdToken;
        this.hdpage = hdpage;
        this.hdExceptionURL = hdExceptionURL;
        this.redirectToReports();
        return false;
    }
    

    redirectToReports(): void {
        var serverURL = this.nursingITServer + links.nursingit.ReportingLandingPage;
        this.hdToken.value = this.auth.token;
        this.hdpage.value = this.page;
        this.hdExceptionURL.value = this.resolveExceptionPage(links.nursingit.exceptionpage);
        $(this.form).attr('ACTION', serverURL).submit();
    }

}