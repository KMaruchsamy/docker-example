/// <reference path="roster-changes.service.ts" />
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import {Router} from '@angular/router';
import { Observable, Subscription } from 'rxjs/Rx';
import { links, RosterUpdateTypes } from '../../constants/config';
import { Response } from '@angular/http';
import { AuthService } from './../../services/auth.service';
import { RosterChangesModel } from '../../models/roster-changes.model';
import {RosterCohortsModel} from '../../models/roster-cohorts.model';
import {RosterCohortStudentsModel} from '../../models/roster-cohort-students.model';
import {ChangeUpdateRosterStudentsModel} from '../../models/change-update-roster-students.model';
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
    expandUpdateDiv: boolean = true;
    rosterChangeUpdateStudents: ChangeUpdateRosterStudentsModel[];
    enableRepeaterCheckbox: boolean = false;
    showRequestChangePopup: boolean = false;
    sStorage: any;
    isResponsive: boolean = false;
    showDuplicateStudentMessage: boolean = false;
    _event: any;

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
        this.bindPopover();
    }

    bindPopover() {
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
                "info": false,
                "ordering": false,
                "scrollY": this.rosterChangeUpdateStudents.length > 6 ? "300px" : false,
                "columns": [
                    null,
                    null,
                    { "width": "80px" },
                    { "width": "80px" },
                    { "width": "80px" }
                ],
                "responsive": {
                    details: {
                        type: 'inline',
                        renderer: function (api, rowIdx) {
                            var theRow = api.row(rowIdx);
                            let _selectedStudent: ChangeUpdateRosterStudentsModel;
                            let _studentid: number = parseInt($(theRow.data()[1]).attr('id').split('_')[1]);
                            _.filter(self.rosterChangeUpdateStudents, (s) => {
                                if (s.studentId == _studentid) {
                                    _selectedStudent = s;
                                }
                            });
                            // Select hidden columns for the given row
                            var data = api.cells(rowIdx, ':hidden').eq(0).map(function (cell) {
                                var header = $(api.column(cell.column).header());
                                var $html = $(api.cell(cell).data()).wrap('<div/>').parent();
                                var _data;
                                if (cell.column === 1) {
                                    var _id = $('button', $html).attr('id');
                                    $('button', $html).attr('id', _id + "-" + rowIdx.toString());  // change the element id for responsive mode
                                    var el = $('button', $html);
                                    self.onMoveToCohortChange(el);
                                    _data = $html.html();
                                }
                                else if (cell.column === 2) {
                                    var _id = $('input', $html).attr('id');
                                    $('input', $html).attr('id', _id + "-" + rowIdx.toString());  // change the element id for responsive mode
                                    var el = $('input', $html);
                                    self.onRepeaterChange(el);

                                    var _labelId = $($html[2].innerHTML).attr('for');
                                    $('label', $html).attr('for', _labelId + "-" + rowIdx.toString()); // change the element id for responsive mode
                                    _data = $html[0].innerHTML + $html[2].innerHTML;
                                }
                                else if (cell.column === 3) {
                                    var _id = $('input', $html).attr('id');
                                    $('input', $html).attr('id', _id + "-" + rowIdx.toString());   // change the element id for responsive mode
                                    var el = $('input', $html);
                                    self.onInactiveChange(el);

                                    var _labelId = $($html[2].innerHTML).attr('for');
                                    $('label', $html).attr('for', _labelId + "-" + rowIdx.toString());  // change the element id for responsive mode

                                    _data = $html[0].innerHTML + $html[2].innerHTML;
                                }
                                else if (cell.column === 4) {
                                    var _id = $('input', $html).attr('id');
                                    $('input', $html).attr('id', _id + "-" + rowIdx.toString());  // change the element id for responsive mode
                                    var el = $('input', $html);
                                    self.onADAChange(el);
                                    var _labelId = $($html[2].innerHTML).attr('for');
                                    $('label', $html).attr('for', _labelId + "-" + rowIdx.toString());  // change the element id for responsive mode
                                    _data = $html[0].innerHTML + $html[2].innerHTML;
                                }

                                return '<ul><li data-dt-row="' + cell.column + '">' +
                                    '<span class="dtr-title">' + header.text() + '</span>' +
                                    '<span class="dtr-data">' + _data + '</span></li></ul>';
                            }).toArray().join('');

                            return data ?
                                $('<table/>').append(data) :
                                false;
                        }
                    }
                }
            });


            // Update original input/select on change in child row
            $('#markChangesTable tbody').on('click', '.js-choose-cohort', function (e) {
                let _selectedStudent: ChangeUpdateRosterStudentsModel;
                var _id = $(e.target).attr('id').split('_')[1];
                if (_id.indexOf('-') > 0) {
                    let _studentid = parseInt(_id.split('-')[0]);
                    _.filter(self.rosterChangeUpdateStudents, (s) => {
                        if (s.studentId == _studentid) {
                            _selectedStudent = s;
                        }
                    });
                    self.showCohortPopup(_selectedStudent.firstName, _selectedStudent.lastName, _selectedStudent.studentId, e);
                }
            });

            $('#markChangesTable tbody').on('change', '.js-repeat', function (e) {
                var _id = $(e.target).attr('id').split('_')[1];
                if (_id.indexOf('-') > 0) {
                    let _studentid = parseInt(_id.split('-')[0]);
                    self.checkRepeater(_studentid, e);
                    self.onChangingUserSelection(e);

                }
            });

            $('#markChangesTable tbody').on('change', '.js-drop', function (e) {
                var _id = $(e.target).attr('id').split('_')[1];
                if (_id.indexOf('-') > 0) {
                    let _studentid = parseInt(_id.split('-')[0]);
                    self.checkInactive(_studentid, e);
                    self.onChangingUserSelection(e);
                }
            });

            $('#markChangesTable tbody').on('change', '.js-ADA', function (e) {
                var _id = $(e.target).attr('id').split('_')[1];
                if (_id.indexOf('-') > 0) {
                    let _studentid = parseInt(_id.split('-')[0]);
                    self.checkGrantUntimedTest(_studentid, e);
                    self.onChangingUserSelection(e);
                }
            });

        });  // Closes setTimeout
    }

    onMoveToCohortChange(el){
        if(el.length>0){
            let _selectedStudent: ChangeUpdateRosterStudentsModel;
            var _id = el.attr('id').split('_')[1];
            let _studentid = parseInt(_id.split('-')[0]);
            _.filter(this.rosterChangeUpdateStudents, (s) => {
                if (s.studentId == _studentid) {
                    _selectedStudent = s;
                }
            });
            if (_selectedStudent.moveToCohortId !== null)
                el.text(_selectedStudent.moveToCohortName);
            else 
                el.text('Choose an active cohort');
            if (!_selectedStudent.userExpiryDate && !(_selectedStudent.isInactive) && !(_selectedStudent.moveToCohortId !== null))
                el.addClass('button-no-change');
            else
                el.removeClass('button-no-change');
            if (_selectedStudent.isInactive || _selectedStudent.userExpiryDate)
                el.attr('disabled', 'true');
            else
                el.removeAttr('disabled');
        }
    }

    onRepeaterChange(el) {
        if(el.length>0){
            let _selectedStudent: ChangeUpdateRosterStudentsModel;
            var _id = el.attr('id').split('_')[1];
            let _studentid = parseInt(_id.split('-')[0]);
            _.filter(this.rosterChangeUpdateStudents, (s) => {
                if (s.studentId == _studentid) {
                    _selectedStudent = s;
                }
            });
            if (!_selectedStudent.isRepeater)
                el.removeAttr('checked');
            else
                el.attr('checked', 'checked');

            let _isRepeater = (_selectedStudent.moveToCohortId === null) || (_selectedStudent.isInactive !== null ? _selectedStudent.isInactive : false || _selectedStudent.userExpiryDate);
            if (_isRepeater)
                el.attr('disabled', 'true');
            else
                el.removeAttr('disabled');
        }
    }
    onInactiveChange(el) {
        if(el.length>0){
            let _selectedStudent: ChangeUpdateRosterStudentsModel;
            var _id = el.attr('id').split('_')[1];
            let _studentid = parseInt(_id.split('-')[0]);
            _.filter(this.rosterChangeUpdateStudents, (s) => {
                if (s.studentId == _studentid) {
                    _selectedStudent = s;
                }
            });
            if (_selectedStudent.isInactive !== null && _selectedStudent.isInactive)
                el.attr('checked', 'true');
            else
                el.removeAttr('checked');
            let _isActive: boolean = _selectedStudent.userExpiryDate || (_selectedStudent.moveToCohortId !== null) || (_selectedStudent.isGrantUntimedTest !== null ? _selectedStudent.isGrantUntimedTest : false);
            if (_isActive)
                el.attr('disabled', 'true');
            else
                el.removeAttr('disabled');
        }
    }
    onADAChange(el) {
        if(el.length>0){
            let _selectedStudent: ChangeUpdateRosterStudentsModel;
            var _id = el.attr('id').split('_')[1];
            let _studentid = parseInt(_id.split('-')[0]);
            _.filter(this.rosterChangeUpdateStudents, (s) => {
                if (s.studentId == _studentid) {
                    _selectedStudent = s;
                }
            });
            if (_selectedStudent.isGrantUntimedTest !== null && _selectedStudent.isGrantUntimedTest)
                el.attr('checked', 'checked');
            else
                el.removeAttr('checked');
            if (_selectedStudent.isInactive !== null && _selectedStudent.isInactive || _selectedStudent.userExpiryDate)
                el.attr('disabled', 'true');
            else
                el.removeAttr('disabled');
        }
    }

        loadRosterCohortStudents(cohort: RosterCohortsModel, cohortStudents: any) {
        let savedData: RosterChangesModel = JSON.parse(this.sStorage.getItem('rosterChanges'));
        let savedStudents: Array<ChangeUpdateRosterStudentsModel> = [];
        if (savedData && savedData.students && savedData.students.length > 0) {
            savedStudents = _.filter(savedData.students, { 'updateType': RosterUpdateTypes.MoveToDifferentCohort });
        }
        if (cohortStudents) {
            this.rosterChangeUpdateStudents = _.map(cohortStudents, (student: any) => {
                let changeUpdateStudent = new ChangeUpdateRosterStudentsModel();
                changeUpdateStudent.moveFromCohortId = student.CohortId;
                changeUpdateStudent.moveFromCohortName = student.CohortName;
                changeUpdateStudent.email = student.Email;
                changeUpdateStudent.firstName = student.FirstName;
                changeUpdateStudent.lastName = student.LastName;
                changeUpdateStudent.studentId = student.StudentId;
                changeUpdateStudent.isDuplicate = this.checkDuplicate(cohortStudents, student)
                if (student.UserExpireDate !== null) {
                    if (moment(student.UserExpireDate).isAfter(Date.now(), 'day')) {
                        changeUpdateStudent.userExpiryDate = false;
                    }
                    else {
                        changeUpdateStudent.userExpiryDate = true;
                    }
                }
                else
                    changeUpdateStudent.userExpiryDate = false;

                if (savedStudents.length > 0) {
                    let savedStudent: ChangeUpdateRosterStudentsModel = _.find(savedStudents, { 'studentId': student.StudentId });
                    if (savedStudent) {
                        if (_.has(savedStudent, 'moveToCohortId'))
                            changeUpdateStudent.moveToCohortId = savedStudent.moveToCohortId;

                        if (_.has(savedStudent, 'moveToCohortName'))
                            changeUpdateStudent.moveToCohortName = savedStudent.moveToCohortName;

                        if (_.has(savedStudent, 'isInactive'))
                            changeUpdateStudent.isInactive = savedStudent.isInactive;

                        if (_.has(savedStudent, 'isRepeater'))
                            changeUpdateStudent.isRepeater = savedStudent.isRepeater;

                        if (_.has(savedStudent, 'isGrantUntimedTest'))
                            changeUpdateStudent.isGrantUntimedTest = savedStudent.isGrantUntimedTest;
                    }
                }

                return changeUpdateStudent;
            });
            this.showDuplicateStudentMessage = _.some(this.rosterChangeUpdateStudents, ['isDuplicate', true]);
            setTimeout(function () {
                $('[data-toggle="popover"]').popover();
            });
        }
    }

    checkDuplicate(students: Array<any>, duplicateStudent: any): boolean {
        return _.some(students, (student) => {
            return (student.StudentId !== duplicateStudent.StudentId)
                && (student.FirstName.toLowerCase() === duplicateStudent.FirstName.toLowerCase())
                && (student.LastName.toLowerCase() === duplicateStudent.LastName.toLowerCase())
        });
    }

    onChangingUserSelection(e) {
        let _selectedStudent: ChangeUpdateRosterStudentsModel;
        var _id = $(e.target).attr('id').split('_')[1];
       
        //On cohort change selection
        var _buttonElement = $('#' + 'btnChangeToCohort_' + _id);
        this.onMoveToCohortChange(_buttonElement);       

        //On Selection of inactive checkbox selection... Start
        var _repeaterElement = $('#' + 'chkRepeat_' + _id);
        this.onRepeaterChange(_repeaterElement);        

        //On Selection of inactive checkbox selection... Start
        var _inactiveElement = $('#' + 'inactive_' + _id);
        this.onInactiveChange(_inactiveElement);        

        //On Selection of ADA checkbox selection... Start   
        var _ADAElement = $('#' + 'ADA_' + _id);
        this.onADAChange(_ADAElement);  
    }

    showCohortPopup(firstName, lastName, studentId, e) {
        e.preventDefault();
        let target = e.target || e.srcElement || e.currentTarget;
        var _id = $(target).attr('id').split('_')[1];
        if (_id.indexOf('-') > 0) {
            this.isResponsive = true;
            this._event = e;
        }
        this.showRequestChangePopup = true;
        this.studentNameToChangeRoster = lastName + ", " + firstName;
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
        let student: ChangeUpdateRosterStudentsModel;
        _.filter(this.rosterChangeUpdateStudents, function (_student) {
            if (_student.studentId === _studentId) {
                _student.updateType = RosterUpdateTypes.MoveToDifferentCohort; 
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
        let student: ChangeUpdateRosterStudentsModel;
        _.filter(this.rosterChangeUpdateStudents, function (_student) {
            if (_student.studentId === _studentId) {
                _student.updateType = RosterUpdateTypes.MoveToDifferentCohort; 
                _student.isInactive= isChecked;
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
        let student: ChangeUpdateRosterStudentsModel;
        _.filter(this.rosterChangeUpdateStudents, function (_student) {
            if (_student.studentId === _studentId) {
                _student.isGrantUntimedTest = isChecked;
                _student.updateType = RosterUpdateTypes.MoveToDifferentCohort; 
                if (_student.moveToCohortId === null) {
                    _student.isInactive = false;
                }
                student = _student;
            }
        });

        this.changeUpdateRosterStudentsEvent.emit(student);
    }

    changeCohortTo(_student: ChangeUpdateRosterStudentsModel) {
        this.showRequestChangePopup = false;
        if (_student !== undefined) {
            if (this.isResponsive) {
                let _id = $(this._event.target).attr('id').split('_')[1];
                var el = $('#' + 'chkRepeat_' + _id);
                this.onChangingUserSelection(this._event);
                el.prop('checked', _student.isRepeater);
            }
            this.changeToDifferentCohortEvent.emit(_student);
        }
    }
    
}

