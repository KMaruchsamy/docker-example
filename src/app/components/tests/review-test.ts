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
import {SelectedStudentModel} from '../../models/selectedStudent-model';
import {RetesterAlternatePopup} from './retesters-alternate-popup';
import {RetesterNoAlternatePopup} from './retesters-noalternate-popup';
import {TimeExceptionPopup} from './time-exception-popup';
import {ConfirmationPopup} from '../shared/confirmation.popup';
import {Loader} from '../shared/loader';
import '../../plugins/dropdown.js';
import '../../plugins/bootstrap-select.min.js';
import '../../plugins/jquery.dataTables.min.js';
import '../../plugins/dataTables.responsive.js';
import '../../lib/modal.js';

@Component({
    selector: "review-test",
    templateUrl: "../../templates/tests/review-test.html",
    providers: [TestService, Auth, TestScheduleModel, Common],
    directives: [PageHeader, TestHeader, PageFooter, NgIf, NgFor, RouterLink, RetesterAlternatePopup, RetesterNoAlternatePopup, ConfirmationPopup, TimeExceptionPopup, Loader],
    pipes: [ParseDatePipe]
})

export class ReviewTest implements OnInit, OnDeactivate, CanDeactivate {
    testScheduleWindow: string = '';
    isScheduleDatesSame: boolean = true;
    testScheduleDates: string = '';
    testScheduleTimes: string = '';
    faculty: Object[] = [];
    sStorage: any;
    valid: boolean = false;
    studentsTable: any;
    hasAlternateTests: boolean;
    loaderPromise: any;
    $ddlfacultyMember: any;
    $txtScheduleName: any;
    loader: any;
    attemptedRoute: string;
    overrideRouteCheck: boolean = false;
    retesterExceptions: any;
    windowExceptions: Object[];
    constructor(public testScheduleModel: TestScheduleModel,
        public testService: TestService, public auth: Auth, public common: Common,
        public router: Router, public dynamicComponentLoader: DynamicComponentLoader, public elementRef: ElementRef) {

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
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else {
            this.initialize();
            this.bindFaculty();
        }
        $(document).scrollTop(0);
    }


    initialize() {
        this.valid = false;
        this.sStorage = this.common.getStorage();
        this.$ddlfacultyMember = $('#ddlFaculty');
        this.$txtScheduleName = $('#txtSessionName');

        let savedSchedule = this.testService.getTestSchedule();
        if (savedSchedule) {
            this.testScheduleModel = savedSchedule;
            console.log(this.testScheduleModel);
            if (this.studentsTable)
                this.studentsTable.destroy();
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

        if (!this.testScheduleModel.facultyMemberId) {
            this.testScheduleModel.facultyMemberId = this.auth.userid;
            this.testScheduleModel.facultyFirstName = this.auth.firstname;
            this.testScheduleModel.facultyLastName = this.auth.lastname;
        }
    }

    resolveMarked(_student): boolean {
        if (_student.hasOwnProperty('MarkedToRemove'))
            return _student.MarkedToRemove;
        else
            return false;
    }

    onInput(testSessionName: string): void {
        this.testScheduleModel.scheduleName = testSessionName;
        this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
        this.validate();
    }

    facultyChange(facultyId: number, e: any): void {
        let facultyName: string[] = this.convertName(e.target.options[e.target.selectedIndex].text);
        this.testScheduleModel.facultyMemberId = facultyId;
        this.testScheduleModel.facultyFirstName = facultyName[0].trim();
        this.testScheduleModel.facultyLastName = facultyName[1].trim();
        this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
        this.validate();
    }


    validate(): void {
        if (this.testScheduleModel.scheduleName !== '')
            console.log(this.testScheduleModel.scheduleName);

        if (this.testScheduleModel) {
            if (this.testScheduleModel.scheduleName && this.testScheduleModel.scheduleName !== ''
                && this.testScheduleModel.facultyMemberId && this.testScheduleModel.facultyMemberId > 0
                && this.unmarkedStudentsCount() > 0) {
                this.valid = true;
                return;
            }

        }
        this.valid = false;
    }

    convertName(_name: string): string[] {
        let strName: string[] = [];
        if (_name && _name != '') {
            strName = _name.split(',');
            return strName.reverse();
        }
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
        let loaderTimer = setTimeout(function() {
            $('#loader').modal('show');
        }, 1000);

        let __this = this;
        this.valid = false;
        let scheduleTestURL = `${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.test.scheduletest}`;
        this.testScheduleModel.selectedStudents = this.removeMarked(this.testScheduleModel.selectedStudents);
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


        this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
        let scheduleTestPromise = this.testService.scheduleTests(scheduleTestURL, JSON.stringify(input));
        scheduleTestPromise.then((response) => {
            return response.json();
        })
            .then((json) => {
                __this.valid = true;
                clearTimeout(loaderTimer);
                $('#loader').modal('hide');
                let result = json;
                console.log(json);
                if (result.TestingSessionId && result.TestingSessionId > 0) {
                    this.testScheduleModel.scheduleId = result.TestingSessionId;
                    this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
                    this.router.navigate(['/Confirmation']);
                }
                else {
                    __this.resolveExceptions(json, __this);
                }

            })
            .catch((error) => {
                __this.valid = true;
                $('#loader').modal('hide');
                console.log(error);
            });

    }

    removeMarked(_students: SelectedStudentModel[]): SelectedStudentModel[] {
        let resolvedStudents: SelectedStudentModel[] = _.remove(_students, function(_student: SelectedStudentModel) {
            return !_student.MarkedToRemove;
        });
        return resolvedStudents;

    }



    resolveExceptions(objException: any, __this: any): boolean {
        let repeaterExceptions: any;

        if (objException.repeaterExceptions)
            repeaterExceptions = objException.repeaterExceptions;

        if (objException.windowExceptions && objException.windowExceptions.length > 0)
            this.windowExceptions = objException.windowExceptions;

        if (objException) {

            let studentRepeaterExceptions: Object[] = [];
            let alternateTests: Object[] = [];
            let studentAlternateTests: Object[] = [];


            if (repeaterExceptions.StudentRepeaterExceptions && repeaterExceptions.StudentRepeaterExceptions.length > 0) {
                studentRepeaterExceptions = repeaterExceptions.StudentRepeaterExceptions;
            }
            if (repeaterExceptions.StudentAlternateTestInfo && repeaterExceptions.StudentAlternateTestInfo.length > 0) {
                studentAlternateTests = repeaterExceptions.StudentAlternateTestInfo;
            }
            if (repeaterExceptions.AlternateTestInfo && repeaterExceptions.AlternateTestInfo.length > 0) {
                alternateTests = repeaterExceptions.AlternateTestInfo;
            }

            if (studentAlternateTests.length === 0 && studentRepeaterExceptions.length === 0 && alternateTests.length === 0 && this.windowExceptions.length === 0)
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
                        // if (!student.Enabled)
                        //     __this.markForRemoval(student.StudentId, true);
                        _.forEach(student.AlternateTests, function(studentAlternate, key) {
                            let _alternateTests = _.find(alternateTests, { 'TestId': studentAlternate.TestId });
                            studentAlternate.TestName = _alternateTests.TestName;
                            studentAlternate.NormingStatus = _alternateTests.NormingStatusName;
                            studentAlternate.Recommended = _alternateTests.Recommended;
                            if (!_.has(studentAlternate, 'Checked'))
                                studentAlternate.Checked = false;
                        });
                    }
                });
            }
            if (studentRepeaterExceptions.length > 0) {
                if (!this.retesterExceptions)
                    this.retesterExceptions = studentRepeaterExceptions;

                if (!__this.hasAlternateTests) {
                    // this.loaderPromise = this.dynamicComponentLoader.loadIntoLocation(RetesterNoAlternatePopup, this.elementRef, 'retestermodal')
                    this.loadRetesterNoAlternatePopup(studentRepeaterExceptions);
                }
                else {
                    this.loadRetesterAlternatePopup(studentRepeaterExceptions);
                }
            }
            else {
                if (this.windowExceptions.length > 0)
                    this.loadWindowExceptions(this.windowExceptions);
            }
        }
        return false;
    }

    validateChangeAlternate(): boolean {
        if (this.retesterExceptions) {
            if (this.retesterExceptions.length > 0) {
                return _.some(this.retesterExceptions, function(retester) {

                    return retester.AlternateTests.length > 0;
                });
            }
        }
        return false;
    }

    markForRemoval(_studentId: number, mark: boolean) {
        let studentToMark: SelectedStudentModel = _.find(this.testScheduleModel.selectedStudents, { 'StudentId': _studentId });
        studentToMark.MarkedToRemove = mark;
    }

    unmarkedStudentsCount(): number {
        return _.filter(this.testScheduleModel.selectedStudents, function(student) {
            return !_.has(student, 'MarkedToRemove') || !student.MarkedToRemove;
        }).length;
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
                        this.testScheduleModel = testSchedule;
                        this.valid = this.unmarkedStudentsCount() > 0 ? true : false;

                        if (this.windowExceptions && this.windowExceptions.length > 0) {
                            this.loadWindowExceptions(this.windowExceptions);
                        }
                        this.rebindTable();
                    }
                });
                retester.instance.retesterNoAlternatePopupCancel.subscribe((e) => {
                    $('#modalNoAlternateTest').modal('hide');
                });

            });
    }

    loadWindowExceptions(_windowExceptions: any): void {
        this.dynamicComponentLoader.loadNextToLocation(TimeExceptionPopup, this.elementRef)
            .then(window=> {
                $('#modalTimingException').modal('show');
                window.instance.studentWindowException = _windowExceptions;
                window.instance.testSchedule = this.testScheduleModel;
                window.instance.windowExceptionPopupClose.subscribe(e => {
                    if (e) {
                        $('#modalTimingException').modal('hide');
                        this.testScheduleModel = JSON.parse(this.sStorage.getItem('testschedule'));
                        this.valid = this.unmarkedStudentsCount() > 0 ? true : false;
                        this.removeWindowExceptionStudentsFromRetesters(_windowExceptions);
                        console.log('WINDOW');
                        console.log(JSON.stringify(this.testScheduleModel));
                        console.log(JSON.stringify(this.retesterExceptions));
                        this.rebindTable();
                    }
                });

            });
    }

    removeWindowExceptionStudentsFromRetesters(_windowExceptions: any): void {
        let self = this;
        if (this.sStorage) {
            if (this.retesterExceptions) {
                var removedStudents = _.remove(this.retesterExceptions, function(student) {
                    return _.some(_windowExceptions, { 'StudentId': student.StudentId })
                });
            }
        }
        console.log(this.retesterExceptions);
    }

    rebindTable(): void {
        if (this.studentsTable)
            this.studentsTable.destroy();
        
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


    loadRetesterAlternatePopup(_studentRepeaterExceptions: any): void {
        let testScheduledSudents: Object[] = _.filter(_studentRepeaterExceptions, { 'ErrorCode': 2 });
        let testTakenStudents: Object[] = _.filter(_studentRepeaterExceptions, { 'ErrorCode': 1 });

        if (this.loader)
            this.loader.dispose();

        this.dynamicComponentLoader.loadNextToLocation(RetesterAlternatePopup, this.elementRef)
            .then(retester=> {
                this.loader = retester;
                $('#modalAlternateTest').modal('show');
                retester.instance.retesterExceptions = _studentRepeaterExceptions;
                retester.instance.testTakenStudents = testTakenStudents;
                retester.instance.testScheduledSudents = testScheduledSudents;
                retester.instance.testSchedule = this.testScheduleModel;
                retester.instance.retesterAlternatePopupOK.subscribe((retesters) => {
                    if (retesters) {
                        $('#modalAlternateTest').modal('hide');
                        this.testScheduleModel = JSON.parse(this.sStorage.getItem('testschedule'));
                        this.retesterExceptions = retesters;
                        this.valid = this.unmarkedStudentsCount() > 0 ? true : false;
                        console.log('ALTERNATE');
                        console.log(JSON.stringify(this.testScheduleModel));
                        console.log(JSON.stringify(this.retesterExceptions));

                        if (this.windowExceptions && this.windowExceptions.length > 0) {
                            this.loadWindowExceptions(this.windowExceptions);
                        }
                        this.rebindTable();
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

    changeAlternateAssignments(e: any): void {
        e.preventDefault();
        this.loadRetesterAlternatePopup(this.retesterExceptions);
    }


}