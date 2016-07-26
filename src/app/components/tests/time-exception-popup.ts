import {Component, Input, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {Common} from '../../services/common';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';
import * as _ from 'lodash';
import {SortPipe} from '../../pipes/sort.pipe';

@Component({
    selector: 'time-exception',
    templateUrl: 'templates/tests/time-exception-popup.html',
    directives: [ROUTER_DIRECTIVES],
    providers: [Common],
    inputs: ['studentWindowException','canRemoveStudents'],
    pipes: [ParseDatePipe,SortPipe]
})

export class TimeExceptionPopup implements OnInit, OnDestroy {
    @Input() studentWindowException: any;
    @Input() canRemoveStudents: boolean;
    @Output() windowExceptionPopupClose = new EventEmitter();
    sStorage: any;
    endDate: Date;
    startDate: Date;
    endTestDate: Date;
    constructor(public common: Common) {
        
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
                var removedStudents = _.remove(savedSchedule.selectedStudents, function(student) {
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
