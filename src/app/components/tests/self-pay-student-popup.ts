import {Component, Input, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {Common} from '../../services/common';
import {SortPipe} from '../../pipes/sort.pipe';

@Component({
    selector: 'self-pay-student-popup',
    templateUrl: 'templates/tests/self-pay-student-popup.html',
    directives: [ROUTER_DIRECTIVES],
    providers: [Common],
    inputs: ['studentWindowException'],
    pipes:[SortPipe]
})

export class SelfPayStudentPopup implements OnInit, OnDestroy {
    @Input() selfPayStudentException: any;
    @Output() selfPayStudentExceptionPopupClose = new EventEmitter();
    sStorage: any;
    constructor(public common: Common) {
        this.initialize();
    }
    ngOnDestroy(): void {
        this.selfPayStudentException = null;
    }
    initialize(): void {
        this.sStorage = this.common.getStorage();
        let savedSchedule = JSON.parse(this.sStorage.getItem('testschedule'));
    }

    ngOnInit(): void {
    }

    close(e): void {
        e.preventDefault();
        this.selfPayStudentExceptionPopupClose.emit(e);
    }

}
