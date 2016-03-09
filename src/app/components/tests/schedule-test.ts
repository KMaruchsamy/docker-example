import {Component, OnInit} from 'angular2/core';
import {Router, CanDeactivate, OnDeactivate, ComponentInstruction, RouteParams} from 'angular2/router';
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
import {ConfirmationPopup} from '../shared/confirmation.popup';
import {AlertPopup} from '../shared/alert.popup';
import '../../plugins/bootstrap-datepicker-1.5.min.js';
import '../../plugins/jquery.timepicker.js';
import '../../lib/modal.js';

@Component({
    selector: 'schedule-test',
    templateUrl: '../../templates/tests/schedule-test.html',
    providers: [TestService, Auth, TestScheduleModel, Common],
    directives: [PageHeader, TestHeader, PageFooter, NgIf, ConfirmationPopup, AlertPopup]
})
export class ScheduleTest implements OnInit, CanDeactivate, OnDeactivate {
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
    attemptedRoute: string;
    overrideRouteCheck: boolean = false;
    modify: boolean = false;
    constructor(public testScheduleModel: TestScheduleModel,
        public testService: TestService, public auth: Auth, public router: Router, public common: Common, public routeParams: RouteParams) {
    }

    onCancelChanges(): void {
        this.overrideRouteCheck = true;
        this.testService.clearTestScheduleObjects();
        this.router.parent.navigate(['/ManageTests']);
    }

    onContinueMakingChanges(): void {
        // continue making changes after confirmation popup..
    }

    routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(next.urlPath)));
        if (!this.overrideRouteCheck) {
            if (outOfTestScheduling) {
                this.attemptedRoute = next.urlPath;
                $('#confirmationPopup').modal('show');
                return false;
            }
        }
        if (outOfTestScheduling) {
            this.startDate = null;
            this.endDate = null;
            this.sStorage.removeItem('testschedule');
            this.$startDate.datepicker({ defaultViewDate: moment(new Date()).format('L') });
            this.$endDate.datepicker({ defaultViewDate: moment(new Date()).format('L') });
        }

        this.overrideRouteCheck = false;
        return true;
    }

    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    }

    ngOnInit(): void {
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else {
            this.$startDate = $('#startDate');
            this.$endDate = $('#endDate');
            this.$startTime = $('#startTime');
            this.$endTime = $('#endTime');
            let action = this.routeParams.get('action');
            if (action != undefined && action.trim() === 'modify')
                this.modify = true;
        }


        this.bindEvents();
        this.initialize();
        this.initializeControls();
        this.set8HourRule();
        $(document).scrollTop(0);
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
        else {
            this.$startDate.datepicker({ defaultViewDate: moment(new Date()).format('L') });
            this.$startDate.datepicker('update', '');
            this.$endDate.datepicker('setStartDate', moment(new Date()).format('L'));
        }


        if (this.endDate)
            this.$endDate.datepicker('update', this.endDate);
        else {
            this.$endDate.datepicker({ defaultViewDate: moment(new Date()).format('L') });
            this.$endDate.datepicker('update', '');
        }
     
        if (this.startTime)
            this.$startTime.timepicker('setTime', new Date(this.startTime));
        else
            this.$startTime.timepicker('setTime', '');

        if (this.endTime)
            this.$endTime.timepicker('setTime', new Date(this.endTime));
        else
            this.$endTime.timepicker('setTime', '');
    }


    roundMinTime(dtDate: Date): Date {
        let hour = moment(dtDate).hour();
        let minute = moment(dtDate).minute();
        if (minute >= 30)
            minute = 30
        else
            minute = 0
        return moment(dtDate)
            .hour(hour)
            .minute(minute)
            .second(0)
            .toDate();
    }


    bindEvents(): void {

        let __this = this;
        this.$startTime.timepicker({
            'timeFormat': 'g:ia',
            'minTime': this.roundMinTime(new Date()),
            'maxTime': moment(this.roundMinTime(new Date())).endOf('day').toDate(),
            'disableTouchKeyboard': true
        }).on('change', function(e) {
            if (e.currentTarget.value) {
                let startTime;
                if (__this.startDate) {
                    startTime = __this.$startTime.timepicker('getTime', new Date(__this.startDate));
                    if (startTime && moment(startTime).isValid()) {
                        __this.startTime = startTime;

                        if (moment(__this.startTime).isAfter(new Date()))
                            __this.$endTime.timepicker('option', 'minTime', new Date(moment(__this.startTime).add(30, 'minutes').format()));

                        if (!__this.endTime) {
                            if (moment(__this.startTime).isAfter(new Date()))
                                __this.endTime = moment(__this.startTime).add(3, 'hours').format();
                            else
                                __this.endTime = moment(new Date()).add(3, 'hours').format();
                            __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                            __this.endDate = moment(new Date(__this.endTime)).format('L');
                            __this.$endDate.datepicker('update', __this.endDate);
                        }
                        else {
                            if (moment(__this.startTime).isAfter(__this.endTime) || moment(__this.startTime).isSame(__this.endTime)) {
                                __this.endTime = moment(__this.startTime).add(30, 'minutes').format();
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

                        if (moment(__this.startTime).isAfter(new Date()))
                            __this.$endTime.timepicker('option', 'minTime', new Date(moment(__this.startTime).add(30, 'minutes').format()));

                        if (!__this.endTime) {
                            if (moment(__this.startTime).isAfter(new Date()))
                                __this.endTime = moment(new Date(__this.startTime)).add(3, 'hours').format();
                            else
                                __this.endTime = moment(new Date()).add(3, 'hours').format();
                            __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                        }
                        else {
                            if (moment(__this.startTime).isAfter(__this.endTime) || moment(__this.startTime).isSame(__this.endTime)) {
                                if (moment(__this.startTime).isAfter(new Date()))
                                    __this.endTime = moment(__this.startTime).add(30, 'minutes').format();
                                else
                                    __this.endTime = moment(new Date()).add(30, 'minutes').format();
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
            __this.$endTime.timepicker('option', 'durationTime', moment(__this.startTime).toDate());
            __this.validate(__this);
        });

        this.$endTime.timepicker({
            'showDuration': true,
            'timeFormat': 'g:ia',
            'minTime': this.roundMinTime(moment(new Date()).add(30, 'minutes').toDate()),
            'maxTime': moment(this.roundMinTime(moment(new Date()).add(30, 'minutes').toDate())).endOf('day').toDate(),
            'disableTouchKeyboard': true
        }).on('change', function(e) {
            if (e.currentTarget.value) {
                let endTime;
                let minEndTime = moment(new Date()).add(30, 'minutes').format();
                if (__this.endDate) {
                    endTime = __this.$endTime.timepicker('getTime', new Date(__this.endDate));
                    // if (moment(endTime).isBefore(minEndTime))
                    //     endTime =new Date(minEndTime);
                    
                    if (endTime && moment(endTime).isValid()) {
                        __this.endTime = endTime;
                        if (!__this.startTime) {
                            if (moment(__this.endTime).isBefore(minEndTime)) {
                                __this.endTime = minEndTime;
                                __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                            }
                            __this.startTime = moment(__this.endTime).subtract(3, 'hours').format();
                            __this.$startTime.timepicker('setTime', new Date(__this.startTime));
                            __this.$endTime.timepicker('option', 'minTime', __this.startTime);
                        }
                        else {
                            if (moment(__this.startTime).isAfter(__this.endTime) || moment(__this.startTime).isSame(__this.endTime)) {
                                if (moment(__this.endTime).isBefore(minEndTime)) {
                                    __this.endTime = minEndTime;
                                    __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                                }
                                else {
                                    __this.endTime = moment(__this.startTime).add(30, 'minutes').format();
                                    __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                                }

                            }
                            else {
                                if (moment(__this.endTime).isBefore(minEndTime)) {
                                    __this.endTime = minEndTime;
                                    __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                                }
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
                    //  if (moment(endTime).isBefore(minEndTime))
                    //     endTime =new Date(minEndTime);
                    if (endTime && moment(endTime).isValid()) {
                        __this.endTime = endTime;
                        if (!__this.startTime) {
                            if (moment(__this.endTime).isBefore(minEndTime)) {
                                __this.endTime = minEndTime;
                                __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                            }
                            __this.startTime = moment(new Date(__this.endTime)).subtract(3, 'hours').format();
                            __this.$startTime.timepicker('setTime', new Date(__this.startTime));
                            __this.$endTime.timepicker('option', 'minTime', __this.startTime);
                        }
                        else {
                            if (moment(__this.startTime).isAfter(__this.endTime) || moment(__this.startTime).isSame(__this.endTime)) {
                                if (moment(__this.endTime).isBefore(minEndTime)) {
                                    __this.endTime = minEndTime;
                                    __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                                }
                                else {
                                    __this.endTime = moment(__this.startTime).add(30, 'minutes').format();
                                    __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                                }
                            }
                            else {
                                if (moment(__this.endTime).isBefore(minEndTime)) {
                                    __this.endTime = minEndTime;
                                    __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                                }
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

            if (__this.startTime)
                __this.$endTime.timepicker('option', 'durationTime', moment(__this.startTime).toDate());
            __this.validate(__this);
        });


        this.$startDate.datepicker({
            format: 'mm/dd/yyyy',
            autoclose: true,
            todayHighlight: true,
            forceParse: false,
            startDate: new Date(),
            orientation: 'bottom',
            'disableTouchKeyboard': true
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

            if (moment(__this.startDate).isAfter(new Date())) {
                __this.$startTime.timepicker('option', 'minTime', '8:00am');
                if (__this.startTime && __this.endTime && moment(__this.startTime).isSame(__this.endTime, 'day'))
                    __this.$endTime.timepicker('option', 'minTime', __this.roundMinTime(moment(__this.startTime).add(30, 'minutes').toDate()));
                else
                    __this.$endTime.timepicker('option', 'minTime', '8:30am');
            }
            else {
                __this.$startTime.timepicker('option', 'minTime', __this.roundMinTime(new Date()));
                if (__this.startTime)
                    __this.$endTime.timepicker('option', 'minTime', __this.roundMinTime(moment(__this.startTime).add(30, 'minutes').toDate()));
                else
                    __this.$endTime.timepicker('option', 'minTime', __this.roundMinTime(moment(new Date()).add(30, 'minutes').toDate()));
            }


            __this.validate(__this);
        });

        this.$endDate.datepicker({
            format: 'mm/dd/yyyy',
            autoclose: true,
            todayHighlight: true, //highlights today's date
            startDate: new Date(),
            forceParse: false,
            orientation: 'bottom',
            'disableTouchKeyboard': true
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
                    let minEndTime = moment(new Date()).add(30, 'minutes').format();
                    if (moment(__this.endTime).isBefore(minEndTime)) {
                        __this.endTime = minEndTime;
                        __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                    }



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

            if (moment(__this.endDate).isAfter(new Date())) {
                if (__this.startTime && moment(__this.startTime).isSame(__this.endTime, 'day'))
                    __this.$endTime.timepicker('option', 'minTime', __this.roundMinTime(moment(__this.startTime).add(30, 'minutes').toDate()));
                else {
                    if (__this.startDate && moment(__this.startDate).isAfter(new Date(), 'day'))
                        __this.$startTime.timepicker('option', 'minTime', '8:00am');
                    else
                        __this.$startTime.timepicker('option', 'minTime', __this.roundMinTime(new Date()));
                    __this.$endTime.timepicker('option', 'minTime', '8:30am');
                }

            }
            else {
                if (__this.startTime)
                    __this.$endTime.timepicker('option', 'minTime', __this.roundMinTime(moment(__this.startTime).add(30, 'minutes').toDate()));
                else
                    __this.$endTime.timepicker('option', 'minTime', __this.roundMinTime(moment(new Date()).add(30, 'minutes').toDate()));
            }
            __this.validate(__this);
        });

    }


    set8HourRule(): void {
        let institution = _.find(JSON.parse(this.auth.institutions), { 'InstitutionId': this.testScheduleModel.institutionId });
        if (institution)
            this.ignore8HourRule = !institution.IsIpBlank;

        if (this.ignore8HourRule) {
            this.validate(this);
            return;
        }


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
                __this.validate(__this);
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
          if (!this.validateDates())
            return;
        
        if (this.startTime !== undefined && moment(this.startTime).isValid() && this.endTime != undefined && moment(this.endTime).isValid()) {
            this.testScheduleModel.scheduleStartTime = new Date(this.startTime);
            this.testScheduleModel.scheduleEndTime = new Date(this.endTime);
            this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
            if (this.modify)
                this.router.navigate(['/ModifyAddStudents', { action: 'modify' }]);
            else
                this.router.navigate(['/AddStudents']);
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


//     validateDates(): boolean {
//         if (this.testScheduleModel) {
// 
//             if (this.testScheduleModel.scheduleStartTime && this.testScheduleModel.scheduleEndTime) {
// 
//                 let institutionOffset = 0;
//                 if (this.testScheduleModel.institutionId && this.testScheduleModel.institutionId > 0) {
//                     institutionOffset = this.common.getOffsetInstitutionTimeZone(this.testScheduleModel.institutionId);
//                 }
// 
//                 let scheduleStartTime = moment(new Date(
//                     moment(this.testScheduleModel.scheduleStartTime).year(),
//                     moment(this.testScheduleModel.scheduleStartTime).month(),
//                     moment(this.testScheduleModel.scheduleStartTime).date(),
//                     moment(this.testScheduleModel.scheduleStartTime).hour(),
//                     moment(this.testScheduleModel.scheduleStartTime).minute(),
//                     moment(this.testScheduleModel.scheduleStartTime).second()
//                 )).format('YYYY-MM-DD HH:mm:ss');
// 
// 
//                 let scheduleEndTime = moment(new Date(
//                     moment(this.testScheduleModel.scheduleEndTime).year(),
//                     moment(this.testScheduleModel.scheduleEndTime).month(),
//                     moment(this.testScheduleModel.scheduleEndTime).date(),
//                     moment(this.testScheduleModel.scheduleEndTime).hour(),
//                     moment(this.testScheduleModel.scheduleEndTime).minute(),
//                     moment(this.testScheduleModel.scheduleEndTime).second()
//                 )).format('YYYY-MM-DD HH:mm:ss');
// 
// 
//                 if (institutionOffset !== 0) {
//                     scheduleStartTime = moment(scheduleStartTime).add((-1) * institutionOffset, 'hour').format('YYYY-MM-DD HH:mm:ss');
//                     scheduleEndTime = moment(scheduleEndTime).add((-1) * institutionOffset, 'hour').format('YYYY-MM-DD HH:mm:ss');
//                 }                
//                 
//                 if (this.modify) {
//                     if (moment(scheduleStartTime).isBefore(new Date())) {
//                         $('#alertPopup').modal('show');
//                         return false;
//                     }
//                 }
//                 else {
//                     if (moment(scheduleStartTime).isBefore(new Date())) {
//                         $('#alertPopup').modal('show');
//                         return false;
//                     }
//                 }
//             }
//         }
//         return true;
//     }



    resolveScheduleURL(url: string, scheduleId: number): string {
        return url.replace('§scheduleId', scheduleId.toString());
    }

    validateDates(): boolean {
        if (this.testScheduleModel) {

            if (this.testScheduleModel.scheduleStartTime && this.testScheduleModel.scheduleEndTime) {

                let scheduleEndTime = moment(new Date(
                    moment(this.testScheduleModel.scheduleEndTime).year(),
                    moment(this.testScheduleModel.scheduleEndTime).month(),
                    moment(this.testScheduleModel.scheduleEndTime).date(),
                    moment(this.testScheduleModel.scheduleEndTime).hour(),
                    moment(this.testScheduleModel.scheduleEndTime).minute(),
                    moment(this.testScheduleModel.scheduleEndTime).second()
                )).format('YYYY-MM-DD HH:mm:ss');
                
                if (this.modify) {
                    let scheduleURL = this.resolveScheduleURL(`${this.common.getApiServer()}${links.api.baseurl}${links.api.admin.test.viewtest}`, this.testScheduleModel.scheduleId);
                    let status = this.testService.getTestStatus(scheduleURL);
                    if (status==='completed' || status === 'inprogress') {
                        $('#alertPopup').modal('show');
                        return false;
                    }
                }
                else {
                    if (moment(scheduleEndTime).isBefore(new Date(),'day')) {
                        $('#alertPopup').modal('show');
                        return false;
                    }
                }
            }
        }
        return true;
    }

    
    onOKAlert(): void {
        $('#alertPopup').modal('hide');
        this.overrideRouteCheck = true;
        this.router.navigate(['ManageTests']);
    }


    onCancelConfirmation(e: any): void {
        $('#confirmationPopup').modal('hide');
        this.attemptedRoute = '';
    }
    onOKConfirmation(e: any): void {
        $('#confirmationPopup').modal('hide');
        this.overrideRouteCheck = true;
        this.router.navigateByUrl(this.attemptedRoute);
    }

}