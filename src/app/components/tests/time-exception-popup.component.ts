import {Component, Input, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {TestScheduleModel} from '../../models/test-schedule.model';
import { CommonService } from './../../services/common.service';

@Component({
    selector: 'time-exception',
    templateUrl: './time-exception-popup.component.html'
})

export class TimeExceptionPopupComponent implements OnInit, OnDestroy {
    @Input() studentWindowException: any;
    @Input() canRemoveStudents: boolean;
    @Input() testSchedule: TestScheduleModel;
    @Output() windowExceptionPopupClose = new EventEmitter();
    sStorage: any;
    endDate: Date;
    startDate: Date;
    endTestDate: Date;
    constructor(public common: CommonService) {
        
    }

    ngOnDestroy(): void {
        this.studentWindowException = null;
    }
    initialize(): void {
        this.sStorage = this.common.getStorage();
        let savedSchedule = JSON.parse(this.sStorage.getItem('testschedule'));
        this.startDate = moment(savedSchedule.scheduleStartTime).format('MM/DD/YY');
        this.endDate = moment(savedSchedule.scheduleEndTime).format('MM/DD/YY');
        if (!moment(this.startDate).isSame(this.endDate, 'day')) {
            this.endTestDate = this.endDate;
        }
    }

    ngOnInit(): void {
        this.initialize();
    }

    removeStudents(): void {
        let self = this;
        if (this.sStorage) {
            let savedSchedule = JSON.parse(this.sStorage.getItem('testschedule'));
            if (savedSchedule) {
                var removedStudents = _.remove(savedSchedule.selectedStudents, function(student:any) {
                    return _.some(self.studentWindowException, { 'StudentId': student.StudentId })
                });
            }
            this.sStorage.setItem('testschedule', JSON.stringify(savedSchedule));
        }
    }


    close(e): void {
        e.preventDefault();
        if (this.canRemoveStudents)
            this.removeStudents();
        this.windowExceptionPopupClose.emit(e);
    }

}
