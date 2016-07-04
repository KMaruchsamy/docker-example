import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {RouterLink} from '@angular/router-deprecated';
import {Common} from '../../services/common';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {SelectedStudentModel} from '../../models/selectedStudent-model';
import * as _ from 'lodash';
import {SortPipe} from '../../pipes/sort.pipe';

@Component({
    selector: 'retesters-noalternate',
    templateUrl: 'templates/tests/retesters-noalternate-popup.html',
    directives: [RouterLink],
    providers: [Common],
    inputs: ['studentRepeaters'],
    pipes:[SortPipe]    
})

export class RetesterNoAlternatePopup implements OnInit {
    @Input() studentRepeaters: any;
    @Output() retesterNoAlternatePopupOK = new EventEmitter();
    @Output() retesterNoAlternatePopupCancel = new EventEmitter();
    sStorage: any;
    testSchedule: TestScheduleModel;
    constructor(public common: Common) {

    }

    ngOnInit(): void {
    }

    removeStudents(e): void {
        e.preventDefault();
        let self = this;
        this.sStorage = this.common.getStorage();
        if (this.sStorage) {
            let savedSchedule:TestScheduleModel = JSON.parse(this.sStorage.getItem('testschedule'));
            if (savedSchedule) {
                var removedStudents = _.remove(savedSchedule.selectedStudents, function(student) {
                    return _.some(self.studentRepeaters, { 'StudentId':student.StudentId })
                });
                this.retesterNoAlternatePopupOK.emit(savedSchedule);               
            }
        }       
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
    }
    
    
    cancel(e): void{
        e.preventDefault();
        this.retesterNoAlternatePopupCancel.emit(e);
    }

}
