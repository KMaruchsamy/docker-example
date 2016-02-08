import {Component, OnInit} from 'angular2/core';
import {Router, OnDeactivate, ComponentInstruction} from 'angular2/router';
import {NgIf} from 'angular2/common';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {links} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestHeader} from './test-header';
import * as _ from '../../lib/index';
import {TestScheduleModel} from '../../models/testSchedule.model';
import '../../plugins/bootstrap-datepicker-1.5.min.js';
import '../../plugins/jquery.timepicker.js';

@Component({
    selector: 'schedule-test',
    templateUrl: '../../templates/tests/schedule-test.html',
    providers: [TestService, Auth, TestScheduleModel,Common],
    directives: [PageHeader, TestHeader, PageFooter, NgIf]
    // styleUrls: ['../../css/bootstrap-datepicker3.css', '../../css/jquery.timepicker.css']
})
export class ScheduleTest implements OnInit, OnDeactivate {
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
    sStorage: any;
    constructor(public testScheduleModel: TestScheduleModel,
        public testService: TestService, public auth: Auth, public router: Router, public common:Common) {
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else {
            this.$startDate = $('#startDate');
            this.$endDate = $('#endDate');
            this.$startTime = $('#startTime');
            this.$endTime = $('#endTime');
        }
    }

    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        let outOfTestScheduling:boolean = this.testService.outOfTestScheduling((this.auth.common.removeWhitespace(next.urlPath)));
        if (outOfTestScheduling) {
             this.sStorage.removeItem('testschedule');  
        }
    }

    ngOnInit(): void {
        this.bindEvents();
        this.initialize();
        this.initializeControls();
        this.set8HourRule();
       
    }

    initialize() {
        let savedSchedule = this.testService.getTestSchedule();
        if (savedSchedule) {
            this.testScheduleModel = savedSchedule;
            if (this.testScheduleModel.scheduleStartTime) {
                this.startDate = moment(this.testScheduleModel.scheduleStartTime).format('L');
                this.startTime = this.testScheduleModel.scheduleStartTime;
            }
            if (this.testScheduleModel.scheduleEndTime) {
                this.endDate = moment(this.testScheduleModel.scheduleEndTime).format('L');
                this.endTime = this.testScheduleModel.scheduleEndTime;
            }
        }

        if (this.testScheduleModel.currentStep < 2)
            this.testScheduleModel.currentStep = 2;
        this.testScheduleModel.activeStep = 2;
        
    }

    initializeControls() {
        if (this.startDate)
            this.$startDate.datepicker('update', this.startDate);
        else 
            this.$startDate.datepicker('update', '');        

        if (this.endDate)
            this.$endDate.datepicker('update', this.endDate);
        else
            this.$endDate.datepicker('update', '');
        if (this.startTime)
            this.$startTime.timepicker('setTime', new Date(this.startTime));
        else
            this.$startTime.timepicker('setTime', '');
        if (this.endTime)
            this.$endTime.timepicker('setTime', new Date(this.endTime));
        else
            this.$endTime.timepicker('setTime', '');
    }

    bindEvents(): void {

        let __this = this;
        this.$startTime.timepicker({
            'timeFormat': 'g:ia',
            'minTime': '8:00am'
        }).on('change', function(e) {
            if (e.currentTarget.value) {
                let startTime;
                if (__this.startDate) {
                    startTime = __this.$startTime.timepicker('getTime', new Date(__this.startDate));
                    if (startTime && moment(startTime).isValid()) {
                        __this.startTime = startTime;
                        __this.$endTime.timepicker('option', 'minTime', __this.startTime);
                        if (!__this.endTime) {
                            __this.endTime = moment(new Date(__this.startTime)).add(3, 'hours').format();
                            __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                            __this.endDate = moment(new Date(__this.endTime)).format('L');
                            __this.$endDate.datepicker('update', __this.endDate);
                        }
                        else {
                            if (moment(__this.startTime).isAfter(__this.endTime) || moment(__this.startTime).isSame(__this.endTime)) {
                                __this.endTime = moment(__this.startTime).add(15, 'minutes').format();
                                __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                            }
                        }
                    } else {
                        if (!__this.startTime)
                            __this.$startTime.timepicker('setTime', '');
                        else
                            __this.$startTime.timepicker('setTime', new Date(__this.startTime));
                    }
                }
                else {
                    startTime = __this.$startTime.timepicker('getTime', new Date());
                    if (startTime && moment(startTime).isValid()) {
                        __this.startTime = startTime;
                        __this.$endTime.timepicker('option', 'minTime', __this.startTime);
                        if (!__this.endTime) {
                            __this.endTime = moment(new Date(__this.startTime)).add(3, 'hours').format();
                            __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                        }
                        else {
                            if (moment(__this.startTime).isAfter(__this.endTime) || moment(__this.startTime).isSame(__this.endTime)) {
                                __this.endTime = moment(__this.startTime).add(15, 'minutes').format();
                                __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                            }
                        }
                    }
                    else {
                        if (!__this.startTime)
                            __this.$startTime.timepicker('setTime', '');
                        else
                            __this.$startTime.timepicker('setTime', new Date(__this.startTime));
                    }
                }

            }
            else {
                __this.startTime = '';
            }

            __this.validate(__this);
        });

        this.$endTime.timepicker({
            'showDuration': true,
            'timeFormat': 'g:ia',
            'minTime': '8:00am'
        }).on('change', function(e) {
            if (e.currentTarget.value) {
                let endTime;
                if (__this.endDate) {
                    endTime = __this.$endTime.timepicker('getTime', new Date(__this.endDate));
                    if (endTime && moment(endTime).isValid()) {
                        __this.endTime = endTime;
                        if (!__this.startTime) {
                            __this.startTime = moment(new Date(__this.endTime)).subtract(3, 'hours').format();
                            __this.$startTime.timepicker('setTime', new Date(__this.startTime));
                            __this.$endTime.timepicker('option', 'minTime', __this.startTime);
                        }
                        else {
                            if (moment(__this.startTime).isAfter(__this.endTime) || moment(__this.startTime).isSame(__this.endTime)) {
                                __this.endTime = moment(__this.startTime).add(15, 'minutes').format();
                                __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                            }
                        }
                    } else {
                        if (!__this.endTime)
                            __this.$endTime.timepicker('setTime', '');
                        else
                            __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                    }
                } else {
                    endTime = __this.$endTime.timepicker('getTime', new Date());
                    if (endTime && moment(endTime).isValid()) {
                        __this.endTime = endTime;
                        if (!__this.startTime) {
                            __this.startTime = moment(new Date(__this.endTime)).subtract(3, 'hours').format();
                            __this.$startTime.timepicker('setTime', new Date(__this.startTime));
                            __this.$endTime.timepicker('option', 'minTime', __this.startTime);
                        }
                        else {
                            if (moment(__this.startTime).isAfter(__this.endTime) || moment(__this.startTime).isSame(__this.endTime)) {
                                __this.endTime = moment(__this.startTime).add(15, 'minutes').format();
                                __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                            }
                        }
                    }
                    else {
                        if (!__this.endTime)
                            __this.$endTime.timepicker('setTime', '');
                        else
                            __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                    }
                }
            }
            else {
                __this.endTime = '';
            }
            __this.validate(__this);
        });


        this.$startDate.datepicker({
            format: 'mm/dd/yyyy',
            autoclose: true,
            todayHighlight: true,
            forceParse: false,
            startDate: new Date(),
            orientation: 'bottom'
        }).on('hide', function(e) {
            let outputString = '';

            if (e.currentTarget.value !== '') {
                outputString = __this.parseDateString(e.currentTarget.value);

                if (outputString !== '' && moment(outputString).isValid()) {

                    if (moment(outputString).isBefore(new Date(), 'day')) {
                        if (!__this.startDate)
                            __this.startDate = moment(new Date()).format('L');
                    }
                    else
                        __this.startDate = outputString;

                    __this.$startDate.datepicker('update', __this.startDate);
                
                
                    // have to change the date part of the time because the date is changed ..
                    __this.startTime = __this.$startTime.timepicker('getTime', new Date(__this.startDate));

                    //Auto populate the enddate only if the enddate is null or the very first time .                
                    if (!__this.endDate) {
                        __this.endDate = __this.startDate;
                        __this.$endDate.datepicker('update', __this.endDate);
                        // have to change the date part of the time because the date is changed ..
                        __this.endTime = __this.$endTime.timepicker('getTime', new Date(__this.endDate));
                        // __this.$startDate.datepicker('setEndDate', __this.endDate);
                    }
                    else if (moment(__this.startDate).isAfter(__this.endDate)) {
                        // in case if the user startdate that is greater than the end date .
                        __this.endDate = __this.startDate;
                        __this.$endDate.datepicker('update', __this.startDate);
                        // have to change the date part of the time because the date is changed ..
                        __this.endTime = __this.$endTime.timepicker('getTime', new Date(__this.endDate));
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
            }
            else {
                __this.startDate = '';
                __this.startTime = __this.$startTime.timepicker('getTime', new Date());
            }

            __this.validate(__this);
        });

        this.$endDate.datepicker({
            format: 'mm/dd/yyyy',
            autoclose: true,
            todayHighlight: true, //highlights today's date
            startDate: new Date(),
            forceParse: false,
            orientation: 'bottom'
        }).on('hide', function(e) {
            let outputString = '';

            if (e.currentTarget.value !== '') {
                outputString = __this.parseDateString(e.currentTarget.value);

                //Check if the entered date string is valid .            
                if (outputString !== '' && moment(outputString).isValid()) {

                    if (__this.startDate) {
                        if (__this.startTime) {
                            let outputTimeString = __this.$endTime.timepicker('getTime', new Date(outputString));
                            if (moment(outputTimeString).isBefore(__this.startTime)) {
                                __this.endTime = moment(__this.startTime).add(15, 'minutes').format();
                                __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                                __this.endDate = moment(__this.startTime).format('L');
                            }
                            else {
                                __this.endDate = moment(outputString).format('L');
                            }
                        }
                        else {
                            if (moment(outputString).isBefore(__this.startDate)) {
                                if (!__this.endDate)
                                    __this.endDate = __this.startDate;
                                else
                                    __this.endDate = __this.startDate;
                            }
                            else {
                                __this.endDate = moment(outputString).format('L');
                            }
                        }
                    }
                    else {
                        if (moment(outputString).isBefore(new Date(), 'day')) {
                            if (!__this.endDate)
                                __this.endDate = moment(new Date()).format('L');

                        }
                        else {
                            __this.endDate = moment(outputString).format('L');
                        }
                            
                        //Auto populate the startdate only if it is null or the very first time . 
                        __this.startDate = __this.endDate;
                        __this.$startDate.datepicker('update', __this.startDate);
                        // have to change the date part of the time because the date is changed ..
                        __this.startTime = __this.$startTime.timepicker('getTime', new Date(__this.startDate));
                        // __this.$startDate.datepicker('setEndDate', __this.endDate);
                    }


                    __this.$endDate.datepicker('update', __this.endDate);
                    // have to change the date part of the time because the date is changed ..
                    __this.endTime = __this.$endTime.timepicker('getTime', new Date(__this.endDate));


                } else {
                    if (__this.endDate)
                        __this.$endDate.datepicker('update', new Date(__this.endDate));
                    else
                        __this.$endDate.datepicker('update', '');
                }
            }
            else {
                __this.endDate = '';
                __this.endTime = __this.$endTime.timepicker('getTime', new Date());
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
                __this.ignore8HourRule = _.contains(json, __this.testScheduleModel.testId);
                __this.validate(__this);
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
        __this.invalid8hours = false;

        if (__this.startDate === undefined || __this.startTime === undefined || __this.endDate === undefined || __this.endTime === undefined) {
            __this.valid = false;
            return;
        }

        if (!moment(__this.startDate).isValid() ||
            !moment(__this.endDate).isValid() ||
            !moment(__this.startTime).isValid() ||
            !moment(__this.endTime).isValid()) {
            __this.valid = false;
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
                __this.valid = false;
                return;
            }

            if (hours === 8) {
                if (minutes > 0 || seconds > 0 || milliseconds > 0) {
                    __this.invalid8hours = true;
                    __this.valid = false;
                    return;
                }
            }
            __this.invalid8hours = false;
        }

        if (moment(__this.startTime).isAfter(__this.endTime)) {
            __this.valid = false;
            return;
        }

        __this.valid = true;
    }


    saveDateTime(): boolean {
        if (this.startTime !== undefined && moment(this.startTime).isValid() && this.endTime != undefined && moment(this.endTime).isValid()) {
            this.testScheduleModel.scheduleStartTime = new Date(this.startTime);
            this.testScheduleModel.scheduleEndTime = new Date(this.endTime);
            this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
            this.router.parent.navigateByUrl('/tests/add-students');
            return false;
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
        else if (inputDate.indexOf('-') > -1)
            inputArr = inputDate.split('-');
        else if (inputDate.indexOf('.') > -1)
            inputArr = inputDate.split('.');
        else if (inputDate.indexOf(' ') > -1)
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
                if (dateNumber.toString().length === 2)
                    year = (dateNumber + 2000).toString();
                else if (dateNumber.toString().length === 4)
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