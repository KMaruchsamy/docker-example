﻿import {Component, Input, OnInit, Output, EventEmitter} from 'angular2/core';
import {RouterLink, OnDeactivate} from 'angular2/router';
import {Common} from '../../services/common';

@Component({
    selector: 'self-pay-student-popup',
    templateUrl: '../../templates/tests/self-pay-student-popup.html',
    directives: [RouterLink],
    providers: [Common],
    inputs: ['studentWindowException']
})

export class SelfPayStudentPopup implements OnInit, OnDeactivate {
    @Input() selfPayStudentException: any;
    @Output() selfPayStudentExceptionPopupClose = new EventEmitter();
    sStorage: any;
    constructor(public common: Common) {
        this.initialize();
    }
    routerOnDeactivate(): void {
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
