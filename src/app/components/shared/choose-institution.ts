import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ROUTER_DIRECTIVES, ActivatedRoute} from '@angular/router';
import {NgIf, Location} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {PageHeader} from './page-header';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from 'lodash';
import {links} from '../../constants/config';
import {TestService} from '../../services/test.service';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {Subscription, Observable} from 'rxjs/Rx';
import {Response} from '@angular/http';
@Component({
    selector: 'choose-institution',
    providers: [Common, Auth, TestService, TestScheduleModel],
    templateUrl: 'templates/shared/choose-institution.html',
    directives: [PageHeader, ROUTER_DIRECTIVES, NgIf]
})

export class ChooseInstitution implements OnInit, OnDestroy {
    fromPage: string;
    page: string;
    apiServer: string;
    testTypeId: number = 1;
    institutionID: string = null;
    institutionRN: string;
    institutionPN: string;
    programRN: number = 0;
    programPN: number = 0;
    backMessage: string;
    nursingITServer: string;
    isTest: boolean = false;
    routeParamsSubscription: Subscription;
    subjectsSubscription: Subscription;
    isMultiCampus: boolean = false;
    Campus: Object[] = [];
    institutionId: number;
    constructor(public router: Router, private activatedRoute: ActivatedRoute, public common: Common, public auth: Auth, public aLocation: Location, public testService: TestService, public testScheduleModel: TestScheduleModel, public titleService: Title) {

    }


    ngOnDestroy(): void {
        if (this.routeParamsSubscription)
            this.routeParamsSubscription.unsubscribe();
        if (this.subjectsSubscription)
            this.subjectsSubscription.unsubscribe();
    }

    ngOnInit(): void {
        this.nursingITServer = this.common.getNursingITServer();
        this.routeParamsSubscription = this.activatedRoute.params.subscribe(params => {
            this.fromPage = params['frompage'];
            this.page = params['redirectpage'];
            if (this.page === 'choose-test')
                this.isTest = true;
            this.checkInstitutions();
            if (!this.isMultiCampus) {
                this.institutionRN = params['idRN'];
                this.institutionPN = params['idPN'];
            }
            this.setBackMessage();
            this.titleService.setTitle('Choose a Program – Kaplan Nursing');
            setTimeout(function(){
                $('.selectpicker').selectpicker('refresh');
            })
        });
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
                        this.router.navigateByUrl(`/tests/${this.page}/${institutionId}`);
                    }
                })

        }
        else {
            window.open('/accounterror');
        }
        return false;
    }
    setInstitution(institutionId: number): void {
        this.institutionID = institutionId.toString();
        this.institutionId = institutionId;
    }
    disableEnableButton(): boolean {
        if (this.institutionId > 0) 
            return false;
        else
            return true;
    }
    chooseCampus(): void {
        this.apiServer = this.common.getApiServer();
        let subjectsURL = this.resolveSubjectsURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.subjects}`);
        let subjectsObservable: Observable<Response> = this.testService.getSubjects(subjectsURL);
        this.subjectsSubscription = subjectsObservable
            .map(response => response.json())
            .subscribe(json => {
                if (json.length > 0) {
                    this.router.navigateByUrl(`/tests/${this.page}/${this.institutionID}`);
                }
            },
            error => {
                console.log(error);
                if (error.status === 400)
                    window.open('/accounterror');
            });
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
                this.programRN = programIdRN.length > 1 ? programIdRN : programIdRN[0];
            if (programIdPN.length > 0)
                this.programPN = programIdPN.length > 1 ? programIdPN : programIdPN[0];
            if (institutionsRN.length > 0)
                this.institutionRN = institutionsRN.length > 1 ? institutionsRN : institutionsRN[0];
            if (institutionsPN.length > 0)
                this.institutionPN = institutionsPN.length > 1 ? institutionsPN : institutionsPN[0];
            if (programIdRN.length > 1 || programIdPN.length > 1) {
                this.Campus = institutions;
                this.isMultiCampus = true;
            }
        }
    }

    triggerRedirect(programType, myform, hdInstitution, hdToken, hdPage, hdExceptionURL, event) {
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
                this.router.navigate(['/'])
                break;
            case "HOME":
                this.router.navigate(['/home']);
                break;
            case "TEST":
                this.router.navigate(['/tests']);
                break;
            default:
                this.router.navigate(['/home']);
                break;
        }
    }
}