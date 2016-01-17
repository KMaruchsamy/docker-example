import {Component, OnInit} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {links} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestHeader} from './test-header';
import * as _ from '../../lib/index';
import {TestScheduleModel} from '../../models/testSchedule.model';
import '../../plugins/bootstrap-datepicker.min.js';
import '../../plugins/jquery.timepicker.js'

@Component({
    selector: 'choose-test',
    templateUrl: '../../templates/tests/schedule-test.html',
    providers: [TestService, Auth, TestScheduleModel],
    directives: [PageHeader, TestHeader, PageFooter, NgIf]
    // styleUrls: ['../../css/bootstrap-datepicker3.css', '../../css/jquery.timepicker.css']
})
export class ScheduleTest implements OnInit {
    valid: boolean=false;
    invalid8hours: boolean=false;
    constructor(public testScheduleModel: TestScheduleModel,
        public testService: TestService) { }

    ngOnInit(): void {
        this.testScheduleModel = this.testService.getTestSchedule();
        this.testScheduleModel.currentStep = 2;
        this.testScheduleModel.completed = false;
        let _this = this;
        $('#scheduleTest .time').timepicker({
            'showDuration': true,
            'timeFormat': 'g:ia',
            'minTime': '8:00am'
        });

        $('#scheduleTest .date').datepicker({
            'format': 'mm/dd/yyyy',
            'autoclose': true,
            'todayHighlight': true, //highlights today's date
            'startDate': new Date(),
            //'forceParse': false,
            //'assumeNearbyYear': true //change manually entered two digit year to four digits
        }).on('changeDate', function(e) {
            // `e` here contains the extra attributes
            console.log(e);
        });
    }
}