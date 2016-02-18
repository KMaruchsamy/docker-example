import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {NgIf, NgFor} from 'angular2/common';
import {RouterLink, OnDeactivate} from 'angular2/router';
import {Common} from '../../services/common';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {SelectedStudentModel} from '../../models/selectedStudent-model';

@Component({
    selector: 'retesters-alternate',
    templateUrl: '../../templates/tests/retesters-alternate-popup.html',
    providers: [Common],
    directives: [RouterLink, NgIf, NgFor]
})

export class RetesterAlternatePopup implements OnDeactivate {
    @Input() retesterExceptions: Object[];
    @Input() testScheduledSudents: Object[];
    @Input() testTakenStudents: Object[];
    @Input() testSchedule: TestScheduleModel;
    @Output() retesterAlternatePopupOK = new EventEmitter();
    @Output() retesterAlternatePopupCancel = new EventEmitter();
    changes: Object[] = [];
    valid: boolean = false;
    sStorage: any;
    constructor(public common: Common) {
    }

    routerOnDeactivate(): void {
        this.testScheduledSudents = null;
        this.testTakenStudents = null;
    }

    ngOnInit(): void {
        this.sStorage = this.common.getStorage();
        let self = this;
        if (this.retesterExceptions) {
            _.forEach(self.retesterExceptions, function(student: any, key) {
                if (!student.Enabled) {
                    self.changes.push({
                        studentId: student.StudentId,
                        mark: true,
                        testId: 0,
                        testName: ''
                    });
                }
            });
        }
        
        this.validate();
    }

    resolve(e): void {
        e.preventDefault();
        let self = this;
        if (this.changes && this.changes.length > 0) {
            _.forEach(this.changes, function(change: any, key) {
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

    onChangeTestTaken(studentId: number, mark: boolean, testId: number, testName: string, e): void {
        let student: any = _.find(this.testTakenStudents, { 'StudentId': studentId });
        if (student)
            student.Checked = true;

        this.addChanges(studentId, mark, testId, testName);
        this.validate();
    }

    addChanges(studentId: number, mark: boolean, testId: number, testName: string): void {
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
                testName: testName
            });
        }
    }

    onChangeTestScheduled(studentId: number, mark: boolean, testId: number, testName: string, e): void {
        let student: any = _.find(this.testScheduledSudents, { 'StudentId': studentId });
        if (student)
            student.Checked = true;
        this.addChanges(studentId, mark, testId, testName);

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
            if (selectedTest)
                selectedTest.Checked = true;
        }
        else {
            studentToMark.StudentTestId = this.testSchedule.testId;
            studentToMark.StudentTestName = this.testSchedule.testName;
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




}