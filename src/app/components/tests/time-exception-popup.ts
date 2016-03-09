import {Component, Input, OnInit, Output, EventEmitter} from 'angular2/core';
import {RouterLink, OnDeactivate} from 'angular2/router';
import {Common} from '../../services/common';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';

@Component({
    selector: 'time-exception',
    templateUrl: '../../templates/tests/time-exception-popup.html',
    directives: [RouterLink],
    providers: [Common],
    inputs: ['studentWindowException','canRemoveStudents'],
    pipes: [ParseDatePipe]
})

export class TimeExceptionPopup implements OnInit, OnDeactivate {
    @Input() studentWindowException: any;
    @Input() canRemoveStudents: boolean;
    @Output() windowExceptionPopupClose = new EventEmitter();
    sStorage: any;
    endDate: Date;
    startDate: Date;
    endTestDate: Date;
    constructor(public common: Common) {
        this.initialize();
    }
    routerOnDeactivate(): void {
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
        // console.log(this.studentRepeaters);
    }

    removeStudents(): void {
        let self = this;
        if (this.sStorage) {
            let savedSchedule = JSON.parse(this.sStorage.getItem('testschedule'));
            if (savedSchedule) {
                var removedStudents = _.remove(savedSchedule.selectedStudents, function(student) {
                    console.log(self.studentWindowException);
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
