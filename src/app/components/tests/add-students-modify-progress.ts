import {Component, OnInit, AfterViewInit, DynamicComponentLoader, ElementRef, ViewEncapsulation} from 'angular2/core';
import {Router, RouterLink, RouteParams, OnDeactivate, CanDeactivate, ComponentInstruction, Location } from 'angular2/router';
import {NgFor} from 'angular2/common';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {links} from '../../constants/config';
import {Common} from '../../services/common';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {SelectedStudentModel} from '../../models/selectedStudent-model';
import {RemoveWhitespacePipe} from '../../pipes/removewhitespace.pipe';
import {ConfirmationPopup} from '../shared/confirmation.popup';
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

@Component({
    selector: 'add-students-modify-progress',
    templateUrl: 'templates/tests/add-students-modify-progress.html',
    // encapsulation: ViewEncapsulation.None,
    //styles: [`#addByName.active + #cohortStudentList .add-students-table-search {display: table; width: 100%;}
    //#addByName.active + #cohortStudentList .add-students-table-search .form-group {display: table-cell; text-align: center;}
    //#addByName.active + #cohortStudentList .add-students-table-search .form-group label.smaller {margin-left: 2em; margin-right: 2em;}`],
    providers: [TestService, Auth, TestScheduleModel, SelectedStudentModel, Common],
    directives: [PageHeader, PageFooter, NgFor, ConfirmationPopup, RouterLink],
    pipes: [RemoveWhitespacePipe, SortPipe]
})

export class AddStudentsModifyInProgress implements OnInit, OnDeactivate, CanDeactivate  {
    //  institutionID: number;
    apiServer: string;
    lastSelectedCohortID: number;
    lastSelectedCohortName: string;
    cohorts: Object[] = [];
    cohortStudentlist: Object[] = [];
    selectedStudents: SelectedStudentModel[] = [];
    prevStudentList: SelectedStudentModel[] = [];
    testsTable: any;
    sStorage: any;
    windowStart: string;
    windowEnd: string;
    testName: string;
    selectedStudentCount: number = 0;
    attemptedRoute: string;
    overrideRouteCheck: boolean = false;
    //valid: boolean = false;
    //loader: any;
    //retesterExceptions: any;
    //modify: boolean = false;
    hasADA: boolean = false;
    noCohort: boolean = false;
    noStudentInCohort: string = "No matching students in this cohort";
    //noStudentInFindByName: string = "We’re sorry, there are no students that match your search. Please try again.";
    //_selfPayStudent: Object[] = [];
    //prevSearchText: string = "";
    //noSearchStudent: boolean = false;
    //AddByNameStudentlist: Object[] = []; // To Check AddByName got students or not...
    //AddByCohortStudentlist: Object[] = []; // To preserve previous selected cohort
    //isAddByName: boolean = false;
    // studentTable: boolean = false;
    @Output('cancelChanges') cancelChangesEvent = new EventEmitter();
    @Output('continueMakingChanges') continueMakingChangesEvent = new EventEmitter();

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
        //if (outOfTestScheduling) {
        //    this.sStorage.removeItem('testschedule');
        //    this.sStorage.removeItem('retesters');
        //    this.sStorage.removeItem('previousTest');
        //}
        this.overrideRouteCheck = false;
        return true;
    }


    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        if (this.testsTable)
            this.testsTable.destroy();
        $('#cohortStudentList, #addAllStudents').addClass('hidden');
        $('.selectpicker').val('').selectpicker('refresh');
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(next.urlPath)));
        if (outOfTestScheduling) {
            this.ResetData();
        }
    }

    ngOnInit() {
        let self = this;
        this.testsTable = null;
        $(document).scrollTop(0);
        //this.prevStudentList = [];
        //let action = this.routeParams.get('action');
        //if (action != undefined && action.trim() === 'modify') {
        //    this.modify = true;
        //    $('title').html('Modify: Add Students &ndash; Kaplan Nursing');
        //} else {
        //    $('title').html('Add Students &ndash; Kaplan Nursing');
        //}
        $('title').html('Modify In Progress: Add Students &ndash; Kaplan Nursing');
        this.CheckForAdaStatus();

        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
            this.initialize();

        this.addClearIcon();
        let __this = this;

        $('.tab-content').on('click', '#cohortStudentList .clear-input-values', function () {
            __this.clearTableSearch();
        });

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

    }

    initialize(): void {
        debugger;
        this.ResetData();
        let savedSchedule = this.testService.getTestSchedule();
        if (savedSchedule) {
            this.testScheduleModel = savedSchedule;

            //this.testScheduleModel.currentStep = 3;
            //this.testScheduleModel.activeStep = 3;
            this.windowStart = moment(this.testScheduleModel.scheduleStartTime).format("MM.DD.YY"); //'01.01.14'
            this.windowEnd = moment(this.testScheduleModel.scheduleEndTime).format("MM.DD.YY"); //'12.12.16';
            this.apiServer = this.auth.common.getApiServer();

            if (this.testScheduleModel.selectedStudents.length > 0) {
                //let previousTestId: number = parseInt(this.sStorage.getItem('previousTest'));
                //if (!(Number.isNaN(previousTestId)) && previousTestId !== 0) {
                //    if (previousTestId !== this.testScheduleModel.testId) {
                //        this.RefreshSelectedSudent();
                //    }
                //    else
                //        this.InitializePage();
                //}
                //else {
                    this.InitializePage();
               // }
            }
            this.loadActiveCohorts();
        }
    }
    InitializePage(): void {      
        this.ReloadData();
        this.RefreshSelectedStudentCount();
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


    RefreshSelectedStudentCount(): void {
        this.selectedStudentCount = this.selectedStudents.length;
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

    CheckForAdaStatus(): void {
        if (this.selectedStudents.length > 0) {
            if (_.some(this.selectedStudents, { 'Ada': true })) {
                this.hasADA = true;
            } else {
                this.hasADA = false;
            }
        }
    }
    clearTableSearch(): void {
        let __this = this;
        var $that = $('.add-students-table-search .small-search-box');
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

            var $table = $('table');
            var table = $('table').DataTable();
            table.search(this.value).draw();
            $table.find('tr').each(function () {
                $(this).removeClass('hidden');
            });
            __this.CheckForAllStudentSelected();
        });
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

    EnableDisableButtonForDetailReview(): void {
        if (this.selectedStudentCount > 0) {
            this.CheckForAdaStatus();
            $('#reviewDetails').removeAttr('disabled', 'disabled');
        }
        else {
            $('#reviewDetails').attr('disabled', 'true');
        }
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

    ResetAddButton(): void {
        $("#cohortStudents button").each(function (index, el) {
            $(el).removeAttr('disabled', 'disabled');
        });
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

    GetConfig(scrollHeight): any {
        let _config = {
            //  "destroy": true,
            "retrive": true,
            "paging": false,
            "responsive": true,
            "info": false,
            "scrollY": scrollHeight,
            "dom": 't<"add-students-table-search"f>',
            "language": {
                search: "_INPUT_", //gets rid of label.  Seems to leave placeholder accessible to to screenreaders; see http://www.html5accessibility.com/tests/placeholder-labelling.html
                searchPlaceholder: "Find student in cohort",
                "zeroRecords": this.noStudentInCohort,
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

    getClassName(isRetester: boolean): string {
        if (isRetester)
            return "teal bolded";
        else
            return "";
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

    FindCohortName(cohortid: number): string {
        for (let i = 0; i < this.cohorts.length; i++) {
            if (this.cohorts[i].CohortId === cohortid) {
                return this.cohorts[i].CohortName;
            }
        }
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

    sortAlpha(): void {
        let mylist = $('#testSchedulingSelectedStudentsList');
        let listitems = mylist.children('li').get();
        listitems.sort(function (a, b) {
            return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
        })
        $.each(listitems, function (idx, itm) { mylist.append(itm); });
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
            if (this.selectedStudents[i].StudentId.toString() === studentid.toString()) {
                this.selectedStudents.splice(i, 1);
                this.selectedStudentCount = this.selectedStudentCount - 1;
                break;
            }
        }
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
    invokeFilterSelectedStudents(): void {
        var $that = $('#filterSelectedStudents');
        $that.val('').next().removeClass('clear-input-values');

        $('#testSchedulingSelectedStudents li').each(function () {
            $(this).removeClass('hidden');
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

    cancelChanges(): boolean {
        $('#cancelChangesPopup').modal('hide');
        this.cancelChangesEvent.emit('');
        return false;
    }

    continueMakingChanges(): boolean {
        $('#cancelChangesPopup').modal('hide');
        this.continueMakingChangesEvent.emit('');
        return false;
    }
    confirmCancelChanges(e): void {
        $('#cancelChangesPopup').modal('show');
        e.preventDefault();
    }
}