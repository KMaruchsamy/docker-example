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
import '../../plugins/jquery.timepicker.js';
import * as moment from '../../lib/moment.min.js';
@Component({
    selector: 'choose-test',
    templateUrl: '../../templates/tests/schedule-test.html',
    providers: [TestService, Auth, TestScheduleModel],
    directives: [PageHeader, TestHeader, PageFooter, NgIf]
    // styleUrls: ['../../css/bootstrap-datepicker3.css', '../../css/jquery.timepicker.css']
})
export class ScheduleTest implements OnInit {
    valid: boolean = false;
    invalid8hours: boolean = false;
    startDate: string = '';
    endDate: string = '';
    $startDate: any;
    $endDate: any;
    dontPropogate: boolean = false;
    constructor(public testScheduleModel: TestScheduleModel,
        public testService: TestService) {
        this.$startDate = $('#startDate');
        this.$endDate = $('#endDate');
        
        console.log(Date.today().toString("M/d/yyyy"));
    }

    ngOnInit(): void {
        this.testScheduleModel = this.testService.getTestSchedule();
        this.testScheduleModel.currentStep = 2;
        this.testScheduleModel.completed = false;
        let __this = this;
        
        
        $('#startTime').timepicker({
            'showDuration': true,
            'timeFormat': 'g:ia',
            'minTime': '8:00am'
        }).on('changeTime', function() {
            console.log($(this).val());
        });




        this.$startDate.datepicker({
            format: 'mm/dd/yyyy',
            autoclose: true,
            todayHighlight: true, //highlights today's date
            startDate: new Date()
        }).on('hide', function() {
            if (!__this.dontPropogate) {
                __this.startDate = __this.$startDate.val();
                setTimeout(outputString=> {
                    __this.$startDate.datepicker('update', __this.startDate);
                    if (__this.endDate === '')
                        __this.$endDate.datepicker('update', __this.startDate);
                });
            }

        });

        this.$endDate.datepicker({
            format: 'mm/dd/yyyy',
            autoclose: true,
            todayHighlight: true, //highlights today's date
            startDate: new Date()
        }).on('hide', function() {
            if (!this.dontPropogate) {
                __this.endDate = __this.$endDate.val();
                setTimeout(outputString=> {
                    if (__this.endDate === '')
                        __this.$endDate.datepicker('update', __this.startDate);
                });
            }
        });

    }

    onKeyDownStartDate($control: any, e: any): boolean {
        this.dontPropogate = true;
        var keyCode = e.keyCode || e.which;
        if (keyCode === 9 || keyCode === 13) {
            let inputString = $control.value;
            let outputString = this.parseDateString(inputString);
            if (outputString !== '') {
                // $control.value = '';
                // $control.value = outputString;
                if (new Date() > new Date(outputString))
                    this.startDate = new Date().toDateString();
                else
                    this.startDate = outputString;
                setTimeout(outputString=> {
                    this.$startDate.datepicker('update', this.startDate);
                    if (this.endDate === '')
                        this.$endDate.datepicker('update', this.startDate);
                });
                // return false;
            }

        }
        e.stopPropagation();
        return true;
    }

    onKeyDownEndDate($control: any, e: any): boolean {
        this.dontPropogate = true;
        var keyCode = e.keyCode || e.which;
        if (keyCode === 9 || keyCode === 13) {
            let inputString = $control.value;
            let outputString = this.parseDateString(inputString);
            if (outputString !== '') {
                // $control.value = '';
                // $control.value = outputString;
                if (new Date() > new Date(outputString))
                    this.endDate = new Date().toDateString();
                else
                    this.endDate = outputString;
                setTimeout(outputString=> {
                    this.$endDate.datepicker('update', this.endDate);
                })
                // return false;
            }
            e.stopPropagation();
            return true;
        }

    }



    parseDateString(inputDate: string): string {
        let inputArr: string[] = [];
        let i: number = 0;
        let day: string;
        let month: string;
        let year: string;

        if (inputDate.indexOf('/') > -1)
            inputArr = inputDate.split('/');
        if (inputDate.indexOf('-') > -1)
            inputArr = inputDate.split('-');
        if (inputDate.indexOf('.') > -1)
            inputArr = inputDate.split('.');
        if (inputDate.indexOf(' ') > -1)
            inputArr = inputDate.split(' ');
        if (inputArr.length < 3)
            return '';

        _.forEach(inputArr, function(value) {
            i++;
            let dateNumber: number;
            if (value === undefined || value === '') {
                return '';
            }
            dateNumber = parseInt(_.trim(value));
            if (!_.isNumber(dateNumber))
                return '';
            if (i === 1) {
                if (dateNumber < 10)
                    day = '0' + dateNumber.toString();
                else
                    day = dateNumber.toString();
            }
            if (i === 2) {
                if (dateNumber < 10)
                    month = '0' + dateNumber.toString();
                else
                    month = dateNumber.toString();
            }
            if (i === 3) {
                if (dateNumber.toString().length < 4)
                    year = (dateNumber + 2000).toString();
                else
                    year = dateNumber.toString();
            }
        });

        if (day === undefined || day === '' || !_.isNumber(parseInt(day)) ||
            month === undefined || month === '' || !_.isNumber(parseInt(month)) ||
            year === undefined || year === '' || !_.isNumber(parseInt(year)))
            return '';

        return day + '/' + month + '/' + year;

    }

}