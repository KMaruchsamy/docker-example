import {ParseDatePipe} from '../../pipes/parsedate.pipe';
import {Common} from '../../services/common';
import { RosterService } from './../../services/roster.service';
import { NgFor, NgIf } from '@angular/common';
import { RosterCohortsModal } from './../../models/roster-cohorts.modal';
import { RosterCohortStudentsModal } from './../../models/roster-cohort-students.modal';
import { RostersModal } from './../../models/rosters.modal';
import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';
import {links} from '../../constants/config';
import {Observable, Subscription} from 'rxjs/Rx';
import {Response} from '@angular/http';

@Component({
    selector: 'rosters-cohorts',
    providers: [RostersModal, RosterCohortsModal, RosterCohortStudentsModal, Common, RosterService],
    encapsulation: ViewEncapsulation.None,
    templateUrl: 'templates/rosters/rosters-cohorts.html',
    directives: [NgIf, NgFor],
    pipes: [ParseDatePipe]
})
export class RostersCohorts implements OnInit, OnDestroy {
    _institutionId: number;
    @Input()
    set institutionId(value: number) {
        this._institutionId = value;
        if (this._institutionId)
            this.rosterCohorts(this.institutionId);
    }
    get institutionId() {
        return this._institutionId;
    }
    searchString: string;
    cohortSubscription: Subscription;
    cohortStudentsSubscription: Subscription;

    constructor(public rosters: RostersModal, private rosterService: RosterService, private common: Common) { }

    ngOnInit() {
        $('body').on('hidden.bs.popover', function (e) {
            $(e.target).data("bs.popover").inState.click = false;
        });

        $('body').on('click', function (e) {
            $('[data-toggle="popover"]').each(function () {
                //the 'is' for buttons that trigger popups
                //the 'has' for icons within a button that triggers a popup
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            });
        });
    }

    ngOnDestroy(): void {
        if (this.cohortSubscription)
            this.cohortSubscription.unsubscribe();
        if (this.cohortStudentsSubscription)
            this.cohortStudentsSubscription.unsubscribe();
    }

    loadCohorts(roster: any) {

        let rosterCohorts: Array<RosterCohortsModal>;
        if (roster) {
            this.rosters.institutionId = roster.InstitutionId;
            this.rosters.institutionName = roster.InstitutionName;
            this.rosters.institutionNameWithProgOfStudy = roster.InstitutionNameWithProgOfStudy;
            this.rosters.accountManagerId = roster.AccountManagerId;
            this.rosters.accountManagerFirstName = roster.AccountManagerFirstName;
            this.rosters.accountManagerLastName = roster.AccountManagerLastName;
            this.rosters.accountManagerEmail = roster.AccountManagerEmail;
            this.rosters.studentPayEnabled = roster.StudentPayEnabled;
            if (roster.Cohorts.length > 0) {
                roster.Cohorts = _.sortBy(roster.Cohorts, function (o: any) { return new Date(o.CohortEndDate); });
                this.rosters.cohorts = _.map(roster.Cohorts, (cohort: any) => {
                    let rosterCohort = new RosterCohortsModal();
                    rosterCohort.cohortId = cohort.CohortId;
                    rosterCohort.cohortName = cohort.CohortName;
                    rosterCohort.cohortStartDate = cohort.CohortStartDate;
                    rosterCohort.cohortEndDate = cohort.CohortEndDate;
                    rosterCohort.studentCount = cohort.StudentCount;
                    return rosterCohort;
                })
            }
        }
    }


    rosterCohorts(institutionId: number) {
        let __this = this;
        let url: string = `${this.common.getApiServer()}${links.api.baseurl}${links.api.admin.rosters.cohorts}`;
        if (institutionId) {
            url = url.replace('§institutionId', institutionId.toString());
            let rosterCohortsObservable: Observable<Response> = this.rosterService.getRosterCohorts(url);
            this.cohortSubscription = rosterCohortsObservable
                .map(response => response.json())
                .subscribe(json => {
                    __this.loadCohorts(json);
                }, error => {
                    console.log(error)
                });
        }
    }

    loadRosterCohortStudents(cohort: RosterCohortsModal, cohortStudents: any) {
        let rosterCohortStudents: Array<RosterCohortStudentsModal> = [];
        if (cohortStudents) {
            rosterCohortStudents = _.map(cohortStudents, (student: any) => {
                let rosterCohortStudent = new RosterCohortStudentsModal();
                rosterCohortStudent.cohortId = student.CohortId;
                rosterCohortStudent.cohortName = student.CohortName;
                rosterCohortStudent.email = student.Email;
                rosterCohortStudent.firstName = student.FirstName;
                rosterCohortStudent.lastName = student.LastName;
                rosterCohortStudent.studentId = student.StudentId;
                rosterCohortStudent.repeatExpiryDate = student.RepeatExpiryDate;
                rosterCohortStudent.userExpireDate = student.UserExpireDate;
                rosterCohortStudent.studentPayInstitution = student.StudentPayInstitution;
                rosterCohortStudent.isRepeatStudent = !!rosterCohortStudent.repeatExpiryDate;
                rosterCohortStudent.isExpriredStudent = (!!rosterCohortStudent.userExpireDate && !rosterCohortStudent.studentPayInstitution);
                rosterCohortStudent.isStudentPayDeactivatedStudent = (!!rosterCohortStudent.userExpireDate && !!rosterCohortStudent.studentPayInstitution);


                rosterCohortStudent.isDuplicate = _.some(cohortStudents, function (stud: any) {
                    return stud.StudentId !== student.StudentId
                        && student.FirstName.toUpperCase() === stud.FirstName.toUpperCase()
                        && student.LastName.toUpperCase() === stud.LastName.toUpperCase()
                });

                if (!cohort.hasRepeatStudent) {
                    if (rosterCohortStudent.isRepeatStudent)
                        cohort.hasRepeatStudent = true;
                }

                if (!cohort.hasExpiredStudent) {
                    if (rosterCohortStudent.isExpriredStudent)
                        cohort.hasExpiredStudent = true;
                }

                if (!cohort.hasStudentPayDeactivatedStudent) {
                    if (rosterCohortStudent.isStudentPayDeactivatedStudent)
                        cohort.hasStudentPayDeactivatedStudent = true;
                }

                return rosterCohortStudent;
            });
        }
        cohort.studentCount = rosterCohortStudents ? rosterCohortStudents.length : 0;
        cohort.students = rosterCohortStudents;
        cohort.visible = !cohort.visible;
        console.log(this.rosters);
    }

    rosterCohortStudents(cohortId: number): any {
        let rosterCohort: RosterCohortsModal = _.find(this.rosters.cohorts, { "cohortId": cohortId });
        if (rosterCohort) {
            if (rosterCohort.students || rosterCohort.visible) {
                rosterCohort.visible = !rosterCohort.visible;
                return;
            }

            let __this = this;
            let url: string = `${this.common.getApiServer()}${links.api.baseurl}${links.api.admin.rosters.cohortStudents}`;
            if (cohortId) {
                url = url.replace('§cohortId', cohortId.toString());
                let rosterCohortsObservable: Observable<Response> = this.rosterService.getRosterStudentCohorts(url);
                this.cohortStudentsSubscription = rosterCohortsObservable
                    .map(response => response.json())
                    .subscribe(json => {
                        __this.loadRosterCohortStudents(rosterCohort, json);
                        console.log('Subscription');
                    }, error => {
                        __this.loadRosterCohortStudents(rosterCohort, null);
                        console.log(error)
                        console.log('error');
                    }, () => {
                        setTimeout(() => {
                            $('.has-popover').popover();
                        });
                    });
            }

        }


    }

}

