import {Component, OnInit} from 'angular2/core';
import {Router, RouterLink, OnDeactivate,ComponentInstruction} from 'angular2/router';
import {NgIf} from 'angular2/common';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {links} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestHeader} from './test-header';
import * as _ from '../../lib/index';
import {ParseDatePipe} from '../../pipes/parseDate.pipe';
import {TestScheduleModel} from '../../models/testSchedule.model';
import '../../plugins/dropdown.js';
import '../../plugins/bootstrap-select.min.js';

@Component({
    selector: "review-test",
    templateUrl: "../../templates/tests/review-test.html",
    providers: [TestService, Auth, TestScheduleModel],
    directives: [PageHeader, TestHeader, PageFooter, NgIf, RouterLink],
    pipes: [ParseDatePipe]
})

export class ReviewTest implements OnInit, OnDeactivate {
    testScheduleWindow: string = '';
    isScheduleDatesSame: boolean = true;
    testScheduleDates: string = '';
    testScheduleTimes: string = '';
    faculty: Object[] = [];
    facultyId: number;
    constructor(public testScheduleModel: TestScheduleModel,
        public testService: TestService, public auth: Auth, public router: Router) {
        this.initialize();
    }

    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        this.testService.outOfTestScheduling((this.auth.common.removeWhitespace(next.componentType.name)));
    }

    ngOnInit() {
        this.bindFaculty();
    }
    initialize() {
        let savedSchedule = this.testService.getTestSchedule();
        if (savedSchedule) {
            this.testScheduleModel = savedSchedule;
            let testScheduleWindowDuration = moment.duration(moment(this.testScheduleModel.scheduleEndTime).diff(this.testScheduleModel.scheduleStartTime));

            this.testScheduleWindow = moment(this.testScheduleModel.scheduleEndTime).diff(this.testScheduleModel.scheduleStartTime, 'hours') + ' hour';
            if (testScheduleWindowDuration.minutes() > 0)
                this.testScheduleWindow += ' ' + testScheduleWindowDuration.minutes() + ' minute';
            this.testScheduleWindow += ' window';


            if (this.testScheduleModel.scheduleStartTime && moment(this.testScheduleModel.scheduleStartTime).isValid()) {
                this.testScheduleDates = moment(this.testScheduleModel.scheduleStartTime).format('dddd') + ', ' + moment(this.testScheduleModel.scheduleStartTime).format('L');
            }
            if (this.testScheduleModel.scheduleEndTime && moment(this.testScheduleModel.scheduleEndTime).isValid() && moment(this.testScheduleModel.scheduleEndTime).isAfter(this.testScheduleModel.scheduleStartTime, 'days')) {
                this.testScheduleDates = 'From ' + this.testScheduleDates + ' to ' + moment(this.testScheduleModel.scheduleEndTime).format('dddd') + ', ' + moment(this.testScheduleModel.scheduleEndTime).format('L');
            }

            if (this.testScheduleModel.scheduleStartTime && moment(this.testScheduleModel.scheduleStartTime).isValid()) {
                this.testScheduleTimes = moment(this.testScheduleModel.scheduleStartTime).format('LT');
            }
            if (this.testScheduleModel.scheduleEndTime && moment(this.testScheduleModel.scheduleEndTime).isValid()) {
                this.testScheduleTimes = 'From ' + this.testScheduleTimes + ' to ' + moment(this.testScheduleModel.scheduleEndTime).format('LT');
            }

        }

        if (this.testScheduleModel.currentStep < 4)
            this.testScheduleModel.currentStep = 4;
        this.testScheduleModel.activeStep = 4;
        
        this.facultyId = this.auth.userid;
    }
    
    
    bindFaculty(): void{
        let facultyURL = this.resolveFacultyURL(`${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.test.faculty}`);
        let facultyPromise = this.testService.getFaculty(facultyURL);
         facultyPromise.then((response) => {
            return response.json();
        })
            .then((json) => {
                this.faculty = json;
                console.log(this.faculty);
                setTimeout(json => {
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
                        $('#ddlFaculty').selectpicker('mobile');
                    else
                        $('#ddlFaculty').selectpicker('refresh');
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }
    
    resolveFacultyURL(url: string): string{
        return url.replace('§institutionid', this.testScheduleModel.institutionId.toString());
    }
}