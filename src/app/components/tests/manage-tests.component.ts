import {Component, OnInit, AfterViewInit, OnChanges, AfterViewChecked, ElementRef, ViewEncapsulation, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute, CanDeactivate, ROUTER_DIRECTIVES} from '@angular/router';
import {Subscription} from 'rxjs/Rx';
import {Http, Response, RequestOptions, Headers, HTTP_PROVIDERS} from "@angular/http";
import {Title} from '@angular/platform-browser';
import {Observable} from 'rxjs/Rx';
// import {TestService} from '../../services/test.service';
// import {AuthService} from '../../services/auth';
// import {CommonService} from '../../services/common';
import {links, errorcodes, teststatus} from '../../constants/config';
// import {PageHeader} from '../shared/page-header';
// import {PageFooter} from '../shared/page-footer';
// import {TestHeader} from './test-header';
import {TestScheduleModel} from '../../models/test-schedule.model';
// import {ConfirmationPopup} from '../shared/confirmation.popup';
import {RemoveWhitespacePipe} from '../../pipes/removewhitespace.pipe';
import {RoundPipe} from '../../pipes/round.pipe';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';
import {UtilityService} from '../../services/utility.service';
import * as _ from 'lodash';
// import {TestsModal} from '../../models/tests.modal';
// import {LogService} from '../../services/log.service.service';
// import '../../plugins/dropdown.js';
// import '../../plugins/bootstrap-select.min.js';
// // import '../../plugins/jquery.dataTables.min.js';
// // import '../../plugins/dataTables.responsive.js';
// import '../../lib/modal.js';
// import '../../lib/tooltip.js';
// import '../../lib/popover.js';
// import '../../lib/bootstrap-editable.min.js';
// import '../../lib/tablesaw.js';
import { TestService } from './test.service';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { TestsModal } from './../../models/tests.model';
import { LogService } from './../../services/log.service';
import { ConfirmationPopupComponent } from './../shared/confirmation.popup.component';
import { PageFooterComponent } from './../shared/page-footer.component';
import { TestHeaderComponent } from './test-header.component';
import { PageHeaderComponent } from './../shared/page-header.component';

@Component({
    selector: 'manage-tests',
    templateUrl: 'components/tests/manage-tests.component.html',
    providers: [TestService, AuthService, TestScheduleModel, UtilityService, CommonService, TestsModal, LogService],
    host: {
        '(window:resize)': 'resize($event)'
    },
    styleUrls: ['../../css/tablesaw.bare.css', '../../css/tablesaw.overrides.css', ' ../../css/bootstrap-editable.css', '../../css/bootstrap-editable-overrides.css'],
    encapsulation: ViewEncapsulation.None,
    directives: [PageHeaderComponent, TestHeaderComponent, PageFooterComponent, ConfirmationPopupComponent, ROUTER_DIRECTIVES],
    pipes: [RemoveWhitespacePipe, RoundPipe, ParseDatePipe]
})
export class ManageTestsComponent implements OnInit, OnDestroy {
    testDate: string;
    apiServer: string;
    tests: Array<TestScheduleModel> = [];
    completedTests: Array<TestsModal> = [];
    scheduleTests: Array<TestsModal> = [];
    inProgressTests: Array<TestsModal> = [];
    scheduleIdToDelete: number = 0;
    institutionIdToDelete: number = 0;
    programId: number = 0;
    institutionRN: number = 0;
    institutionPN: number = 0;
    institutionId: number = 0;
    institutionName: string = '';
    adminId: number = 0;
    sStorage: any;
    testTypeId: number = 1;
    institutionID: number = 0;
    actionSubscription: Subscription;
    subjectsSubscription: Subscription;
    scheduleTestsSubscription: Subscription;
    renameSessionSuscription: Subscription;
    errorCodes: any;
    testStatus: any;
    isMultiCampus: boolean = false;
    Campus: Object[] = [];
    constructor(private activatedRoute: ActivatedRoute, public testService: TestService, public router: Router, public auth: AuthService, public common: CommonService, public testSchedule: TestScheduleModel, public titleService: Title, private testsModal: TestsModal, private log: LogService) { }

    ngOnDestroy(): void {
        if (this.actionSubscription)
            this.actionSubscription.unsubscribe();
        if (this.subjectsSubscription)
            this.subjectsSubscription.unsubscribe();
        if (this.scheduleTestsSubscription)
            this.scheduleTestsSubscription.unsubscribe();
        if (this.renameSessionSuscription)
            this.renameSessionSuscription.unsubscribe();
    }


    ngOnInit(): void {
        this.errorCodes = errorcodes;
        this.testStatus = teststatus;
        this.sStorage = this.common.getStorage();
        this.testService.clearTestScheduleObjects();
        this.apiServer = this.common.getApiServer();
        this.testDate = moment(new Date()).subtract(3, 'month').format('L');
        this.adminId = this.auth.userid;
        this.checkInstitutions();
        this.setLatestInstitution();
        this.bindTests();
        this.titleService.setTitle('Manage Tests – Kaplan Nursing');
        $(document).scrollTop(0);
    }

    resize(): void {
        this.toggleTd();
    }


    groupTests(tests: Array<TestScheduleModel>): Array<TestsModal> {
        // No tests
        if (tests.length == 0)
            return [];

        // Only one test & one institution
        if (tests.length == 1) {
            let tmpTestsModal = new TestsModal();
            tmpTestsModal.institutionId = tests[0].institutionId;
            tmpTestsModal.institutionName = tests[0].institutionName;
            tmpTestsModal.institutionNameWithProgramOfStudy = tests[0].institutionNameWithProgramOfStudy;
            tmpTestsModal.tests = tests;
            return [tmpTestsModal];
        }

        // Multiple tests but only one institution
        let uniqueTests: Array<any> = _.uniqBy(tests, 'institutionId');
        if (uniqueTests.length == 1) {
            let tmpTestsModal = new TestsModal();
            tmpTestsModal.institutionId = uniqueTests[0].institutionId;
            tmpTestsModal.institutionName = uniqueTests[0].institutionName;
            tmpTestsModal.institutionNameWithProgramOfStudy = uniqueTests[0].institutionNameWithProgramOfStudy;
            tmpTestsModal.tests = tests;
            return [tmpTestsModal];
        }

        // Multiple tests & multiple institutions        
        uniqueTests = _.sortBy(uniqueTests, ['institutionName']);
        return _.map(uniqueTests, (uniqueTest) => {
            let filteredTests: Array<TestScheduleModel> = _.filter(tests, { 'institutionId': +uniqueTest.institutionId });
            let tmpTestsModal = new TestsModal();
            tmpTestsModal.institutionId = uniqueTest.institutionId;
            tmpTestsModal.institutionName = uniqueTest.institutionName;
            tmpTestsModal.institutionNameWithProgramOfStudy = uniqueTest.institutionNameWithProgramOfStudy;
            tmpTestsModal.tests = filteredTests;
            return tmpTestsModal;
        });
    }

    bindTests(): void {
        let __this = this;
        let scheduleTestsURL = `${this.apiServer}${links.api.baseurl}${links.api.admin.test.scheduletests}?adminId=${this.auth.userid}&after=${this.testDate}`;
        let scheduleTestsObservable: Observable<Response> = this.testService.getAllScheduleTests(scheduleTestsURL);
        this.scheduleTestsSubscription = scheduleTestsObservable
            .map(response => response.json())
            .subscribe(json => {
                __this.tests = _.map(json, (test) => {
                    return __this.testService.mapTestScheduleObjects(test);
                });
                if (__this.tests && __this.tests.length > 0) {

                    let unsortedInProgressTests: Array<TestScheduleModel> = _.filter(__this.tests, function (test) {
                        return (test.status == __this.testStatus.InProgress);
                    });

                    let sortedInProgressTests = _.sortBy(unsortedInProgressTests, function (_test) {
                        _test.spanMultipleDays = moment(_test.scheduleStartTime).isBefore(_test.scheduleEndTime, 'day');
                        return moment(_test.scheduleStartTime).toDate()
                    });

                    __this.inProgressTests = __this.groupTests(sortedInProgressTests);



                    let unsortedScheduledTests: Array<TestScheduleModel> = _.filter(__this.tests, function (test) {
                        test.spanMultipleDays = moment(test.scheduleStartTime).isBefore(test.scheduleEndTime, 'day');
                        return (test.status == __this.testStatus.Scheduled);
                    });
                    let sortedScheduleTests = _.sortBy(unsortedScheduledTests, function (_test) {
                        return moment(_test.scheduleStartTime).toDate()
                    });
                    __this.scheduleTests = __this.groupTests(sortedScheduleTests);


                    let unsortedCompletedTests: Array<TestScheduleModel> = _.filter(__this.tests, function (test) {
                        return (test.status == __this.testStatus.Completed);
                    });
                    let sortedCompletedTests = _.orderBy(unsortedCompletedTests, function (_test: TestScheduleModel) {
                        _test.spanMultipleDays = moment(_test.scheduleStartTime).isBefore(_test.scheduleEndTime, 'day');
                        return moment(_test.scheduleStartTime).toDate()
                    }, ['desc']);

                    __this.completedTests = __this.groupTests(sortedCompletedTests);




                    setTimeout((json) => {
                        $(document).trigger("enhance.tablesaw");
                        $('.js-rename-session').editable("destroy");
                        __this.configureEditor(__this);
                        __this.toggleTd();
                    })

                }
            },
            error => console.log(error));

    }


    view(scheduleId: number, e, modify: boolean): void {
        e.preventDefault();
        if (modify)
            this.router.navigate(['/tests', 'modify', 'view', scheduleId]);
        else
            this.router.navigate(['/tests/view', scheduleId]);
    }

    getTestSchedule(testScheduleId: number): Observable<Response> {
        let __this = this;
        let scheduleURL = this.resolveScheduleURL(`${this.common.apiServer}${links.api.baseurl}${links.api.admin.test.viewtest}`, testScheduleId);
        let scheduleObservable: Observable<Response> = this.testService.getScheduleById(scheduleURL);
        return scheduleObservable;
    }

    redirectModifyInProgress(route: string, testScheduleId: number, e: any): void {
        e.preventDefault();
        let testScheduleObservable: Observable<Response> = this.getTestSchedule(testScheduleId);
        let __this = this;
        testScheduleObservable
            .map(response => response.json())
            .subscribe(json => {
                if (json) {
                    let testSchedule: TestScheduleModel = __this.testService.mapTestScheduleObjects(json);
                    if (testSchedule) {
                        __this.sStorage.setItem('testschedule', JSON.stringify(testSchedule));
                        console.log(testSchedule);
                        switch (route) {
                            case 'ModifyScheduleTest':
                                this.router.navigate(['/tests', 'modify', 'schedule-test']);
                                break;

                            case 'ModifyAddStudents':
                                this.router.navigate(['/tests', 'modify', 'add-students']);
                                break;

                            default:
                                break;
                        }
                    }
                }

            },
            error => console.log(error));
    }

    configureEditor(__this: any) {
        //Initialize Bootstrap editable
        $('.js-rename-session').editable({
            type: 'text',
            pk: 1,  //change to whatever primary key is
            //url: '/post',
            title: 'Rename this testing session',
            highlight: 'transparent',
            tpl: '<input type="text" aria-label="Rename this testing session">',
            display: function (value) {
                // $(this).html(value).append('<img src="images/edit-pencil-icon_2x.png" alt="edit">');
            },
            savenochange: false,
            validate: function (value) {
                if (value.trim() == '') {
                    return 'This field is required';
                }
            }
        });
        //modify buttons style
        $.fn.editableform.buttons =
            '<button type="submit" class="button editable-submit" aria-label="submit"><img src="images/button-check-white.png" alt="check icon"></button>' +
            '<button type="button" class="unstyled-button editable-cancel" aria-label="cancel"><img src="images/button-close-icon.png" alt="x icon"></button>';


        $('.js-rename-session').on('save', function (e, params) {
            let _sessionId = e.currentTarget.attributes['sessionId'].textContent;
            let type = e.currentTarget.attributes['type'].textContent;
            let institutionId = e.currentTarget.attributes['institutionId'].textContent;
            let _newName = params.newValue;
            let renameSessionObservable = __this.renameSession(_sessionId, _newName);

            this.renameSessionSubscription = renameSessionObservable
                .map(response => response.status)
                .subscribe(status => {
                    if (status.toString() === __this.errorCodes.SUCCESS) {
                        // e.currentTarget.textContent = _newName;
                        let renamedTest: TestScheduleModel;
                        if (type === 'scheduled') {
                            let institution: TestsModal = <TestsModal>_.find(__this.scheduleTests, { 'institutionId': parseInt(institutionId) });
                            renamedTest = _.find(institution.tests, { 'scheduleId': parseInt(_sessionId) });
                            if (renamedTest) {
                                renamedTest.scheduleName = _newName;
                            }
                        }
                        else {
                            let institution: TestsModal = <TestsModal>_.find(__this.inProgressTests, { 'institutionId': parseInt(institutionId) });
                            renamedTest = _.find(institution.tests, { 'scheduleId': parseInt(_sessionId) });
                            if (renamedTest) {
                                renamedTest.scheduleName = _newName;
                            }
                        }
                    }

                }, error => console.log(error));

        });
    }

    resolveSessionURL(url: string, _sessionId: number): string {
        return url.replace('§scheduleId', _sessionId.toString());
    }


    renameSession(sessionId: number, newName: string): any {
        let __this = this;
        let renameSessionURL = __this.resolveScheduleURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.renamesession}`, sessionId);

        let renameSessionObservable: Observable<Response> = this.testService.renameSession(renameSessionURL, JSON.stringify(newName));

        return renameSessionObservable;

    }


    onOKConfirmation(): void {
        $('#confirmationPopup').modal('hide');
        this.deleteSchedule();
    }

    onCancelConfirmation() {
        $('#confirmationPopup').modal('hide');
        this.scheduleIdToDelete = 0;
        this.institutionIdToDelete = 0;
    }

    showConfirmation(scheduleId: number, institutionId: number): void {
        this.scheduleIdToDelete = scheduleId;
        this.institutionIdToDelete = institutionId;
        $('#confirmationPopup').modal('show');
    }

    resolveScheduleURL(url: string, scheduleId: number): string {
        return url.replace('§scheduleId', scheduleId.toString());
    }

    deleteSchedule(): void {
        let __this = this;
        let scheduleURL = this.resolveScheduleURL(`${this.common.apiServer}${links.api.baseurl}${links.api.admin.test.deleteSchedule}`, this.scheduleIdToDelete);
        let deleteObdervable: Observable<Response> = this.testService.deleteSchedule(scheduleURL);
        deleteObdervable.subscribe((res: Response) => {
            let institution: TestsModal = <TestsModal>_.find(__this.scheduleTests, { 'institutionId': +__this.institutionIdToDelete });
            _.remove(institution.tests, (test) => {
                return test.scheduleId === +__this.scheduleIdToDelete;
            });
            if (institution.tests.length === 0)
                _.remove(__this.scheduleTests, (test) => {
                    return test.institutionId === +__this.institutionIdToDelete;
                });
            __this.scheduleIdToDelete = 0;
            __this.institutionIdToDelete = 0;
        }, (error: Response) => {
            __this.scheduleIdToDelete = 0;
            __this.institutionIdToDelete = 0;
        });
    }

    setLatestInstitution(): number {
        if (this.auth.institutions != null && this.auth.institutions != 'undefined') {
            let latestInstitution:any = _.first(_.orderBy(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc'))
            if (latestInstitution) {
                this.institutionId = latestInstitution.InstitutionId;
                this.institutionName = latestInstitution.InstitutionName;
            }
        }
        return 0;
    }


    checkInstitutions(): void {
        let institutions = _.orderBy(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc');
        if (institutions != null && institutions != undefined) {
            let institutionsRN = _.map(_.filter(institutions, { 'ProgramofStudyName': 'RN' }), 'InstitutionId');
            let institutionsPN = _.map(_.filter(institutions, { 'ProgramofStudyName': 'PN' }), 'InstitutionId');
            let programId = _.map(institutions, 'ProgramId');
            if (programId.length > 0)
                this.programId = programId.length > 1 ? programId : programId[0];
            if (institutionsRN.length > 0)
                this.institutionRN = institutionsRN.length > 1 ? institutionsRN : institutionsRN[0];
            if (institutionsPN.length > 0)
                this.institutionPN = institutionsPN.length > 1 ? institutionsPN : institutionsPN[0];
            if (institutionsRN.length > 1 || institutionsPN.length > 1) {
                this.Campus = institutions;
                this.isMultiCampus = true;
            }
        }
    }

    redirectToRoute(route: string): boolean {
        this.checkInstitutions();
        if (this.isMultiCampus)
            this.router.navigateByUrl(`/choose-institution/Test/${route}`);
        else if (this.institutionRN > 0 && this.institutionPN > 0 && !this.isMultiCampus) {
            this.router.navigateByUrl(`/choose-institution/Test/${route}/${this.institutionRN}/${this.institutionPN}`);
        }
        else {
            if (this.programId > 0) {
                if (this.institutionRN == 0) {
                    this.institutionID = this.institutionPN;
                }
                else {
                    this.institutionID = this.institutionRN;
                }
                this.apiServer = this.common.getApiServer();
                let subjectsURL = this.resolveSubjectsURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.subjects}`);
                let subjectsObservable: Observable<Response> = this.testService.getSubjects(subjectsURL);

                this.subjectsSubscription = subjectsObservable
                    .map(response => {
                        if (response.status !== 400) {
                            return response.json();
                        }
                        return [];
                    })
                    .subscribe(json => {
                        if (json.length === 0) {
                            window.open('/accounterror');
                        }
                        else {
                            this.router.navigateByUrl(`/tests/choose-test/${(this.institutionPN === 0 ? this.institutionRN : this.institutionPN)}`);
                        }
                    });
            }
            else {
                window.open('/accounterror');
            }
        }
        return false;
    }
    resolveSubjectsURL(url: string): string {
        return url.replace('§institutionid', this.institutionID.toString()).replace('§testtype', this.testTypeId.toString());
    }

    addColumnStyle($table) {
        $table.find('tbody td:nth-child(1)').addClass('column-striped');
        $table.find('thead th').click(function () {
            // $table.find('thead th button').removeClass('sorted');
            //$(this).focus().addClass('sorted');

            var tableId = $table.attr('id');
            var index = $(this).index('table#' + tableId + ' thead th') + 1;
            $table.find('tbody td').removeClass('column-striped');
            $table.find('tbody td:nth-child(' + index + ')').addClass('column-striped');
        });
    }

    toggleTd() {
        $('tr td:first-child').unbind('click');
        $('tr td:first-child').on('click', function () {
            var $firstTd = $(this);
            var $tr = $(this).parent('tr');
            var $hiddenTd = $tr.find('td').not($(this));
            $tr.toggleClass('tablesaw-stacked-hidden-border');
            $hiddenTd.toggleClass('tablesaw-stacked-hidden');
        });
    }

    sort(institutionId: number, tablename: string, columnname: string): void {
        if (_.includes(tablename, '#tblScheduledTests')) {
            let institution: TestsModal = <TestsModal>_.find(this.scheduleTests, { 'institutionId': +institutionId });
            institution.tests = this.testService.sortTests(institution.tests, tablename, columnname);
        }
        else if (_.includes(tablename, '#tblCompletedTests')) {
            let institution: TestsModal = <TestsModal>_.find(this.completedTests, { 'institutionId': +institutionId });
            institution.tests = this.testService.sortTests(institution.tests, tablename, columnname);
        }

    }
}
