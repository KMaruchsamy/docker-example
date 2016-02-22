import {Component, OnInit, DynamicComponentLoader, ElementRef} from 'angular2/core';
import {Router, RouterLink, OnDeactivate, CanDeactivate, ComponentInstruction} from 'angular2/router';
import {Http, Response, RequestOptions, Headers, HTTP_PROVIDERS} from "angular2/http";
import {Observable} from 'rxjs/Rx';
import {NgIf, NgFor} from 'angular2/common';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {links} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestHeader} from './test-header';
import * as _ from '../../lib/index';
import {ParseDatePipe} from '../../pipes/parseDate.pipe';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {ConfirmationPopup} from '../shared/confirmation.popup';
import '../../plugins/jquery.dataTables.min.js';
import '../../plugins/dataTables.responsive.js';
import '../../lib/modal.js';

@Component({
    selector: "view-test",
    templateUrl: "../../templates/tests/view-test.html",
    providers: [TestService, Auth, TestScheduleModel, Common],
    directives: [PageHeader, TestHeader, PageFooter, NgIf, NgFor, RouterLink, ConfirmationPopup],
    pipes: [ParseDatePipe]
})
export class ViewTest implements OnInit, OnDeactivate {
    studentsTable: any;
    sStorage: any;
    nextDay: boolean = false;
    constructor(public auth: Auth, public common: Common, public testService: TestService, public schedule: TestScheduleModel, public router: Router) {

    }

    ngOnInit(): void {
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else {
            this.loadTestSchedule();
        }
        $(document).scrollTop(0);
    }


    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction): void {
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(next.urlPath)));
        if (outOfTestScheduling)
            this.sStorage.removeItem('testschedule');
        if (this.studentsTable)
            this.studentsTable.destroy();
    }


    loadTestSchedule(): void {
        let __this = this;
        this.schedule = this.testService.getTestSchedule();
        if (this.schedule) {
            let startTime = this.schedule.scheduleStartTime;
            let endTime = this.schedule.scheduleEndTime;
            if (moment(endTime).isAfter(startTime, 'day'))
                this.nextDay = true;
        }
        if (this.schedule) {
            setTimeout(() => {
                this.studentsTable = $('#studentsInTestingSessionTable').DataTable({
                    "paging": false,
                    "searching": false,
                    "responsive": true,
                    "info": false,
                    "ordering": false
                });


                $('#studentsInTestingSessionTable').on('responsive-display.dt', function() {
                    $(this).find('.child .dtr-title br').remove();
                });

            });
        }
    }


    resolveScheduleURL(url: string): string {
        return url.replace('§scheduleId', this.schedule.scheduleId.toString());
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
            __this.sStorage.removeItem('testschedule');
            __this.router.navigate(['/ManageTests']);
        });
    }
}