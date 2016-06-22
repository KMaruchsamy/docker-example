import {Component, OnInit, AfterViewInit, DynamicComponentLoader, ElementRef, ViewEncapsulation} from 'angular2/core';
import {Router, RouterLink, RouteParams, OnDeactivate, CanDeactivate, ComponentInstruction, Location } from 'angular2/router';
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
import {SelfPayStudentPopup} from './self-pay-student-popup';
import {SortPipe} from '../../pipes/sort.pipe';

import * as _ from '../../lib/index';
import '../../plugins/dropdown.js';
import '../../plugins/bootstrap-select.min.js';
import '../../plugins/jquery.dataTables.min.js';
import '../../plugins/dataTables.responsive.js';
import '../../lib/modal.js';
import '../../lib/tooltip.js';
import '../../lib/popover.js';
import '../../plugins/typeahead.bundle.js';
//import '../../plugins/dataTables.bootstrap.min.js';

@Component({
    selector: 'add-students',
    templateUrl: 'templates/tests/add-students.html',
    encapsulation: ViewEncapsulation.None,
    styles: [`#addByName.active + #cohortStudentList .add-students-table-search {display: table; width: 100%;}
    #addByName.active + #cohortStudentList .add-students-table-search .form-group {display: table-cell; text-align: center;}
    #addByName.active + #cohortStudentList .add-students-table-search .form-group label.smaller {margin-left: 2em; margin-right: 2em;}`],
    providers: [TestService, Auth, TestScheduleModel, SelectedStudentModel, Common, RetesterAlternatePopup, RetesterNoAlternatePopup, TimeExceptionPopup, AlertPopup, SelfPayStudentPopup],
    directives: [PageHeader, TestHeader, PageFooter, NgFor, ConfirmationPopup, RouterLink, AlertPopup],
    pipes: [RemoveWhitespacePipe, SortPipe]
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
    hasADA: boolean = false;
    noCohort: boolean = false;
    noStudentInCohort: string = "No matching students in this cohort";
    noStudentInFindByName: string = "We’re sorry, there are no students that match your search. Please try again.";
    _selfPayStudent: Object[] = [];
    prevSearchText: string = "";
    noSearchStudent: boolean = false;
    AddByNameStudentlist: Object[] = []; // To Check AddByName got students or not...
    AddByCohortStudentlist: Object[] = []; // To preserve previous selected cohort
    isAddByName: boolean = false;
    // studentTable: boolean = false;

    constructor(public testService: TestService, public auth: Auth, public testScheduleModel: TestScheduleModel, public elementRef: ElementRef, public router: Router, public routeParams: RouteParams, public selectedStudentModel: SelectedStudentModel, public common: Common,
        public dynamicComponentLoader: DynamicComponentLoader, public aLocation: Location) {

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
        $('#cohortStudentList').addClass('hidden');
        // this.studentTable = false;  //remove any initialized tables from DOM
        $('.selectpicker').val('').selectpicker('refresh');
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(next.urlPath)));
        if (outOfTestScheduling) {
            this.ResetData();
        }
        $('.typeahead').typeahead('destroy');
    }

    ngOnInit() {
        let self = this;
        this.testsTable = null;
        this.SetPageToAddByCohort();
        $(document).scrollTop(0);
        this.prevStudentList = [];
        let action = this.routeParams.get('action');
        if (action != undefined && action.trim() === 'modify') {
            this.modify = true;
            $('title').html('Modify: Add Students &ndash; Kaplan Nursing');
        } else {
            $('title').html('Add Students &ndash; Kaplan Nursing');
        }
        this.CheckForAdaStatus();

        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
            this.initialize();

        this.addClearIcon();
        let __this = this;
        $('#chooseCohortContainer').on('click', '#cohortStudentList .clear-input-values', function () {
            __this.clearTableSearch();
        });
        // $('.tab-content').on('click', '#cohortStudentList .clear-input-values', function () {
        //     __this.clearTableSearch();
        // });

        $('body').on('hidden.bs.popover', function (e) {
            $(e.target).data("bs.popover").inState.click = false;
        });

        $('body').on('click', function (e) {
            $('[data-toggle="popover"]').each(function () {
                //the 'is' for buttons that trigger popups
                //the 'has' for icons within a button that triggers a popup
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            });
        });


        $('.typeahead').bind('typeahead:select', function (ev, suggetion) {
            ev.preventDefault();
            self.FilterStudentfromResult(suggetion);
        });
    }

    CallonSearchClick(e): void {
        e.preventDefault();
        $('.typeahead').typeahead('open');
    }
    CallOnSearchInput(searchElement: any): void {
        setTimeout(() => {
            let searchText = searchElement.value;
             $('#findStudentToAdd').focus();
            this.BindSearch(searchText);
        });
    }

    initialize(): void {
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
                let retesting = "";
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
                    this.noCohort = true;
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

    markDuplicate(objArray: Object[]): Object[] {

        if (!objArray)
            return [];

        if (objArray.length === 1)
            return objArray;

        let duplicate = false;
        _.forEach(objArray, (obj, key) => {

            let duplicateArray = _.filter(objArray, function (o) { return o.StudentId !== obj.StudentId && obj.FirstName.toUpperCase() === o.FirstName.toUpperCase() && obj.LastName.toUpperCase() === o.LastName.toUpperCase() });
            if (duplicateArray.length > 0)
                obj.duplicate = true;
            else
                obj.duplicate = false;
        });

        return objArray;
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
            let _self = this;
            testsPromise.then((response) => {
                return response.json();
            })
                .then((json) => {
                    if (_self.testsTable)
                        _self.testsTable.destroy();

                    $('#' + btnAddAllStudent.id).removeClass('hidden');
                    $('#' + tblCohortStudentList.id).removeClass('hidden');
                    // this.studentTable = true;
                    if (typeof (json.msg) === "undefined")
                        this.cohortStudentlist = this.markDuplicate(json);
                    else
                        this.cohortStudentlist = [];

                    setTimeout(json => {
                        _self.testsTable = $('#cohortStudents').DataTable(_self.GetConfig(551));
                        this.RefreshAllSelectionOnCohortChange();
                    });
                })

                .catch((error) => {
                    throw (error);
                });
        }
    }

    RefreshAllSelectionOnCohortChange(): void {
        if (this.cohortStudentlist.length > 0) {
            this.SearchFilterOptions(this);
            this.ResetAddButton();
            this.DisableAddButton();
            $('#cohortStudentList .add-students-table-search').removeClass('invisible');
        }
        else {
            $('#cohortStudentList .add-students-table-search').addClass('invisible');
        }
        this.CheckForAllStudentSelected();
        this.initPopOver();
    }

    initPopOver(): void {
        $('.has-popover').popover();
        $('#cohortStudents .has-popover').on('show.bs.popover', function () {
            var firstRow = $('#cohortStudents tbody tr:visible:first').find($(this)).length;
            if (firstRow > 0) {
                $('.dataTables_scrollBody').css('padding-top', 35)
                    .find('table').addClass('border-top')
            }
        });
    }

    SearchFilterOptions(__this: any): void {
        $('#cohortStudentList .dataTables_filter :input').addClass('small-search-box').after('<span class="icon"></span>');
        __this.filterTableSearch();
        let checkboxfilters = '<div class="form-group hidden-small-down"><input type="checkbox" class="small-checkbox-image" id="cohortRepeatersOnly" name="filterADA" value="repeatersOnly">' +
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
            let $Repeaters = $('#cohortRepeatersOnly');

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
                if ($(el).attr('class').search('hidden') < 0) {
                    let buttonId = $(el).find('td:eq(4) button').attr('id');
                    if (!$('#' + buttonId).prop('disabled')) {
                        student.LastName = $(el).find('td:eq(0)').attr('lastname');
                        student.FirstName = $(el).find('td:eq(1)').attr('firstname');
                        student.Retester = $(el).find('td:eq(3)').text() === "Yes" ? true : false;
                        student.StudentId = parseInt(buttonId.split('-')[1]);
                        student.Email = $(el).find('td:eq(4) button').attr('email');
                        student.CohortId = __this.lastSelectedCohortID;
                        student.CohortName = __this.FindCohortName(student.CohortId);
                        student.StudentTestId = __this.testScheduleModel.testId;
                        student.StudentTestName = __this.testScheduleModel.testName;
                        student.Ada = $(el).find('td:eq(4) button').attr('ada') === "true" ? true : false;
                        student.NormingId = 0;
                        student.NormingStatus = "";
                        __this.selectedStudents.push(student);
                        $('#' + buttonId).attr('disabled', 'disabled');
                        let retesting = "";
                        if (student.Retester) {
                            retesting = "RETESTING";
                        }
                        studentlist += '<li class="clearfix"><div class="students-in-testing-session-list-item"><span class="js-selected-student">' + student.LastName + ', ' + student.FirstName + '</span><span class="small-tag-text">' + ' ' + retesting + '</span></div><button class="button button-small button-light testing-remove-students-button" data-id="' + student.StudentId + '">Remove</button></li>';
                    }
                }
            });
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
            for (let j = 0; j < _selectedStudents.length; j++) {
                if (typeof (_selectedStudents[j].MarkedToRemove) === 'undefined' || !_selectedStudents[j].MarkedToRemove) {
                    let buttonid = "cohort-" + _selectedStudents[j].StudentId.toString();
                    $("#cohortStudents button").each(function (index, el) {
                        let button = $(el).attr('id');
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
            for (let j = 0; j < this.selectedStudents.length; j++) {
                let buttonid = "cohort-" + this.selectedStudents[j].StudentId.toString();
                $("#cohortStudents button").each(function (index, el) {
                    let button = $(el).attr('id');
                    if (button === buttonid) {
                        $(el).attr('disabled', 'disabled');
                    }
                });
            }
        }
    }

    CheckForAllStudentSelected(): void {
        let rows = $("#cohortStudents tbody tr button");
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
            let rowId = $(this).attr('data-id');
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
        for (let i = 0; i < this.selectedStudents.length; i++) {
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
        student.CohortId = (this.isAddByName ? student.CohortId : this.lastSelectedCohortID);
        student.CohortName = this.FindCohortName(student.CohortId);
        student.StudentTestId = this.testScheduleModel.testId;
        student.StudentTestName = this.testScheduleModel.testName;
        student.NormingId = 0;
        student.NormingStatus = "";
        this.selectedStudents.push(student);
        let retesting = "";
        if (student.Retester) {
            retesting = "RETESTING";
        }
        let studentli = '<li class="clearfix"><div class="students-in-testing-session-list-item"><span class="js-selected-student">' + student.LastName + ', ' + student.FirstName + '</span><span class="small-tag-text">' + ' ' + retesting + '</span></div><button class="button button-small button-light testing-remove-students-button" data-id="' + student.StudentId + '">Remove</button></li>';
        $('#testSchedulingSelectedStudentsList').append(studentli);
        let counter = 0;
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
            $('#testSchedulingSelectedStudentsList').empty();
        }
        else {
            $('.top-section').addClass('active');
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
            if (_.some(this.selectedStudents, { 'Ada': true })) {
                this.hasADA = true;
            } else {
                this.hasADA = false;
            }
        }
    }

    EnableDisableButtonForDetailReview(): void {
        if (this.selectedStudentCount > 0) {
            this.CheckForAdaStatus();
            $('#reviewDetails').removeAttr('disabled', 'disabled');
        }
        else {
            $('#reviewDetails').attr('disabled', 'true');
        }
    }

    filterTableSearch(): void {
        let __this = this;
        $('#cohortStudentList .dataTables_filter :input').on('keyup click', function () {
            $('#noMatchingStudents').removeClass('hidden');
            let that = this;
            let _count = 0;
            let _lname = "";
            $('#cohortStudents tbody tr').each(function (index, el) {
                let firstName = $(el).find('td:eq(1)').text().toUpperCase();
                let lastName = $(el).find('td:eq(0)').text().toUpperCase();
                _lname = lastName;
                let searchString = $(that).val().toUpperCase();
                if (lastName !== __this.noStudentInCohort.toUpperCase()) {
                    if (!(_.startsWith(firstName, searchString) || _.startsWith(lastName, searchString))) {
                        $(this).addClass('hidden');
                    }
                    else {
                        $(this).removeClass('hidden');
                        _count = _count + 1;
                    }
                }
            });
            if (_count)
                __this.CheckForAllStudentSelected();
            else {
                if (_lname !== __this.noStudentInCohort.toUpperCase()) {
                    $('#cohortStudents tbody').append('<tr class="odd" id="noMatchingStudents"><td class="not-collapsed" style="text-align:center" colspan="5" >' + __this.noStudentInCohort + '</td></tr>');
                    var $table = $('#cohortStudents tbody').parent('table')
                }
                $('#addAllStudents').attr('disabled', 'disabled');
            }
        });
    }

    filterSelectedStudents(): void {
        $('#filterSelectedStudents').on('keyup', function () {
            let that = this;
            $('#testSchedulingSelectedStudents li').each(function () {
                let $span = $(this).find('span.js-selected-student');
                let firstName = $span.text().split(',')[0].toUpperCase();
                let lastName = $span.text().split(',')[1].replace(' ', '').toUpperCase();
                let searchString = $(that).val().toUpperCase();
                if (!(_.startsWith(firstName, searchString) || _.startsWith(lastName, searchString)))
                    $(this).addClass('hidden');
                else {
                    $(this).removeClass('hidden');
                }
            });
        });
    }

    addClearIcon(): void {
        $('.testing-add-students-container').on('keyup', '.small-search-box', function () {
            if ($(this).val().length > 0) {
                $(this).next('span').addClass('clear-input-values');
            } else {
                $(this).next('span').removeClass('clear-input-values');
            }
        });
    }

    clearTableSearch(): void {
        let __this = this;
        var $that = $('.tab-pane.active :input');
        $that.val('');
        $that.next('span').removeClass('clear-input-values');

        this.filterTableSearch()

        $('table tbody tr').each(function () {
            $(this).removeClass('hidden');
            $('#noMatchingStudents').addClass('hidden');
        });

        //Right now necessary because table is empty of rows except for no matching student row after more than one letter entered
        //When only only letter has been entered table rows are simply hidden
        $that.on('click', function () {

            var $table = $('.tab-pane.active table');
            var table = $('.tab-pane.active table').DataTable();
            table.search(this.value).draw();
            $table.find('tr').each(function () {
                $(this).removeClass('hidden');
            });
            __this.CheckForAllStudentSelected();
        });
    }

    invokeFilterSelectedStudents(): void {
        var $that = $('#filterSelectedStudents');
        $that.val('').next().removeClass('clear-input-values');

        $('#testSchedulingSelectedStudents li').each(function () {
            $(this).removeClass('hidden');
        });
    }

    sortAlpha(): void {
        let mylist = $('#testSchedulingSelectedStudentsList');
        let listitems = mylist.children('li').get();
        listitems.sort(function (a, b) {
            return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
        })
        $.each(listitems, function (idx, itm) { mylist.append(itm); });
    }

    SetPageToAddByCohort(): void {
        $('#ByCohort').addClass('active');
        $('#ByName').removeClass('active');
        $('#addByCohort').addClass('active');
        $('#addByName').removeClass('active');
        $('#findStudentToAdd').val("");
        $('#btnTypeahead').attr('disabled', 'disabled');
        this.isAddByName = false;
        this.noSearchStudent = false;
        $('.typeahead').typeahead('destroy');
        this.prevSearchText = "";

    }
    DetailReviewTestClick(event): void {
        event.preventDefault();

        if (!this.validateDates())
            return;
        let studentId = [];
        let selectedStudentModelList = this.selectedStudents;
        if (this.prevStudentList.length === 0)
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
        for (let i = 0; i < this.cohorts.length; i++) {
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
                    this.HasStudentPayException();
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
    WindowException(): void {
        let __this = this;
        let windowExceptionURL = `${this.auth.common.apiServer}${links.api.v2baseurl}${links.api.admin.test.windowexception}`;
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
                __this.SeperateOutSelfPayStudents(json);

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
                .then(retester => {
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
            this.GetRepeaterException(); // Repeater Exception will call only when having no timing window exception
        }
    }


    markSelfPayStudents() {
        if (this._selfPayStudent && this._selfPayStudent.length > 0) {
            if (this.testScheduleModel && this.testScheduleModel.selectedStudents && this.testScheduleModel.selectedStudents.length > 0) {
                _.forEach(this._selfPayStudent, (student, key) => {
                    let selectedStudent: SelectedStudentModel = _.find(this.testScheduleModel.selectedStudents, { 'StudentId': student.StudentId });
                    if (selectedStudent)
                        selectedStudent.StudentPay = true;
                });
                this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
            }
        }
    }

    HasStudentPayException(): void {
        this.markSelfPayStudents();
        if (this._selfPayStudent.length > 0) {
            if (this.loader)
                this.loader.dispose();
            this.dynamicComponentLoader.loadNextToLocation(SelfPayStudentPopup, this.elementRef)
                .then(retester => {
                    this.loader = retester;
                    $('#selfPayStudentModal').modal('show');
                    this.markSelfPayStudents();
                    retester.instance.selfPayStudentException = this._selfPayStudent;
                    retester.instance.testSchedule = this.testScheduleModel;
                    //retester.instance.canRemoveStudents = false;
                    retester.instance.selfPayStudentExceptionPopupClose.subscribe((e) => {
                        $('#selfPayStudentModal').modal('hide');
                        if (this.modify)
                            this.router.navigate(['/ModifyReviewTest', { action: 'modify' }]);
                        else
                            this.router.navigate(['ReviewTest']);
                    });

                });
        }
        else {
            if (this.modify)
                this.router.navigate(['/ModifyReviewTest', { action: 'modify' }]);
            else
                this.router.navigate(['ReviewTest']);
        }
    }

    SeperateOutSelfPayStudents(_studentWindowException: any): void {
        let _timingWindowStudents: Object[] = [];
        let __this = this;
        if (_studentWindowException.length > 0) {
            __this._selfPayStudent = [];
            $.each(_studentWindowException, function () {
                if (this.IgnoreExceptionIfStudentPay && __this.auth.isStudentPayEnabledInstitution(__this.testScheduleModel.institutionId))
                    __this._selfPayStudent.push(this);
                else
                    _timingWindowStudents.push(this);
            });
            if (_timingWindowStudents.length > 0) {
                this.HasWindowException(_timingWindowStudents);
            }
            else {
                this.GetRepeaterException();
            }
        }
        else {
            __this._selfPayStudent = [];
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
        repeaterExceptions = objException;
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
        if (this.loader)
            this.loader.dispose();
        this.dynamicComponentLoader.loadNextToLocation(RetesterNoAlternatePopup, this.elementRef)
            .then(retester => {
                this.loader = retester;
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

                            this.HasStudentPayException();
                            // this.router.navigateByUrl('/tests/review');
                        }
                        else {
                            this.initialize();
                            this.CheckForAllStudentSelected();
                        }
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
            .then(retester => {
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
                            //if (this.modify)
                            //    this.router.navigate(['/ModifyReviewTest', { action: 'modify' }]);
                            //else
                            //   this.router.navigate(['ReviewTest']);
                            this.HasStudentPayException();
                            // this.router.navigateByUrl('/tests/review');
                        }
                        else {
                            this.initialize();
                            this.CheckForAllStudentSelected();
                        }
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
        if (this.modify)
            this.router.navigate(['/ModifyScheduleTest', { action: 'modify' }]);
        else
            this.router.navigate(['ScheduleTest']);
    }

    onCancelChanges(): void {
        this.overrideRouteCheck = true;
        this.testService.clearTestScheduleObjects();
        this.router.parent.navigate(['/ManageTests']);
    }

    onContinueMakingChanges(): void {
        // continue making changes after confirmation popup..
    }


    resolveScheduleURL(url: string, scheduleId: number): string {
        return url.replace('§scheduleId', scheduleId.toString());
    }

    validateDates(): boolean {
        return this.testService.validateDates(this.testScheduleModel, this.testScheduleModel.institutionId, this.modify);
    }

    AddByCohort(): void {

        this.SetPageToAddByCohort();
        let _self = this;
        if (this.AddByCohortStudentlist.length > 0) {
            let _promise = new Promise(function (resolve, reject) {
                resolve();
            });
            _promise.then(() => {
                if (_self.testsTable)
                    _self.testsTable.destroy();
                _self.cohortStudentlist = _self.AddByCohortStudentlist;

                setTimeout(() => {
                    _self.AddByCohortStudentlist = [];
                    _self.testsTable = $('#cohortStudents').DataTable(_self.GetConfig(551));
                    $('#cohortStudentList').removeClass('hidden');
                    // this.studentTable = true;
                    _self.noSearchStudent = false;
                    _self.RefreshAllSelectionOnCohortChange();
                    _self.RedrawColumns();

                });
            })
                .catch((error) => {
                    throw (error);
                });
        }
        else {
            this.cohortStudentlist = [];
            $('#cohortStudentList').addClass('hidden');
            // this.studentTable = false;
        }
    }

    //Fix table headers collapsing in width as tab views are switched
    RedrawColumns(): void {
        this.testsTable.responsive.recalc().columns.adjust();
    }

    AddByName(e): void {
        e.preventDefault();
        $('#ByCohort').removeClass('active');
        $('#ByName').addClass('active');
        $('#addByCohort').removeClass('active');
        $('#addByName').addClass('active');
        this.isAddByName = true;
        $('#findStudentToAdd').focus();
        if (this.cohortStudentlist.length > 0) {
            this.AddByCohortStudentlist = this.cohortStudentlist;
            $('#cohortStudentList').addClass('hidden');
            // this.studentTable = false;
        }

    }

    BindSearch(searchText: string): void {
        let mainSearchText: string = searchText;
        if (!searchText.startsWith(' ')) {
            if (searchText.length > 1) {
                $('#btnTypeahead').removeAttr('disabled', 'disabled');
                if (searchText.length > 2) {        // On paste the searchString....  
                    searchText = searchText.trim().substr(0, 2).toUpperCase();
                }  // End of paste the searchString....  

                if (searchText.length === 2 && this.prevSearchText != searchText.trim().toUpperCase()) {
                    //call the api
                    this.loadSearchStudent(searchText);
                    this.prevSearchText = searchText.trim().toUpperCase();
                }
                else if (mainSearchText.length > 1 && this.prevSearchText === searchText.trim().toUpperCase()) {
                    this.BindTypeAhead(mainSearchText);
                }
                else {
                    $('.typeahead').typeahead('destroy');
                    this.noSearchStudent = false;
                }
            }
            else {
                $('.typeahead').typeahead('close');
                $('#btnTypeahead').attr('disabled', 'disabled');
            }
        }
        else {
            $('#findStudentToAdd').val("");
            $('#findStudentToAdd').focus();
            $('.typeahead').typeahead('close');
        }
    }

    loadSearchStudent(searctText: string): void {
        let cohortURL = this.resolveSearchStudentURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.searchStudents}`, searctText);
        let searchStudentPromise = this.testService.getSearchStudent(cohortURL);
        let __this = this;
        searchStudentPromise.then((response) => {
            if (response.status !== 400) {
                return response.json();
            }
            return [];
        })
            .then((json) => {
                __this.AddByNameStudentlist = json;

                if (__this.AddByNameStudentlist.length > 0) {
                    $('.typeahead').focus();
                    __this.BindTypeAhead(searctText);
                }
                else {
                    setTimeout(() => { $('.typeahead').focus(); });
                    $('.typeahead').typeahead('destroy');
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    BindTypeAhead(_searchText: string): void {
        $('.typeahead').typeahead('destroy');
        if (this.AddByNameStudentlist.length > 0) {            
            let __this = this;
            $('#chooseStudent .typeahead').typeahead({
                hint: false,
                highlight: true,
                minLength: 2,
            },
                {
                    name: 'students',
                    source: function (query, process) {
                        let data: string = [];

                        $.each(__this.AddByNameStudentlist, function (index, el) {
                            let firstName = el.FirstName.toUpperCase();
                            let lastName = el.LastName.toUpperCase();
                            let isValidToSplitCheck: boolean = true;
                            let isValidToCheckFullName: boolean = true;
                            let _student = "";
                            _searchText = _searchText.trim().toUpperCase();
                            if (_.startsWith(firstName, _searchText) || _.startsWith(lastName, _searchText)) {
                                _student = el.FirstName + " " + el.LastName;
                                if ($.inArray(_student, data) === -1)
                                    data.push(_student);
                                isValidToSplitCheck = false;
                            }
                            else if (isValidToSplitCheck) {
                                let _fname = firstName.split(' ');
                                let _lname = lastName.split(' ');
                                if (_fname.length > 1 || _lname.length > 1) {
                                    let isValidToCheckLName = true;
                                    $.each(_fname, function (i, e) {
                                        if (_.startsWith(e, _searchText)) {
                                            _student = el.FirstName + " " + el.LastName;
                                            if ($.inArray(_student, data) === -1)
                                                data.push(_student);
                                            isValidToCheckLName = false;
                                            isValidToCheckFullName = false;
                                            return false;
                                        }
                                    });
                                    if (isValidToCheckLName) {
                                        $.each(_lname, function (i, e) {
                                            if (_.startsWith(e, _searchText)) {
                                                _student = el.FirstName + " " + el.LastName;
                                                if ($.inArray(_student, data) === -1)
                                                    data.push(_student);
                                                isValidToCheckFullName = false;
                                                return false;
                                            }
                                        });
                                    }
                                }
                                if (isValidToCheckFullName) {
                                    let studentName = firstName + " " + lastName;
                                    if (_.startsWith(studentName, _searchText)) {
                                        _student = el.FirstName + " " + el.LastName;
                                        if ($.inArray(_student, data) === -1)
                                            data.push(_student);
                                    }
                                }
                            }
                            else {
                                let studentName = firstName + " " + lastName;
                                if (_.startsWith(studentName, _searchText)) {
                                    _student = el.FirstName + " " + el.LastName;
                                    if ($.inArray(_student, data) === -1)
                                        data.push(_student);
                                }
                            }
                        });
                        process(data);

                    },
                    limit: 200
                });


            setTimeout(() => { $('#findStudentToAdd').focus(); });
            $('.typeahead').typeahead('open');
        }
        else {
            setTimeout(() => { $('.typeahead').focus(); });
        }

    }
    FillGridWithSearch(searchText: string, e): void {
        e.preventDefault(); 
        if (searchText.length > 1) {
            if (e.keyCode === 13) {
                this.FilterStudentfromResult(searchText);
            }
        }
    }

    resolveSearchStudentURL(url: string, searctText: string): string {
        return url.replace('§institutionid', this.testScheduleModel.institutionId.toString()).replace('§searchstring', searctText).replace('§testid', this.testScheduleModel.testId.toString()).replace('§windowstart', this.windowStart.toString()).replace('§windowend', this.windowEnd.toString());
    }

    FilterStudentfromResult(searchString: string): void {
        let _self = this;
        if (searchString.length > 1) {
            if (this.AddByNameStudentlist.length > 0) {
                let _searchStudents: Object[] = [];
                $.each(this.AddByNameStudentlist, function (index, el) {
                    let firstName = el.FirstName.toUpperCase();
                    let lastName = el.LastName.toUpperCase();
                    let isValidToSplitCheck: boolean = true;
                    let isValidToCheckFullName: boolean = true;
                    searchString = searchString.trim().toUpperCase();
                    if (_.startsWith(firstName, searchString) || _.startsWith(lastName, searchString)) {
                        _searchStudents.push(el);
                        isValidToSplitCheck = false;
                    }
                    else if (isValidToSplitCheck) {
                        let _fname = firstName.split(' ');
                        let _lname = lastName.split(' ');
                        if (_fname.length > 1 || _lname.length > 1) {
                            let isValidToCheckLName = true;
                            $.each(_fname, function (i, e) {
                                if (_.startsWith(e, searchString)) {
                                    _searchStudents.push(el);
                                    isValidToCheckLName = false;
                                    isValidToCheckFullName = false;
                                    return false;
                                }
                            });
                            if (isValidToCheckLName) {
                                $.each(_lname, function (i, e) {
                                    if (_.startsWith(e, searchString)) {
                                        _searchStudents.push(el);
                                        isValidToCheckFullName = false;
                                        return false;
                                    }
                                });
                            }
                        }
                        if (isValidToCheckFullName) {
                            let studentName = firstName + " " + lastName;
                            if (_.startsWith(studentName, searchString)) {
                                _searchStudents.push(el);
                            }
                        }
                    }
                    else {
                        let studentName = firstName + " " + lastName;
                        if (_.startsWith(studentName, searchString)) {
                            _searchStudents.push(el);
                        }
                    }
                });
                if (_searchStudents.length > 0) {
                    let _promise = new Promise(function (resolve, reject) {
                        resolve(_searchStudents);
                    });

                    _promise.then((data) => {
                        if (_self.testsTable)
                            _self.testsTable.destroy();
                        _self.cohortStudentlist = _self.markDuplicate(data);
                        setTimeout(data => {
                            _self.testsTable = $('#cohortStudents').DataTable(_self.GetConfig(493));
                            $('#cohortStudentList').removeClass('hidden');
                            // this.studentTable = true;
                            _self.noSearchStudent = false;
                            $('#cohortStudents_filter').addClass('hidden');
                            $('.typeahead').typeahead('close');
                            _self.RefreshAllSelectionOnCohortChange();
                            _self.RedrawColumns();
                        });
                    })
                        .catch((error) => {
                            throw (error);
                        });
                }
                else {
                    this.noSearchStudent = true;
                    $('.typeahead').typeahead('close');
                    $('#cohortStudentList').addClass('hidden');
                    // this.studentTable = false;
                }
            }
            else {
                this.noSearchStudent = true;
                $('.typeahead').typeahead('close');
                $('#cohortStudentList').addClass('hidden');
                // this.studentTable = false;
            }
        }
    }

    GetConfig(scrollHeight): any {
        let _config = {
            "destroy": true,
            "retrive": true,
            "paging": false,
            "responsive": true,
            "info": false,
            "scrollY": scrollHeight,
            "dom": 't<"add-students-table-search"f>',
            "language": {
                search: "_INPUT_", //gets rid of label.  Seems to leave placeholder accessible to to screenreaders; see http://www.html5accessibility.com/tests/placeholder-labelling.html
                searchPlaceholder: "Find student in cohort",
                "zeroRecords": this.isAddByName ? this.noStudentInFindByName : this.noStudentInCohort,
                "emptyTable": "We’re sorry, there are no students in this cohort.",
            },
            columnDefs: [{
                targets: [2, 4],
                orderable: false,
                searchable: false
            }]
        };
        return _config;
    }

    searchStudent(searchText: string, e): void {
        e.preventDefault();
        this.FilterStudentfromResult(searchText);
    }

    // validateDates(): boolean {
    //     if (this.testScheduleModel) {

    //         if (this.testScheduleModel.scheduleStartTime && this.testScheduleModel.scheduleEndTime) {

    //             let scheduleEndTime = moment(new Date(
    //                 moment(this.testScheduleModel.scheduleEndTime).year(),
    //                 moment(this.testScheduleModel.scheduleEndTime).month(),
    //                 moment(this.testScheduleModel.scheduleEndTime).date(),
    //                 moment(this.testScheduleModel.scheduleEndTime).hour(),
    //                 moment(this.testScheduleModel.scheduleEndTime).minute(),
    //                 moment(this.testScheduleModel.scheduleEndTime).second()
    //             )).format('YYYY-MM-DD HH:mm:ss');

    //             if (this.modify) {
    //                 let scheduleURL = this.resolveScheduleURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.viewtest}`, this.testScheduleModel.scheduleId);
    //                 let status = this.testService.getTestStatus(scheduleURL);
    //                 if (status === 'completed' || status === 'inprogress') {
    //                     $('#alertPopup').modal('show');
    //                     return false;
    //                 }
    //             }
    //             else {
    //                 if (moment(scheduleEndTime).isBefore(new Date(), 'day')) {
    //                     $('#alertPopup').modal('show');
    //                     return false;
    //                 }
    //             }
    //         }
    //     }
    //     return true;
    // }

}