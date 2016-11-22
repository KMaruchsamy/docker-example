import {ParseDatePipe} from '../../pipes/parsedate.pipe';
// import {CommonService} from '../../services/common';
// import { RosterService } from './../../services/roster.service';
import { NgFor, NgIf } from '@angular/common';
// import { RosterCohortsModel } from './../../models/roster-cohorts.modal';
// import { RosterCohortStudentsModel } from './../../models/roster-cohort-students.modal';
// import { RostersModal } from './../../models/rosters.modal';
import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import {RouterLink, ROUTER_DIRECTIVES} from '@angular/router';
import * as _ from 'lodash';
import {links, Timezones} from '../../constants/config';
import {Observable, Subscription} from 'rxjs/Rx';
import {Response} from '@angular/http';
import { RostersModal } from './../../models/rosters.model';
import { RosterCohortsModel } from './../../models/roster-cohorts.model';
import { RosterCohortStudentsModel } from './../../models/roster-cohort-students.model';
import { CommonService } from './../../services/common.service';
import { RosterService } from './roster.service';
import * as moment from 'moment-timezone';

@Component({
    selector: 'rosters-cohorts',
    providers: [RostersModal, RosterCohortsModel, RosterCohortStudentsModel, CommonService, RosterService],
    encapsulation: ViewEncapsulation.Emulated,
    templateUrl: 'components/rosters/rosters-cohorts.component.html',
    directives: [NgIf, NgFor, RouterLink, ROUTER_DIRECTIVES],
    pipes: [ParseDatePipe],
    styles: [`
    .name-multiple-icons  {
        top: -.75em;
        right: -.75em;
        position: relative;
    }
    .list-item-with-icons {
        padding-right: 55px !important;
    }
    .small-popover {
        margin-left: -0.15em;
        margin-right: .25em;
    }
    .large-expander-trigger {
        padding-right: 100px;
    }`]
})
export class RostersCohortsComponent implements OnInit, OnDestroy {
    _institutionId: number;
    noCohorts: Boolean = false;
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

    constructor(public rosters: RostersModal, private rosterService: RosterService, private common: CommonService) { }

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
        let rosterCohorts: Array<RosterCohortsModel>;
        if (roster) {
            let extensionCohort: RosterCohortsModel;
            this.rosters.institutionId = roster.InstitutionId;
            this.rosters.institutionName = roster.InstitutionName;
            this.rosters.institutionNameWithProgOfStudy = roster.InstitutionNameWithProgOfStudy;
            this.rosters.accountManagerId = roster.AccountManagerId;
            this.rosters.accountManagerFirstName = roster.AccountManagerFirstName;
            this.rosters.accountManagerLastName = roster.AccountManagerLastName;
            this.rosters.accountManagerEmail = roster.AccountManagerEmail;
            this.rosters.studentPayEnabled = roster.StudentPayEnabled;
            if (roster.Cohorts.length > 0) {
                roster.Cohorts = _.orderBy(roster.Cohorts, function (o: any) {
                    if (o.CohortName.toUpperCase().indexOf('EXTENSION') != -1)
                        return new Date(0);
                    else
                        return new Date(o.CohortEndDate);
                }, 'desc');
                this.rosters.cohorts = _.map(roster.Cohorts, (cohort: any) => {
                    let rosterCohort = new RosterCohortsModel();
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
                    __this.noCohorts = false;
                    __this.loadCohorts(json);
                }, error => {
                    console.log(error)
                    __this.noCohorts = true;
                    __this.rosters = new RostersModal();
                });
        }
    }

    loadRosterCohortStudents(cohort: RosterCohortsModel, cohortStudents: any) {
        let rosterCohortStudents: Array<RosterCohortStudentsModel> = [];
        if (cohortStudents) {
            rosterCohortStudents = _.map(cohortStudents, (student: any) => {
                let rosterCohortStudent = new RosterCohortStudentsModel();
                rosterCohortStudent.cohortId = student.CohortId;
                rosterCohortStudent.cohortName = student.CohortName;
                rosterCohortStudent.email = student.Email;
                rosterCohortStudent.firstName = student.FirstName;
                rosterCohortStudent.lastName = student.LastName;
                rosterCohortStudent.studentId = student.StudentId;
                rosterCohortStudent.repeatExpiryDate = student.RepeatExpiryDate;
                rosterCohortStudent.userExpireDate = student.UserExpireDate;
                rosterCohortStudent.studentPayInstitution = student.StudentPayInstitution;
                rosterCohortStudent.isRepeatStudent = !!rosterCohortStudent.repeatExpiryDate && moment(rosterCohortStudent.repeatExpiryDate).isAfter(new Date(), 'day');
                rosterCohortStudent.isExpiredStudent = (moment(rosterCohortStudent.userExpireDate).isSameOrBefore(new Date(), 'day') && !rosterCohortStudent.studentPayInstitution);
                rosterCohortStudent.isStudentPayDeactivatedStudent = (moment(rosterCohortStudent.userExpireDate).isSameOrBefore(new Date(), 'day') && !!rosterCohortStudent.studentPayInstitution);


                rosterCohortStudent.isDuplicate = _.some(cohortStudents, function (stud: any) {
                    return stud.StudentId !== student.StudentId
                        && student.FirstName.toUpperCase() === stud.FirstName.toUpperCase()
                        && student.LastName.toUpperCase() === stud.LastName.toUpperCase()
                });

                if (!cohort.hasDuplicateStudent) {
                    if (rosterCohortStudent.isDuplicate)
                        cohort.hasDuplicateStudent = true;
                }

                if (!cohort.hasRepeatStudent) {
                    if (rosterCohortStudent.isRepeatStudent)
                        cohort.hasRepeatStudent = true;
                }

                if (!cohort.hasExpiredStudent) {
                    if (rosterCohortStudent.isExpiredStudent)
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
    }

    rosterCohortStudents(cohortId: number): any {
        let rosterCohort: RosterCohortsModel = _.find(this.rosters.cohorts, { "cohortId": cohortId });
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
                    }, error => {
                        __this.loadRosterCohortStudents(rosterCohort, null);
                    }, () => {
                        setTimeout(() => {
                            $('.has-popover').popover();
                        });
                    });
            }

        }


    }

    isExtensionCohort(cohortName: string)
    {
        if (cohortName.toUpperCase().indexOf('EXTENSION') === 0)
            return true;
        else
            return false;
    }
    isCohortAboutToExpire(cohort: RosterCohortsModel) {
        let cohortExpiry = moment(cohort.cohortEndDate);
        let dateAfterTwoWeek = moment().add(14, "days").tz(Timezones.GMTminus5);
        let isExpire = cohortExpiry.isSameOrBefore(dateAfterTwoWeek);
        return isExpire;
    }

}

