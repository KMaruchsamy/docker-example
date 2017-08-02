import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, RoutesRecognized, NavigationStart } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgIf } from '@angular/common';
import { CommonService } from './../../services/common.service';
import { Observable } from 'rxjs/Rx';

import { AuthService } from './../../services/auth.service';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { RosterChangesService } from './roster-changes.service';
import { ChangeUpdateRosterStudentsModel } from '../../models/change-update-roster-students.model';
import * as _ from 'lodash';
import { RosterUpdateTypes, RosterChangesPages } from '../../constants/config';
//declare var Appcues: any;

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

    constructor(private changeDetectorRef: ChangeDetectorRef, public auth: AuthService, public router: Router, public titleService: Title, private common: CommonService, public rosterChangesModel: RosterChangesModel, private rosterChangesService: RosterChangesService) {
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
            this.rosterChangesModel = this.rosterChangesService.getRosterChangesModel();
            if (this.rosterChangesModel.instructions && this.rosterChangesModel.instructions != '')
                this.instructions = this.rosterChangesModel.instructions;
            this.titleService.setTitle('Request Roster Changes – Kaplan Nursing');
            //Appcues.start();
            window.scroll(0, 0);
        }
    }


    moveToCohort(student: ChangeUpdateRosterStudentsModel) {
        if (!this.rosterChangesModel.students || this.rosterChangesModel.students.length === 0)
            this.rosterChangesModel.students = new Array<ChangeUpdateRosterStudentsModel>();
        this.rosterChangesModel.students.push(student);
        this.rosterChangesModel.students = this.rosterChangesModel.students.slice();
    }

    remove(studentToRemove: ChangeUpdateRosterStudentsModel): void {
        _.remove(this.rosterChangesModel.students, (student: ChangeUpdateRosterStudentsModel) => {
            return student.studentId === studentToRemove.studentId;
        })
        this.rosterChangesModel.students = this.rosterChangesModel.students.slice();
    }

    updateUntimed(e: any): void {
        if (e) {
            let student: ChangeUpdateRosterStudentsModel = e.student;
            let studentToUpdate: ChangeUpdateRosterStudentsModel = _.find(this.rosterChangesModel.students, { 'studentId': student.studentId });
            if (studentToUpdate)
                studentToUpdate.isGrantUntimedTest = e.checked;
        }
    }

    updateAddedStudentUntimed(e: any): void {
        if (e) {
            let student: ChangeUpdateRosterStudentsModel = e.student;
            let studentToUpdate: ChangeUpdateRosterStudentsModel = _.find(this.rosterChangesModel.students, { 'email': student.email });
            if (studentToUpdate)
                studentToUpdate.isGrantUntimedTest = e.checked;
        }
    }

    updateRepeater(e: any): void {
        if (e) {
            let student: ChangeUpdateRosterStudentsModel = e.student;
            let studentToUpdate: ChangeUpdateRosterStudentsModel = _.find(this.rosterChangesModel.students, { 'studentId': student.studentId });
            if (studentToUpdate)
                studentToUpdate.isRepeater = e.checked;
        }
    }

    canDeactivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean> | boolean {
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

    onOKConfirmation(e: any): void {
        $('#confirmationPopup').modal('hide');
        this.overrideRouteCheck = true;
        if (this.attemptedRoute === RosterChangesPages.CHANGESNOTE) {
            this.attemptedRoute = RosterChangesPages.VIEWROSTERS;
        }
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
            let student: ChangeUpdateRosterStudentsModel = e;
            let studentToUpdate: ChangeUpdateRosterStudentsModel = _.find(this.rosterChangesModel.students, { 'studentId': student.studentId });
            if (studentToUpdate) {
                // studentToUpdate = student;
                studentToUpdate.isGrantUntimedTest = student.isGrantUntimedTest;
                studentToUpdate.isInactive = student.isInactive;
                studentToUpdate.moveToCohortId = student.moveToCohortId;
                studentToUpdate.moveToCohortName = student.moveToCohortName;
                if (studentToUpdate.moveToCohortId == null && !studentToUpdate.isInactive && !studentToUpdate.isGrantUntimedTest)
                    _.remove(this.rosterChangesModel.students, function (s) {
                        return s.studentId == student.studentId;
                    });
            }
            else
                this.rosterChangesModel.students.push(student);
            console.log("changeUpdate=" + JSON.stringify(this.rosterChangesModel.students));
        }
    }
    changeToDifferentCohort(e: any) {
        if (e) {
            let student: ChangeUpdateRosterStudentsModel = e;
            let studentToUpdate: ChangeUpdateRosterStudentsModel = _.find(this.rosterChangesModel.students, { 'studentId': student.studentId });
            if (studentToUpdate) {
                if (student.moveToCohortId !== null) {
                    studentToUpdate.moveToCohortId = student.moveToCohortId;
                    studentToUpdate.moveToCohortName = student.moveToCohortName;
                }
                else {
                    if (student.moveToCohortId == null && !student.isInactive && !student.isGrantUntimedTest)
                        _.remove(this.rosterChangesModel.students, function (s) {
                            return s.studentId == student.studentId;
                        });
                    else
                        _.filter(this.rosterChangesModel.students, function (s) {
                            if (s.studentId == student.studentId)
                                s = student;
                        });
                        }                   
            }
            else
                if (student.moveToCohortId !== null)
                    this.rosterChangesModel.students.push(student);

            console.log("different cohort=" + JSON.stringify(this.rosterChangesModel.students));
        }
    }

    addToCohort(student: any) {
        if (student) {
            let studentToAdd = new ChangeUpdateRosterStudentsModel();
            studentToAdd.firstName = student.firstName;
            studentToAdd.lastName = student.lastName;
            studentToAdd.email = student.email;
            studentToAdd.isGrantUntimedTest = student.unTimedTest;
            studentToAdd.updateType = RosterUpdateTypes.AddToThisCohort;
            studentToAdd.addedFrom = RosterUpdateTypes.AddToThisCohort;
            studentToAdd.moveToCohortId = this.rosterChangesModel.cohortId;
            studentToAdd.moveToCohortName = this.rosterChangesModel.cohortName;
            this.rosterChangesModel.students.push(studentToAdd);
            this.rosterChangesModel.students = this.rosterChangesModel.students.slice();
        }

    }

    removeAddedStudent(student: ChangeUpdateRosterStudentsModel) {
        if (this.rosterChangesModel.students) {
            _.remove(this.rosterChangesModel.students, { 'email': student.email });
            this.rosterChangesModel.students = this.rosterChangesModel.students.slice();
        }
    }
}
