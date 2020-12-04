import { Component, OnInit } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CommonService } from './../../services/common.service';
import { Observable } from 'rxjs';
import { AuthService } from './../../services/auth.service';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { RosterChangesService } from './roster-changes.service';
import {links, errorcodes} from '../../constants/config';
import { general } from '../../constants/error-messages';

@Component({
    selector: 'rosters-changes-summary',
    templateUrl: './rosters-changes-summary.component.html'
})

export class RosterChangesSummaryComponent implements OnInit {
    sStorage: any;
    overrideRouteCheck: boolean = false;
    attemptedRoute: string;
    destinationRoute: string;
    isExtendedAccess: boolean = false;
    errorMessage: string;
    showErrorMessage: boolean = false;
    valid: boolean = true;

    constructor(public auth: AuthService, public router: Router, public titleService: Title, private common: CommonService, public rosterChangesModel: RosterChangesModel, private rosterChangesService: RosterChangesService) {
    }

    ngOnInit(): void {
        // this.router
        //     .events
        //     .filter(event => event instanceof NavigationStart)
        //     .subscribe(e => {
        //         this.destinationRoute = e.url;
        //     });

        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else {
            this.rosterChangesModel = this.rosterChangesService.getUpdatedRosterChangesModel();
            this.titleService.setTitle('Roster Change Request Summary – Kaplan Nursing');
            window.scroll(0, 0);
            this.errorMessage = general.requestException;
        }
    }

    canDeactivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot, nextState?:RouterStateSnapshot): Observable<boolean> | boolean {
        this.destinationRoute = nextState.url;
        let outOfRostersChanges: boolean = this.rosterChangesService.outOfRostersChanges((this.common.removeWhitespace(this.destinationRoute)));
        if (!this.overrideRouteCheck) {
            if (outOfRostersChanges) {
                this.attemptedRoute = this.destinationRoute;
                $('#confirmationPopup').modal('show');
                return false;
            }
        }
        if (outOfRostersChanges) {
            this.rosterChangesService.clearRosterChangesObjects();
        }
        this.overrideRouteCheck = false;
        return true;
    }

    onOKConfirmation(e): void {
        $('#confirmationPopup').modal('hide');
        this.overrideRouteCheck = true;
        this.router.navigateByUrl(this.attemptedRoute);
    }

    onCancelConfirmation(popupId): void {
        $('#' + popupId).modal('hide');
        this.attemptedRoute = '';
    }

    cancelChanges(): void {
        this.attemptedRoute = '/rosters';
        $('#confirmationPopup').modal('show');
    }

    submitRequests(): void {
        this.valid = false;
        let input = {
            "SubmitterId": this.auth.userid,
            "CohortId": this.rosterChangesModel.cohortId,
            "InstitutionId": this.rosterChangesModel.institutionId,
            "SpecialRequestNote": this.rosterChangesModel.instructions == null ? "" : this.rosterChangesModel.instructions,
            "AccountManagerId": this.rosterChangesModel.accountManagerId,
            "RosterRequestStudents": _.map(this.rosterChangesModel.students, (_student)=> {
                return {
                    StudentId: (_student.studentId == null) ? 0 : _student.studentId,
                    MoveFromCohortId: _student.moveFromCohortId,
                    MoveToCohortId: _student.moveToCohortId,
                    IsRepeater: false,
                    MakeInActive: _student.isInactive,
                    IsGrantUntimedTest: _student.isGrantUntimedTest,
                    IsExtendAccess: _student.isExtendAccess,
                    EmailId: _student.email,
                    FirstName: _student.firstName,
                    LastName: _student.lastName,
                    RequestTypeId: _student.updateType,
                    MoveFromCohortName: _student.moveFromCohortName,
                    MoveToCohortName: _student.moveToCohortName,
                    MakeActive: _student.makeActive
                }
            })
        };
        // console.log('final request=' + JSON.stringify(input));
        let rosterChangeUpdateObservable: Observable<any>;
        let rosterChangeUpdateURL = '';
        rosterChangeUpdateURL = `${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.rosters.saveRosterCohortChanges}`;
        rosterChangeUpdateObservable = this.rosterChangesService.updateRosterChanges(rosterChangeUpdateURL, JSON.stringify(input));

        rosterChangeUpdateObservable
            .map(response => response.status)
            .subscribe(status => {
                if (status.toString() === errorcodes.SUCCESS) {
                    // redirect to confirmation page
                    this.router.navigate(['/rosters/confirmation']);
                    if (this.showErrorMessage)
                        this.showErrorMessage = false;
                }
            }, error => {
                //show error message
                this.showErrorMessage = true;
                console.log(error);
            });
    }

}
