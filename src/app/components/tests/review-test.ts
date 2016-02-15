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
import {RetesterAlternatePopup} from './retesters-alternate-popup';
import {RetesterNoAlternatePopup} from './retesters-noalternate-popup';
import {ConfirmationPopup} from '../shared/confirmation.popup';
import '../../plugins/dropdown.js';
import '../../plugins/bootstrap-select.min.js';
import '../../plugins/jquery.dataTables.min.js';
import '../../plugins/dataTables.responsive.js';
import '../../lib/modal.js';

@Component({
    selector: "review-test",
    templateUrl: "../../templates/tests/review-test.html",
    providers: [TestService, Auth, TestScheduleModel, Common],
    directives: [PageHeader, TestHeader, PageFooter, NgIf, NgFor, RouterLink, RetesterAlternatePopup, RetesterNoAlternatePopup, ConfirmationPopup],
    pipes: [ParseDatePipe]
})

export class ReviewTest implements OnInit, OnDeactivate, CanDeactivate {
    testScheduleWindow: string = '';
    isScheduleDatesSame: boolean = true;
    testScheduleDates: string = '';
    testScheduleTimes: string = '';
    faculty: Object[] = [];
    sStorage: any;
    valid: boolean;
    studentsTable: any;
    hasAlternateTests: boolean;
    loaderPromise: any;
    $ddlfacultyMember: any;
    $txtScheduleName: any;
    loader: any;
    attemptedRoute: string;
    overrideRouteCheck: boolean = false;
    constructor(public testScheduleModel: TestScheduleModel,
        public testService: TestService, public auth: Auth, public common: Common,
        public router: Router, public dynamicComponentLoader: DynamicComponentLoader, public elementRef: ElementRef) {
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
            this.initialize();
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
        if (outOfTestScheduling)
            this.sStorage.removeItem('testschedule');
        this.overrideRouteCheck = false;
        return true;
    }

    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        if (this.studentsTable)
            this.studentsTable.destroy();
        $('#ddlFaculty').val('').selectpicker('refresh');
    }

    ngOnInit() {
        this.bindFaculty();
        this.onInput(this.$txtScheduleName.val(), this.$ddlfacultyMember.val());
    }


    initialize() {
        this.valid = false;
        this.sStorage = this.common.getStorage();
        this.$ddlfacultyMember = $('#ddlFaculty');
        this.$txtScheduleName = $('#txtSessionName');
        let savedSchedule = this.testService.getTestSchedule();
        if (savedSchedule) {
            this.testScheduleModel = savedSchedule;
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

        if (!this.testScheduleModel.facultyMemberId)
            this.testScheduleModel.facultyMemberId = this.auth.userid;



    }

    onInput(testSessionName: string, facultyId: number): void {
        if (!testSessionName || testSessionName === '' || this.common.removeWhitespace(testSessionName) === '' || !facultyId || facultyId === 0)
            this.valid = false;
        else
            this.valid = true;

        this.testScheduleModel.scheduleName = testSessionName;
        this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
    }

    facultyChange(facultyId: number): void {
        this.testScheduleModel.facultyMemberId = facultyId;
        this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
    }

    bindFaculty(): void {
        let facultyURL = this.resolveFacultyURL(`${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.test.faculty}`);
        let facultyPromise = this.testService.getFaculty(facultyURL);
        let __this = this;
        facultyPromise.then((response) => {
            return response.json();
        })
            .then((json) => {
                __this.faculty = json;
                console.log(JSON.stringify(__this.faculty));
                console.log(__this.testScheduleModel.facultyMemberId)
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

    resolveFacultyURL(url: string): string {
        return url.replace('§institutionid', this.testScheduleModel.institutionId.toString());
    }

    scheduleTest(): void {

        let __this = this;
        let scheduleTestURL = `${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.test.scheduletest}`;
        
        // let input = {
        //     TestingSessionId: 0,
        //     SessionName: "New Test",
        //     AdminId: 4266,
        //     InstitutionId: 1432,
        //     SessionTestId: 1075,
        //     SessionTestName: "Fundamentals 108 2012",
        //     TestingWindowStart: "2016-02-10T13:00:00.000Z",
        //     TestingWindowEnd: "2016-02-10T16:00:00.000Z",
        //     FacultyMemberId: 4266,
        //     Students: [
        //         {
        //             TestingSessionId: 0,
        //             StudentId: 378185,
        //             LastName: "tonystudent1rn",
        //             FirstName: "tonystudent1rn",
        //             StudentTestId: 1075,
        //             StudentTestName: "Fundamentals 108 2012",
        //             Ada: false,
        //             Email: "tonystudent1rn@mailinator.com",
        //             Retester: false,
        //             CohortId: 14120,
        //             CohortName: "TonyRNCohort"
        //         }
        //     ],
        //     LastCohortSelectedId: 0,
        //     LastSubjectSelectedId: 0,
        //     PageSavedOn: "string",
        //     DateCreated: "2016-02-09T10:19:37.055Z",
        //     DateModified: "2016-02-09T10:19:37.055Z"
        // };
        
        
        let input = {
            TestingSessionId: (this.testScheduleModel.scheduleId ? this.testScheduleModel.scheduleId : 0),
            SessionName: this.testScheduleModel.scheduleName,
            AdminId: this.auth.userid,
            InstitutionId: this.testScheduleModel.institutionId,
            SessionTestId: this.testScheduleModel.testId,
            SessionTestName: this.testScheduleModel.testName,
            TestingWindowStart: moment(this.testScheduleModel.scheduleStartTime).format(),
            TestingWindowEnd: moment(this.testScheduleModel.scheduleEndTime).format(),
            FacultyMemberId: this.testScheduleModel.facultyMemberId,
            Students: this.testScheduleModel.selectedStudents,
            LastCohortSelectedId: this.testScheduleModel.lastselectedcohortId,
            LastSubjectSelectedId: this.testScheduleModel.subjectId,
            PageSavedOn: ''//TODO need to add the logic for this one ..
        };


        console.log(moment().format('h:mm:ss:sss'));
        console.log(JSON.stringify(input));
        
        this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
        let scheduleTestPromise = this.testService.scheduleTests(scheduleTestURL, JSON.stringify(input));
        scheduleTestPromise.then((response) => {
            return response.json();
        })
            .then((json) => {
                let success = __this.resolveExceptions(json, __this);
                if (success)
                    this.router.navigate(['/Confirmation']);    
            })
            .catch((error) => {
                console.log(error);
            });

    }


    resolveExceptions(objException: any, __this: any): boolean {

        console.log(moment().format('h:mm:ss:sss'));
        if (objException) {

            let studentRepeaterExceptions: Object[] = [];
            let alternateTests: Object[] = [];
            let studentAlternateTests: Object[] = [];

            if (objException.StudentRepeaterExceptions && objException.StudentRepeaterExceptions.length > 0) {
                studentRepeaterExceptions = objException.StudentRepeaterExceptions;
            }
            if (objException.StudentAlternateTestInfo && objException.StudentAlternateTestInfo.length > 0) {
                studentAlternateTests = objException.StudentAlternateTestInfo;
            }
            if (objException.AlternateTestInfo && objException.AlternateTestInfo.length > 0) {
                alternateTests = objException.AlternateTestInfo;
            }

            if (studentAlternateTests.length === 0 && studentRepeaterExceptions.length === 0 && alternateTests.length == 0)
                return true;


            if (alternateTests.length > 0)
                __this.hasAlternateTests = true;

            if (studentRepeaterExceptions.length > 0) {
                _.forEach(studentRepeaterExceptions, function(student, key) {
                    let studentId = student.StudentId;
                    student.TestName = __this.testScheduleModel.testName;
                    student.NormingStatus = __this.testScheduleModel.testNormingStatus;
                    if (__this.hasAlternateTests) {
                        student.AlternateTests = _.filter(studentAlternateTests, { 'StudentId': student.StudentId });
                        student.Enabled = _.some(student.AlternateTests, { 'ErrorCode': 0 });
                        student.Checked = !student.Enabled;
                        _.forEach(student.AlternateTests, function(studentAlternate, key) {
                            let _alternateTests = _.find(alternateTests, { 'TestId': studentAlternate.TestId });
                            studentAlternate.TestName = _alternateTests.TestName;
                            studentAlternate.NormingStatus = _alternateTests.NormingStatusName;
                        });
                    }
                });
            }
            if (studentRepeaterExceptions.length > 0) {
                if (!__this.hasAlternateTests) {
                    // this.loaderPromise = this.dynamicComponentLoader.loadIntoLocation(RetesterNoAlternatePopup, this.elementRef, 'retestermodal')
                    this.loadRetesterNoAlternatePopup(studentRepeaterExceptions);
                }
                else {
                    this.loadRetesterAlternatePopup(studentRepeaterExceptions);
                }
            }
        }
        return true;
    }

    loadRetesterNoAlternatePopup(_studentRepeaterExceptions: any): void {
        this.dynamicComponentLoader.loadNextToLocation(RetesterNoAlternatePopup, this.elementRef)
            .then(retester=> {
                $('#modalNoAlternateTest').modal('show');
                retester.instance.studentRepeaters = _studentRepeaterExceptions;
                retester.instance.testSchedule = this.testScheduleModel;
                retester.instance.retesterNoAlternatePopupOK.subscribe(testSchedule => {
                    if (testSchedule) {
                        $('#modalNoAlternateTest').modal('hide');
                        this.sStorage.setItem('testschedule', JSON.stringify(testSchedule));
                    }
                });
                retester.instance.retesterNoAlternatePopupCancel.subscribe((e) => {
                    $('#modalNoAlternateTest').modal('hide');
                });

            });
    }


    loadRetesterAlternatePopup(_studentRepeaterExceptions: any): void {
        let testScheduledSudents: Object[] = _.filter(_studentRepeaterExceptions, { 'ErrorCode': 2 });
        let testTakenStudents: Object[] = _.filter(_studentRepeaterExceptions, { 'ErrorCode': 1 });
        console.log(moment().format('h:mm:ss:sss'));

        if (this.loader)
            this.loader.dispose();

        this.dynamicComponentLoader.loadNextToLocation(RetesterAlternatePopup, this.elementRef)
            .then(retester=> {
                this.loader = retester;
                $('#modalAlternateTest').modal('show');
                console.log(moment().format('h:mm:ss:sss'));
                retester.instance.testTakenStudents = testTakenStudents;
                retester.instance.testScheduledSudents = testScheduledSudents;
                retester.instance.testSchedule = this.testScheduleModel;
                retester.instance.retesterAlternatePopupOK.subscribe(testSchedule => {
                    if (testSchedule) {
                        $('#modalAlternateTest').modal('hide');
                        this.sStorage.setItem('testschedule', JSON.stringify(testSchedule));
                    }
                });
                retester.instance.retesterAlternatePopupCancel.subscribe((e) => {
                    $('#modalAlternateTest').modal('hide');
                });

            });
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