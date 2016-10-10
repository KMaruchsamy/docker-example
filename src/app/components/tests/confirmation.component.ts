import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, RoutesRecognized, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
// import {CommonService} from '../../services/common';
// import {AuthService} from '../../services/auth';
import {TestScheduleModel} from '../../models/test-schedule.model';
// import {PageHeader} from '../shared/page-header';
// import {PageFooter} from '../shared/page-footer';
// import {TestHeader} from './test-header';
// import {TestService} from '../../services/test.service';
import {Subscription} from 'rxjs/Rx';
// import '../../lib/modal.js';
import { CommonService } from './../../services/common.service';
import { TestService } from './test.service';
import { PageHeaderComponent } from './../shared/page-header.component';
import { PageFooterComponent } from './../shared/page-footer.component';
import { TestHeaderComponent } from './test-header.component';
import { AuthService } from './../../services/auth.service';


@Component({
    selector: 'confirmation',
    templateUrl: 'components/tests/confirmation.component.html',
    providers: [CommonService, TestService, TestScheduleModel, AuthService],
    directives: [ROUTER_DIRECTIVES, PageHeaderComponent, PageFooterComponent, TestHeaderComponent]
})
export class ConfirmationComponent implements OnInit, OnDestroy {
    sStorage: any;
    modify: boolean = false;
    actionSubscription: Subscription;
    deactivateSubscription: Subscription;
    destinationRoute: string;
    constructor(private activatedRoute: ActivatedRoute, public testScheduleModel: TestScheduleModel, public common: CommonService, public testService: TestService, public router: Router, public auth: AuthService, public titleService: Title) { }

    ngOnDestroy(): void {
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(this.destinationRoute)));
        if (outOfTestScheduling)
            this.testService.clearTestScheduleObjects();

        if (this.actionSubscription)
            this.actionSubscription.unsubscribe();
        if (this.deactivateSubscription)
            this.deactivateSubscription.unsubscribe();    
    }

    ngOnInit(): void {

        this.deactivateSubscription = this.router
            .events
            .filter(event => event instanceof RoutesRecognized)
            .subscribe(event => {
                console.log('Event - ' + event);
                this.destinationRoute = event.urlAfterRedirects;
            });

        $(document).scrollTop(0);
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else {

            this.actionSubscription = this.activatedRoute.params.subscribe(params => {
                let action = params['action'];
                if (action != undefined && action.trim() !== '') {
                    this.modify = true;
                    this.titleService.setTitle('Modify: Confirmation – Kaplan Nursing');
                } else {
                    this.titleService.setTitle('Confirmation – Kaplan Nursing');
                }
                let savedSchedule: TestScheduleModel = this.testService.getTestSchedule();
                if (savedSchedule)
                    this.testScheduleModel = savedSchedule;
                else
                    this.router.navigate(['/testing-session-expired']);
                this.testScheduleModel.currentStep = 5;
                this.testScheduleModel.activeStep = 5;
            });

        }
    }
  
}