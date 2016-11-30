import {Component, Injector, Inject, OnInit, OnDestroy} from '@angular/core';
import {NgIf, Location} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {Response} from '@angular/http';
import {Title} from '@angular/platform-browser';
import {links} from '../../constants/config';
// import {Angulartics2On} from 'angulartics2';
import {TestScheduleModel} from '../../models/test-schedule.model';
import {Observable, Subscription} from 'rxjs/Rx';
// import * as _ from 'lodash';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { ProfileService } from './profile.service';
import { TestService } from './../tests/test.service';
// import { PageHeaderComponent } from './../shared/page-header.component';
// import { PageFooterComponent } from './../shared/page-footer.component';
// import { ProfileComponent } from './profile.component';
import { ProfileModel } from './../../models/profile.model';
// import { PageScroll } from 'ng2-page-scroll/ng2-page-scroll';


@Component({
    selector: 'home',
    // providers: [AuthService, CommonService, profileService, TestService, TestScheduleModel],
    templateUrl: './home.component.html'//,
    // directives: [PageHeaderComponent, PageFooterComponent, NgIf, ProfileComponent, Angulartics2On, RouterLinkActive, PageScroll]
})
export class HomeComponent implements OnInit, OnDestroy {
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
    profilesSubscription: Subscription;
    subjectsSubscription: Subscription;
    isMultiCampus: boolean = false;
    constructor(public router: Router, public auth: AuthService, public location: Location, public common: CommonService, public profileService: ProfileService, public testService: TestService, public testScheduleModel: TestScheduleModel, public titleService: Title) {
    }

    ngOnDestroy() {
        if (this.profilesSubscription)
            this.profilesSubscription.unsubscribe();
        if (this.subjectsSubscription)
            this.subjectsSubscription.unsubscribe();
    }

    ngOnInit(): void {
        this.apiServer = this.common.getApiServer();
        this.nursingITServer = this.common.getNursingITServer();
        this.redirectToPage();
        this.initialize();
        // this.profiles = [];
        let self = this;
        this.accountManagerProfile = new ProfileModel(null, null, 'ACCOUNTMANAGER', null, null, null, null, null, null, null, null, null, null, null);
        this.nurseConsultantProfile = new ProfileModel(null, null, 'NURSECONSULTANT', null, null, null, null, null, null, null, null, null, null, null);
        this.loadProfiles(self);
        this.checkInstitutions();
        window.scroll(0,0);
        this.titleService.setTitle('Faculty Home – Kaplan Nursing');
    }

    loadProfiles(self): void {
        let institutionID = this.getLatestInstitution();
        if (institutionID > 0) {
            let url = this.apiServer + links.api.baseurl + links.api.admin.profilesapi + '?institutionId=' + institutionID;
            let profilesObservable: Observable<Response> = this.profileService.getProfiles(url);
            this.profilesSubscription = profilesObservable
                .map(response => response.json())
                .subscribe(json => {
                    self.bindToModel(self, json);
                },
                error => console.log(error.message),
                () => console.log('complete')
                );

            // let profilePromise = this.profileService.getProfiles(url);
            // profilePromise.then((response) => {
            //     return response.json();
            // })
            //     .then((json) => {
            //         self.bindToModel(self, json);
            //     })
            //     .catch((error) => {
            //         alert(error);
            //     });
        }
        else {
            this.accountManagerProfile = new ProfileModel(null, null, 'ACCOUNTMANAGER', null, null, null, null, null, null, null, null, null, null, null);
            this.nurseConsultantProfile = new ProfileModel(null, null, 'NURSECONSULTANT', null, null, null, null, null, null, null, null, null, null, null);
        }
    }

    bindToModel(self, json): void {
        if (json) {
            _.forEach(json, function (profile, key) {
                if (profile && profile.KaplanAdminTypeName !== undefined) {
                    if (profile.KaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER') {
                        self.accountManagerProfile = self.profileService.bindToModel(profile);
                    }
                    else {
                        self.nurseConsultantProfile = self.profileService.bindToModel(profile);
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
                this.router.navigate(['/']);
        }
        else if (!this.auth.isAuth())
            this.router.navigate(['/']);
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
        this.router.navigate(['/']);
    }

    redirectToRoute(route: string): boolean {
        this.checkInstitutions();
        if (this.isMultiCampus)
            this.router.navigateByUrl(`/choose-institution/home/${route}`);
        else if (this.institutionRN > 0 && this.institutionPN > 0 && !this.isMultiCampus) {
            this.router.navigateByUrl(`/choose-institution/home/${route}/${this.institutionRN}/${this.institutionPN}`);
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


                let subjectsObservable: Observable<Response> = this.testService.getSubjects(subjectsURL);
                this.subjectsSubscription = subjectsObservable
                    .map(response => {
                        if (response.status !== 400) {
                            return response.json();
                        }
                        return [];
                    })
                    .subscribe(json => {
                        if (json.length === 0) {
                            window.open('/accounterror');
                        }
                        else {
                            this.router.navigateByUrl(`/tests/choose-test/${(this.institutionPN === 0 ? this.institutionRN : this.institutionPN)}`);
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
            // this.router.navigate(['/ChooseInstitution', { page: this.page, idRN: this.institutionRN, idPN: this.institutionPN }]);
            if (this.page.toUpperCase() === 'CASESTUDIES')
                this.redirectToStudentSite();
            else
                this.router.navigateByUrl(`/choose-institution/home/${this.page}/${this.institutionRN}/${this.institutionPN}`);
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
        this.form.setAttribute('ACTION', serverURL);
        this.form.submit();
    }

    getLatestInstitution(): number {
        if (this.auth.institutions != null && this.auth.institutions != 'undefined') {
            let latestInstitution:any = _.first(_.orderBy(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc'))
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
                this.programId = +(programId.length>1? programId : programId[0]);
            if (institutionsRN.length > 0)
                this.institutionRN = +(institutionsRN.length>1? institutionsRN : institutionsRN[0]);
            if (institutionsPN.length > 0)
                this.institutionPN = +(institutionsPN.length>1? institutionsPN : institutionsPN[0]);
            if (institutionsRN.length > 1 || institutionsPN.length > 1)
                this.isMultiCampus = true;
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
        this.form.setAttribute('ACTION', serverURL)
        this.form.submit();
    }
}
