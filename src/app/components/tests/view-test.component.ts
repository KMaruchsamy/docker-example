import {Component, OnInit, DynamicComponentLoader, ElementRef, OnDestroy} from '@angular/core';
import {Router, ROUTER_DIRECTIVES, RoutesRecognized, ActivatedRoute} from '@angular/router';
import {Http, Response, RequestOptions, Headers, HTTP_PROVIDERS} from "@angular/http";
import {Title} from '@angular/platform-browser';
import {Observable, Subscription} from 'rxjs/Rx';
import {NgIf, NgFor} from '@angular/common';
// import {TestService} from '../../services/test.service';
// import {AuthService} from '../../services/auth';
// import {CommonService} from '../../services/common';
import {links} from '../../constants/config';
// import {PageHeader} from '../shared/page-header';
// import {PageFooter} from '../shared/page-footer';
// import {TestHeader} from './test-header';
import * as _ from 'lodash';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';
import {TestScheduleModel} from '../../models/test-schedule.model';
import {SelectedStudentModel} from '../../models/selected-student.model';
// import {ConfirmationPopup} from '../shared/confirmation.popup';
// import {LogService} from '../../services/log.service.service';

// import '../../plugins/jquery.dataTables.min.js';
// import '../../plugins/dataTables.responsive.js';
// import '../../lib/modal.js';
import { TestService } from './test.service';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { LogService } from './../../services/log.service';
import { PageHeaderComponent } from './../shared/page-header.component';
import { TestHeaderComponent } from './test-header.component';
import { PageFooterComponent } from './../shared/page-footer.component';
import { ConfirmationPopupComponent } from './../shared/confirmation.popup.component';
import * as moment from 'moment-timezone';

@Component({
    selector: "view-test",
    templateUrl: "components/tests/view-test.component.html",
    providers: [TestService, AuthService, TestScheduleModel, CommonService, LogService ],
    directives: [PageHeaderComponent, TestHeaderComponent, PageFooterComponent, NgIf, NgFor, ROUTER_DIRECTIVES, ConfirmationPopupComponent],
    pipes: [ParseDatePipe]
})
export class ViewTestComponent implements OnInit, OnDestroy {
    studentsTable: any;
    sStorage: any;
    nextDay: boolean = false;
    modify: boolean = false;
    hasADA: boolean = false;
    testStatus: number;
    anyStudentPayStudents: boolean = false;
    testScheduleId: number;
    modifyInProgress: boolean = false;
    adminId: number;
    deactivateSubscription: Subscription;
    destinationRoute: string;
    paramsSubscription: Subscription;
    scheduleSubscription: Subscription;
    constructor(public auth: AuthService, public common: CommonService, public testService: TestService, public schedule: TestScheduleModel, public router: Router, private activatedRoute: ActivatedRoute, public titleService: Title, private log: LogService
) {

    }

    ngOnInit(): void {

        this.deactivateSubscription = this.router
            .events
            .filter(event => event instanceof RoutesRecognized)
            .subscribe(event => {
                console.log('Event - ' + event);
                this.destinationRoute = event.urlAfterRedirects;
            });

        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else {
            this.paramsSubscription = this.activatedRoute.params.subscribe(params => {
                let action = params['action'];
                if (action != undefined && action.trim() !== '')
                    this.modify = true;
                this.testScheduleId = parseInt(params['id']);
                this.adminId = this.auth.userid;
                this.loadTestSchedule();
            });
        }
        $(document).scrollTop(0);
        this.titleService.setTitle('View Testing Session – Kaplan Nursing');
    }


    ngOnDestroy(): void {
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(this.destinationRoute)));
        if (outOfTestScheduling)
            this.testService.clearTestScheduleObjects();
        if (this.studentsTable)
            this.studentsTable.destroy();

        if (this.deactivateSubscription)
            this.deactivateSubscription.unsubscribe();

        if (this.paramsSubscription)
            this.paramsSubscription.unsubscribe();

        if (this.scheduleSubscription)
            this.scheduleSubscription.unsubscribe();
    }




    loadTestSchedule(): void {
        let __this = this;
        let scheduleURL = this.resolveScheduleURL(`${this.common.apiServer}${links.api.baseurl}${links.api.admin.test.viewtest}`);
        let scheduleObservable: Observable<Response> = this.testService.getScheduleById(scheduleURL);
        this.scheduleSubscription = scheduleObservable
            .map(response => response.json())
            .subscribe(json => {
                if (json) {
                    let _schedule: TestScheduleModel = __this.testService.mapTestScheduleObjects(json);
                    if (_schedule) {
                        __this.sStorage.setItem('testschedule', JSON.stringify(_schedule));
                        if (_schedule.selectedStudents && _schedule.selectedStudents.length > 0) {
                            let __selectedStudents: SelectedStudentModel[] = _schedule.selectedStudents.sort(function (a, b) {
                                var nameA = a.LastName.toLowerCase(), nameB = b.LastName.toLowerCase()
                                if (nameA < nameB) //sort string ascending
                                    return -1
                                if (nameA > nameB)
                                    return 1
                                return 0 //default return value (no sorting)
                            });
                            _schedule.selectedStudents = __selectedStudents;

                        }
                        __this.schedule = _schedule;
                        __this.hasADA = _.some(__this.schedule.selectedStudents, { 'Ada': true });
                        __this.testStatus = __this.testService.getTestStatusFromTimezone(_schedule.institutionId, _schedule.scheduleStartTime, _schedule.scheduleEndTime);
                        __this.anyStudentPayStudents = __this.testService.anyStudentPayStudents(_schedule);
                        console.log('>>>>>>>>>>>>>>>>>>');
                        console.log(JSON.stringify(this.schedule));
                        let testStatus: number = __this.testService.getTestStatusFromTimezone(__this.schedule.institutionId, __this.schedule.scheduleStartTime, __this.schedule.scheduleEndTime);
                        if (testStatus === 0)
                            __this.modifyInProgress = true;
                    }
                    else
                        __this.router.navigate(['/testing-session-expired']);

                    if (__this.schedule) {
                        let startTime = __this.schedule.scheduleStartTime;
                        let endTime = __this.schedule.scheduleEndTime;
                        if (moment(endTime).isAfter(startTime, 'day'))
                            __this.nextDay = true;
                    }
                    if (__this.schedule) {
                        setTimeout(() => {
                            __this.studentsTable = $('#studentsInTestingSessionTable').DataTable({
                                "paging": false,
                                "searching": false,
                                "responsive": true,
                                "info": false,
                                "ordering": false
                            });


                            $('#studentsInTestingSessionTable').on('responsive-display.dt', function () {
                                $(this).find('.child .dtr-title br').remove();
                            });

                        });
                    }

                }

            },
            error => console.log(error));
    }


    resolveScheduleURL(url: string): string {
        return url.replace('§scheduleId', this.testScheduleId.toString());
    }

    print(e): void {
        e.preventDefault();
        window.print();

    }


    onOKConfirmation(): void {
        $('#confirmationPopup').modal('hide');
        this.deleteSchedule();

    }

    onCancelConfirmation() {
        $('#confirmationPopup').modal('hide');
    }

    showConfirmation(): void {
        $('#confirmationPopup').modal('show');
        // return false;
    }

    deleteSchedule(): void {
        let __this = this;
        let scheduleURL = this.resolveScheduleURL(`${this.common.apiServer}${links.api.baseurl}${links.api.admin.test.deleteSchedule}`);
        let deleteObdervable: Observable<Response> = this.testService.deleteSchedule(scheduleURL);
        deleteObdervable.subscribe((res: Response) => {
            __this.testService.clearTestScheduleObjects();
            __this.router.navigate(['/tests']);
        });
    }
}