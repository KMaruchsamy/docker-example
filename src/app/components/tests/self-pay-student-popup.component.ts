import {Component, Input, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
// import {CommonService} from '../../services/common';
import {SortPipe} from '../../pipes/sort.pipe';
import { CommonService } from './../../services/common.service';

@Component({
    selector: 'self-pay-student-popup',
    templateUrl: './self-pay-student-popup.component.html',
    inputs: ['studentWindowException']
})

export class SelfPayStudentPopupComponent implements OnInit, OnDestroy {
    @Input() selfPayStudentException: any;
    @Input() isModifyInProgress: boolean = false;
    @Input() pageName: string="";
    @Output() selfPayStudentExceptionPopupClose = new EventEmitter();
    sStorage: any;
    constructor(public common: CommonService) {
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
