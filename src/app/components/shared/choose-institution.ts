import {Component} from 'angular2/core';
import {Router, RouterLink, RouteParams, Location} from 'angular2/router';
import {NgIf} from 'angular2/common';
import {PageHeader} from './page-header';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from '../../lib/index';
import {links} from '../../constants/config';

@Component({
    selector: 'choose-institution',
    providers: [Common, Auth],
    templateUrl: '../../templates/shared/choose-institution.html',
    directives: [PageHeader, RouterLink, NgIf]
})

export class ChooseInstitution {
    fromPage: string;
    page: string;
    institutionRN: string;
    institutionPN: string;
   // programRN: number = 0;
   // programPN: number = 0;
    backMessage: string;
    nursingITServer: string;
    isTest: boolean = false;
    constructor(public router: Router, public routeParams: RouteParams, public common: Common, public auth: Auth, public aLocation: Location) {
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
        $('title').html('Choose a Program &ndash; Kaplan Nursing');
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
       // let ProgramId = (program === 'RN' ? this.programRN : this.programPN);
       // if (ProgramId > 0) {
            this.router.parent.navigateByUrl(`/tests/${this.page}/${institutionId}`);
       // }
        //else {
       //     window.open('/#/accounterror');
       // }
        return false;
    }

    checkInstitutions(): void {
        let institutions = _.sortByOrder(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc');
        if (institutions != null && institutions != 'undefined') {
            let institutionsRN = _.pluck(_.filter(institutions, { 'ProgramofStudyName': 'RN' }), 'InstitutionId');
            let institutionsPN = _.pluck(_.filter(institutions, { 'ProgramofStudyName': 'PN' }), 'InstitutionId');
         ////   let programIdRN = _.pluck(_.filter(institutions, { 'ProgramofStudyName': 'RN' }), 'ProgramId');
         //   let programIdPN = _.pluck(_.filter(institutions, { 'ProgramofStudyName': 'PN' }), 'ProgramId');
          //  if (programIdRN.length > 0)
           //     this.programRN = programIdRN[0];
           //// if (programIdPN.length > 0)
             //   this.programPN = programIdPN[0];
            if (institutionsRN.length > 0)
                this.institutionRN = institutionsRN[0];
            if (institutionsPN.length > 0)
                this.institutionPN = institutionsPN[0];
        }
    }

    triggerRedirect(programType, myform, hdInstitution, hdToken, hdPage, event) {
        var serverURL = this.nursingITServer + links.nursingit.landingpage;
        hdInstitution.value = programType === 'RN' ? this.institutionRN : this.institutionPN
        hdToken.value = this.auth.token
        hdPage.value = this.page;
        $(myform).attr('ACTION', serverURL).submit();
        return false;
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