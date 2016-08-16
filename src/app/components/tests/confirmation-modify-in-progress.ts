import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ROUTER_DIRECTIVES, ActivatedRoute, RoutesRecognized } from '@angular/router';
import {NgFor, NgIf} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Rx';
import {Common} from '../../services/common';
import {Auth} from '../../services/auth';
import {PageHeader} from '../shared/page-header';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {TestService} from '../../services/test.service';
import {SelectedStudentModel} from '../../models/selectedStudent-model';
import * as _ from 'lodash';
import {SortPipe} from '../../pipes/sort.pipe';

@Component({
    selector: 'confirmation-modify-in-progress',
    templateUrl: 'templates/tests/confirmation-modify-in-progress.html',
    providers: [Auth, Common, TestService, TestScheduleModel, SelectedStudentModel],
    directives: [ROUTER_DIRECTIVES,PageHeader, NgFor, NgIf],
    pipes: [SortPipe]
})
export class ConfirmationModifyInProgress implements OnInit, OnDestroy {
    sStorage: any;
    removedStudents: SelectedStudentModel[]=[];
    studentsAdded: SelectedStudentModel[] = [];
    testName: string = "";
    deactivateSubscription: Subscription;
    destinationRoute: string;
    isAnyChange: boolean = false;

    constructor(private activatedRoute: ActivatedRoute, public auth: Auth, public common: Common, public testService: TestService, public schedule: TestScheduleModel, public router: Router, public titleService: Title) {

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
            this.titleService.setTitle('Modify In Progress: Confirmation – Kaplan Nursing');
            this.initialization();
        }
    }

    ngOnDestroy(): void {
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(this.destinationRoute)));
        if (outOfTestScheduling)
            this.testService.clearTestScheduleObjects();  

        if (this.deactivateSubscription)
            this.deactivateSubscription.unsubscribe();  
    }
    initialization(): void {
        let _testScheduleModal = JSON.parse(this.sStorage.getItem('testschedule'));
        this.testName = _testScheduleModal.testName;
        let _prevStudentList: SelectedStudentModel[] = JSON.parse(this.sStorage.getItem('prevtestschedule'));
        let _newStudentList: SelectedStudentModel[] = _testScheduleModal.selectedStudents;
        this.removedStudents = _.differenceWith(_prevStudentList, _newStudentList, _.isEqual);
        this.studentsAdded = _.differenceWith(_newStudentList, _prevStudentList, _.isEqual);
        if (this.removedStudents.length > 0 || this.studentsAdded.length > 0)
            this.isAnyChange = true;
    }
}