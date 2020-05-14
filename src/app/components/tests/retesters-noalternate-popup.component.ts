import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {TestScheduleModel} from '../../models/test-schedule.model';
import {SelectedStudentModel} from '../../models/selected-student.model';
import { CommonService } from './../../services/common.service';

@Component({
    selector: 'retesters-noalternate',
    templateUrl: './retesters-noalternate-popup.component.html'
})

export class RetesterNoAlternatePopupComponent implements OnInit {
    @Input() studentRepeaters: any;
    @Input() modifyInProgress: boolean = false;
    @Output() retesterNoAlternatePopupOK = new EventEmitter();
    @Output() retesterNoAlternatePopupCancel = new EventEmitter();
    sStorage: any;
    @Input() testSchedule: TestScheduleModel;
    constructor(public common: CommonService) {

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
