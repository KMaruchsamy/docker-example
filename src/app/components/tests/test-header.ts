import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {NgIf} from '@angular/common';
import {Router, RouterLink, RouteParams} from '@angular/router-deprecated';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';
import {ConfirmationPopup} from '../shared/confirmation.popup';
import {Common} from '../../services/common';

@Component({
    selector: 'test-header',
    templateUrl: 'templates/tests/test-header.html',
    inputs: ['testSchedule', 'scheduleStep','hideCancelButton'],
    directives: [RouterLink, NgIf, ConfirmationPopup],
    pipes: [ParseDatePipe]
})

export class TestHeader implements OnInit {
    nextDay: boolean = false;
    @Input() testSchedule;
    @Input() hideCancelButton;
    @Output('cancelChanges') cancelChangesEvent = new EventEmitter();
    @Output('continueMakingChanges') continueMakingChangesEvent = new EventEmitter();
    modify: boolean = false;
    modifyInProgress: boolean = false;
    sStorage: any;
    TestName: string = "";
    constructor(public routeParams: RouteParams, public router: Router, public common: Common) { }

    ngOnInit(): void {
        this.sStorage = this.common.getStorage();
        let action = this.routeParams.get('action');
        if (action != undefined && action.trim() !== '') {
            if (action.trim() === 'modifyinprogress')
                this.modifyInProgress = true;
            else
                this.modify = true;
        }
        if (this.testSchedule) {
            let startTime = this.testSchedule.scheduleStartTime;
            let endTime = this.testSchedule.scheduleEndTime;
            this.TestName = this.testSchedule.testName;
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