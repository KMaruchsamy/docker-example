import {Subscription, Observable} from 'rxjs/Rx';
import {RosterService} from '../../services/roster.service';
import {Common} from '../../services/common';
import { Input } from '@angular/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {links} from '../../constants/config';
import {Response} from '@angular/http';
import {RosterCohortStudentsModal} from '../../models/roster-cohort-students.modal';
import * as _ from 'lodash';

@Component({
    selector: 'rosters-search',
    providers: [Common, RosterService],
    templateUrl: 'templates/rosters/rosters-search.html',
    directives: []
})
export class RostersSearch implements OnInit, OnDestroy {
    _institutionId: number;
    @Input()
    set institutionId(value: number) {
        this._institutionId = value;
        if (value)
            this.validInstitution = true;
        this.resetSearch();
    }
    get institutionId() {
        return this._institutionId;
    }

    searchString: string;
    validInstitution: boolean = false;
    searchStudentsSubscription: Subscription;
    activeStudents: Array<RosterCohortStudentsModal>;
    inactiveStudents: Array<RosterCohortStudentsModal>;
    anyRepeatStudents: boolean = false;
    anyExpiredStudents: boolean = false;
    anyStudentPayStudents: boolean = false;
    searchTriggered: boolean = false;

    constructor(private common: Common, private rosterService: RosterService) { }


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

    ngOnDestroy() {
        if (this.searchStudentsSubscription)
            this.searchStudentsSubscription.unsubscribe();
    }


    resetSearch() {
        this.searchString = '';
        this.activeStudents = this.inactiveStudents = [];
        this.searchTriggered = false;
    }

    searchStudents(e) {
        e.preventDefault();

        this.anyRepeatStudents = this.anyExpiredStudents = this.anyStudentPayStudents = false;

        if (!this.institutionId || !this.searchString || this.searchString === '') {
            this.activeStudents = this.inactiveStudents = [];
            return;
        }

        let __this: RostersSearch = this;
        let url: string = `${this.common.getApiServer()}${links.api.baseurl}${links.api.admin.rosters.search}`;
        url = url.replace("§institutionId", this.institutionId.toString()).replace('§searchString', this.searchString);
        let searchStudentsObservable: Observable<Response> = this.rosterService.searchStudents(url);
        this.searchStudentsSubscription = searchStudentsObservable
            .map(response => response.json())
            .finally(() => {
                console.log('done!');
                __this.searchTriggered = true;
                setTimeout(() => {
                    $('.has-popover').popover();
                });
            })
            .subscribe((json: any) => {
                console.log('subscribe');
                if (json) {
                    if (json.Active && json.Active.length > 0) {
                        __this.activeStudents = __this.mapStudents(json.Active);
                    }
                    if (json.InactiveOrExpired && json.InactiveOrExpired.length > 0) {
                        __this.inactiveStudents = __this.mapStudents(json.InactiveOrExpired);
                    }
                }
            },
            error => {
                console.log('error');
                this.activeStudents = this.inactiveStudents = [];
            });

    }

    mapStudents(objStudents: Array<any>) {
        if (!objStudents)
            return [];
        else if (objStudents.length === 0)
            return [];
        else
            return _.map(objStudents, (student: any) => {
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
                rosterCohortStudent.isExpiredStudent = (!!rosterCohortStudent.userExpireDate && !rosterCohortStudent.studentPayInstitution);
                rosterCohortStudent.isStudentPayDeactivatedStudent = (!!rosterCohortStudent.userExpireDate && rosterCohortStudent.studentPayInstitution);

                rosterCohortStudent.isDuplicate = _.some(objStudents, function (stud: any) {
                    return stud.StudentId !== student.StudentId
                        && student.FirstName.toUpperCase() === stud.FirstName.toUpperCase()
                        && student.LastName.toUpperCase() === stud.LastName.toUpperCase()
                });

                if (!this.anyRepeatStudents) {
                    if (rosterCohortStudent.isRepeatStudent)
                        this.anyRepeatStudents = true;
                }

                if (!this.anyExpiredStudents) {
                    if (rosterCohortStudent.isExpiredStudent)
                        this.anyExpiredStudents = true;
                }

                if (!this.anyStudentPayStudents) {
                    if (rosterCohortStudent.isStudentPayDeactivatedStudent)
                        this.anyStudentPayStudents = true;
                }

                return rosterCohortStudent;
            });
    }

    clear(e) {
        e.preventDefault();
        this.searchString = '';
        this.activeStudents = this.inactiveStudents = [];
        this.searchTriggered = false;
    }


}