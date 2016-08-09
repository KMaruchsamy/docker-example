import {Component, Input, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {ROUTER_DIRECTIVES, Router} from '@angular/router';
import {Common} from '../../services/common';
import {SortPipe} from '../../pipes/sort.pipe';

@Component({
    selector: 'self-pay-student-popup',
    templateUrl: 'templates/tests/student-already-started-test.html',
    directives: [ROUTER_DIRECTIVES],
    providers: [Common],
  //  inputs: ['studentWindowException']
    pipes: [SortPipe]
})

export class StudentAlreadyStartedTestPopup implements OnInit, OnDestroy {
    @Input() studentHasStartedTestException: any;
    @Output() studentHasStartedTestExceptionPopupContinue = new EventEmitter();
    @Output() studentHasStartedTestExceptionPopupClose = new EventEmitter();
    sStorage: any;
    constructor(public common: Common, public router: Router) {
       
    }
    ngOnDestroy(): void {
        this.studentHasStartedTestException = null;
    }
    initialize(): void {
        debugger;
        this.sStorage = this.common.getStorage();
        //let savedSchedule = JSON.parse(this.sStorage.getItem('testschedule'));
        console.log('Student has started Exception : ' + this.studentHasStartedTestException);
    }

    ngOnInit(): void {
        this.initialize();
    }

    removeStudents(): void {
        let self = this;
        if (this.sStorage) {
            let savedSchedule = JSON.parse(this.sStorage.getItem('testschedule'));
            if (savedSchedule) {
                //var removedStudents = _.remove(savedSchedule.selectedStudents, function (student) {
                //    return _.some(self.studentWindowException, { 'StudentId': student.StudentId })
                //});
            }
            this.sStorage.setItem('testschedule', JSON.stringify(savedSchedule));
        }
    }
    continue(e): void {
        e.preventDefault();
        this.studentHasStartedTestExceptionPopupContinue.emit(e);
     //   this.router.navigate(['/tests/confirmation-modify-in-progress']);
    }

    close(e): void {
        e.preventDefault();
        this.studentHasStartedTestExceptionPopupClose.emit(e);
    }

}
