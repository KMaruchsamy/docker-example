import {Component, OnInit, DynamicComponentLoader, ElementRef} from 'angular2/core';
import {Router, RouterLink, OnDeactivate, CanDeactivate, ComponentInstruction, RouteParams} from 'angular2/router';
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
import {AlertPopup} from '../shared/alert.popup';
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
    directives: [PageHeader, TestHeader, PageFooter, NgIf, NgFor, RouterLink, RetesterAlternatePopup, RetesterNoAlternatePopup, ConfirmationPopup, TimeExceptionPopup, Loader, AlertPopup],
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
    nextDay: boolean = false;
    modify: boolean = false;
    hasSavedRetesterExceptions: boolean = true;
    hasADA: boolean = false;
    retesterExceptionsModify: any;
    constructor(public testScheduleModel: TestScheduleModel,
        public testService: TestService, public auth: Auth, public common: Common,
        public router: Router, public dynamicComponentLoader: DynamicComponentLoader,
        public elementRef: ElementRef, public routeParams: RouteParams) {

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
        if (outOfTestScheduling)
            this.testService.clearTestScheduleObjects();
        this.overrideRouteCheck = false;
        return true;
    }

    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        if (this.studentsTable)
            this.studentsTable.destroy();
        $('#ddlFaculty').val('').selectpicker('refresh');
        this.testService.removeRestestersExceptionForModify();
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
        let action = this.routeParams.get('action');
        if (action != undefined && action.trim() === 'modify')
            this.modify = true;
        this.valid = false;
        this.sStorage = this.common.getStorage();
        this.$ddlfacultyMember = $('#ddlFaculty');
        this.$txtScheduleName = $('#txtSessionName');
        let __this = this;
        let savedSchedule = this.testService.getTestSchedule();
        if (savedSchedule) {
            let savedRetesterExceptions = this.testService.getSavedRetesterExceptions();
            if (savedRetesterExceptions) {
                this.retesterExceptions = savedRetesterExceptions;
                this.hasSavedRetesterExceptions = true;
            }

            this.testScheduleModel = this.testService.sortSchedule(savedSchedule);
            console.log(this.testScheduleModel);

            if (this.modify) {
                let retestersExceptionsModify = this.testService.getAlternateExceptionsModify();
                if (retestersExceptionsModify != undefined && retestersExceptionsModify.length > 0) {
                    this.retesterExceptionsModify = retestersExceptionsModify;
                    this.checkAndResolveNewExceptionsOnModify(this);
                }
                else
                    this.loadAlternateAssignmentsModify();

            }

            this.resolveADA();

            if (this.studentsTable)
                this.studentsTable.destroy();
            setTimeout(() => {

                __this.studentsTable = $('#studentsInTestingSessionTable').DataTable({
                    "paging": false,
                    "searching": false,
                    "responsive": true,
                    "info": false,
                    "ordering": false
                });


                $('#studentsInTestingSessionTable').on('responsive-display.dt', function() {
                    $(this).find('.child .dtr-title br').remove();
                });
                __this.validate();
            });

            let startTime = this.testScheduleModel.scheduleStartTime;
            let endTime = this.testScheduleModel.scheduleEndTime;
            if (moment(endTime).isAfter(startTime, 'day'))
                this.nextDay = true;

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

                    __this.validate();
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }

    resolveFacultyURL(url: string): string {
        return url.replace('§institutionid', this.testScheduleModel.institutionId.toString());
    }

    resolveModifyTestingSessionURL(url: string): string {
        return url.replace('§scheduleId', (this.testScheduleModel.scheduleId ? this.testScheduleModel.scheduleId : 0).toString());
    }

    scheduleTest(e): void {

        e.preventDefault();
        if (!this.validateDates())
            return;

        let loaderTimer = setTimeout(function() {
            $('#loader').modal('show');
        }, 1000);

        let __this = this;
        this.valid = false;

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

        let scheduleTestPromise: any;
        let scheduleTestURL = '';
        if (this.modify) {
            scheduleTestURL = this.resolveModifyTestingSessionURL(`${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.test.modifyscheduletest}`);
            scheduleTestPromise = this.testService.modifyScheduleTests(scheduleTestURL, JSON.stringify(input));
        }
        else {
            scheduleTestURL = `${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.test.scheduletest}`;
            scheduleTestPromise = this.testService.scheduleTests(scheduleTestURL, JSON.stringify(input));
        }

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
                    __this.testScheduleModel.scheduleId = result.TestingSessionId;
                    __this.sStorage.setItem('testschedule', JSON.stringify(__this.testScheduleModel));
                    __this.router.navigate(['/Confirmation']);
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


            if (this.windowExceptions != undefined && this.windowExceptions.length > 0)
                this.loadWindowExceptions(this.windowExceptions);
            else if (studentRepeaterExceptions.length > 0) {
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
                        this.testScheduleModel = this.testService.sortSchedule(testSchedule);
                        this.resolveADA();
                        this.validate();
                        //this.valid = this.unmarkedStudentsCount() > 0 ? true : false;

                        // if (this.windowExceptions && this.windowExceptions.length > 0) {
                        //     this.loadWindowExceptions(this.windowExceptions);
                        // }
                        this.rebindTable();
                    }
                });
                retester.instance.retesterNoAlternatePopupCancel.subscribe((e) => {
                    $('#modalNoAlternateTest').modal('hide');
                });

            });
    }

    resolveADA(): void {
        this.hasADA = _.some(this.testScheduleModel.selectedStudents, { 'Ada': true });
    }

    loadWindowExceptions(_windowExceptions: any): void {
        this.dynamicComponentLoader.loadNextToLocation(TimeExceptionPopup, this.elementRef)
            .then(window=> {
                $('#modalTimingException').modal('show');
                window.instance.studentWindowException = _windowExceptions;
                window.instance.canRemoveStudents = true;
                window.instance.testSchedule = this.testScheduleModel;
                window.instance.windowExceptionPopupClose.subscribe(e => {
                    if (e) {
                        $('#modalTimingException').modal('hide');
                        this.testScheduleModel = this.testService.sortSchedule(this.testService.getTestSchedule());
                        this.valid = this.unmarkedStudentsCount() > 0 ? true : false;
                        //this.removeWindowExceptionStudentsFromRetesters(_windowExceptions);
                        console.log('WINDOW');
                        console.log(JSON.stringify(this.testScheduleModel));
                        console.log(JSON.stringify(this.retesterExceptions));
                        //this.rebindTable();
                        if (this.modify)
                            this.router.navigate(['/AddStudents', { action: 'modify' }]);
                        else
                            this.router.navigate(['/AddStudents']);

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
                        this.testScheduleModel = this.testService.sortSchedule(this.testService.getTestSchedule());
                        this.resolveADA();
                        if (this.modify) {
                            this.sStorage.setItem('retestersModify', JSON.stringify(retesters));
                            this.retesterExceptionsModify = retesters;
                            this.updateRemovedStudentsToRetesters(this);
                        }
                        else {
                            this.sStorage.setItem('retesters', JSON.stringify(retesters));
                            this.retesterExceptions = retesters;
                        }

                        this.validate();
                        //this.valid = this.unmarkedStudentsCount() > 0 ? true : false;
                        console.log('ALTERNATE');
                        console.log(JSON.stringify(this.testScheduleModel));
                        console.log(JSON.stringify(this.retesterExceptions));

                        // if (this.windowExceptions && this.windowExceptions.length > 0) {
                        //     this.loadWindowExceptions(this.windowExceptions);
                        // }
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
        if (this.modify)
            this.loadRetesterAlternatePopup(this.retesterExceptionsModify);
        else
            this.loadRetesterAlternatePopup(this.retesterExceptions);
    }
    ChangeTest(e: any): void {
        e.preventDefault();
        this.sStorage.removeItem('retesters');
    }


    loadAlternateAssignmentsModify(): void {
        let __this = this;

        let retesterExceptionsURL: string = `${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.test.retesters}?institutionId=${this.testScheduleModel.institutionId}&testingSessionId=${this.testScheduleModel.scheduleId}`;

        let studentIds: number[];
        // studentIds = _.pluck(this.removeMarked(_schedule.selectedStudents), 'StudentId');
        studentIds = _.chain(__this.testScheduleModel.selectedStudents)
            .map(c => c.StudentId)
            .value();
        let input = {
            SessionTestId: __this.testScheduleModel.testId,
            StudentIds: studentIds,
            TestingSessionWindowStart: __this.testScheduleModel.scheduleStartTime,
            TestingSessionWindowEnd: __this.testScheduleModel.scheduleEndTime
        };
        let retesterExceptionsPromise: any = this.testService.getRetesters(retesterExceptionsURL, JSON.stringify(input));

        retesterExceptionsPromise.then((response) => {
            return response.json();
        })
            .then((json) => {
                console.log(JSON.stringify(json));
                __this.resolveAlternateExceptionsForModify(json, __this);
                __this.checkAndResolveNewExceptionsOnModify(__this);
            })
            .catch((error) => {
                console.log(error);
            });

    }

    resolveAlternateExceptionsForModify(objException: any, __this: any): any {
        let repeaterExceptions: any;

        if (!objException)
            return false;



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

            if (studentAlternateTests.length === 0 && studentRepeaterExceptions.length === 0 && alternateTests.length === 0)
                return true;


            if (alternateTests.length > 0)
                __this.hasAlternateTests = true;
            else
                return true;


            if (studentRepeaterExceptions.length > 0) {
                _.forEach(studentRepeaterExceptions, function(student, key) {
                    let studentId = student.StudentId;
                    student.TestName = __this.testScheduleModel.testName;
                    student.NormingStatus = __this.testScheduleModel.testNormingStatus;
                    if (__this.hasAlternateTests) {
                        student.AlternateTests = _.filter(studentAlternateTests, { 'StudentId': student.StudentId });
                        student.Enabled = _.some(student.AlternateTests, { 'ErrorCode': 0 });
                        student.Checked = !student.Enabled;
                        student.Modify = true;
                        // if (!student.Enabled)
                        //     __this.markForRemoval(student.StudentId, true);
                        _.forEach(student.AlternateTests, function(studentAlternate, key) {
                            let _alternateTests = _.find(alternateTests, { 'TestId': studentAlternate.TestId });
                            studentAlternate.TestName = _alternateTests.TestName;
                            studentAlternate.NormingStatus = _alternateTests.NormingStatusName;
                            studentAlternate.Recommended = _alternateTests.Recommended;
                            // if (!_.has(studentAlternate, 'Checked'))
                            studentAlternate.Checked = _.some(__this.testScheduleModel.selectedStudents, {
                                'StudentId': student.StudentId,
                                'StudentTestId': studentAlternate.TestId,
                                'MarkedToRemove': false
                            });
                            if (studentAlternate.Checked)
                                student.Checked = true;
                        });
                    }
                });
            }

            this.retesterExceptionsModify = studentRepeaterExceptions; 
         
        }
        return false;
    }


    updateRemovedStudentsToRetesters(__this:any): void {
        if (__this.retesterExceptions && __this.retesterExceptions.length > 0 && __this.retesterExceptionsModify && __this.retesterExceptionsModify.length > 0) {
            let removedRetesters = _.filter(__this.retesterExceptionsModify, { 'Enabled': false });
            _.forEach(removedRetesters, function(student, key) {
                let toDisableRetester = _.find(__this.retesterExceptions, { 'StudentId': student.StudentId });
                if (toDisableRetester) {
                    toDisableRetester.Enabled = false;
                }
            });
            
            __this.sStorage.setItem('retesters', JSON.stringify(__this.retesterExceptions));
        }
    }


    checkAndResolveNewExceptionsOnModify(__this: any): void {
        if (this.retesterExceptions && this.retesterExceptions.length > 0) {
            _.forEach(this.retesterExceptions, function(student, key) {
                let retesterModifyStudent = _.find(this.retesterExceptionsModify, { 'StudentId': student.StudentId });
                if (retesterModifyStudent) {
                    retesterModifyStudent.Enabled = student.Enabled;
                    retesterModifyStudent.Checked = retesterModifyStudent.Enabled;
                    _.forEach(student.AlternateTests, function(newAlternate, key) {
                        let modifyAlternateTest = _.find(retesterModifyStudent.AlternateTests, { 'TestId': newAlternate.TestId });
                        if (modifyAlternateTest) {
                            modifyAlternateTest.Checked = newAlternate.Checked;
                            if (newAlternate.Checked)
                                retesterModifyStudent.Ckecked = true;
                        }
                        else {
                            retesterModifyStudent.AlternateTests.push(newAlternate);
                        }
                    });
                }
                else {
                    this.retesterExceptionsModify.push(student);
                }
            });
        }
    }


    validateDates(): boolean {
        if (this.testScheduleModel) {
            if (this.testScheduleModel.scheduleStartTime && this.testScheduleModel.scheduleEndTime) {
                if (this.modify) {
                    if (moment(this.testScheduleModel.scheduleStartTime).isBefore(new Date())) {
                        $('#alertPopup').modal('show');
                        return false;
                    }
                }
                else {
                    if (moment(this.testScheduleModel.scheduleEndTime).isBefore(new Date())) {
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

}