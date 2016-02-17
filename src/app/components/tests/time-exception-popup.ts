import {Component, Input, OnInit, Output, EventEmitter} from 'angular2/core';
import {RouterLink} from 'angular2/router';
import {Common} from '../../services/common';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';

@Component({
    selector: 'time-exception',
    templateUrl: '../../templates/tests/time-exception-popup.html',
    directives: [RouterLink],
    providers: [Common],
    inputs: ['studentWindowException'],
    pipes: [ParseDatePipe]
})

export class RetesterNoAlternatePopup implements OnInit {
    @Input() studentWindowException: any;
    //@Output() retesterNoAlternatePopupOK = new EventEmitter();
    @Output() windowExceptionPopupCancel = new EventEmitter();
    sStorage: any;
    constructor(public common: Common) {

    }

    ngOnInit(): void {
        // console.log(this.studentRepeaters);
    }

    removeStudents(e): void {
        e.preventDefault();
        let self = this;
        this.sStorage = this.common.getStorage();
        if (this.sStorage) {
            let savedSchedule = JSON.parse(this.sStorage.getItem('testschedule'));
            if (savedSchedule) {
                var removedStudents = _.remove(savedSchedule.selectedStudents, function (student) {
                    console.log(self.studentRepeaters);
                    return _.some(self.studentRepeaters, { 'StudentId': student.studentId })
                });
               // this.retesterNoAlternatePopupOK.emit(savedSchedule);
            }
        }
    }


    cancel(e): void {
        e.preventDefault();
        this.windowExceptionPopupCancel.emit(e);
    }

}
