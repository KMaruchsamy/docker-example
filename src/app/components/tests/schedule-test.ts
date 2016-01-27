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

@Component({
    selector: 'schedule-test',
    templateUrl: '../../templates/tests/schedule-test.html',
    providers: [TestService, Auth, TestScheduleModel],
    directives: [PageHeader, TestHeader, PageFooter, NgIf]
    // styleUrls: ['../../css/bootstrap-datepicker3.css', '../../css/jquery.timepicker.css']
})
export class ScheduleTest implements OnInit {
    valid: boolean = false;
    invalid8hours: boolean = false;
    ignore8HourRule: boolean = false;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    $startDate: any;
    $startTime: any;
    $endDate: any;
    $endTime: any;
    dontPropogate: boolean = false;

    constructor(public testScheduleModel: TestScheduleModel,
        public testService: TestService, public auth: Auth) {
        this.$startDate = $('#startDate');
        this.$endDate = $('#endDate');
        this.$startTime = $('#startTime');
        this.$endTime = $('#endTime');
    }



    ngOnInit(): void {
        this.testScheduleModel = this.testService.getTestSchedule();
        this.testScheduleModel.currentStep = 2;
        this.testScheduleModel.activeStep = 2;
        this.testScheduleModel.completed = false;
        this.set8HourRule();
        this.bindEvents();
    }


    bindEvents(): void {

        let __this = this;
        this.$startTime.timepicker({
            'timeFormat': 'g:ia',
            'minTime': '8:00am'
        }).on('change', function(e) {
            console.log(e);
            if (__this.startDate) {
                __this.startTime = $(this).timepicker('getTime', new Date(__this.startDate));
                if (moment(__this.startTime).isValid()) {
                    __this.$endTime.timepicker('option', 'minTime', __this.startTime);
                    if (!__this.endTime) {
                        __this.endTime = moment(new Date(__this.startTime)).add(3, 'hours').format();
                        __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                        __this.endDate = moment(new Date(__this.endTime)).format('L');
                        __this.$endDate.datepicker('update', __this.endDate);
                    }
                } else
                    __this.$startTime.timepicker('setTime', '');

            }
            else
                __this.$startTime.timepicker('setTime', '');

            __this.validate(__this);
        });

        this.$endTime.timepicker({
            'showDuration': true,
            'timeFormat': 'g:ia',
            'minTime': '8:00am'
        }).on('change', function(e) {
            if (__this.endDate) {
                __this.endTime = $(this).timepicker('getTime', new Date(__this.endDate));
                if (!moment(__this.endTime).isValid())
                    __this.$endTime.timepicker('setTime', '');

            } else
                __this.$endTime.timepicker('setTime', '');

            __this.validate(__this);
        });


        this.$startDate.datepicker({
            format: 'mm/dd/yyyy',
            autoclose: true,
            todayHighlight: true,
            forceParse: false,
            startDate: new Date()
        }).on('hide', function(e) {
            let outputString = '';

            outputString = __this.parseDateString(e.currentTarget.value);

            if (outputString !== '' && moment(outputString).isValid()) {
                
                // Checking if the startdate is before endate and before current date. 
                let selectedDateTime = __this.$startTime.timepicker('getTime', new Date(outputString));
                console.log(selectedDateTime,__this.endTime,moment(selectedDateTime).isAfter(__this.endTime));
                
                
                if (new Date() > new Date(outputString))
                    __this.startDate = moment(new Date()).format('L');
                else
                    __this.startDate = outputString;

                __this.$startDate.datepicker('update', __this.startDate);
                
                
                // have to change the date part of the time because the date is changed ..
                __this.startTime = __this.$startTime.timepicker('getTime', new Date(__this.startDate));

                //Auto populate the enddate only if the enddate is null or the very first time .                
                if (!__this.endDate) {
                    __this.endDate = __this.startDate;
                    __this.$endDate.datepicker('update', __this.startDate);
                    // have to change the date part of the time because the date is changed ..
                    __this.endTime = __this.$endTime.timepicker('getTime', new Date(__this.endDate));
                    __this.$startDate.datepicker('setEndDate', __this.endDate);
                }
                
                //setting the start date of end datepicker with the start date so that we cannot select a date less than than the start date.
                __this.$endDate.datepicker('setStartDate', __this.startDate);
            }
            else {
                if (__this.startDate)
                    __this.$startDate.datepicker('update', new Date(__this.startDate));
                else
                    __this.$startDate.datepicker('update', '');
            }
            __this.validate(__this);
        });

        this.$endDate.datepicker({
            format: 'mm/dd/yyyy',
            autoclose: true,
            todayHighlight: true, //highlights today's date
            startDate: new Date(),
            forceParse: false
        }).on('hide', function(e) {
            let outputString = '';

            outputString = __this.parseDateString(e.currentTarget.value);

            if (outputString !== '' && moment(outputString).isValid()) {
                if (new Date() > new Date(outputString))
                    __this.endDate = moment(new Date()).format('L');
                else
                    __this.endDate = outputString;

                __this.$endDate.datepicker('update', __this.endDate);
                // have to change the date part of the time because the date is changed ..
                __this.endTime = __this.$endTime.timepicker('getTime', new Date(__this.endDate));
                
                //setting the start date of end datepicker with the start date so that we cannot select a date less than than the start date.
                __this.$startDate.datepicker('setEndDate', __this.endDate);
            } else {
                if (__this.endDate)
                    __this.$endDate.datepicker('update', new Date(__this.endDate));
                else
                    __this.$endDate.datepicker('update', '');
            }
            __this.validate(__this);
        });
    }


    set8HourRule(): void {
        let institution = _.find(JSON.parse(this.auth.institutions), { 'InstitutionId': this.testScheduleModel.institutionId });
        if (institution)
            this.ignore8HourRule = !institution.IsIpBlank;

        if (this.ignore8HourRule)
            return;

        let __this = this;
        let url = `${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.test.openintegratedtests}`;
        let openIntegratedTestsPromise = this.testService.getOpenIntegratedTests(url);
        openIntegratedTestsPromise.then((response) => {
            return response.json();
        })
            .then((json) => {
                this.ignore8HourRule = _.contains(json, __this.testScheduleModel.testId);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    onKeyUpDate($date: any, e: any): boolean {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 9 || keyCode === 13 || keyCode === 27)
            return true;
        $($date).datepicker('show');
        return true;
    }

    onKeyUpTime($time: any, e: any): boolean {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 9 || keyCode === 13 || keyCode === 27)
            return true;
        $($time).timepicker('show');
        return true;
    }


    validate(__this): boolean {
        // console.log(__this.endTime);
        // console.log(__this.startTime);
        // console.log(moment.duration(moment(__this.endTime).diff(moment(__this.startTime))));
        // console.log(moment.duration(100));
        // console.log(moment(__this.startDate).isValid());
        // console.log(moment(__this.startTime).isValid());
        // console.log(moment(__this.endDate).isValid());
        // console.log(moment(__this.endTime).isValid());
        // console.log(__this.startDate + '--' + __this.startTime);
        // console.log(__this.endDate + '--' + __this.endTime);
        // console.log(moment(new Date(__this.startTime)).isAfter(new Date(__this.endTime))); 
        
        if (!(moment(__this.startDate).isValid() || moment(__this.endDate).isValid() || moment(__this.startTime).isValid() || moment(__this.endTime).isValid())) {
            console.log('invalid date/time');
            return;
        }

        if (moment(__this.startTime).isAfter(__this.endTime)) {
            console.log(__this.startTime, __this.endTime);
            
            console.log('endtime less than starttime');
            return;
        }


        if (!__this.ignore8HourRule) {
            let duration = moment.duration(moment(__this.endTime).diff(moment(__this.startTime)));
            let years = duration.years();
            let months = duration.months();
            let days = duration.days();
            let hours = duration.hours();
            let minutes = duration.minutes();
            let seconds = duration.seconds();
            let milliseconds = duration.milliseconds();
            if (years > 0 || months > 0 || days > 0 || hours > 8) {
                __this.invalid8hours = true;
                return;
            }

            if (hours === 8) {
                if (minutes > 0 || seconds > 0 || milliseconds > 0) {
                    this.invalid8hours = true;
                    return;
                }
            }


        }

        return true;
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