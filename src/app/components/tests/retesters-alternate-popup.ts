import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {NgIf, NgFor} from 'angular2/common';
import {RouterLink} from 'angular2/router';
import {Common} from '../../services/common';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {SelectedStudentModel} from '../../models/selectedStudent-model';

@Component({
    selector: 'retesters-alternate',
    templateUrl: '../../templates/tests/retesters-alternate-popup.html',
    providers: [Common],
    directives: [RouterLink, NgIf, NgFor]
})

export class RetesterAlternatePopup {
    @Input() testScheduledSudents: Object[];
    @Input() testTakenStudents: Object[];
    @Input() testSchedule: TestScheduleModel;
    @Output() retesterAlternatePopupOK = new EventEmitter();
    @Output() retesterAlternatePopupCancel = new EventEmitter();
    valid: boolean = false;
    sStorage: any;
    constructor(public common: Common) {
        console.log(moment().format('h:mm:ss:sss'));
    }

    ngOnInit(): void {
        console.log('<<>>');
        console.log(JSON.stringify(this.testScheduledSudents));
        console.log('<<>>');
        console.log(JSON.stringify(this.testTakenStudents));
        console.log('<<>>');
        console.log(JSON.stringify(this.testSchedule));
    }

    resolve(e): void {
        e.preventDefault();
        let self = this;
        this.retesterAlternatePopupOK.emit(this.testSchedule);
    }


    cancel(e): void {
        e.preventDefault();
        this.retesterAlternatePopupCancel.emit(e);
    }

    onChangeTestTaken(studentId: number, mark: boolean, testId: number, testName: string, e): void {
        let student: any = _.find(this.testTakenStudents, { 'StudentId': studentId });
        if (student)
            student.Checked = true;

        this.markForRemoval(studentId, mark, testId, testName);

        console.log(this.testTakenStudents);
        console.log(this.testSchedule);
        this.validate();
    }

    onChangeTestScheduled(studentId: number, mark: boolean, testId: number, testName: string, e): void {
        let student: any = _.find(this.testScheduledSudents, { 'StudentId': studentId });
        if (student)
            student.Checked = true;

        this.markForRemoval(studentId, mark, testId, testName);

        console.log(this.testScheduledSudents);
        this.validate();
    }

    markForRemoval(_studentId: number, mark: boolean, testId: number, testName: string) {
        let studentToMark: SelectedStudentModel = _.find(this.testSchedule.selectedStudents, { 'StudentId': _studentId });
        studentToMark.MarkedToRemove = mark;
        if (!mark) {
            studentToMark.StudentTestId = testId;
            studentToMark.StudentTestName = testName;
        }
        else {
            studentToMark.StudentTestId = this.testSchedule.testId;
            studentToMark.StudentTestName = this.testSchedule.testName;
        }
        console.log(this.testSchedule);
    }

    validate(): boolean {
        let unselectedTestsTaken = _.some(this.testTakenStudents, { 'Checked': false });
        let unselectedTestsScheduled = _.some(this.testScheduledSudents, { 'Checked': false });
        console.log(unselectedTestsTaken, unselectedTestsScheduled);
        if (unselectedTestsTaken || unselectedTestsScheduled) {
            this.valid = false;
            return false;
        }

        this.valid = true;
        return true;
    }


}