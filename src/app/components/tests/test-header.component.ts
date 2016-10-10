import {Component, Input, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {NgIf} from '@angular/common';
import {Router, ROUTER_DIRECTIVES, ActivatedRoute} from '@angular/router';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';
// import {ConfirmationPopup} from '../shared/confirmation.popup';
// import {CommonService} from '../../services/common';
import {Observable, Subscription} from 'rxjs/Rx';
import { ConfirmationPopupComponent } from './../shared/confirmation.popup.component';
import { CommonService } from './../../services/common.service';

@Component({
    selector: 'test-header',
    templateUrl: 'components/tests/test-header.component.html',
    inputs: ['scheduleStep'],
    directives: [ROUTER_DIRECTIVES, NgIf, ConfirmationPopupComponent],
    pipes: [ParseDatePipe]
})
export class TestHeaderComponent implements OnInit, OnDestroy {
    nextDay: boolean = false;
    @Input() testSchedule;
    @Input() hideCancelButton;
    @Output('cancelChanges') cancelChangesEvent = new EventEmitter();
    @Output('continueMakingChanges') continueMakingChangesEvent = new EventEmitter();
    // modify: boolean = false;
    @Input() modify: boolean = false;
    @Input() modifyInProgress: boolean = false;
    sStorage: any;
    constructor(public activatedRoute: ActivatedRoute, public router: Router, public common: CommonService) { }

    ngOnDestroy(): void {
    }

    ngOnInit(): void {
        this.sStorage = this.common.getStorage();
        if (this.testSchedule) {
            let startTime = this.testSchedule.scheduleStartTime;
            let endTime = this.testSchedule.scheduleEndTime;
            if (moment(endTime).isAfter(startTime, 'day'))
                this.nextDay = true;
        }
    }

    confirmCancelChanges(e): void {
        if (this.modifyInProgress)
            $('#cancelModifyInProgress').modal('show');
        else
            $('#cancelChangesPopup').modal('show');
        e.preventDefault();
    }

    cancelChanges(): boolean {
        if (this.modifyInProgress)
            $('#cancelModifyInProgress').modal('hide');
        else
            $('#cancelChangesPopup').modal('hide');
        this.cancelChangesEvent.emit('');
        return false;
    }

    continueMakingChanges(): boolean {
        if (this.modifyInProgress)
            $('#cancelModifyInProgress').modal('hide');
        else
            $('#cancelChangesPopup').modal('hide');
        this.continueMakingChangesEvent.emit('');
        return false;
    }



}