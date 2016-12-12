import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
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
    styleUrls: ['./rosters-change-update-form.component.css']
})

export class RostersChangeUpdateFormComponent implements OnInit, OnDestroy {

    @Input() rosterChangesModel: RosterChangesModel;
    @Output() changeUpdateRosterStudentsEvent = new EventEmitter();
    @Output() changeToDifferentCohortEvent = new EventEmitter();

    cohortStudentsSubscription: Subscription;
    cohortSubscription: Subscription;
    noCohorts: boolean = false;
    rostersList: RostersModal[] = [];
    _institutionId: number;
    studentNameToChangeRoster: string;
    toChangeRosterStudentId: number;
    testsTable: any;
    showRepeaterCheckboxes: boolean = true;
    showInactiveCheckboxes: boolean = true;
    showADACheckboxes: boolean = true;
    expandUpdateDiv: boolean = true;
    rosterChangeUpdateStudents: ChangeUpdateRosterStudentsModal[];
    enableRepeaterCheckbox: boolean = false;
    showRequestChangePopup: boolean = false;
    sStorage: any;

    constructor(public auth: AuthService, public router: Router, public common: CommonService, public rosterService: RosterService, public rosterCohortsModel: RosterCohortsModel, public rosters: RostersModal) { }

    ngOnDestroy(): void {
        if (this.testsTable)
            this.testsTable.destroy();
        if (this.cohortStudentsSubscription)
            this.cohortStudentsSubscription.unsubscribe();
        if (this.cohortSubscription)
            this.cohortSubscription.unsubscribe();
        this.sStorage.removeItem('rosterlist');

    }

    ngOnInit() {
        this.sStorage = this.common.getStorage();
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
                "columns": [
                    null,
                    null,
                    { "width": "80px" },
                    { "width": "80px" },
                    { "width": "80px" }
                ]
            });

            let __this = this;

            self.testsTable.responsive.recalc().columns.adjust();

            // in responsive mode with checkboxes in child rows remove original checkboxes from the DOM as needed
            self.testsTable.on('responsive-display', function (e, datatable, row, showHide, update) {
                let children = $(row.child()).find('ul li').length;
                switch (children) {
                    case 0:
                        __this.showRepeaterCheckboxes = true;
                        __this.showInactiveCheckboxes = true;
                        __this.showADACheckboxes = true;
                        break;
                    case 1:
                        __this.showRepeaterCheckboxes = true;
                        __this.showInactiveCheckboxes = true;
                        __this.showADACheckboxes = false;
                        break;
                    case 2:
                        __this.showRepeaterCheckboxes = true;
                        __this.showInactiveCheckboxes = false;
                        __this.showADACheckboxes = false;
                        break;
                    case 3:
                    case 4:
                        __this.showRepeaterCheckboxes = false;
                        __this.showInactiveCheckboxes = false;
                        __this.showADACheckboxes = false;
                }
                
            });


            //check if on responsive resize all columns are displayed (no children) and set showCheckboxes back to true
            // https://datatables.net/reference/event/responsive-resize
            self.testsTable.on('responsive-resize.dt', function (e, datatable, columns) {
                var count = columns.reduce(function (a, b) {
                    return b === false ? a + 1 : a;
                }, 0);                
                // count equals number of hidden columns
                switch (count) {
                    case 0:
                        __this.showRepeaterCheckboxes = true;
                        __this.showInactiveCheckboxes = true;
                        __this.showADACheckboxes = true;
                        break;
                    case 1:
                        __this.showRepeaterCheckboxes = true;
                        __this.showInactiveCheckboxes = true;
                        __this.showADACheckboxes = false;
                        break;
                    case 2:
                        __this.showRepeaterCheckboxes = true;
                        __this.showInactiveCheckboxes = false;
                        __this.showADACheckboxes = false;
                        break;
                    case 3:
                    case 4:
                        __this.showRepeaterCheckboxes = false;
                        __this.showInactiveCheckboxes = false;
                        __this.showADACheckboxes = false;
                }
            });            

        });  // Closes setTimeout
    }
        

    loadRosterCohortStudents(cohort: RosterCohortsModel, cohortStudents: any) {
        if (cohortStudents) {
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
    }



    showCohortPopup(firstName, lastName, studentId, e) {
        e.preventDefault();
        this.showRequestChangePopup = true;
        this.studentNameToChangeRoster = lastName + "," + firstName;
        this.toChangeRosterStudentId = studentId;
    }


    expandRequestChanges(e) {
        e.preventDefault();
        this.expandUpdateDiv = !this.expandUpdateDiv;
    }
    checkRepeater(_studentId, e) {
        e.preventDefault();
        let target = e.target || e.srcElement || e.currentTarget;
        let isChecked: boolean = target.checked;
        let student: ChangeUpdateRosterStudentsModal;
        _.filter(this.rosterChangeUpdateStudents, function (_student) {
            if (_student.studentId === _studentId) {
                _student.updateType = 1;
                _student.isRepeater = isChecked;
                student = _student
            }
        });
        this.changeUpdateRosterStudentsEvent.emit(student);
    }
    checkInactive(_studentId, e) {
        e.preventDefault(); 
        let target = e.target || e.srcElement || e.currentTarget;
        let isChecked: boolean = target.checked;
        let student: ChangeUpdateRosterStudentsModal;
        _.filter(this.rosterChangeUpdateStudents, function (_student) {
            if (_student.studentId === _studentId) {
                _student.updateType = 1;
                _student.isActive = isChecked;
                _student.isRepeater = false;
                _student.isGrantUntimedTest = false;
                student = _student;
            }
        });
        this.changeUpdateRosterStudentsEvent.emit(student);
    }
    checkGrantUntimedTest(_studentId, e) {
        e.preventDefault();
        let __this = this;
        let target = e.target || e.srcElement || e.currentTarget;
        let isChecked: boolean = target.checked;
        let student: ChangeUpdateRosterStudentsModal;
        _.filter(this.rosterChangeUpdateStudents, function (_student) {
            if (_student.studentId === _studentId) {
                _student.isGrantUntimedTest = isChecked;
                _student.updateType = 1;
                if (_student.moveToCohortId === null) {
                    _student.isActive = false;
                }
                student = _student;
            }
        });
        this.changeUpdateRosterStudentsEvent.emit(student);
    }

    changeCohortTo(_student: ChangeUpdateRosterStudentsModal) {
        this.enableRepeaterCheckbox = true;
        this.showRequestChangePopup = false;
        this.changeToDifferentCohortEvent.emit(_student);
    }

    //saveRequestedStudentsUpdate() {
    //    let _rosterChangeUpdateStudents : ChangeUpdateRosterStudentsModal[]=[];
    //    _.filter(this.rosterChangeUpdateStudents, function (_student) {
    //        if (_student.moveToCohortId !== null || _student.isActive !== null || _student.isRepeater !== null || _student.isGrantUntimedTest !== null)
    //            _rosterChangeUpdateStudents.push(_student);

    //    });
    //    this.rosterChangesModel.students = _rosterChangeUpdateStudents;
    //    console.log(JSON.stringify(this.rosterChangesModel.students));
    //}
}

