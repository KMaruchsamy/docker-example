import {Component, Input, Output, EventEmitter, OnInit} from 'angular2/core';
import {RouterLink, OnDeactivate,ComponentInstruction, RouteParams, Router} from 'angular2/router';
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
    modify: boolean = false;
    constructor(public testScheduleModel: TestScheduleModel, public common: Common, public testService: TestService, public routeParams:RouteParams, public router:Router, public auth:Auth) { }

    ngOnInit(): void {
        $(document).scrollTop(0);
        $('title').html('Confirmation &ndash; Kaplan Nursing');
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else {
            let action = this.routeParams.get('action');
            if (action != undefined && action.trim() !== '')
                this.modify = true;
            let savedSchedule: TestScheduleModel = this.testService.getTestSchedule();
            if (savedSchedule)
                this.testScheduleModel = savedSchedule;
            this.testScheduleModel.currentStep = 5;
            this.testScheduleModel.activeStep = 5;
        }
    }

    routerOnDeactivate(next: ComponentInstruction ,prev: ComponentInstruction): void {
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(next.urlPath)));
        if (outOfTestScheduling)
            this.testService.clearTestScheduleObjects(); 
    }
}