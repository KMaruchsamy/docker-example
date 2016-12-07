import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {NgFor} from '@angular/common';
import {Router} from '@angular/router';
import { Observable, Subscription } from 'rxjs/Rx';
import { links } from '../../constants/config';
import { Response } from '@angular/http';
import { AuthService } from './../../services/auth.service';
import { RosterChangesModel } from '../../models/roster-changes.model';
import {RosterCohortsModel} from '../../models/roster-cohorts.model';
import {RosterCohortStudentsModel} from '../../models/roster-cohort-students.model';
import {ChangeUpdateRosterStudentsModal} from '../../models/change-update-roster-students.model';
import {RostersModal} from '../../models/rosters.model';
import { CommonService } from './../../services/common.service';
import {RosterService} from './roster.service';

@Component({
    selector: 'rosters-form',
    providers: [RosterCohortsModel, RostersModal],
    templateUrl: './rosters-change-update-form.component.html',
    styleUrls: ['./rosters-change-update-form.component.css'],
})

export class RostersChangeUpdateFormComponent implements OnInit, OnDestroy {
   
    @Input() rosterChangesModel: RosterChangesModel;
    
    cohortStudentsSubscription: Subscription;
    cohortSubscription: Subscription;
    noCohorts: boolean = false;
    rostersList: RostersModal[] = [];
    _institutionId: number;
    studentNameToChangeRoster: string;
    toChangeRosterStudentId: number;
    testsTable: any;
    expandUpdateDiv: boolean = true;
    rosterChangeUpdateStudents: ChangeUpdateRosterStudentsModal[];
    enableRepeaterCheckbox: boolean = false;
   

    constructor(public auth: AuthService, public router: Router, public common: CommonService, public rosterService: RosterService, public rosterCohortsModel: RosterCohortsModel, public rosters: RostersModal) { }

    ngOnDestroy(): void {
        if (this.testsTable)
            this.testsTable.destroy();
        if (this.cohortStudentsSubscription)
            this.cohortStudentsSubscription.unsubscribe();
        if (this.cohortSubscription)
            this.cohortSubscription.unsubscribe();
        
    }

    ngOnInit() {
        let cohortId: number = this.rosterChangesModel.cohortId;
        this._institutionId = this.rosterChangesModel.institutionId;
        this.testsTable = null;
        this.getRosterCohortStudents(cohortId);
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
                    __this.bindDatatable(__this);
                }, error => {
                    __this.loadRosterCohortStudents(__this.rosterCohortsModel, null);
                }, () => {
                    setTimeout(() => {
                        $('.has-popover').popover();
                    });
                });
        }
    }
    bindDatatable(self: any): void {
        if (self.testsTable)
            self.testsTable.destroy();
        setTimeout(() => {
            self.testsTable = $('#markChangesTable').DataTable({
                "paging": false,
                "searching": false,
                "responsive": true,
                "info": false,
                "ordering": false,
                "scrollY": "300px",
                "scrollCollapse": true,
            });
            $('#markChangesTable').on('responsive-display.dt', function () {
                $(this).find('.child .dtr-title br').remove();
            });
        });
    }

    loadRosterCohortStudents(cohort: RosterCohortsModel, cohortStudents: any) {
        debugger;
        //let rosterCohortStudents: Array<RosterCohortStudentsModel> = [];
       // let rosterChangeUpdateStudents: Array<ChangeUpdateRosterStudentsModal>[];
        if (cohortStudents) {
            //rosterCohortStudents = _.map(cohortStudents, (student: any) => {
            //    let rosterCohortStudent = new RosterCohortStudentsModel();
            //    rosterCohortStudent.cohortId = student.CohortId;
            //    rosterCohortStudent.cohortName = student.CohortName;
            //    rosterCohortStudent.email = student.Email;
            //    rosterCohortStudent.firstName = student.FirstName;
            //    rosterCohortStudent.lastName = student.LastName;
            //    rosterCohortStudent.studentId = student.StudentId;
            //    rosterCohortStudent.repeatExpiryDate = student.RepeatExpiryDate;
            //    rosterCohortStudent.userExpireDate = student.UserExpireDate;
            //    rosterCohortStudent.studentPayInstitution = student.StudentPayInstitution;
            //    rosterCohortStudent.isRepeatStudent = !!rosterCohortStudent.repeatExpiryDate && moment(rosterCohortStudent.repeatExpiryDate).isAfter(new Date(), 'day');
            //    rosterCohortStudent.isExpiredStudent = (moment(rosterCohortStudent.userExpireDate).isSameOrBefore(new Date(), 'day') && !rosterCohortStudent.studentPayInstitution);
            //    rosterCohortStudent.isStudentPayDeactivatedStudent = (moment(rosterCohortStudent.userExpireDate).isSameOrBefore(new Date(), 'day') && !!rosterCohortStudent.studentPayInstitution);


            //    rosterCohortStudent.isDuplicate = _.some(cohortStudents, function (stud: any) {
            //        return stud.StudentId !== student.StudentId
            //            && student.FirstName.toUpperCase() === stud.FirstName.toUpperCase()
            //            && student.LastName.toUpperCase() === stud.LastName.toUpperCase()
            //    });

            //    if (!cohort.hasDuplicateStudent) {
            //        if (rosterCohortStudent.isDuplicate)
            //            cohort.hasDuplicateStudent = true;
            //    }

            //    if (!cohort.hasRepeatStudent) {
            //        if (rosterCohortStudent.isRepeatStudent)
            //            cohort.hasRepeatStudent = true;
            //    }

            //    if (!cohort.hasExpiredStudent) {
            //        if (rosterCohortStudent.isExpiredStudent)
            //            cohort.hasExpiredStudent = true;
            //    }

            //    if (!cohort.hasStudentPayDeactivatedStudent) {
            //        if (rosterCohortStudent.isStudentPayDeactivatedStudent)
            //            cohort.hasStudentPayDeactivatedStudent = true;
            //    }

            //    return rosterCohortStudent;
            //});
            this.rosterChangeUpdateStudents = _.map(cohortStudents, (student: any) => {
                let changeUpdateStudent = new ChangeUpdateRosterStudentsModal();
                changeUpdateStudent.moveFromCohortId = student.CohortId;
                changeUpdateStudent.moveFromCohortName = student.CohortName;
                changeUpdateStudent.email = student.Email;
                changeUpdateStudent.firstName = student.FirstName;
                changeUpdateStudent.lastName = student.LastName;
                changeUpdateStudent.studentId = student.StudentId;
                return changeUpdateStudent;
            });
            

        }
        //cohort.studentCount = rosterChangeUpdateStudents ? rosterChangeUpdateStudents.length : 0;
        //cohort.students = rosterChangeUpdateStudents;
        //cohort.visible = !cohort.visible;
        //cohort.cohortId = this.rosterChangesModel.cohortId;
        //cohort.cohortName = this.rosterChangesModel.cohortName;
        this.rosterCohorts(this._institutionId);
    }

    loadCohorts(roster: any) {        
        if (roster) {
            let __this = this;
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
                });
                _.filter(this.rosters.cohorts, function (o) {
                    if (__this.rosterChangesModel.cohortId !== o.cohortId)
                        __this.rostersList.push(o);
                });
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

    showCohortPopup(firstName,lastName,studentId,e) {
        e.preventDefault();
        $('#changeCohortModal').modal('show');
        this.studentNameToChangeRoster = lastName + "," + firstName;
        this.toChangeRosterStudentId = studentId;
    }

    CloseCohortPopup(e) {
        e.preventDefault();
        $('#changeCohortModal').modal('hide');
    }
    moveToCohort(_roster, e) {
        debugger;
        e.preventDefault();
        let __this = this;
        _.filter(this.rosterChangeUpdateStudents, function (_student) {
            if (_student.studentId === __this.toChangeRosterStudentId) {
                _student.moveToCohortId = _roster.cohortId;
                _student.moveToCohortName = _roster.cohortName;
                __this.enableRepeaterCheckbox = true;
            }
        });
        $('#changeCohortModal').modal('hide');

        //let target = e.target || e.srcElement || e.currentTarget;
        //let idAttr = target.attributes.id;
        //let movetocohortid = idAttr.nodeValue;
        //idAttr.value = _roster.cohortName;
        //idAttr.text = _roster.cohortName;

        //let modalButtonId: string = _roster.cohortId;
        //$('#' + modalButtonId).removeClass('button-unselected');
        //$('#' + modalButtonId).find('img').removeClass('hidden');

        //$('#btnChangeToCohort' + this.toChangeRosterStudentId).text(_roster.cohortName);
        //$('#btnChangeToCohort' + this.toChangeRosterStudentId).val(_roster.cohortName);
        //$('#btnChangeToCohort' + this.toChangeRosterStudentId).removeClass('button-no-change');

        //$('#chkRepeat' + this.toChangeRosterStudentId).prop('disabled', false);
        //$('#inactive' + this.toChangeRosterStudentId).prop('disabled', 'disabled');
   //     $('#' + modalButtonId).removeClass('button-unselected');
        

        //$('#' + modalButtonId).addClass('button-unselected');
        //$('#' + modalButtonId).find('img').addClass('hidden');
    }
    expandRequestChanges(e) {
        e.preventDefault();
        this.expandUpdateDiv = !this.expandUpdateDiv;
    }
    callMakeInactive(_studentId,e)
    {
        e.preventDefault(); debugger;
        let target = e.target || e.srcElement || e.currentTarget;
        let isChecked: boolean = target.checked;
        _.filter(this.rosterChangeUpdateStudents, function (_student) {
            if (_student.studentId === _studentId) {
                _student.isActive = isChecked;
                _student.isRepeater = false;
                _student.isGrantUntimedTest = false;
            }
        });
        
    }
    callToGrantUntimedTest(_studentId,e) {
        e.preventDefault(); debugger;
        let __this = this;
        let target = e.target || e.srcElement || e.currentTarget;
        let isChecked: boolean = target.checked;
        _.filter(this.rosterChangeUpdateStudents, function (_student) {
            if (_student.studentId === _studentId) {
                _student.isGrantUntimedTest = isChecked;
                if (_student.moveToCohortId === null) {
                    _student.isActive = false;
                }
            }
        });     
    }

    saveRequestedStudentsUpdate() {

    }
}

