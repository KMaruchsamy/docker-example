import {Component, OnInit, DynamicComponentLoader, ElementRef} from 'angular2/core';
import {Router, RouterLink, RouteParams, OnDeactivate, CanDeactivate, ComponentInstruction } from 'angular2/router';
import {NgFor} from 'angular2/common';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {links} from '../../constants/config';
import {Common} from '../../services/common';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestHeader} from './test-header';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {SelectedStudentModel} from '../../models/selectedStudent-model';
import {RemoveWhitespacePipe} from '../../pipes/removewhitespace.pipe';
import {ConfirmationPopup} from '../shared/confirmation.popup';
import {AlertPopup} from '../shared/alert.popup';
import {RetesterAlternatePopup} from './retesters-alternate-popup';
import {RetesterNoAlternatePopup} from './retesters-noalternate-popup';
import {TimeExceptionPopup} from './time-exception-popup';

import * as _ from '../../lib/index';
import '../../plugins/dropdown.js';
import '../../plugins/bootstrap-select.min.js';
import '../../plugins/jquery.dataTables.min.js';
import '../../plugins/dataTables.responsive.js';
import '../../lib/modal.js';
//import '../../plugins/dataTables.bootstrap.min.js';

@Component({
    selector: 'add-students',
    templateUrl: '../../templates/tests/add-students.html',
    // styleUrls:['../../css/responsive.dataTablesCustom.css','../../css/jquery.dataTables.min.css'],
    providers: [TestService, Auth, TestScheduleModel, SelectedStudentModel, Common, RetesterAlternatePopup, RetesterNoAlternatePopup, TimeExceptionPopup, AlertPopup],
    directives: [PageHeader, TestHeader, PageFooter, NgFor, ConfirmationPopup, RouterLink],
    pipes: [RemoveWhitespacePipe]
})

export class AddStudents implements OnInit, OnDeactivate, CanDeactivate {
    //  institutionID: number;
    apiServer: string;
    lastSelectedCohortID: number;
    lastSelectedCohortName: string;
    cohorts: Object[] = [];
    cohortStudentlist: Object[] = [];
    selectedStudents: selectedStudentModel[] = [];
    prevStudentList: SelectedStudentModel[] = [];
    testsTable: any;
    sStorage: any;
    windowStart: string;
    windowEnd: string;
    selectedStudentCount: number = 0;
    attemptedRoute: string;
    overrideRouteCheck: boolean = false;
    valid: boolean = false;
    loader: any;
    retesterExceptions: any;
    modify: boolean = false;
    constructor(public testService: TestService, public auth: Auth, public testScheduleModel: TestScheduleModel, public elementRef: ElementRef, public router: Router, public routeParams: RouteParams, public selectedStudentModel: SelectedStudentModel, public common: Common,
        public dynamicComponentLoader: DynamicComponentLoader) {

    }

    routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(next.urlPath)));
        if (!this.overrideRouteCheck) {
            if (outOfTestScheduling) {
                if (this.testScheduleModel.testId) {
                    this.attemptedRoute = next.urlPath;
                    $('#confirmationPopup').modal('show');
                    return false;
                }
            }
        }
        if (outOfTestScheduling) {
            this.sStorage.removeItem('testschedule');
            this.sStorage.removeItem('retesters');
            this.sStorage.removeItem('previousTest');
        }
        this.overrideRouteCheck = false;
        return true;
    }


    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        if (this.testsTable)
            this.testsTable.destroy();
        $('.selectpicker').val('').selectpicker('refresh');
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(next.urlPath)));
        if (outOfTestScheduling) {
            this.ResetData();
        }

    }

    ngOnInit() {
        this.prevStudentList = [];
        let action = this.routeParams.get('action');
        if (action != undefined && action.trim() === 'modify')
            this.modify = true; 
        // console.log('on init');
        $('#ddlCohort').addClass('hidden');
        $('#noCohort').addClass('hidden');
        $('#addAllStudents').addClass('hidden');
        $('#cohortStudentList').addClass('hidden');
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
            this.initialize();
    }

    initialize(): void {
        this.testsTable = null;
        this.ResetData();
        let savedSchedule = this.testService.getTestSchedule();
        this.testScheduleModel = savedSchedule;
        this.testScheduleModel.currentStep = 3;
        this.testScheduleModel.activeStep = 3;
        this.windowStart = moment(this.testScheduleModel.scheduleStartTime).format("MM.DD.YY"); //'01.01.14'
        this.windowEnd = moment(this.testScheduleModel.scheduleEndTime).format("MM.DD.YY"); //'12.12.16'; 
        this.apiServer = this.auth.common.getApiServer();

        if (this.testScheduleModel.selectedStudents.length > 0) {
            let previousTestId: number = parseInt(this.sStorage.getItem('previousTest'));
            if (!(Number.isNaN(previousTestId)) && previousTestId !== 0) {
                if (previousTestId !== this.testScheduleModel.testId) {
                    this.RefreshSelectedSudent();
                }
                else
                    this.InitializePage();
            }
            else {
                this.InitializePage();
            }
        }
        this.loadActiveCohorts();
    }
    InitializePage(): void {
        if (!this.modify)
            this.UpdateTestName();
        this.ReloadData();
        this.RefreshSelectedStudentCount();
    }
    RefreshSelectedSudent(): void {
        let refreshTestingStatusURL = this.resolveCohortURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.refreshTestingStatus}`);
        let __this = this;
        let input = {
            "SessionTestId": this.testScheduleModel.testId,
            "StudentIds": this.GetStudentIDList(),
            "TestingSessionWindowStart": moment(this.testScheduleModel.scheduleStartTime).format(),
            "TestingSessionWindowEnd": moment(this.testScheduleModel.scheduleEndTime).format()
        }
        let refreshTestingStatusPromise = this.testService.scheduleTests(refreshTestingStatusURL, JSON.stringify(input));
        refreshTestingStatusPromise.then((response) => {
            return response.json();
        })
            .then((json) => {

                if (json != null) {
                    let prevSessionStudentList = __this.testScheduleModel.selectedStudents;
                    __this.testScheduleModel.selectedStudents = [];
                    __this.testScheduleModel.selectedStudents = json;
                    if (prevSessionStudentList.length > 0) {
                        for (let i = 0; i < __this.testScheduleModel.selectedStudents.length; i++) {
                            let student = __this.testScheduleModel.selectedStudents[i];
                            $.each(prevSessionStudentList, function (index, el) {
                                if (el.StudentId === student.StudentId) {
                                    __this.testScheduleModel.selectedStudents[i].CohortId = el.CohortId;
                                    __this.testScheduleModel.selectedStudents[i].CohortName = el.CohortName;
                                }
                            });
                            __this.testScheduleModel.selectedStudents[i].StudentTestId = __this.testScheduleModel.testId;
                            __this.testScheduleModel.selectedStudents[i].StudentTestName = __this.testScheduleModel.testName;
                        }
                    }
                    __this.sStorage.setItem('previousTest', __this.testScheduleModel.testId);
                    __this.ReloadData();
                    __this.RefreshSelectedStudentCount();
                }
                //else
                //    this.router.navigateByUrl('/tests/review');
            })
            .catch((error) => {
                console.log(error);
            });
    }

    ResetData(): void {
        $('#testSchedulingSelectedStudentsList').empty();
        $('#cohortStudents button').each(function () {
            $(this).removeAttr('disabled', 'disabled');
        });
        this.selectedStudents = [];
        this.ShowHideSelectedStudentContainer();
        this.EnableDisableButtonForDetailReview();
    }

    UpdateTestName(): void {
        let _selectedStudent = this.testScheduleModel.selectedStudents;
        let retesters = JSON.parse(this.sStorage.getItem('retesters'));
        for (let i = 0; i < _selectedStudent.length; i++) {
            if (retesters != null) {
                if (retesters.length > 0) {
                    let _retesterStudent: Object = _.filter(retesters, { 'StudentId': _selectedStudent[i].StudentId });
                    if (_retesterStudent.length > 0) { }
                    else {
                        this.testScheduleModel.selectedStudents[i].StudentTestId = this.testScheduleModel.testId;
                        this.testScheduleModel.selectedStudents[i].StudentTestName = this.testScheduleModel.testName;
                    }
                }
                else {
                    this.testScheduleModel.selectedStudents[i].StudentTestId = this.testScheduleModel.testId;
                    this.testScheduleModel.selectedStudents[i].StudentTestName = this.testScheduleModel.testName;
                }
            }
            else {
                this.testScheduleModel.selectedStudents[i].StudentTestId = this.testScheduleModel.testId;
                this.testScheduleModel.selectedStudents[i].StudentTestName = this.testScheduleModel.testName;
            }
        }
    }

    ReloadData(): void {
        let studentlist = "";
        let _selectedStudent = this.testScheduleModel.selectedStudents;
        for (let i = 0; i < _selectedStudent.length; i++) {
            let student = _selectedStudent[i];
            if (typeof (student.MarkedToRemove) === 'undefined' || !student.MarkedToRemove) {
                this.selectedStudents.push(student);
                var retesting = "";
                if (student.Retester) {
                    retesting = "RETESTING";
                }
                studentlist += '<li class="clearfix"><div class="students-in-testing-session-list-item"><span class="js-selected-student">' + student.LastName + ', ' + student.FirstName + '</span><span class="small-tag-text">' + ' ' + retesting + '</span></div><button class="button button-small button-light testing-remove-students-button" data-id="' + student.StudentId + '">Remove</button></li>';
            }
        }
        $('#testSchedulingSelectedStudentsList').append(studentlist);
        this.ShowHideSelectedStudentContainer();
        this.displaySelectedStudentFilter();
        this.EnableDisableButtonForDetailReview();
        this.sortAlpha();
        this.RemoveSelectedStudents();
    }

    loadActiveCohorts(): void {
        this.loadCohorts();
    }

    loadCohorts(): void {
        let cohortURL = this.resolveCohortURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.cohorts}`);
        let subjectsPromise = this.testService.getActiveCohorts(cohortURL);
        let _this = this;
        subjectsPromise.then((response) => {
            if (response.status !== 400) {
                return response.json();
            }
            return [];
        })
            .then((json) => {
                _this.cohorts = json;
                setTimeout(json => {
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
                        $('.selectpicker').selectpicker('mobile');
                    else
                        $('.selectpicker').selectpicker('refresh');
                });

                if (_this.cohorts.length === 0) {
                    $('#ddlCohort').addClass('hidden');
                    $('#noCohort').removeClass('hidden');
                }
                else {
                    $('#noCohort').addClass('hidden');
                    $('#ddlCohort').removeClass('hidden');
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }


    resolveCohortURL(url: string): string {
        return url.replace('§institutionid', this.testScheduleModel.institutionId.toString()).replace('§windowstart', this.windowStart.toString()).replace('§windowend', this.windowEnd.toString());
    }

    resolveCohortStudentsURL(url: string): string {
        return url.replace('§cohortid', this.lastSelectedCohortID.toString()).replace('§testid', this.testScheduleModel.testId.toString());
    }

    loadStudentsByCohort(btnAddAllStudent, tblCohortStudentList, selectedcohort: any, event): void {
        event.preventDefault();
        this.ResetAddButton();
        let cohortId = this.cohorts[selectedcohort.selectedIndex - 1].CohortId;
        this.lastSelectedCohortName = this.cohorts[selectedcohort.selectedIndex - 1].CohortName.toString();
        if (cohortId > 0) {
            this.lastSelectedCohortID = cohortId;
            let CohortStudentsURL = this.resolveCohortStudentsURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.cohortstudents}`);
            let testsPromise = this.testService.getTests(CohortStudentsURL);
            testsPromise.then((response) => {
                return response.json();
            })
                .then((json) => {
                    if (this.testsTable)
                        this.testsTable.destroy();
                    let _self = this;
                    $('#' + btnAddAllStudent.id).removeClass('hidden');
                    $('#' + tblCohortStudentList.id).removeClass('hidden');
                    if (typeof (json.msg) === "undefined")
                        this.cohortStudentlist = json;
                    else
                        this.cohortStudentlist = [];

                    setTimeout(json=> {
                        this.testsTable = $('#cohortStudents').DataTable({
                            "retrieve": true,
                            "paging": false,
                            "responsive": true,
                            "info": false,
                            "scrollY": 551,
                            "dom": 't<"add-students-table-search"f>',
                            "language": {
                                search: "_INPUT_", //gets rid of label.  Seems to leave placeholder accessible to to screenreaders; see http://www.html5accessibility.com/tests/placeholder-labelling.html
                                searchPlaceholder: "Find student in cohort",
                                "zeroRecords": "No matching students in this cohort",
                                "emptyTable": "We’re sorry, there are no students in this cohort.",
                            },
                            columnDefs: [{
                                targets: [2, 4],
                                orderable: false,
                                searchable: false
                            }],

                        });

                        if (_self.cohortStudentlist.length > 0) {
                            this.SearchFilterOptions(this);
                            this.ResetAddButton();
                            this.DisableAddButton();
                            $('#cohortStudentList .add-students-table-search').removeClass('invisible');
                        }
                        else {
                            $('#cohortStudentList .add-students-table-search').addClass('invisible');
                        }
                        this.CheckForAllStudentSelected();
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    SearchFilterOptions(__this: any): void {
        $('#cohortStudentList .dataTables_filter :input').addClass('small-search-box');
        __this.filterTableSearch();
        var checkboxfilters = '<div class="form-group hidden-small-down"><input type="checkbox" class="small-checkbox-image" id="cohortRepeatersOnly" name="filterADA" value="repeatersOnly">' +
            '<label class="smaller" for="cohortRepeatersOnly">Retesting only</label>' +
            '<input type="checkbox" class="small-checkbox-image"  id="cohortExcludeRepeaters" name="filterADA" value="excludeRepeaters">' +
            '<label class="smaller" for="cohortExcludeRepeaters">Exclude retesting students</label></div>';

        $('#cohortStudentList .add-students-table-search').append(checkboxfilters);
        $('#cohortRepeatersOnly').on('click', function () {
            let $excludeRepeaters = $('#cohortExcludeRepeaters');

            if ($(this).is(':checked')) {
                $excludeRepeaters.prop('checked', false);
                $('#cohortStudents').DataTable().column(3)
                    .search('Yes')
                    .draw();
            } else {
                $('#cohortStudents').DataTable().column(3)
                    .search('')
                    .draw();
            }
            __this.IncludeExcludeRetesterFromList();
        });
        $('#cohortExcludeRepeaters').on('click', function () {
            var $Repeaters = $('#cohortRepeatersOnly');

            if ($(this).is(':checked')) {
                $Repeaters.prop('checked', false);
                $('#cohortStudents').DataTable().column(3)
                    .search('No')
                    .draw();
            } else {
                $('#cohortStudents').DataTable().column(3)
                    .search('')
                    .draw();
            }
            __this.IncludeExcludeRetesterFromList();
        });
    }

    AddAllStudentsByCohort(event): void {
        event.preventDefault();
        $('#testSchedulingSelectedStudentsList').append(this.AddStudentList());
        $('#addAllStudents').attr('disabled', 'true');
        this.ShowHideSelectedStudentContainer();
        this.displaySelectedStudentFilter();
        this.EnableDisableButtonForDetailReview();
        this.sortAlpha();
        this.RemoveSelectedStudents();
    }
    AddStudentList(): string {
        let studentlist = "";
        let rows = $("#cohortStudents tbody tr");
        if (rows.length > 0) {
            let __this = this;
            $("#cohortStudents tbody tr").each(function (index, el) {
                let student = {};
                let buttonId = $(el).find('td:eq(4) button').attr('id');
                if (!$('#' + buttonId).prop('disabled')) {
                    student.LastName = $(el).find('td:eq(0)').text();
                    student.FirstName = $(el).find('td:eq(1)').text();
                    student.Retester = $(el).find('td:eq(3)').text() === "Yes" ? true : false;
                    student.StudentId = parseInt(buttonId.split('-')[1]);
                    student.Email = $(el).find('td:eq(4) button').attr('email');
                    student.CohortId = __this.lastSelectedCohortID;
                    student.CohortName = __this.FindCohortName(student.CohortId);
                    student.StudentTestId = __this.testScheduleModel.testId;
                    student.StudentTestName = __this.testScheduleModel.testName;
                    student.Ada = (eval($(el).find('td:eq(4) button').attr('ada'))) == "true" ? true : false;
                    student.NormingId = 0;
                    student.NormingStatus = "";
                    __this.selectedStudents.push(student);
                    $('#' + buttonId).attr('disabled', 'disabled');
                    var retesting = "";
                    if (student.Retester) {
                        retesting = "RETESTING";
                    }
                    studentlist += '<li class="clearfix"><div class="students-in-testing-session-list-item"><span class="js-selected-student">' + student.LastName + ', ' + student.FirstName + '</span><span class="small-tag-text">' + ' ' + retesting + '</span></div><button class="button button-small button-light testing-remove-students-button" data-id="' + student.StudentId + '">Remove</button></li>';
                }
            });
            //  }
        }
        return studentlist;
    }

    ResetAddButton(): void {
        $("#cohortStudents button").each(function (index, el) {
            $(el).removeAttr('disabled', 'disabled');
        });
    }

    IncludeExcludeRetesterFromList(): void {
        let _selectedStudents = this.selectedStudents;
        let _counter = 0;
        if (_selectedStudents.length > 0) {
            this.ResetAddButton();
            for (var j = 0; j < _selectedStudents.length; j++) {
                if (typeof (_selectedStudents[j].MarkedToRemove) === 'undefined' || !_selectedStudents[j].MarkedToRemove) {
                    var buttonid = "cohort-" + _selectedStudents[j].StudentId.toString();
                    $("#cohortStudents button").each(function (index, el) {
                        var button = $(el).attr('id');
                        if (button === buttonid) {
                            $(el).attr('disabled', 'disabled');
                            _counter = _counter + 1;
                        }
                    });
                }
            }
        }
        else {
            this.ResetAddButton();
        }
        if ($("#cohortStudents button").length === _counter) {
            $('#addAllStudents').attr('disabled', 'disabled');
        }
        else
            $('#addAllStudents').removeAttr('disabled', 'disabled');
    }

    DisableAddButton(): void {
        if (this.selectedStudents.length > 0) {
            for (var j = 0; j < this.selectedStudents.length; j++) {
                var buttonid = "cohort-" + this.selectedStudents[j].StudentId.toString();
                $("#cohortStudents button").each(function (index, el) {
                    var button = $(el).attr('id');
                    if (button === buttonid) {
                        $(el).attr('disabled', 'disabled');
                    }
                });
            }
        }
    }

    CheckForAllStudentSelected(): void {
        var rows = $("#cohortStudents tbody tr button");
        if (rows.length > 0) {
            $('#cohortStudents tbody tr button').each(function (index, el) {
                let buttonId = $(el).attr('id');
                if (!$('#' + buttonId).prop('disabled')) {
                    $('#addAllStudents').removeAttr('disabled', 'disabled');
                    return false;
                }
                else
                    $('#addAllStudents').attr('disabled', 'disabled');
            });
        }
        else
            $('#addAllStudents').attr('disabled', 'disabled');
    }

    RemoveSelectedStudents(): void {
        let _self = this;
        $('#testSchedulingSelectedStudentsList button').on('click', function (e) {
            e.preventDefault();
            var rowId = $(this).attr('data-id');
            $(this).parent().remove();
            _self.RemoveStudentFromList(rowId);
        });
    }
    RemoveStudentFromList(buttonid: number): void {
        if (this.selectedStudents.length > 0) {
            this.ResetAddButton();
            this.UpdateSelectedStudentCount(buttonid);
            this.DisableAddButton();
            this.displaySelectedStudentFilter();
            this.CheckForAdaStatus();
            this.CheckForAllStudentSelected();
            if (this.selectedStudentCount < 1) {
                this.ShowHideSelectedStudentContainer();
                this.EnableDisableButtonForDetailReview();
            }
        }
    }

    UpdateSelectedStudentCount(studentid: number): void {
        for (var i = 0; i < this.selectedStudents.length; i++) {
            if (this.selectedStudents[i].StudentId.toString() === studentid) {
                this.selectedStudents.splice(i, 1);
                this.selectedStudentCount = this.selectedStudentCount - 1;
                break;
            }
        }
    }

    RefreshSelectedStudentCount(): void {
        this.selectedStudentCount = this.selectedStudents.length;
    }

    AddStudent(student: Object, event): void {
        event.preventDefault();
        $('#cohort-' + student.StudentId.toString()).attr('disabled', 'disabled');
        student.CohortId = this.lastSelectedCohortID;
        student.CohortName = this.FindCohortName(student.CohortId);
        student.StudentTestId = this.testScheduleModel.testId;
        student.StudentTestName = this.testScheduleModel.testName;
        student.NormingId = 0;
        student.NormingStatus = "";
        this.selectedStudents.push(student);
        var retesting = "";
        if (student.Retester) {
            retesting = "RETESTING";
        }
        var studentli = '<li class="clearfix"><div class="students-in-testing-session-list-item"><span class="js-selected-student">' + student.LastName + ', ' + student.FirstName + '</span><span class="small-tag-text">' + ' ' + retesting + '</span></div><button class="button button-small button-light testing-remove-students-button" data-id="' + student.StudentId + '">Remove</button></li>';
        $('#testSchedulingSelectedStudentsList').append(studentli);
        var counter = 0;
        $("#cohortStudents button").each(function (index, el) {
            let buttonid = $(el).attr('id');
            if (!$('#' + buttonid).prop('disabled')) { counter = counter + 1; }
        });
        if (counter === 0) {
            $('#addAllStudents').attr('disabled', 'disabled');
        }
        this.ShowHideSelectedStudentContainer();
        this.displaySelectedStudentFilter();
        this.EnableDisableButtonForDetailReview();
        this.sortAlpha();
        this.RemoveSelectedStudents();
    }

    RemoveAllSelectedStudents(event): void {
        event.preventDefault();
        this.selectedStudents = [];
        this.ResetAddButton();
        this.CheckForAllStudentSelected();
        this.ShowHideSelectedStudentContainer();
        this.displaySelectedStudentFilter();
        this.EnableDisableButtonForDetailReview();
    }

    ShowHideSelectedStudentContainer(): void {
        this.selectedStudentCount = this.selectedStudents.length;
        if (this.selectedStudentCount < 1) {
            $('.top-section').removeClass('active');
            $('#selectedStudentsContainer').removeClass('hidden');
            $('#testSchedulingSelectedStudentsList').empty();
            $('#testSchedulingSelectedStudents').addClass('hidden');
        }
        else {
            $('.top-section').addClass('active');
            $('#selectedStudentsContainer').addClass('hidden');
            $('#testSchedulingSelectedStudents').removeClass('hidden');
        }
    }
    displaySelectedStudentFilter(): void {
        this.selectedStudentCount = this.selectedStudents.length;
        if (this.selectedStudentCount >= 10) {
            $('#filterSelectedStudents').attr('style', 'visibility:visible');
            this.filterSelectedStudents();
        }
        else {
            if (this.selectedStudentCount > 0) {
                $('#filterSelectedStudents').val("");
                $('#testSchedulingSelectedStudents li').each(function () {
                    $(this).show();
                });
            }
            $('#filterSelectedStudents').attr('style', 'visibility:hidden');
        }
    }

    CheckForAdaStatus(): void {
        if (this.selectedStudents.length > 0) {
            for (var i = 0; i < this.selectedStudents.length; i++) {
                var student = this.selectedStudents[i];
                if (student.Ada) {
                    $('#accommadationNote').removeClass('hidden');
                    break;
                }
                else
                    $('#accommadationNote').addClass('hidden');
            }
        }
    }

    EnableDisableButtonForDetailReview(): void {
        if (this.selectedStudentCount > 0) {
            this.CheckForAdaStatus();
            $('#studentScheduleNote').removeClass('hidden');
            $('#reviewDetails').removeAttr('disabled', 'disabled');
        }
        else {
            $('#accommadationNote').addClass('hidden');
            $('#studentScheduleNote').addClass('hidden');
            $('#reviewDetails').attr('disabled', 'true');
        }
    }
    filterTableSearch(): void {
        let __this = this;
        $('#cohortStudentList :input').on('keyup', function () {
            var that = this;
            var _count = 0;
            $('#cohortStudents tbody tr').each(function (index, el) {
                var firstName = $(el).find('td:eq(1)').text().toUpperCase();
                var lastName = $(el).find('td:eq(0)').text().toUpperCase();
                var searchString = $(that).val().toUpperCase();
                if (!(_.startsWith(firstName, searchString) || _.startsWith(lastName, searchString)))
                    $(this).hide();
                else {
                    $(this).show();
                    _count = _count + 1;
                }
            });
            if (_count)
                __this.CheckForAllStudentSelected();
            else
                $('#addAllStudents').attr('disabled', 'disabled');
        });
    }

    filterSelectedStudents(): void {
        $('#filterSelectedStudents').on('keyup', function () {
            var that = this;
            $('#testSchedulingSelectedStudents li').each(function () {
                var $span = $(this).find('span.js-selected-student');
                var firstName = $span.text().split(',')[0].toUpperCase();
                var lastName = $span.text().split(',')[1].replace(' ', '').toUpperCase();
                var searchString = $(that).val().toUpperCase();
                if (!(_.startsWith(firstName, searchString) || _.startsWith(lastName, searchString)))
                    $(this).hide();
                else
                    $(this).show();
            });
        });
    }

    sortAlpha(): void {
        var mylist = $('#testSchedulingSelectedStudentsList');
        var listitems = mylist.children('li').get();
        listitems.sort(function (a, b) {
            return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
        })
        $.each(listitems, function (idx, itm) { mylist.append(itm); });
    }

    DetailReviewTestClick(event): void {
        event.preventDefault();
        if (!this.validateDates())
            return;
        let studentId = [];
        let selectedStudentModelList = this.selectedStudents;
        if (this.prevStudentList.length===0)
            this.prevStudentList = this.testScheduleModel.selectedStudents;
        if (this.testScheduleModel.selectedStudents.length > 0) {
            this.CheckForPreviousAlternateSelection(selectedStudentModelList);
        }
        else
            this.testScheduleModel.selectedStudents = selectedStudentModelList;
        this.sStorage = this.auth.common.getStorage();
        this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
        console.log('TestScheduleModel with Selected student' + this.testScheduleModel);
        this.WindowException();
    }
    CheckForPreviousAlternateSelection(selectedStudentModelList: any[]): void {
       // let prevStudentList = this.testScheduleModel.selectedStudents;
        let _studentList: SelectedStudentModel[] = [];
        for (let i = 0; i < selectedStudentModelList.length; i++) {
            let _retester = selectedStudentModelList[i];
            let _retesterStudent: SelectedStudentModel = _.filter(this.prevStudentList, { 'StudentId': _retester.StudentId });
            if (_retesterStudent.length > 0)
                _studentList.push(_retesterStudent[0]);
            else
                _studentList.push(_retester);

        }
        this.testScheduleModel.selectedStudents = _studentList;
    }

    FindCohortName(cohortid: number): string {
        for (var i = 0; i < this.cohorts.length; i++) {
            if (this.cohorts[i].CohortId === cohortid) {
                return this.cohorts[i].CohortName;
            }
        }
    }

    GetStudentIDList(): Object[] {
        let studentsid = [];
        if (this.testScheduleModel.selectedStudents.length > 0) {
            for (let i = 0; i < this.testScheduleModel.selectedStudents.length; i++) {
                let student = this.testScheduleModel.selectedStudents[i];
                studentsid[i] = student.StudentId;
            }
        }
        return studentsid;
    }
    resolveRepeaterURL(url: string): string {
        return url.replace('§institutionid', this.testScheduleModel.institutionId.toString());
    }

    prepareInputForModify(): any {
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

        return input;
    }

    GetRepeaterException(): void {
        let __this = this;
        let repeaterExceptionURL: string
        let input: any;
        if (this.modify) {
            repeaterExceptionURL = `${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.test.retestersModify}`;
            input = this.prepareInputForModify();
        }
        else {
            repeaterExceptionURL = this.resolveRepeaterURL(`${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.test.retesters}`);
            input = {
                "SessionTestId": this.testScheduleModel.testId,
                "StudentIds": __this.GetStudentIDList(),
                "TestingSessionWindowStart": moment(this.testScheduleModel.scheduleStartTime).format(),
                "TestingSessionWindowEnd": moment(this.testScheduleModel.scheduleEndTime).format()
            }
        }
        let exceptionPromise = this.testService.scheduleTests(repeaterExceptionURL, JSON.stringify(input));
        exceptionPromise.then((response) => {
            return response.json();
        })
            .then((json) => {

                if (json != null) {
                    __this.resolveExceptions(json, __this);
                }
                else {
                    this.sStorage.removeItem('retesters');
                    if (this.modify)
                        this.router.navigate(['/ModifyReviewTest', { action: 'modify' }]);
                    else
                        this.router.navigate(['ReviewTest']);
                }
                // this.router.navigateByUrl('/tests/review');
            })
            .catch((error) => {
                console.log(error);
            });
    }
    WindowException(): void {
        let __this = this;
        let windowExceptionURL = `${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.test.windowexception}`;
        let input = {
            "SessionTestId": this.testScheduleModel.testId,
            "StudentIds": __this.GetStudentIDList(),
            "TestingSessionWindowStart": moment(this.testScheduleModel.scheduleStartTime).format(),
            "TestingSessionWindowEnd": moment(this.testScheduleModel.scheduleEndTime).format()
        }
        let exceptionPromise = this.testService.scheduleTests(windowExceptionURL, JSON.stringify(input));
        exceptionPromise.then((response) => {
            return response.json();
        })
            .then((json) => {
                __this.HasWindowException(json);

            })
            .catch((error) => {
                console.log(error);
            });
    }
    HasWindowException(_studentWindowException: any): void {
        if (_studentWindowException.length != 0) {
            if (this.loader)
                this.loader.dispose();
            this.dynamicComponentLoader.loadNextToLocation(TimeExceptionPopup, this.elementRef)
                .then(retester=> {
                    this.loader = retester;
                    $('#modalTimingException').modal('show');
                    retester.instance.studentWindowException = _studentWindowException;
                    retester.instance.testSchedule = this.testScheduleModel;
                    retester.instance.canRemoveStudents = false;
                    retester.instance.windowExceptionPopupClose.subscribe((e) => {
                        $('#modalTimingException').modal('hide');
                    });

                });
        }
        else {
            this.GetRepeaterException();
        }
    }

    removeMarked(_students: SelectedStudentModel[]): SelectedStudentModel[] {
        let resolvedStudents: SelectedStudentModel[] = _.remove(_students, function (_student: SelectedStudentModel) {
            return !_student.MarkedToRemove;
        });
        return resolvedStudents;

    }

    resolveExceptions(objException: any, __this: any): boolean {
        let repeaterExceptions: any;
        //if (objException.repeaterExceptions)
        repeaterExceptions = objException;//.repeaterExceptions;
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

            if (studentAlternateTests.length === 0 && studentRepeaterExceptions.length === 0 && alternateTests.length == 0)
                return true;


            if (alternateTests.length > 0)
                __this.hasAlternateTests = true;

            if (studentRepeaterExceptions.length > 0) {
                _.forEach(studentRepeaterExceptions, function (student, key) {
                    let studentId = student.StudentId;
                    student.TestName = __this.testScheduleModel.testName;
                    student.NormingStatus = __this.testScheduleModel.testNormingStatus;
                    if (__this.hasAlternateTests) {
                        student.AlternateTests = _.filter(studentAlternateTests, { 'StudentId': student.StudentId });
                        student.Enabled = _.some(student.AlternateTests, { 'ErrorCode': 0 });
                        student.Checked = !student.Enabled;
                        // if (!student.Enabled)
                        //     __this.markForRemoval(student.StudentId, true);
                        _.forEach(student.AlternateTests, function (studentAlternate, key) {
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
                return _.some(this.retesterExceptions, function (retester) {

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
        return _.filter(this.testScheduleModel.selectedStudents, function (student) {
            return !_.has(student, 'MarkedToRemove') || !student.MarkedToRemove;
        }).length;
    }
    studentCountInSession(): number {
        let _count: number = 0;
        let _selectedStudent = this.testScheduleModel.selectedStudents;
        if (_selectedStudent.length > 0) {
            for (let i = 0; i < _selectedStudent.length; i++) {
                let student = _selectedStudent[i];
                if (typeof (student.MarkedToRemove) === 'undefined' || student.MarkedToRemove) {
                    if (student.MarkedToRemove)
                        _count = _count + 1;
                }
            }
            _count = this.selectedStudentCount - _count;
        }
        return _count;
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
                        if (this.studentCountInSession()) {
                            if (this.modify)
                                this.router.navigate(['/ModifyReviewTest', { action: 'modify' }]);
                            else
                                this.router.navigate(['ReviewTest']);
                            // this.router.navigateByUrl('/tests/review');
                        }
                        else
                            this.initialize();
                    }
                });
                retester.instance.retesterNoAlternatePopupCancel.subscribe((e) => {
                    $('#modalNoAlternateTest').modal('hide');
                });

            });
    }


    loadRetesterAlternatePopup(_studentRepeaterExceptions: any): void {
        _studentRepeaterExceptions = this.CheckForRetesters(_studentRepeaterExceptions);
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
                        this.DeleteRemovedStudentFromSession(retesters);
                        
                        this.valid = this.unmarkedStudentsCount() > 0 ? true : false;
                        if (this.studentCountInSession()) {
                            if (this.modify)
                                this.router.navigate(['/ModifyReviewTest', { action: 'modify' }]);
                            else
                                this.router.navigate(['ReviewTest']);
                            // this.router.navigateByUrl('/tests/review');                        
                        }
                        else
                            this.initialize();
                    }
                });
                retester.instance.retesterAlternatePopupCancel.subscribe((e) => {
                    $('#modalAlternateTest').modal('hide');
                });

            });
    }
    DeleteRemovedStudentFromSession(_retesters: any): void {
        this.sStorage.removeItem('retesters');
        if (_retesters.length > 0) {
            let _selectedStudent = this.testScheduleModel.selectedStudents;
            if (_selectedStudent.length > 0) {
                for (let i = 0; i < _selectedStudent.length; i++) {
                    let student = _selectedStudent[i];
                    if (student.MarkedToRemove && typeof (student.MarkedToRemove) !== 'undefined') {
                        $.each(_retesters, function (index, el) {
                            if (el.StudentId === student.StudentId) {
                                _retesters.splice(index, 1);
                                return false;
                            }
                        });
                    }
                }
            }
        }
        this.sStorage.setItem('retesters', JSON.stringify(_retesters));
    }

    CheckForRetesters(_studentRepeaterExceptions: any): Object[] {
        if (_studentRepeaterExceptions.length !== 0) {
            let retesters = JSON.parse(this.sStorage.getItem('retesters'));
            if (retesters != null) {
                if (retesters.length === 0) {
                    return _studentRepeaterExceptions;
                }
                else {
                    let _repeterExceptions: Object[] = [];
                    for (let i = 0; i < _studentRepeaterExceptions.length; i++) {
                        let _retester = _studentRepeaterExceptions[i];
                        let _retesterStudent: Object = _.filter(retesters, { 'StudentId': _retester.StudentId });
                        if (_retesterStudent.length > 0)
                            _repeterExceptions.push(_retesterStudent[0]);
                        else
                            _repeterExceptions.push(_retester);
                    }
                    return _repeterExceptions;
                }
            }
            else
                return _studentRepeaterExceptions;
        }
        else
            return _studentRepeaterExceptions;
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

    getClassName(isRetester: boolean): string {
        if (isRetester)
            return "teal bolded";
        else
            return "";
    }

    onOKAlert(): void {
        $('#alertPopup').modal('hide');
        this.overrideRouteCheck = true;
        this.router.navigate(['ManageTests']);
    }

    onCancelChanges(): void {
        this.overrideRouteCheck = true;
        this.testService.clearTestScheduleObjects();
        this.router.parent.navigate(['/ManageTests']);
    }

    onContinueMakingChanges(): void {
        // continue making changes after confirmation popup..
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
                    let scheduleURL = this.resolveScheduleURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.viewtest}`, this.testScheduleModel.scheduleId);
                    let status = this.testService.getTestStatus(scheduleURL);
                    if (status === 'completed' || status === 'inprogress') {
                        $('#alertPopup').modal('show');
                        return false;
                    }
                }
                else {
                    if (moment(scheduleEndTime).isBefore(new Date(), 'day')) {
                        $('#alertPopup').modal('show');
                        return false;
                    }
                }
            }
        }
        return true;
    }

}