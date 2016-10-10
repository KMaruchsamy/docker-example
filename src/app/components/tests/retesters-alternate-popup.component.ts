import {Component, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {NgIf, NgFor} from '@angular/common';
import {ROUTER_DIRECTIVES} from '@angular/router';
// import {CommonService} from '../../services/common';
import {TestScheduleModel} from '../../models/testschedule.model';
import {SelectedStudentModel} from '../../models/selectedStudent-model';
import * as _ from 'lodash';
import {SortPipe} from '../../pipes/sort.pipe';
import { CommonService } from './../../services/common.service';

@Component({
    selector: 'retesters-alternate',
    templateUrl: 'components/tests/retesters-alternate-popup.component.html',
    providers: [CommonService],
    directives: [ROUTER_DIRECTIVES, NgIf, NgFor],
    pipes: [SortPipe]
})

export class RetesterAlternatePopupComponent implements OnDestroy {
    @Input() retesterExceptions: Object[];
    @Input() testScheduledSudents: Object[];
    @Input() testTakenStudents: Object[];
    @Input() testSchedule: TestScheduleModel;
    @Input() modifyInProgress: boolean = false;
    @Output() retesterAlternatePopupOK = new EventEmitter();
    @Output() retesterAlternatePopupCancel = new EventEmitter();
    changes: Object[] = [];
    valid: boolean = false;
    sStorage: any;
    testTakenStudentsChanges: Object[] = [];
    testScheduledStudentsChanges: Object[] = [];
    TestScheduled: boolean = true;
    TestTaken: boolean = true;
    chkTestTaken: boolean = false;
    chkTestSchedule: boolean = false;
    chkRdbTestTaken: boolean = true;
    chkRdbTestSchedule: boolean = true;
    
    constructor(public common: CommonService) {

    }

    ngOnDestroy(): void {
        this.testScheduledSudents = null;
        this.testTakenStudents = null;
    }

    ngOnInit(): void {
        this.sStorage = this.common.getStorage();
        let self = this;
        if (this.retesterExceptions) {
            _.forEach(self.retesterExceptions, function (student: any, key) {
                let studentTest: any = _.find(self.testTakenStudents, { 'StudentId': student.StudentId });
                if (studentTest) {
                    student.type = 'testTaken';
                }
                else {
                    student.type = 'testScheduled';
                }
                if (!student.Enabled) {
                    self.changes.push({
                        studentId: student.StudentId,
                        mark: true,
                        testId: 0,
                        testName: '',
                        type: student.type
                    });
                }
            });
        }
        if (this.testTakenStudents) {
            _.forEach(self.testTakenStudents, function (student: any, key) {
                if (!student.Enabled) {
                    self.testTakenStudentsChanges.push({
                        studentId: student.StudentId,
                        mark: true,
                        testId: 0,
                        testName: ''
                    });
                }
            });
            let enabled = this.testTakenStudentsChanges.length;
            let count = this.testTakenStudents.length;
            if (count === enabled && count >= 5) {
                this.chkTestTaken = true;
                this.TestTaken = false;
            }
            else {
                this.chkTestTaken = false;
            }
        }
        if (this.testScheduledSudents) {
            _.forEach(self.testScheduledSudents, function (student: any, key) {
                if (!student.Enabled) {
                    self.testScheduledStudentsChanges.push({
                        studentId: student.StudentId,
                        mark: true,
                        testId: 0,
                        testName: ''
                    });
                }
            });
            let enabled = this.testScheduledStudentsChanges.length;
            let count = this.testScheduledSudents.length;
            if (count === enabled && count >= 5) {
                this.chkTestSchedule = true;
                this.TestScheduled = false;
            }
            else {
                this.chkTestSchedule = false;
            }
        }
        this.validate();
    }

    resolve(e): void {
        e.preventDefault();
        let self = this;
        if (this.changes && this.changes.length > 0) {
            _.forEach(this.changes, function (change: any, key) {
                self.markForRemoval(change.studentId, change.mark, change.testId, change.testName)
            });
        }
        this.sStorage.setItem('testschedule', JSON.stringify(this.testSchedule));
        this.retesterAlternatePopupOK.emit(this.retesterExceptions);
    }


    cancel(e): void {
        e.preventDefault();
        this.retesterAlternatePopupCancel.emit(e);
    }

    onChangeTestTaken(studentId: number, mark: boolean, testId: number, testName: string, type: string, e): void {
        let student: any = _.find(this.testTakenStudents, { 'StudentId': studentId });
        if (student)
            student.Checked = true;
        this.addChanges(studentId, mark, testId, testName, type);
        let selected = _.filter(this.changes, { 'mark': true, 'type': 'testTaken' });
        let count = this.testTakenStudents.length;
        if (count === selected.length && count >= 5) {
            this.chkTestTaken = true;
        } else {
            this.chkTestTaken = false;
        }
        this.validate();
    }


    addChanges(studentId: number, mark: boolean, testId: number, testName: string, type: string): void {
        let change: any = _.find(this.changes, { 'studentId': studentId });
        if (change) {
            change.testId = testId;
            change.testName = testName;
            change.mark = mark;
        } else {
            this.changes.push({
                studentId: studentId,
                mark: mark,
                testId: testId,
                testName: testName,
                type: type
            });
        }
    }

    onChangeTestScheduled(studentId: number, mark: boolean, testId: number, testName: string, type: string, e): void {
        let student: any = _.find(this.testScheduledSudents, { 'StudentId': studentId });
        if (student)
            student.Checked = true;
        this.addChanges(studentId, mark, testId, testName, type);
        let selected = _.filter(this.changes, { 'mark': true, 'type': 'testScheduled' });
        let count = this.testScheduledSudents.length;
        if (count === selected.length && count >= 5) {
            this.chkTestSchedule = true;
        }
        else {
            this.chkTestSchedule = false;
        }
        this.validate();
    }

    markForRemoval(_studentId: number, mark: boolean, testId: number, testName: string) {
        let studentToMark: SelectedStudentModel = _.find(this.testSchedule.selectedStudents, { 'StudentId': _studentId });
        let retesterStudent: any = _.find(this.retesterExceptions, { 'StudentId': _studentId });
        if (retesterStudent)
            retesterStudent.Enabled = !mark;
        studentToMark.MarkedToRemove = mark;
        let previouslySelectedTest: any = _.find(retesterStudent.AlternateTests, { Checked: true });
        if (previouslySelectedTest)
            previouslySelectedTest.Checked = false;

        if (!mark) {
            studentToMark.StudentTestId = testId;
            studentToMark.StudentTestName = testName;
            let selectedTest: any = _.find(retesterStudent.AlternateTests, { TestId: testId });
            if (selectedTest) {
                selectedTest.Checked = true;
                studentToMark.NormingStatus = selectedTest.NormingStatus;
            }

        }
        else {
            studentToMark.StudentTestId = this.testSchedule.testId;
            studentToMark.StudentTestName = this.testSchedule.testName;
            studentToMark.NormingStatus = this.testSchedule.testNormingStatus;
        }
    }

    validate(): boolean {
        let unselectedTestsTaken = _.some(this.testTakenStudents, { 'Checked': false });
        let unselectedTestsScheduled = _.some(this.testScheduledSudents, { 'Checked': false });
        if (unselectedTestsTaken || unselectedTestsScheduled) {
            this.valid = false;
            return false;
        }

        this.valid = true;
        return true;
    }

    selectAll(check: boolean, e): void {
        let self = this;
        if (check === true) {
            this.chkTestSchedule = false;
            if (this.testScheduledSudents) {
                _.forEach(self.testScheduledSudents, function (student: any, key) {
                    let enabled = _.find(self.testScheduledStudentsChanges, { 'studentId': student.StudentId });
                    if (enabled) {
                        self.addChanges(student.StudentId, true, 0, "", 'testScheduled');
                        $('#rdbTestScheduledRemove' + student.StudentId).prop('checked', true);
                    }
                    else {
                        let chkStudent: any = _.find(self.testScheduledSudents, { 'StudentId': student.StudentId });
                        if (chkStudent)
                            student.Checked = false;
                        self.addChanges(student.StudentId, false, 0, "", 'testScheduled');
                        $('#rdbTestScheduledRemove' + student.StudentId).prop('checked', false);
                    }
                });
            }
            this.validate();
        }
        else {
            this.chkTestSchedule = true;
            if (this.testScheduledSudents) {
                _.forEach(self.testScheduledSudents, function (student: any, key) {
                    let chkStudent: any = _.find(self.testScheduledSudents, { 'StudentId': student.StudentId });
                    if (chkStudent)
                        student.Checked = true;
                    self.addChanges(student.StudentId, true, 0, "", 'testScheduled');
                    $('#rdbTestScheduledRemove' + student.StudentId).prop('checked', true);
                });
            }
        }
        this.validate();
    }

    selectAllTestTaken(check: boolean, e): void {
        let self = this;
        if (check === true) {
            this.chkTestTaken = false;
            if (this.testTakenStudents) {
                _.forEach(self.testTakenStudents, function (student: any, key) {
                    let enabled = _.find(self.testTakenStudentsChanges, { 'studentId': student.StudentId });
                    if (enabled) {
                        self.addChanges(student.StudentId, true, 0, "", 'testTaken');
                        $('#rdbTestTakenRemove' + student.StudentId).prop('checked', true);
                    }
                    else {
                        let chkStudent: any = _.find(self.testTakenStudents, { 'StudentId': student.StudentId });
                        if (chkStudent)
                            student.Checked = false;
                        self.addChanges(student.StudentId, false, 0, "", 'testTaken');
                        $('#rdbTestTakenRemove' + student.StudentId).prop('checked', false);
                    }
                });
            }
            this.validate();
        }
        else {
            this.chkTestTaken = true;
            if (this.testTakenStudents) {
                _.forEach(self.testTakenStudents, function (student: any, key) {
                    let chkStudent: any = _.find(self.testTakenStudents, { 'StudentId': student.StudentId });
                    if (chkStudent)
                        student.Checked = true;
                    self.addChanges(student.StudentId, true, 0, "", 'testTaken');
                    $('#rdbTestTakenRemove' + student.StudentId).prop('checked', true);
                });
            }
            this.validate();
        }
    }
}