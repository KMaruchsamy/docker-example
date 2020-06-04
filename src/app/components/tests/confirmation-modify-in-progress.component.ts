import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import {Title} from '@angular/platform-browser';
import { Subscription, Observable } from 'rxjs';
import {TestScheduleModel} from '../../models/test-schedule.model';
import {SelectedStudentModel} from '../../models/selected-student.model';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { TestService } from './test.service';

@Component({
    selector: 'confirmation-modify-in-progress',
    templateUrl: './confirmation-modify-in-progress.component.html',
    providers: [TestScheduleModel, SelectedStudentModel]
})
export class ConfirmationModifyInProgressComponent implements OnInit, OnDestroy {
    sStorage: any;
    removedStudents: SelectedStudentModel[]=[];
    studentsAdded: SelectedStudentModel[] = [];
    testName: string = "";
    deactivateSubscription: Subscription;
    destinationRoute: string;
    isAnyChange: boolean = false;

    constructor(public auth: AuthService, public common: CommonService, public testService: TestService, public schedule: TestScheduleModel, public router: Router, public titleService: Title) {

    }
   
    ngOnInit(): void {
        // this.deactivateSubscription = this.router
        //      .events
        //     .filter(event => event instanceof NavigationStart)
        //     .subscribe(e => {
        //         this.destinationRoute = e.url;
        //     });

        window.scroll(0,0);
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else {
            this.titleService.setTitle('Modify In Progress: Confirmation – Kaplan Nursing');
            this.initialization();
        }
    }
    canDeactivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot, nextState: RouterStateSnapshot): Observable<boolean> | boolean {
        this.destinationRoute = nextState.url;
        return true;
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
