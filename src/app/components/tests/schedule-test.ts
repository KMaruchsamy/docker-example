import {Component, OnInit, AfterViewInit, ViewEncapsulation, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute, CanDeactivate, RoutesRecognized} from '@angular/router';
import {NgIf, Location} from '@angular/common';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';
import {Title} from '@angular/platform-browser';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {links} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestHeader} from './test-header';
import * as _ from 'lodash';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {ConfirmationPopup} from '../shared/confirmation.popup';
import {AlertPopup} from '../shared/alert.popup';
import {Observable, Subscription} from 'rxjs/Rx';
import {Response} from '@angular/http';
import {Utility} from '../../scripts/utility';
import {TestingSessionStartingPopup} from '../tests/test-starting-popup';
import {StudentsStartedTest} from './students-started-test.popup';
import {TestStartedExceptionModal} from '../../models/test-started-exceptions.modal';
import {TimingExceptionsModal} from '../../models/timing-exceptions.modal';
import {TimeExceptionPopup} from './time-exception-popup';
import {SelfPayStudentPopup} from './self-pay-student-popup';
// import '../../plugins/bootstrap-datepicker-1.5.min.js';
// import '../../plugins/jquery.timepicker.js';
// import '../../lib/modal.js';

@Component({
    selector: 'schedule-test',
    templateUrl: 'templates/tests/schedule-test.html',
    styleUrls: ['../../css/bootstrap-editable.css', '../../css/bootstrap-editable-overrides.css', '../../css/jquery.timepicker.css', '../../css/schedule.css'],
    encapsulation: ViewEncapsulation.None,
    providers: [TestService, Auth, TestScheduleModel, Common, Utility, TestStartedExceptionModal, TimingExceptionsModal],
    directives: [PageHeader, TestHeader, PageFooter, NgIf, ConfirmationPopup, AlertPopup, TestingSessionStartingPopup, StudentsStartedTest, TimeExceptionPopup, SelfPayStudentPopup],
    pipes: [ParseDatePipe]
})
export class ScheduleTest implements OnInit, OnDestroy {
    institutionID: number;
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
    modifyInProgress: boolean = false;
    paramsSubscription: Subscription;
    destinationRoute: string;
    deactivateSubscription: Subscription;
    eightHourSubscription: Subscription;
    testStartedExceptions: Array<TestStartedExceptionModal>;
    timingExceptions: Array<TimingExceptionsModal>;
    studentPayExceptions: Array<TimingExceptionsModal>;
    constructor(private activatedRoute: ActivatedRoute, public testScheduleModel: TestScheduleModel,
        public testService: TestService, public auth: Auth, public router: Router, public common: Common, public aLocation: Location, public titleService: Title, private utility: Utility) {
    }



    ngOnInit(): void {

        this.deactivateSubscription = this.router
            .events
            .filter(event => event instanceof RoutesRecognized)
            .subscribe(event => {
                this.destinationRoute = event.urlAfterRedirects;
            });

        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else {
            this.$startDate = $('#startDate');
            this.$endDate = $('#endDate');
            this.$startTime = $('#startTime');
            this.$endTime = $('#endTime');

            this.paramsSubscription = this.activatedRoute.params.subscribe(params => {
                let action = params['action'];
                if (action != undefined && action.trim() === 'modify') {
                    this.modify = true;
                    this.titleService.setTitle('Modify: Schedule Test – Kaplan Nursing');
                } else {
                    this.titleService.setTitle('Schedule Test – Kaplan Nursing');
                }

                this.bindEvents();
                this.initialize();
                this.initializeControls();
                this.set8HourRule();
                this.testService.showTestStartingWarningModals(this.modify, this.testScheduleModel.institutionId, this.testScheduleModel.savedStartTime, this.testScheduleModel.savedEndTime);

                $(document).scrollTop(0);
            });
        }
    }


    onCancelChanges(): void {
        this.overrideRouteCheck = true;
        this.testService.clearTestScheduleObjects();
        this.router.navigate(['/tests']);
    }

    cancelStartingTestChanges(popupId): void {
        $('#' + popupId).modal('hide');
        this.onCancelChanges();
    }

    onContinueMakingChanges(): void {
        // continue making changes after confirmation popup..
    }

    canDeactivate(): Observable<boolean> | boolean {
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(this.destinationRoute)));
        if (!this.overrideRouteCheck) {
            if (outOfTestScheduling) {
                this.attemptedRoute = this.destinationRoute;
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

    ngOnDestroy(): void {
        if (this.paramsSubscription)
            this.paramsSubscription.unsubscribe();
        if (this.deactivateSubscription)
            this.deactivateSubscription.unsubscribe();
        if (this.eightHourSubscription)
            this.eightHourSubscription.unsubscribe();
    }

    initialize() {
        let savedSchedule = this.testService.getTestSchedule();
        if (savedSchedule) {
            this.testScheduleModel = savedSchedule;
            if (this.testScheduleModel.scheduleStartTime) {
                if (this.modify) {
                    if (!this.testScheduleModel.savedStartTime || this.testScheduleModel.savedStartTime == '')
                        this.testScheduleModel.savedStartTime = this.testScheduleModel.scheduleStartTime;
                }
                this.startDate = moment(this.testScheduleModel.scheduleStartTime).format('L');
                this.startTime = this.testScheduleModel.scheduleStartTime;
            }
            if (this.testScheduleModel.scheduleEndTime) {
                if (this.modify) {
                    if (!this.testScheduleModel.savedEndTime || this.testScheduleModel.savedEndTime == '')
                        this.testScheduleModel.savedEndTime = this.testScheduleModel.scheduleEndTime;
                }
                this.endDate = moment(this.testScheduleModel.scheduleEndTime).format('L');
                this.endTime = this.testScheduleModel.scheduleEndTime;
            }
        }

        if (this.modify) {
            let testStatus: number = this.testService.getTestStatusFromTimezone(this.testScheduleModel.institutionId, this.testScheduleModel.savedStartTime, this.testScheduleModel.savedEndTime);
            if (testStatus === 0)
                this.modifyInProgress = true;
        }

        this.testScheduleModel.currentStep = 2;
        this.testScheduleModel.activeStep = 2;
    }

    initializeControls() {
        if (this.startDate) {
            if (this.modifyInProgress) {
                if (moment(this.testScheduleModel.savedStartTime).isBefore(moment(new Date()))) {
                    this.$startDate.datepicker('setStartDate', moment(this.testScheduleModel.savedStartTime).format('L'));
                    let disabledDateArray = this.utility.getDateRangeArray(moment(this.testScheduleModel.savedStartTime).add(1, 'day'), new Date());
                    this.$startDate.datepicker('setDatesDisabled', disabledDateArray);
                }
            }
            this.$startDate.datepicker('update', this.startDate);
        }
        else {
            this.$startDate.datepicker({ defaultViewDate: moment(new Date()).format('L') });
            this.$startDate.datepicker('update', '');
            this.$endDate.datepicker('setStartDate', moment(new Date()).format('L'));
        }


        if (this.endDate) {
            this.$endDate.datepicker('update', this.endDate);
            if (this.modifyInProgress) {
                if (moment(this.testScheduleModel.savedStartTime).isAfter(new Date()))
                    this.$endDate.datepicker('setStartDate', moment(this.testScheduleModel.savedStartTime).toDate());
                else
                    this.$endDate.datepicker('setStartDate', moment(new Date()).toDate());
            }
        }
        else {
            this.$endDate.datepicker({ defaultViewDate: moment(new Date()).format('L') });
            this.$endDate.datepicker('update', '');
        }

        if (this.startTime)
            this.$startTime.timepicker('setTime', moment(this.startTime).toDate());
        else
            this.$startTime.timepicker('setTime', '');

        if (this.endTime)
            this.$endTime.timepicker('setTime', moment(this.endTime).toDate());
        else
            this.$endTime.timepicker('setTime', '');

        if (this.startTime)
            this.$endTime.timepicker('option', 'durationTime', this.roundMinTime(moment(this.startTime).toDate()));
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
            'disableTouchKeyboard': true,
            'selectOnBlur': false,
            'typeaheadHighlight': false
        }).on('change', function (e) {
            debugger;
            if (e.currentTarget.value) {
                let startTime;
                if (__this.startDate) {
                    startTime = __this.$startTime.timepicker('getTime', new Date(__this.startDate));



                    if (startTime && moment(startTime).isValid()) {
                        __this.startTime = startTime;

                        if (moment(__this.startTime).isAfter(new Date())) {
                            if (__this.modifyInProgress)
                                __this.$endTime.timepicker('option', 'minTime', __this.roundMinTime(moment(__this.startTime).toDate()));
                            else
                                __this.$endTime.timepicker('option', 'minTime', __this.roundMinTime(moment(__this.startTime).add(30, 'minutes').toDate()));
                        }
                        else {
                            if (__this.modifyInProgress) {
                                if (moment(startTime).isBefore(__this.testScheduleModel.savedStartTime)) {
                                    __this.$startTime.timepicker('setTime', moment(__this.testScheduleModel.savedStartTime).toDate());
                                }
                                __this.$endTime.timepicker('option', 'minTime', __this.roundMinTime(moment(new Date()).toDate()));
                            }
                            else
                                __this.$endTime.timepicker('option', 'minTime', __this.roundMinTime(moment(new Date()).add(30, 'minutes').toDate()));
                        }

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
                                if (__this.modifyInProgress) {
                                    __this.endTime = moment(__this.startTime).format();
                                    __this.$endTime.timepicker('setTime', moment(__this.endTime).toDate());
                                }
                                else {
                                    __this.endTime = moment(__this.startTime).add(30, 'minutes').format();
                                    __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                                }

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
                if (__this.modifyInProgress) {
                    __this.$startTime.timepicker('setTime', moment(__this.startTime).toDate());
                }
                else
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
            'disableTouchKeyboard': true,
            'selectOnBlur': false,
            'typeaheadHighlight': false
        }).on('change', function (e) {
            debugger;
            if (e.currentTarget.value) {
                let endTime;
                let minEndTime = moment(new Date()).add(30, 'minutes').format();
                let inProgressMinEndTime = moment(new Date()).format();
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
                                if (__this.modifyInProgress) {
                                    if (moment(__this.endTime).isBefore(inProgressMinEndTime))
                                        __this.endTime = moment(new Date()).format();
                                    else
                                        __this.endTime = __this.startTime;
                                    __this.$endTime.timepicker('setTime', moment(__this.endTime).toDate());
                                }
                                else {
                                    if (moment(__this.endTime).isBefore(minEndTime)) {
                                        __this.endTime = minEndTime;
                                        __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                                    }
                                    else {
                                        __this.endTime = moment(__this.startTime).add(30, 'minutes').format();
                                        __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                                    }
                                }
                            }
                            else {
                                if (__this.modifyInProgress) {
                                    if (moment(__this.endTime).isBefore(moment(new Date()))) {
                                        __this.endTime = moment(new Date()).format();
                                        __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                                    }
                                } else {
                                    if (moment(__this.endTime).isBefore(minEndTime)) {
                                        __this.endTime = minEndTime;
                                        __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                                    }
                                }
                            }
                        }
                    } else {

                        if (__this.modifyInProgress) {
                            __this.$endTime.timepicker('setTime', moment(__this.testScheduleModel.savedEndTime).toDate());
                        }
                        else {
                            if (!__this.endTime)
                                __this.$endTime.timepicker('setTime', '');
                            else
                                __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                        }

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
                if (__this.modifyInProgress)
                    __this.$endTime.timepicker('setTime', moment(__this.testScheduleModel.savedEndTime).toDate());
                else
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
        }).on('hide', function (e) {
            let outputString = '';
            debugger;
            if (e.currentTarget.value !== '') {
                outputString = __this.parseDateString(e.currentTarget.value);

                if (outputString !== '' && moment(outputString).isValid()) {


                    if (moment(outputString).isBefore(new Date(), 'day')) {
                        if (__this.modifyInProgress) {
                            if (moment(outputString).isSame(__this.testScheduleModel.savedStartTime, 'day'))
                                __this.startDate = __this.testScheduleModel.savedStartTime;
                        } else if (!__this.startDate)
                            __this.startDate = moment(new Date()).format('L');
                    }
                    else
                        __this.startDate = outputString;

                    __this.$startDate.datepicker('update', moment(__this.startDate).toDate());

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
                    if (__this.modifyInProgress) {
                        __this.$startDate.datepicker('update', moment(__this.testScheduleModel.savedStartTime).toDate());
                    } else if (__this.startDate)
                        __this.$startDate.datepicker('update', moment(__this.startDate).toDate());
                    else
                        __this.$startDate.datepicker('update', '');
                }
            }
            else {
                if (__this.modifyInProgress) {
                    __this.$startDate.datepicker('update', __this.testScheduleModel.savedStartTime);
                }
                else {
                    __this.startDate = '';
                    __this.startTime = __this.$startTime.timepicker('getTime', new Date());
                }
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
        }).on('hide', function (e) {
            debugger;
            let outputString = '';
            if (e.currentTarget.value !== '') {
                outputString = __this.parseDateString(e.currentTarget.value);

                //Check if the entered date string is valid .            
                if (outputString !== '' && moment(outputString).isValid()) {

                    if (__this.startDate) {
                        if (__this.startTime) {
                            let outputTimeString = __this.$endTime.timepicker('getTime', new Date(outputString));
                            if (moment(outputTimeString).isBefore(__this.startTime)) {
                                if (__this.modifyInProgress) {
                                    __this.endTime = moment(new Date()).format();
                                }
                                else {
                                    __this.endTime = moment(__this.startTime).add(30, 'minutes').format();
                                }
                                __this.$endTime.timepicker('setTime', moment(__this.endTime).toDate());
                                if (__this.modifyInProgress)
                                    __this.endDate = moment(new Date()).format('L');
                                else
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

                    if (__this.modifyInProgress) {
                        let minEndTime = moment(new Date()).format();
                        if (moment(__this.endTime).isBefore(minEndTime)) {
                            __this.endTime = minEndTime;
                            __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                        }
                    } else {
                        let minEndTime = moment(new Date()).add(30, 'minutes').format();
                        if (moment(__this.endTime).isBefore(minEndTime)) {
                            __this.endTime = minEndTime;
                            __this.$endTime.timepicker('setTime', new Date(__this.endTime));
                        }
                    }

                } else {

                    if (__this.modifyInProgress) {
                        __this.endDate = __this.testScheduleModel.savedEndTime;
                        __this.$endDate.datepicker('update', moment(__this.testScheduleModel.savedEndTime).toDate());
                    }
                    else {
                        if (__this.endDate)
                            __this.$endDate.datepicker('update', new Date(__this.endDate));
                        else
                            __this.$endDate.datepicker('update', '');
                    }

                }
            }
            else {

                if (__this.modifyInProgress) {
                    __this.endDate = __this.testScheduleModel.savedEndTime;
                    __this.$endDate.datepicker('update', moment(__this.testScheduleModel.savedEndTime).toDate());
                }
                else {
                    __this.endDate = '';
                    __this.endTime = __this.$endTime.timepicker('getTime', new Date());
                }

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
        let institution = _.find(JSON.parse(this.auth.institutions), { 'InstitutionId': +this.testScheduleModel.institutionId });
        if (institution)
            this.ignore8HourRule = !institution.IsIpBlank;

        if (this.ignore8HourRule) {
            this.validate(this);
            return;
        }


        let __this = this;
        let url = `${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.test.openintegratedtests}`;
        let openIntegratedTestsObservable: Observable<Response> = this.testService.getOpenIntegratedTests(url);
        this.eightHourSubscription = openIntegratedTestsObservable
            .map(response => response.json())
            .subscribe(json => {
                __this.ignore8HourRule = _.includes(json, __this.testScheduleModel.testId);
                __this.validate(__this);
            },
            error => {
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

        if (this.modifyInProgress
            && (moment(this.testScheduleModel.savedStartTime).isSame(this.startTime)
                && moment(this.testScheduleModel.savedEndTime).isSame(this.endTime))) {
            __this.valid = false;
            return;
        }

        __this.valid = true;
    }

    checkIfTestHasStarted(): number {
        return this.testService.checkIfTestHasStarted(this.testScheduleModel.institutionId, this.testScheduleModel.savedStartTime, this.testScheduleModel.savedEndTime, this.modifyInProgress)
    }

    saveDateTime(): boolean {
        //if modify flow, check first if test has already started
        if (this.modify) {
            this.checkIfTestHasStarted();
            if (!this.checkIfTestHasStarted()) {
                return false;
            }
        }

        if (!this.validateDates())
            return;

        if (this.startTime !== undefined && moment(this.startTime).isValid() && this.endTime != undefined && moment(this.endTime).isValid()) {
            this.testScheduleModel.scheduleStartTime = moment(this.startTime).toDate();
            this.testScheduleModel.scheduleEndTime = moment(this.endTime).toDate();
            if (this.modifyInProgress) {
                let closeSession: boolean = false;
                if (moment(this.testScheduleModel.scheduleEndTime).isSame(new Date(), 'minutes')) {
                    $('#endModifyInProgressSession').modal('show');
                    return;
                }
                this.saveModifyInProgress();
            }
            else {
                this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
                if (this.modify)
                    this.router.navigate(['/tests', 'modify', 'add-students']);
                else
                    this.router.navigate(['/tests/add-students']);
                return false;
            }
        }
    }



    resolveModifyTestingSessionURL(url: string): string {
        return url.replace('§scheduleId', (this.testScheduleModel.scheduleId ? this.testScheduleModel.scheduleId : 0).toString());
    }

    saveModifyInProgress(closeSession: boolean = false) {

        let input = {
            TestingSessionWindowStart: moment(this.testScheduleModel.scheduleStartTime).format(),
            TestingSessionWindowEnd: moment(this.testScheduleModel.scheduleEndTime).format()
        };

        let myNewStartDateTime2 = moment(new Date(
            moment(input.TestingSessionWindowStart).year(),
            moment(input.TestingSessionWindowStart).month(),
            moment(input.TestingSessionWindowStart).date(),
            moment(input.TestingSessionWindowStart).hour(),
            moment(input.TestingSessionWindowStart).minute(),
            moment(input.TestingSessionWindowStart).second()
        )).format('YYYY/MM/DD HH:mm:ss');

        let myNewEndDateTime2 = moment(new Date(
            moment(input.TestingSessionWindowEnd).year(),
            moment(input.TestingSessionWindowEnd).month(),
            moment(input.TestingSessionWindowEnd).date(),
            moment(input.TestingSessionWindowEnd).hour(),
            moment(input.TestingSessionWindowEnd).minute(),
            moment(input.TestingSessionWindowEnd).second()
        )).format('YYYY/MM/DD HH:mm:ss');

        input.TestingSessionWindowStart = myNewStartDateTime2;
        input.TestingSessionWindowEnd = myNewEndDateTime2;



        let scheduleTestObservable: Observable<Response>;
        let scheduleTestURL = '';
        scheduleTestURL = this.resolveModifyTestingSessionURL(`${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.test.updateScheduleDatesModifyInProgress}`);
        scheduleTestObservable = this.testService.updateScheduleDates(scheduleTestURL, JSON.stringify(input));

        let __this = this;
        scheduleTestObservable
            .map(response => response.json())
            .subscribe(json => {
                __this.valid = true;
                // clearTimeout(loaderTimer);
                // $('#loader').modal('hide');
                let result = json;
                if (result.TestingSessionId && result.TestingSessionId > 0
                    && result.ErrorCode === 0
                    && (!result.TimingExceptions || result.TimingExceptions.length === 0)
                    && (!result.TestAlreadyStartedExceptions || result.TestAlreadyStartedExceptions.length === 0)
                    && (!result.windowExceptions || result.windowExceptions.length === 0)
                    && (!result.alreadyStartedExceptions || result.alreadyStartedExceptions.length === 0)) {
                    // __this.testScheduleModel.scheduleId = result.TestingSessionId;
                    // __this.sStorage.setItem('testschedule', JSON.stringify(__this.testScheduleModel));
                    __this.overrideRouteCheck = true;
                    __this.router.navigate(['/tests']);
                }
                else if (closeSession) {
                    __this.overrideRouteCheck = true;
                    __this.router.navigate(['/tests']);
                }
                else
                    __this.handleExceptions(result, __this);

            }, error => {
                let json = error.json();
                if (!closeSession
                    && ((json.TimingExceptions && json.TimingExceptions.length > 0)
                        || (json.TestAlreadyStartedExceptions && json.TestAlreadyStartedExceptions.length > 0)
                        || (json.windowExceptions && json.windowExceptions.length > 0)
                        || (json.alreadyStartedExceptions && json.alreadyStartedExceptions.length > 0)))
                    __this.handleExceptions(json, __this);
                else
                    console.log(error);
            });
    }

    handleExceptions(result: any, __this: any) {
        __this.studentPayExceptions = [];
        __this.timingExceptions = [];
        __this.testStartedExceptions = [];
        console.log(result);
        if ((result.TimingExceptions && result.TimingExceptions.length > 0) || (result.windowExceptions && result.windowExceptions.length > 0)) {
            if (result.TimingExceptions && result.TimingExceptions.length > 0) {
                __this.studentPayExceptions = result.TimingExceptions;
            }
            else if (result.windowExceptions && result.windowExceptions.length > 0) {
                let studentPayEnabledInstitution: boolean;
                studentPayEnabledInstitution = __this.auth.isStudentPayEnabledInstitution(__this.testScheduleModel.institutionId);
                if (studentPayEnabledInstitution) {
                    __this.studentPayExceptions = _.filter(result.windowExceptions, { 'IgnoreExceptionIfStudentPay': true });
                    __this.timingExceptions = _.filter(result.windowExceptions, { 'IgnoreExceptionIfStudentPay': false });
                }
                else
                    __this.timingExceptions = result.windowExceptions
            }
        }
        if ((result.TestAlreadyStartedExceptions && result.TestAlreadyStartedExceptions.length > 0) || (result.alreadyStartedExceptions && result.alreadyStartedExceptions.length > 0)) {
            if (result.TestAlreadyStartedExceptions && result.TestAlreadyStartedExceptions.length > 0) {
                __this.testStartedExceptions = result.TestAlreadyStartedExceptions;
                $('#studentsStartedTest').modal('show');
            }
            else if (result.alreadyStartedExceptions && result.alreadyStartedExceptions.length > 0) {
                __this.testStartedExceptions = result.alreadyStartedExceptions;
                $('#studentsStartedTest').modal('show');
            }
        }
        else if (__this.timingExceptions && __this.timingExceptions.length > 0)
            $('#modalTimingException').modal('show');
        else if (__this.studentPayExceptions && __this.studentPayExceptions.length > 0)
            $('#selfPayStudentModal').modal('show');
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

        _.forEach(inputArr, function (value) {
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

    resolveScheduleURL(url: string, scheduleId: number): string {
        return url.replace('§scheduleId', scheduleId.toString());
    }

    validateDates(): boolean {
        if (this.testScheduleModel) {
            let institutionTimezone: string = this.common.getTimezone(this.testScheduleModel.institutionId);
            let institutionCurrentTime = moment.tz(new Date(), institutionTimezone).format('YYYY-MM-DD HH:mm:ss');

            if (this.startTime && this.endTime) {

                let scheduleEndTime = moment(new Date(
                    moment(this.endTime).year(),
                    moment(this.endTime).month(),
                    moment(this.endTime).date(),
                    moment(this.endTime).hour(),
                    moment(this.endTime).minute(),
                    moment(this.endTime).second()
                )).format('YYYY-MM-DD HH:mm:ss');

                let scheduleStartTime = moment(new Date(
                    moment(this.startTime).year(),
                    moment(this.startTime).month(),
                    moment(this.startTime).date(),
                    moment(this.startTime).hour(),
                    moment(this.startTime).minute(),
                    moment(this.startTime).second()
                )).format('YYYY-MM-DD HH:mm:ss');

                if (this.modify) {
                    if (this.testScheduleModel.savedStartTime) {
                        let savedStartTime = moment(new Date(
                            moment(this.testScheduleModel.savedStartTime).year(),
                            moment(this.testScheduleModel.savedStartTime).month(),
                            moment(this.testScheduleModel.savedStartTime).date(),
                            moment(this.testScheduleModel.savedStartTime).hour(),
                            moment(this.testScheduleModel.savedStartTime).minute(),
                            moment(this.testScheduleModel.savedStartTime).second()
                        )).format('YYYY-MM-DD HH:mm:ss');

                        let savedEndTime = moment(new Date(
                            moment(this.testScheduleModel.savedEndTime).year(),
                            moment(this.testScheduleModel.savedEndTime).month(),
                            moment(this.testScheduleModel.savedEndTime).date(),
                            moment(this.testScheduleModel.savedEndTime).hour(),
                            moment(this.testScheduleModel.savedEndTime).minute(),
                            moment(this.testScheduleModel.savedEndTime).second()
                        )).format('YYYY-MM-DD HH:mm:ss');
                    }
                } //closes if this.modify
                 // show The testing window you specified has expired and needs to be changed modal if end time is at least a minute before current time only
                if (moment(scheduleEndTime).isBefore(institutionCurrentTime, 'minute')) {
                    $('#alertPopup').modal('show');
                    return false;
                }
            }
        }
        return true;
    }

    onOKAlert(): void {
        $('#alertPopup').modal('hide');
        //this.overrideRouteCheck = true;
        //this.router.navigate(['ScheduleTest']);
    }


    onCancelConfirmation(popupId): void {
        $('#' + popupId).modal('hide');
        this.attemptedRoute = '';
    }
    onOKConfirmation(e: any): void {
        $('#confirmationPopup').modal('hide');
        this.overrideRouteCheck = true;
        this.router.navigateByUrl(this.attemptedRoute);
    }

    studentsStartedTestPopupOK(e): void {
        $('#studentsStartedTest').modal('hide');
        if (this.timingExceptions && this.timingExceptions.length > 0)
            $('#modalTimingException').modal('show');
        else if (this.studentPayExceptions && this.studentPayExceptions.length > 0)
            $('#selfPayStudentModal').modal('show');
        else {
            this.overrideRouteCheck = true;
            this.router.navigate(['/tests']);
        }
    }

    onCloseTimingExceptionsPopup(e): void {
        $('#modalTimingException').modal('hide');
        // if (this.studentPayExceptions && this.studentPayExceptions.length > 0)
        //     $('#selfPayStudentModal').modal('show');
        // else {
        //     this.overrideRouteCheck = true;
        //     this.router.navigate(['/tests']);
        // }
    }

    onCloseSelfPayExceptionsPopup(e): void {
        $('#selfPayStudentModal').modal('hide');
        this.overrideRouteCheck = true;
        this.router.navigate(['/tests']);
    }


    endSession(): void {
        $('#endModifyInProgressSession').modal('hide');
        this.saveModifyInProgress(true);
    }

    cancelEndSession(e): void {
        $('#endModifyInProgressSession').modal('hide');
    }
}