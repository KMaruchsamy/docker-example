import {Component, OnInit, OnDestroy, ElementRef, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {links, ItSecurity} from '../../constants/config';
import {TestScheduleModel} from '../../models/test-schedule.model';
import {Subscription} from 'rxjs';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { ProfileService } from './profile.service';
import { TestService } from './../tests/test.service';
import { ProfileModel } from './../../models/profile.model';
// import { PageScroll } from 'ng2-page-scroll/ng2-page-scroll';
//declare var Appcues: any;


@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
    @ViewChild('element') public viewElement: ElementRef;

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
    testTypeIds: number[];
    institutionID: number;
    profilesSubscription: Subscription;
    subjectsSubscription: Subscription;
    isMultiCampus: boolean = false;
    sStorage: any;
    userEmail: string
    userId: number;
    firstName: string;
    lastName: string;
    atomStudyPlanLink:string;
    kaptestServer :string;
    hasBetaInstitution:boolean = false;
    ItSecurityEnabled: boolean = false;
    examityServer:string;
    examityLoginURL:string;
    iHPServerURL: string;
    element: any;
    htmlSnippet:string;
    ihpEnableInstitutions: any[] = [];
    ihpSSOLoginSubscription: Subscription;
    isMultiCampus_IHP: boolean = false;
    hasIhpEnableInstitution: boolean = false;
    proctortrackITSecurityEnabled: boolean = false;
    ItSecurityEnabledInstitutions: any[] = [];
    ITSecurityInstitutionID: number = 0;
    
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
        this.kaptestServer = this.common.getKaptestServer();
        this.redirectToPage();
        this.initialize();
        // this.profiles = [];
        this.sStorage = this.common.getStorage();
        this.getUserInfo();
        let self = this;
        this.accountManagerProfile = new ProfileModel(null, null, 'ACCOUNTMANAGER', null, null, null, null, null, null, null, null, null, null, null);
        this.nurseConsultantProfile = new ProfileModel(null, null, 'NURSECONSULTANT', null, null, null, null, null, null, null, null, null, null, null);
        this.loadProfiles(self);
        this.checkInstitutions();
       this.filterIHPEnableInstitutions();

        window.scroll(0,0);
        this.titleService.setTitle('Faculty Home – Kaplan Nursing');
        this.setAtomStudyPlanLink();
        this.hasBetaInstitution = this.auth.hasBetaInstitution();
        this.ItSecurityEnabled = this.auth.isExamityEnabled();
        this.examityServer = this.common.getExamityServer();
        this.examityLoginURL = this.examityServer + links.examity.login;
        this.proctortrackITSecurityEnabled = this.auth.isProctortrackEnabled();
        this.getProctorTrackInstitutions();
    }

    setAtomStudyPlanLink(){
        this.atomStudyPlanLink = this.kaptestServer +  links.atomStudyPlan.login.replace('§facultyEmail',this.userEmail);
    }

    getUserInfo(): void {
        this.userEmail = this.sStorage.getItem('useremail');
        this.userId = this.sStorage.getItem('userid');
        this.firstName = this.sStorage.getItem('firstname');
        this.lastName = this.sStorage.getItem('lastname');

      //  Appcues.identify(this.userId, {
      //  firstName: this.firstName,
      //  lastName: this.lastName,
      //  email: this.userEmail,
      //  userId: this.userId
      //});

    }

    loadProfiles(self): void {
        let institutionID = this.getLatestInstitution();
        if (institutionID > 0) {
            let url = this.apiServer + links.api.baseurl + links.api.admin.profilesapi + '?institutionId=' + institutionID;
            let profilesObservable  = this.profileService.getProfiles(url);
            this.profilesSubscription = profilesObservable
                .map(response => response.body)
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
        this.testTypeIds = [1,7];
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


                let subjectsObservable  = this.testService.getSubjects(subjectsURL);
                this.subjectsSubscription = subjectsObservable
                    .map(response => {
                        if (response.status !== 400) {
                            return response.body;
                        }
                        return [];
                    })
                    .subscribe((json: any) => {
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
        return url.replace('§institutionid', this.institutionID.toString()).replace('§testtype', this.testTypeIds.toString());
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
        var serverURL;
        if(this.page==='ApolloStudentReportCard'){
            serverURL = this.nursingITServer + links.nursingit.apolloLaunchPage + "&adminId=" + this.auth.userid;
        }
        else
        serverURL = this.nursingITServer + links.nursingit.ReportingLandingPage;
        this.hdToken.value = this.auth.token;
        this.hdpage.value = this.page;
        this.hdExceptionURL.value = this.resolveExceptionPage(links.nursingit.exceptionpage);
        this.form.setAttribute('ACTION', serverURL)
        this.form.submit();
    }

    redirectToKaptest() {
        var facultyAMLoginUrl = this.apiServer + links.api.baseurl + links.api.admin.facultyAMLoginUrl;
        this.auth.getKaptestRedirectURL(facultyAMLoginUrl, this.userId, this.userEmail)
            .subscribe(response => {
                if (response.ok) {
                    const redirectUrl = response.body.toString();
                    window.open(redirectUrl, "_blank");
                }
                else {
                    try {
                        window.open(this.atomStudyPlanLink, "_blank");
                    } catch (error) {}
                }
            },
            error => {
                try {
                    window.open(this.atomStudyPlanLink, "_blank");
                } catch (error) {}
            });
    }

    onClickExamityProfile(ssologin, encryptedUsername_val): void {
        let facultyAPIUrl = this.resolveFacultyURL(`${this.common.apiServer}${links.api.baseurl}${links.api.admin.examityProfileapi}`);
        let examityObservable  = this.auth.setFacultyProfileInExamity(facultyAPIUrl);
        examityObservable.subscribe(response => {
            encryptedUsername_val.value = response.toString();
            ssologin.submit();
        }, error => console.log(error));
    }   

    resolveFacultyURL(url: string): string {
        return url.replace('§adminId', this.auth.userid.toString());
    }

    filterIHPEnableInstitutions(): void {
        
        let institutions = _.orderBy(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc');
        this.ihpEnableInstitutions = _.filter(institutions, { 'IsIHPEnabledForAnyCohorts': true });
        this.ihpEnableInstitutions = _.orderBy(this.ihpEnableInstitutions, 'InstitutionName','asc');
        this.hasIhpEnableInstitution = this.ihpEnableInstitutions.length > 0 ? true : false;
        this.isMultiCampus_IHP = this.ihpEnableInstitutions.length>1 ? true : false;
        setTimeout(() =>{
            $('.selectpicker').selectpicker('refresh');
        });
    }

    setInstitution(institutionId: number): void {
        this.institutionID = institutionId;
    }

    onClickIhpReport(): void {
        if(this.isMultiCampus_IHP) {
            $('#ihpmulticampus').modal('show');
        } else {
           this.institutionID = this.getLatestInstitution();
            this.getIHPHtmlFormString();
        }

    }
    goToIhpSSOLogin() {
        this.getIHPHtmlFormString();
    }
    getIHPHtmlFormString() {        
       let ihpSSOLoginURL = `${this.apiServer}${links.api.baseurl}${links.api.admin.ihpSSoLoginApi}`;
       let input = {
           "UserId": this.userId,
           "FirstName": this.firstName,
           "LastName": this.lastName,
           "EmailAddress": this.userEmail,
           "InstitutionId": this.institutionID,
       }
       let ihpSSOLoginObservable  = this.profileService.getIhpSsoLogin(ihpSSOLoginURL, JSON.stringify(input));
       this.ihpSSOLoginSubscription = ihpSSOLoginObservable
           .map(response => response)
           .subscribe(data => {
           this.htmlSnippet = data.toString();
           this.appendHTMLSnippetToDOM();
           $('#ihpmulticampus').modal('hide');
            
        }, error => console.log(error));
    }

    appendHTMLSnippetToDOM()
    {
        this.element = this.viewElement.nativeElement;
        const fragment = document.createRange().createContextualFragment(this.htmlSnippet);
        this.element.appendChild(fragment);
    }

    onClickProctortrackReport(): void {
        if (this.ItSecurityEnabledInstitutions.length > 1)
        {
            $('#itSecurity').modal('show');
            return;
        }
       this.callToProctortrackReportByInstitutionId();
    }
    setInstitutionforItSecurity(id) {
        this.ITSecurityInstitutionID = id;
    }
    takeToProctorTrackDashboard() {
        this.callToProctortrackReportByInstitutionId();
    }
    callToProctortrackReportByInstitutionId() {
        let input = JSON.stringify({
            first_name: this.auth.firstname,
            last_name: this.auth.lastname,
            user_id: this.auth.userid,
            email: this.auth.useremail,
            role: "Instructor",
            institution_id: this.ITSecurityInstitutionID,
            group_id: []
          });
        let facultyAPIUrl = this.resolveFacultyURL(`${this.common.apiServer}${links.api.baseurl}${links.api.admin.proctortrackReportapi}`);
        let proctortrackObservable  = this.auth.postApiCall(facultyAPIUrl, input);
        proctortrackObservable.subscribe(response => {
            window.open(response.body.toString(),'blank');
            $('#itSecurity').modal('hide');
        }, error => console.log(error));
    }

    getProctorTrackInstitutions() {
        let institutions = JSON.parse(this.auth.institutions);
        this.ItSecurityEnabledInstitutions = institutions.filter(x=> x.ITSecurityEnabled == ItSecurity.ProctorTrack);
        this.ItSecurityEnabledInstitutions =   _.orderBy(this.ItSecurityEnabledInstitutions, 'InstitutionName','asc');
        if(this.ItSecurityEnabledInstitutions && this.ItSecurityEnabledInstitutions.length > 0) {
            if(this.ItSecurityEnabledInstitutions.length == 1){
                this.ITSecurityInstitutionID = this.ItSecurityEnabledInstitutions[0].InstitutionId;
            }
        }
    }

    redirectToNewApolloRoute(event) {
        event.preventDefault();
        window.open('https://ktp.qa.learnwithatom.com/identity?client_id=47hb19klns7ttm2hbh6acb366i','blank');
    }
}
