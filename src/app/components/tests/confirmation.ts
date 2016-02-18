import {Component, Input, Output, EventEmitter, OnInit} from 'angular2/core';
import {RouterLink, OnDeactivate,ComponentInstruction} from 'angular2/router';
import {Common} from '../../services/common';
import {Auth} from '../../services/auth';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestHeader} from './test-header';
import {TestService} from '../../services/test.service';
import '../../lib/modal.js';


@Component({
    selector: 'confirmation',
    templateUrl: '../../templates/tests/confirmation.html',
    providers: [Common, TestService, TestScheduleModel, Auth],
    directives: [RouterLink, PageHeader, PageFooter, TestHeader]
})
export class Confirmation implements OnInit, OnDeactivate {
    sStorage: any;
    constructor(public testScheduleModel: TestScheduleModel, public common: Common, public testService: TestService) { }

    ngOnInit(): void {
        this.sStorage = this.common.getStorage();
        let savedSchedule: TestScheduleModel = this.testService.getTestSchedule();
        if (savedSchedule)
            this.testScheduleModel = savedSchedule;
        this.testScheduleModel.currentStep = 5;
        this.testScheduleModel.activeStep = 5;
    }

    routerOnDeactivate(prev: ComponentInstruction, next: ComponentInstruction): void {
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(next.urlPath)));
        if (outOfTestScheduling)
            this.sStorage.removeItem('testschedule');    
    }
}