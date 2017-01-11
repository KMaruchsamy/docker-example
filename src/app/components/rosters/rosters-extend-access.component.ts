import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, RoutesRecognized, NavigationStart } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgIf } from '@angular/common';
import { CommonService } from './../../services/common.service';
import { Observable, Subscription } from 'rxjs/Rx';
import { links, RosterUpdateTypes } from '../../constants/config';
import { Response } from '@angular/http';
import { AuthService } from './../../services/auth.service';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { RosterCohortsModel } from '../../models/roster-cohorts.model';
import { ChangeUpdateRosterStudentsModel } from '../../models/change-update-roster-students.model';
import { RosterService } from './roster.service';
import { RosterChangesService } from './roster-changes.service';
import * as _ from 'lodash';

@Component({
    selector: 'rosters-extend-access',
    templateUrl: './rosters-extend-access.component.html',
    styles: [`textarea { min-height: 100px;}`]
})

export class RostersExtendAccessComponent implements OnInit, OnDestroy {
    sStorage: any;
    instructions: string;
    overrideRouteCheck: boolean = false;
    attemptedRoute: string;
    destinationRoute: string;
    cohortStudentsSubscription: Subscription;
    cohortSubscription: Subscription;
    _institutionId: number;
    selectAll: boolean = false;
    allSelected: boolean = false;
    extendAccessStudents: Array<any>;
    rosterChangeUpdateStudents: ChangeUpdateRosterStudentsModel[];

    constructor(private changeDetectorRef: ChangeDetectorRef, public auth: AuthService, public router: Router, public titleService: Title, private common: CommonService, private rosterChangesModel: RosterChangesModel, 
    private rosterCohortsModel: RosterCohortsModel, private rosterChangesService: RosterChangesService, private rosterService: RosterService) {
    }

    ngOnDestroy(): void {
        if (this.cohortStudentsSubscription)
            this.cohortStudentsSubscription.unsubscribe();
        if (this.cohortSubscription)
            this.cohortSubscription.unsubscribe();
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
            let cohortId: number = this.rosterChangesModel.cohortId;
            this._institutionId = this.rosterChangesModel.institutionId;
            this.getRosterCohortStudents(cohortId);
            this.titleService.setTitle('Request Extended Access – Kaplan Nursing');
            window.scroll(0, 0);
        }
    }

    getRosterCohortStudents(cohortId) {
        let __this = this;
        let url: string = `${this.common.getApiServer()}${links.api.baseurl}${links.api.admin.rosters.cohortStudents}`;
        if (cohortId) {
            url = url.replace('§cohortId', cohortId.toString());
            let rosterCohortsObservable: Observable<Response> = this.rosterService.getRosterStudentCohorts(url);
            this.cohortStudentsSubscription = rosterCohortsObservable
                .map(response => response.json())
                .subscribe(json => {
                    __this.loadRosterCohortStudents(__this.rosterCohortsModel, json);
                }, error => {
                    __this.loadRosterCohortStudents(__this.rosterCohortsModel, null);
                });
        }
    }

  loadRosterCohortStudents(cohort: RosterCohortsModel, cohortStudents: any) {
        if (cohortStudents) {
            this.rosterChangeUpdateStudents = _.map(cohortStudents, (student: any) => {
                let changeUpdateStudent = new ChangeUpdateRosterStudentsModel();
                changeUpdateStudent.email = student.Email;
                changeUpdateStudent.firstName = student.FirstName;
                changeUpdateStudent.lastName = student.LastName;
                changeUpdateStudent.studentId = student.StudentId;
                return changeUpdateStudent;
            });
            this.loadUpdatedCohortStudents();
        }
    }

    loadUpdatedCohortStudents() {
        // in case user is going back to modify changes, get updated model
        let rosterChangesUpdatedModel = this.rosterChangesService.getUpdatedRosterChangesModel();
        // check if any students have already been updated and return an array of students
        let extendAccessStudents =  _.filter(rosterChangesUpdatedModel.students, ['updateType', RosterUpdateTypes.ExtendAccess ]);
        if (extendAccessStudents.length > 0) {
            // update flags for those students in original model
            _.each(extendAccessStudents, ( extendedAccessStudent: any) => {
                let eachStudent = _.find(this.rosterChangeUpdateStudents, ['studentId', extendedAccessStudent.studentId]);
                if (eachStudent) {
                    eachStudent.isExtendAccess = true;
                    eachStudent.updateType = RosterUpdateTypes.ExtendAccess;
                }
            });
            // check if select all input should be checked
            if (this.rosterChangeUpdateStudents.length === extendAccessStudents.length) {
                this.selectAll = true;
            } else {
                this.selectAll = false;
            }
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

    selectAllStudents(e:any): void {
        // update isExtendedAccess and Update Type for all students in model 
        let allStudents = this.rosterChangeUpdateStudents;
        if(this.selectAll) {
            // check if there are already students added to the rosterChangesModel.students array and if so remove them all first
            if (this.rosterChangesModel.students.length > 0) {
              this.rosterChangesModel.students = [];
            }
            // then add all students to array
            for(var i=0; i < allStudents.length; i++) {
                allStudents[i].isExtendAccess = true;
                allStudents[i].updateType = RosterUpdateTypes.ExtendAccess;
                this.rosterChangesModel.students.push(allStudents[i]);
            }
        } else {
            for(var i=0; i < allStudents.length; i++) {
                allStudents[i].isExtendAccess = false;
                allStudents[i].updateType = null;
            }
           // remove all students from array on uncheck of selectAll
           this.rosterChangesModel.students = [];
        }
    }


    extendAccessForStudent(e:any, studentId) {
        let studentToUpdate: ChangeUpdateRosterStudentsModel = _.find(this.rosterChangeUpdateStudents, { 'studentId': studentId });
        //if checkbox is checked find student in model and update isExtendAccess and updateType
        if (e.target.checked) {
            studentToUpdate.isExtendAccess = true;
            studentToUpdate.updateType = RosterUpdateTypes.ExtendAccess;
            //add student to rosterChangesModel.students array
            this.rosterChangesModel.students.push(studentToUpdate);
        } else {
            studentToUpdate.isExtendAccess = false;
            studentToUpdate.updateType = null;
            // find student to remove and remove from rosterChangesModel.students array
            let studentToRemove = _.findIndex(this.rosterChangesModel.students, { 'studentId': studentId });
            this.rosterChangesModel.students.splice(studentToRemove, 1);

        }
        //check if students with isExtendAccess is all students of not and check or uncheck select all input
        this.checkIfAllStudentsSelected();
    }

    checkIfAllStudentsSelected():void {
      let allStudents = this.rosterChangeUpdateStudents;
      let allStudentsSelected = _.every(allStudents, ['isExtendAccess', true]);
      if(allStudentsSelected) {
          this.selectAll = true;
      } else {
          this.selectAll = false;
      }
    }

    redirectToReview(): void {
         // sort extended students by last name in case user added once and then added more students
         this.rosterChangesModel.students = _.sortBy(this.rosterChangesModel.students, ['lastName']);
         // save student roster changes to sStorage and redirect
         this.sStorage.setItem('rosterChanges', JSON.stringify(this.rosterChangesModel));
         this.router.navigate(['rosters/roster-changes-summary']);
    }

}
