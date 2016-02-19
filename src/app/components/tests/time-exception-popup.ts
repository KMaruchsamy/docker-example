import {Component, Input, OnInit, Output, EventEmitter} from 'angular2/core';
import {RouterLink} from 'angular2/router';
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

export class TimeExceptionPopup implements OnInit {
    @Input() studentWindowException: any;
    @Input() canRemoveStudents: boolean;
    @Output() windowExceptionPopupClose = new EventEmitter();
    sStorage: any;
    constructor(public common: Common) {
        this.sStorage = this.common.getStorage();
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
