import { Component, Input, Output, OnInit, OnDestroy, EventEmitter} from '@angular/core';
import {NgFor} from '@angular/common';
import { Observable, Subscription } from 'rxjs/Rx';
import { links, RosterUpdateTypes } from '../../constants/config';
import { Response } from '@angular/http';
import { AuthService } from './../../services/auth.service';

import { CommonService } from './../../services/common.service';
import {RosterService} from './roster.service';
import {RosterCohortsModel} from '../../models/roster-cohorts.model';
import { RosterChangesModel } from '../../models/roster-changes.model';
import {RostersModal} from '../../models/rosters.model';
import {ChangeUpdateRosterStudentsModel} from '../../models/change-update-roster-students.model';

@Component({
    selector: 'request-change-roster-popup',
    providers: [RosterCohortsModel, RosterChangesModel],
    templateUrl: './request-change-roster-popup.component.html',
    styleUrls: ['./rosters-change-update-form.component.css'] 
})

export class RequestChangeRosterPopupComponent implements OnInit, OnDestroy {
    @Input() rosterChangesModel: RosterChangesModel;
    @Input() rosterChangeUpdateStudents: ChangeUpdateRosterStudentsModel[];
    @Input() studentNameToChangeRoster: string;
    @Input() toChangeRosterStudentId: number;
    @Output() requestChangeCohortPopup = new EventEmitter();

    rostersList: RostersModal[] = [];
    cohortSubscription: Subscription;
    noCohorts: boolean = true;
    institutionId: number;
    sStorage: any;

    constructor(public auth: AuthService, public common: CommonService, public rosterService: RosterService, public rosterCohortsModel: RosterCohortsModel, public rosters: RostersModal) { }

    ngOnDestroy() {
        if (this.cohortSubscription)
            this.cohortSubscription.unsubscribe();
    }

    ngOnInit() {
        this.sStorage = this.common.getStorage();
        this.rostersList = JSON.parse(this.sStorage.getItem('rosterlist'));
        if (this.rostersList === null || this.rostersList.length === 0) {
            this.rostersList = [];
            this.rosterCohorts();           
        }
        $('#changeCohortModal').focus();
    }
    rosterCohorts() {
        let institutionId = this.rosterChangesModel.institutionId;
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


    loadCohorts(roster: any) {
        if (roster) {
            let __this = this;
            let _keepInCohort: any;
            let seperateExtensionCohort: RosterCohortsModel[] = [];
            this.rosters.studentPayEnabled = roster.StudentPayEnabled;
            if (roster.Cohorts.length > 0) {
                roster.Cohorts = _.orderBy(roster.Cohorts, function (o: any) {
                    if (o.CohortName.toUpperCase().indexOf('EXTENSION') != -1)
                        return new Date(0);
                    else {
                        seperateExtensionCohort.push(o);
                        return new Date(o.CohortEndDate);
                    }
                }, 'desc');

                this.rosters.cohorts = _.map(seperateExtensionCohort, (cohort: any) => {
                    let rosterCohort = new RosterCohortsModel();
                    rosterCohort.cohortId = cohort.CohortId;
                    rosterCohort.cohortName = cohort.CohortName;
                    rosterCohort.cohortStartDate = cohort.CohortStartDate;
                    rosterCohort.cohortEndDate = cohort.CohortEndDate;
                    rosterCohort.studentCount = cohort.StudentCount;
                    return rosterCohort;
                });
                _.filter(this.rosters.cohorts, function (o) {
                    if (__this.rosterChangesModel.cohortId !== o.cohortId)
                        __this.rostersList.push(o);
                    else
                        _keepInCohort = o;
                });
                this.rostersList.splice(0, 0, _keepInCohort);
                __this.sStorage.setItem('rosterlist', JSON.stringify(this.rostersList));
            }
        }
    }

    CloseCohortPopup(e) {
        e.preventDefault();
        this.requestChangeCohortPopup.emit();
    }

    moveToCohort(_roster, e) {
        e.preventDefault();
        let __this = this;
        let updatedStudent: ChangeUpdateRosterStudentsModel;
        _.filter(this.rosterChangeUpdateStudents, function (_student) {
            if (_student.studentId === __this.toChangeRosterStudentId) {
                if (__this.rosterChangesModel.cohortId !== _roster.cohortId) {
                    _student.moveToCohortId = _roster.cohortId;
                    _student.moveToCohortName = _roster.cohortName;
                }
                else {
                    _student.moveToCohortId = null;
                    _student.moveToCohortName = null;
                }
                _student.updateType = RosterUpdateTypes.MoveToDifferentCohort;
                updatedStudent = _student;
                __this.updateRosterList(_roster.cohortId);
            }
        });
        setTimeout(() => {
            this.requestChangeCohortPopup.emit(updatedStudent);
        }, 100);

    }

    updateRosterList(rosterid) {
        let __this = this;
        _.filter(this.rostersList, (o) => {
            if (o.cohortId == rosterid && __this.rosterChangesModel.cohortId !== rosterid)
                o.isSelected = true;
            else
                o.isSelected = false;
        });
    }

}