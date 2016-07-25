import {Component, Input, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {NgIf} from '@angular/common';
import {Router, ROUTER_DIRECTIVES, ActivatedRoute} from '@angular/router';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';
import {ConfirmationPopup} from '../shared/confirmation.popup';
import {Common} from '../../services/common';
import {Observable, Subscription} from 'rxjs/Rx';

@Component({
    selector: 'test-header',
    templateUrl: 'templates/tests/test-header.html',
    inputs: ['testSchedule', 'scheduleStep', 'hideCancelButton'],
    directives: [ROUTER_DIRECTIVES, NgIf, ConfirmationPopup],
    pipes: [ParseDatePipe]
})
export class TestHeader implements OnInit, OnDestroy {
    nextDay: boolean = false;
    @Input() testSchedule;
    @Input() hideCancelButton;
    @Output('cancelChanges') cancelChangesEvent = new EventEmitter();
    @Output('continueMakingChanges') continueMakingChangesEvent = new EventEmitter();
    // modify: boolean = false;
    @Input() modify: boolean = false;
    @Input() modifyInProgress: boolean = false;
    sStorage: any;
    constructor(public activatedRoute: ActivatedRoute, public router: Router, public common: Common) { }

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
        $('#cancelChangesPopup').modal('show');
        e.preventDefault();
    }

    cancelChanges(): boolean {
        $('#cancelChangesPopup').modal('hide');
        this.cancelChangesEvent.emit('');
        return false;
    }

    continueMakingChanges(): boolean {
        $('#cancelChangesPopup').modal('hide');
        this.continueMakingChangesEvent.emit('');
        return false;
    }



}