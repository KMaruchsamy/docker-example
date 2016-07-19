import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouteParams} from '@angular/router-deprecated';
import {NgIf, Location} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {PageHeader} from './page-header';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from 'lodash';
import {links} from '../../constants/config';
import {TestService} from '../../services/test.service';
import {TestScheduleModel} from '../../models/testSchedule.model';


@Component({
    selector: 'choose-institution',
    providers: [Common, Auth, TestService, TestScheduleModel],
    templateUrl: 'templates/shared/choose-institution.html',
    directives: [PageHeader, RouterLink, NgIf]
})

export class ChooseInstitution implements OnInit {
    fromPage: string;
    page: string;
    apiServer: string;
    testTypeId: number = 1;
    institutionID : string = null;
    institutionRN: string;
    institutionPN: string;
    programRN: number = 0;
    programPN: number = 0;
    backMessage: string;
    nursingITServer: string;
    isTest: boolean = false;
    constructor(public router: Router, public routeParams: RouteParams, public common: Common, public auth: Auth, public aLocation: Location, public testService: TestService, public testScheduleModel: TestScheduleModel, public titleService: Title) {
        this.nursingITServer = this.common.getNursingITServer();
        this.fromPage = this.routeParams.get('frompage');
        this.page = this.routeParams.get('redirectpage');
        if (this.page === 'choose-test')
            this.isTest = true;
        this.institutionRN = this.routeParams.get('idRN');
        this.institutionPN = this.routeParams.get('idPN');
        this.setBackMessage();
    }
    ngOnInit(): void {
        this.titleService.setTitle('Choose a Program – Kaplan Nursing');
        this.checkInstitutions();
    }

    setBackMessage() {
        switch (this.fromPage.toUpperCase()) {
            case "LOGIN":
                this.backMessage = 'Cancel and return to Sign In';
                break;
            case "HOME":
                this.backMessage = 'Cancel and return to Faculty Home';
                break;
            case "TEST":
                this.backMessage = 'Cancel and return to Manage Tests main page';
                break;
            default:
                this.backMessage = 'Cancel and return to Faculty Home';
                break;
        }
    }

    redirectToRoute(program: string): boolean {
        let institutionId = (program === 'RN' ? this.institutionRN : this.institutionPN);
        this.institutionID = institutionId;
           let ProgramId = (program === 'RN' ? this.programRN : this.programPN);
         if (ProgramId > 0) {
             this.apiServer = this.common.getApiServer();
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
                         this.router.parent.navigateByUrl(`/tests/${this.page}/${institutionId}`);
                     }
                 });
         }
        else {
             window.open('/accounterror');
         }
        return false;
    }

    resolveSubjectsURL(url: string): string {
        return url.replace('§institutionid', this.institutionID.toString()).replace('§testtype', this.testTypeId.toString());
    }

    checkInstitutions(): void {
        let institutions = _.orderBy(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc');
        if (institutions != null && institutions != undefined) {
            let institutionsRN = _.map(_.filter(institutions, { 'ProgramofStudyName': 'RN' }), 'InstitutionId');
            let institutionsPN = _.map(_.filter(institutions, { 'ProgramofStudyName': 'PN' }), 'InstitutionId');
            let programIdRN = _.map(_.filter(institutions, { 'ProgramofStudyName': 'RN' }), 'ProgramId');
            let programIdPN = _.map(_.filter(institutions, { 'ProgramofStudyName': 'PN' }), 'ProgramId');
            if (programIdRN.length > 0)
                this.programRN = programIdRN[0];
            if (programIdPN.length > 0)
                this.programPN = programIdPN[0];
            if (institutionsRN.length > 0)
                this.institutionRN = institutionsRN[0];
            if (institutionsPN.length > 0)
                this.institutionPN = institutionsPN[0];
        }
    }

    triggerRedirect(programType, myform, hdInstitution, hdToken, hdPage, hdExceptionURL,event) {
        var serverURL = this.nursingITServer + links.nursingit.landingpage;
        hdInstitution.value = programType === 'RN' ? this.institutionRN : this.institutionPN
        hdToken.value = this.auth.token
        hdPage.value = this.page;
        hdExceptionURL.value = this.resolveExceptionPage(links.nursingit.exceptionpage);
        $(myform).attr('ACTION', serverURL).submit();
        return false;
    }

    resolveExceptionPage(url): string {
        let resolvedURL = url.replace('§environment', this.common.getOrigin());
        return resolvedURL;
    }

    goBack() {
        switch (this.fromPage.toUpperCase()) {
            case "LOGIN":
                this.auth.logout();
                this.router.parent.navigateByUrl('/');
                break;
            case "HOME":
                this.router.parent.navigateByUrl('/home');
                break;
            case "TEST":
                this.router.parent.navigateByUrl('/tests');
                break;
            default:
                this.router.parent.navigateByUrl('/home');
                break;
        }
    }
}