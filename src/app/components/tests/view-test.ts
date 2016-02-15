import {Component, OnInit, DynamicComponentLoader, ElementRef} from 'angular2/core';
import {Router, RouterLink, OnDeactivate, CanDeactivate, ComponentInstruction} from 'angular2/router';
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
import '../../plugins/jquery.dataTables.min.js';
import '../../plugins/dataTables.responsive.js';
import '../../lib/modal.js';

@Component({
    selector: "view-test",
    templateUrl: "../../templates/tests/view-test.html",
    providers: [TestService, Auth, TestScheduleModel, Common],
    directives: [PageHeader, TestHeader, PageFooter, NgIf, NgFor, RouterLink],
    pipes: [ParseDatePipe]
})
export class ViewTest implements OnDeactivate {
    scheduleId: number = 1;// hard coded for now .. need to change it ....
    studentsTable: any;
    constructor(public auth: Auth, public common: Common, public testService: TestService, public schedule: TestScheduleModel, public router: Router) {
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
            this.loadTestSchedule();
    }

    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        if (this.studentsTable)
            this.studentsTable.destroy();
    }

    loadTestSchedule(): void {
        let __this = this;
        let scheduleURL = this.resolveScheduleURL(`${this.common.apiServer}${links.api.baseurl}${links.api.admin.test.viewtest}`);
        let schedulePromise = this.testService.getScheduleById(scheduleURL);
        let schedule =
            schedulePromise.then((response) => {
                return response.json();
            })
                .then((json) => {
                    __this.schedule = __this.testService.mapTestScheduleObjects(json);
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
                })
                .catch((error) => {
                    console.log(error);
                });
    }


    resolveScheduleURL(url: string): string {
        return url.replace('§scheduleId', this.scheduleId.toString());
    }
    
    print(e): void{
        e.preventDefault();
        window.print();
        
    }
}