import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, RoutesRecognized, NavigationStart } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgIf } from '@angular/common';
import { CommonService } from './../../services/common.service';
import { Observable } from 'rxjs/Rx';

import { AuthService } from './../../services/auth.service';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { RosterChangesService } from './roster-changes.service';
import { ChangeUpdateRosterStudentsModal } from '../../models/change-update-roster-students.model';
import * as _ from 'lodash';

@Component({
    selector: 'rosters-changes-updates',
    templateUrl: './rosters-changes-updates.component.html',
    styles: [`textarea { min-height: 100px;}`]
})

export class RostersChangesUpdatesComponent implements OnInit {
    sStorage: any;
    instructions: string;
    overrideRouteCheck: boolean = false;
    attemptedRoute: string;
    destinationRoute: string;

    constructor(private changeDetectorRef: ChangeDetectorRef, public auth: AuthService, public router: Router, public titleService: Title, private common: CommonService, private rosterChangesModel: RosterChangesModel, private rosterChangesService: RosterChangesService) {
    }

    ngOnInit(): void {
        this.router
            .events
            .filter(event => event instanceof NavigationStart)
            .subscribe(e => {
                this.destinationRoute = e.url;
            });

        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else {
            this.rosterChangesModel = this.rosterChangesService.getRosterChangesModel();
            this.titleService.setTitle('Request Roster Changes – Kaplan Nursing');
        }
    }


    moveToCohort(student: ChangeUpdateRosterStudentsModal) {
        if (!this.rosterChangesModel.students || this.rosterChangesModel.students.length === 0)
            this.rosterChangesModel.students = new Array<ChangeUpdateRosterStudentsModal>();
        this.rosterChangesModel.students.push(student);
        this.rosterChangesModel.students = this.rosterChangesModel.students.slice();

    }

    remove(studentToRemove: ChangeUpdateRosterStudentsModal): void {
        _.remove(this.rosterChangesModel.students, (student: ChangeUpdateRosterStudentsModal) => {
            return student.studentId === studentToRemove.studentId;
        })
        this.rosterChangesModel.students = this.rosterChangesModel.students.slice();
    }

    updateUntimed(e: any): void {
        if (e) {
            let student: ChangeUpdateRosterStudentsModal = e.student;
            let studentToUpdate: ChangeUpdateRosterStudentsModal = _.find(this.rosterChangesModel.students, { 'studentId': student.studentId });
            if (studentToUpdate)
                studentToUpdate.isGrantUntimedTest = e.checked;
        }
    }

    updateRepeater(e: any): void {
        if (e) {
            let student: ChangeUpdateRosterStudentsModal = e.student;
            let studentToUpdate: ChangeUpdateRosterStudentsModal = _.find(this.rosterChangesModel.students, { 'studentId': student.studentId });
            if (studentToUpdate)
                studentToUpdate.isRepeater = e.checked;
        }
    }

    canDeactivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
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

    onOKConfirmation(e: any): void {
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


    redirectToReview(): void {
        // save instructions and student roster changes to sStorage and redirect
         this.rosterChangesModel.instructions = this.instructions;
         this.sStorage.setItem('rosterChanges', JSON.stringify(this.rosterChangesModel));
         this.router.navigate(['/rosters/roster-changes-summary']);
    }

    changeUpdateRosterStudents(e: any) {
        if (e) {
            let student: ChangeUpdateRosterStudentsModal = e;
            let studentToUpdate: ChangeUpdateRosterStudentsModal = _.find(this.rosterChangesModel.students, { 'studentId': student.studentId });
            if (studentToUpdate)
                studentToUpdate = student;
            else
                this.rosterChangesModel.students.push(student);
        }
        console.log('checkRosterADA=' + JSON.stringify(this.rosterChangesModel));
    }
    changeToDifferentCohort(e: any) {
        if (e) {
            let student: ChangeUpdateRosterStudentsModal = e;
            let studentToUpdate: ChangeUpdateRosterStudentsModal = _.find(this.rosterChangesModel.students, { 'studentId': student.studentId });
            if (studentToUpdate) {
                studentToUpdate.moveToCohortId = student.moveToCohortId;
                studentToUpdate.moveToCohortName = student.moveToCohortName;
            }
            else
                this.rosterChangesModel.students.push(student);
        }
        console.log('changeToDifferentCohort=' + JSON.stringify(this.rosterChangesModel));
    }
}
