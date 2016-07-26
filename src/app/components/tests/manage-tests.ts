import {Component, OnInit, AfterViewInit, OnChanges, AfterViewChecked, ElementRef, ViewEncapsulation, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute, CanDeactivate, ROUTER_DIRECTIVES} from '@angular/router';
import {Subscription} from 'rxjs/Rx';
import {Http, Response, RequestOptions, Headers, HTTP_PROVIDERS} from "@angular/http";
import {Title} from '@angular/platform-browser';
import {Observable} from 'rxjs/Rx';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {links, errorcodes, teststatus} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestHeader} from './test-header';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {ConfirmationPopup} from '../shared/confirmation.popup';
import {RemoveWhitespacePipe} from '../../pipes/removewhitespace.pipe';
import {RoundPipe} from '../../pipes/round.pipe';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';
import {Utility} from '../../scripts/utility';
import * as _ from 'lodash';
// import '../../plugins/dropdown.js';
// import '../../plugins/bootstrap-select.min.js';
// // import '../../plugins/jquery.dataTables.min.js';
// // import '../../plugins/dataTables.responsive.js';
// import '../../lib/modal.js';
// import '../../lib/tooltip.js';
// import '../../lib/popover.js';
// import '../../lib/bootstrap-editable.min.js';
// import '../../lib/tablesaw.js';

@Component({
    selector: 'manage-tests',
    templateUrl: 'templates/tests/manage-tests.html',
    providers: [TestService, Auth, TestScheduleModel, Utility, Common],
    host: {
        '(window:resize)': 'resize($event)'
    },
    styleUrls: ['../../css/tablesaw.bare.css', '../../css/tablesaw.overrides.css', ' ../../css/bootstrap-editable.css', '../../css/bootstrap-editable-overrides.css'],
    encapsulation: ViewEncapsulation.None,
    directives: [PageHeader, TestHeader, PageFooter, ConfirmationPopup, ROUTER_DIRECTIVES],
    pipes: [RemoveWhitespacePipe, RoundPipe, ParseDatePipe]
})
export class ManageTests implements OnInit, OnDestroy {
    testDate: string;
    apiServer: string;
    tests: Object[] = [];
    completedTests: Object[] = [];
    scheduleTests: Object[] = [];
    inProgressTests: Object[] = [];
    scheduleIdToDelete: number = 0;
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
    constructor(private activatedRoute: ActivatedRoute, public testService: TestService, public router: Router, public auth: Auth, public common: Common, public testSchedule: TestScheduleModel, public titleService: Title) { }

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

    bindTests(): void {
        let __this = this;
        let scheduleTestsURL = `${this.apiServer}${links.api.baseurl}${links.api.admin.test.scheduletests}?adminId=${this.auth.userid}&after=${this.testDate}`;
        let scheduleTestsObservable: Observable<Response> = this.testService.getAllScheduleTests(scheduleTestsURL);
        this.scheduleTestsSubscription = scheduleTestsObservable
            .map(response => response.json())
            .subscribe(json => {
                __this.tests = json;
                if (__this.tests && __this.tests.length > 0) {

                    let unsortedCompletedTests = _.filter(__this.tests, function (test) {
                        return (test.Status == teststatus.Completed);
                    });
                    __this.completedTests = _.sortBy(unsortedCompletedTests, function (_test) {
                        _test.nextDay = moment(_test.TestingWindowStart).isBefore(_test.TestingWindowEnd, 'day');
                        return moment(_test.TestingWindowStart).toDate()
                    });

                    let unsortedScheduledTests = _.filter(__this.tests, function (test) {
                        test.nextDay = moment(test.TestingWindowStart).isBefore(test.TestingWindowEnd, 'day');
                        return (test.Status == teststatus.Scheduled);
                    });
                    __this.scheduleTests = _.sortBy(unsortedScheduledTests, function (_test) {
                        return moment(_test.TestingWindowStart).toDate()
                    });

                    let unsortedInProgressTests = _.filter(__this.tests, function (test) {
                        return (test.Status == teststatus.InProgress);
                    });

                    __this.inProgressTests = _.sortBy(unsortedInProgressTests, function (_test) {
                        _test.nextDay = moment(_test.TestingWindowStart).isBefore(_test.TestingWindowEnd, 'day');
                        return moment(_test.TestingWindowStart).toDate()
                    });

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
                                this.router.navigate(['/tests','modify','schedule-test']);
                                break;

                            case 'ModifyAddStudents':
                                this.router.navigate(['/tests', 'modify','add-students']);
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
            let _newName = params.newValue;
            let renameSessionObservable = __this.renameSession(_sessionId, _newName);

            this.renameSessionSubscription = renameSessionObservable
                .map(response => response.status)
                .subscribe(status => {
                    if (status.toString() === errorcodes.SUCCESS) {
                        // e.currentTarget.textContent = _newName;
                        let renamedTest: any;
                        if (type === 'scheduled') {
                            renamedTest = _.find(__this.scheduleTests, { 'TestingSessionId': parseInt(_sessionId) });
                            if (renamedTest) {
                                renamedTest.SessionName = _newName;
                            }
                        }
                        else {
                            renamedTest = _.find(__this.inProgressTests, { 'TestingSessionId': parseInt(_sessionId) });
                            if (renamedTest) {
                                renamedTest.SessionName = _newName;
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

        let renameSessionObservable:Observable<Response> = this.testService.renameSession(renameSessionURL, JSON.stringify(newName));

        return renameSessionObservable;

    }


    onOKConfirmation(): void {
        $('#confirmationPopup').modal('hide');
        this.deleteSchedule();
    }

    onCancelConfirmation() {
        $('#confirmationPopup').modal('hide');
        this.scheduleIdToDelete = 0;
    }

    showConfirmation(scheduleId: number): void {
        this.scheduleIdToDelete = scheduleId;
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
            __this.bindTests();
            __this.scheduleIdToDelete = 0;
        }, (error: Response) => {
            __this.scheduleIdToDelete = 0;
        });
    }

    setLatestInstitution(): number {
        if (this.auth.institutions != null && this.auth.institutions != 'undefined') {
            let latestInstitution = _.first(_.orderBy(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc'))
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
                this.programId = programId[0];
            if (institutionsRN.length > 0)
                this.institutionRN = institutionsRN[0];
            if (institutionsPN.length > 0)
                this.institutionPN = institutionsPN[0];
        }
    }

    redirectToRoute(route: string): boolean {
        this.checkInstitutions();
        if (this.institutionRN > 0 && this.institutionPN > 0) {
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


    bindSort(tblTest: string): void {
        let __this = this;
        $(tblTest).find('th').off('click');
        $(tblTest).find('th').on('click', function (e) {
            e.preventDefault();
            let columnId = $(this).attr('id');
            let ascending: boolean = false;
            if ($(this).hasClass('tablesaw-sortable-descending')) {
                ascending = true;
                $(this).addClass('tablesaw-sortable-ascending');
                $(this).removeClass('tablesaw-sortable-descending');
            }
            else {
                $(this).addClass('tablesaw-sortable-descending');
                $(this).removeClass('tablesaw-sortable-ascending');
            }
            let tempTests: any;
            if (tblTest === '#tblScheduledTests') {
                if (__this.scheduleTests) {
                    switch (columnId) {
                        case 'dateTH':
                            tempTests = _.sortBy(__this.scheduleTests, function (_test) {
                                return moment(_test.TestingWindowStart).toDate();
                            });
                            break;
                        case 'sessionTH':
                            tempTests = _.sortBy(__this.scheduleTests, function (test) {
                                return test.SessionName;
                            });
                            break;
                        case 'facultyTH':
                            tempTests = _.sortBy(__this.scheduleTests, function (_test) {
                                return _test.FacultyFirstName + ' ' + _test.FacultyLastName;
                            });
                            break;
                        case 'adminTH':
                            tempTests = _.sortBy(__this.scheduleTests, function (_test) {
                                return _test.AdminFirstName + ' ' + _test.AdminLastName;
                            });
                            break;

                        default:
                            tempTests = _.sortBy(__this.scheduleTests, function (_test) {
                                return moment(_test.TestingWindowStart).toDate();
                            });
                            break;
                    }

                    if (ascending)
                        __this.scheduleTests = tempTests;
                    else
                        __this.scheduleTests = tempTests.reverse();
                }
            }
            else if (tblTest === '#tblCompletedTests') {
                if (__this.completedTests) {
                    switch (columnId) {
                        case 'dateTH':
                            tempTests = _.sortBy(__this.completedTests, function (_test) {
                                return moment(_test.TestingWindowStart).toDate();
                            });
                            break;
                        case 'sessionTH':
                            tempTests = _.sortBy(__this.completedTests, function (_test) {
                                return _test.SessionName;
                            });
                            break;
                        case 'facultyTH':
                            tempTests = _.sortBy(__this.completedTests, function (_test) {
                                return _test.FacultyFirstName + ' ' + _test.FacultyLastName;
                            });
                            break;
                        case 'adminTH':
                            tempTests = _.sortBy(__this.completedTests, function (_test) {
                                return _test.AdminFirstName + ' ' + _test.AdminLastName;
                            });
                            break;

                        default:
                            tempTests = _.sortBy(__this.completedTests, function (_test) {
                                return moment(_test.TestingWindowStart).toDate();
                            });
                            break;
                    }

                    if (ascending)
                        __this.completedTests = tempTests;
                    else
                        __this.completedTests = tempTests.reverse();
                }
            }

            setTimeout((json) => {
                $(document).trigger("enhance.tablesaw");
                __this.configureEditor(__this);
                __this.bindSort('#tblScheduledTests');
                __this.bindSort('#tblCompletedTests');
                __this.addColumnStyle($('table#tblCompletedTests'));
                __this.addColumnStyle($('table#tblScheduledTests'));
            });

        });
    }

    sort(tablename: string, columnname: string): void {
        if (tablename === '#tblScheduledTests')
            this.scheduleTests = this.testService.sortTests(this.scheduleTests, tablename, columnname);
        else if (tablename === '#tblCompletedTests')
            this.completedTests = this.testService.sortTests(this.completedTests, tablename, columnname);

        let __this = this;
    }
}
