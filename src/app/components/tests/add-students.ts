import {Component, OnInit, AfterViewInit, OnChanges, AfterViewChecked, ElementRef, EventEmitter} from 'angular2/core';
import {Router, RouteParams, OnDeactivate, ComponentInstruction} from 'angular2/router';
import {NgFor} from 'angular2/common';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {links} from '../../constants/config';
import {Common} from '../../services/common';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestHeader} from './test-header';
import {ExceptionModalPopup} from './exception-modal-popup';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {SelectedStudentModel} from '../../models/selectedStudent-model';
import {RemoveWhitespacePipe} from '../../pipes/removewhitespace.pipe';

import * as _ from '../../lib/index';
import '../../plugins/dropdown.js';
import '../../plugins/bootstrap-select.min.js';
import '../../plugins/jquery.dataTables.min.js';
import '../../plugins/dataTables.responsive.js';
//import '../../plugins/dataTables.bootstrap.min.js';

@Component({
    selector: 'add-students',
    templateUrl: '../../templates/tests/add-students.html',
    // styleUrls:['../../css/responsive.dataTablesCustom.css','../../css/jquery.dataTables.min.css'],
    providers: [TestService, Auth, TestScheduleModel, SelectedStudentModel, Common],
    directives: [PageHeader, TestHeader, PageFooter, ExceptionModalPopup, NgFor],
    pipes: [RemoveWhitespacePipe]
})

export class AddStudents implements OnInit, OnDeactivate {
    //  institutionID: number;
    apiServer: string;
    lastSelectedCohortID: number;
    lastSelectedCohortName: string;
    testTypeID: number;
    cohorts: Object[] = [];
    cohortStudentlist: Object[] = [];
    selectedStudents: Object[] = [];
    testsTable: any;
    sStorage: any;
    windowStart: string;
    windowEnd: string;
    selectedStudentCount: number = 0;
    constructor(public testService: TestService, public auth: Auth, public testScheduleModel: TestScheduleModel, public elementRef: ElementRef, public router: Router, public routeParams: RouteParams, public selectedStudentModel: SelectedStudentModel, public common: Common) {
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
            this.initialize();
    }
    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.auth.common.removeWhitespace(next.urlPath)));
        if (outOfTestScheduling)
            this.sStorage.removeItem('testschedule');
        if (this.testsTable)
            this.testsTable.destroy();
        $('.selectpicker').val('').selectpicker('refresh');
    }

    ngOnInit() {
        // console.log('on init');
        $('#addAllStudents').addClass('hidden');
        $('#cohortStudentList').addClass('hidden');
    }

    initialize(): void {
        this.testsTable = null;
        let savedSchedule = this.testService.getTestSchedule();
        this.testScheduleModel = savedSchedule;
        this.testScheduleModel.currentStep = 3;
        this.testScheduleModel.activeStep = 3;
        this.testTypeID = 1;
        this.windowStart = moment(this.testScheduleModel.scheduleStartTime).format("MM.DD.YY"); //'01.01.14'
        this.windowEnd = moment(this.testScheduleModel.scheduleEndTime).format("MM.DD.YY"); //'12.12.16'; 
        this.apiServer = this.auth.common.getApiServer();
        this.loadActiveCohorts();

    }

    loadActiveCohorts(): void {
        this.loadCohorts();
    }

    loadCohorts(): void {
        let cohortURL = this.resolveCohortURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.cohorts}`);
        let subjectsPromise = this.testService.getActiveCohorts(cohortURL);
        let _this = this;
        subjectsPromise.then((response) => {
            return response.json();
        })
            .then((json) => {
                console.log('Cohorts=' + json);
                _this.cohorts = json;
                setTimeout(json => {
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
                        $('.selectpicker').selectpicker('mobile');
                    else
                        $('.selectpicker').selectpicker('refresh');
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }


    resolveCohortURL(url: string): string {
        return url.replace('§institutionid', this.testScheduleModel.institutionId.toString()).replace('§windowstart', this.windowStart.toString()).replace('§windowend', this.windowEnd.toString());
    }

    resolveCohortStudentsURL(url: string): string {
        return url.replace('§cohortid', this.lastSelectedCohortID.toString()).replace('§testid', this.testTypeID.toString());
    }

    loadStudentsByCohort(btnAddAllStudent, tblCohortStudentList, selectedcohort: any, event): void {
        event.preventDefault();
        this.resetAllAddButtonsOnCohortSelection();
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
                    $('#' + btnAddAllStudent.id).removeClass('hidden');
                    $('#' + tblCohortStudentList.id).removeClass('hidden');
                    this.cohortStudentlist = json;
                    setTimeout(json=> {
                        this.testsTable = $('#cohortStudents').DataTable({
                            "paging": false,
                            "responsive": true,
                            "info": false,
                            "scrollY": 551,
                            "dom": 't<"add-students-table-search"f>',
                            "language": {
                                search: "_INPUT_", //gets rid of label.  Seems to leave placeholder accessible to to screenreaders; see http://www.html5accessibility.com/tests/placeholder-labelling.html
                                //search: "Find student in cohort",
                                searchPlaceholder: "Find student in cohort",
                                "zeroRecords": "No matching students in this cohort",
                            },
                            columnDefs: [{
                                targets: [2, 4],
                                orderable: false,
                                searchable: false
                            }],

                        });
                        this.SearchFilterOptions();
                        this.DisableAddButton();
                        this.CheckForAllStudentSelected();
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    resetAllAddButtonsOnCohortSelection(): void {
        if (this.selectedStudents.length > 0)
        {
            for (var i = 0; i < this.selectedStudents.length; i++)
            {
                var studentid = "cohort-" + this.selectedStudents[i].StudentId.toString();
                this.EnableAddButton(studentid);
            }
        }
    }
    SearchFilterOptions(): void {
        $('#cohortStudentList .dataTables_filter :input').addClass('small-search-box');
        var checkboxfilters = '<div class="form-group hidden-small-down"><input type="checkbox" class="small-checkbox-image" id="cohortRepeatersOnly" name="filterADA" value="repeatersOnly">' +
            '<label class="smaller" for="cohortRepeatersOnly">Retesting only</label>' +
            '<input type="checkbox" class="small-checkbox-image"  id="cohortExcludeRepeaters" name="filterADA" value="excludeRepeaters">' +
            '<label class="smaller" for="cohortExcludeRepeaters">Exclude retesting students</label></div>';

        $('#cohortStudentList .add-students-table-search').append(checkboxfilters);
        $('#cohortRepeatersOnly').on('click', function () {
            var $excludeRepeaters = $('#cohortExcludeRepeaters');
            
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
            var rows = $("#cohortStudents").dataTable()._('tr', { "filter": "applied" });
            if (rows.length > 0) {
                for (var i = 0; i < rows.length; i++) {
                    var data = $(rows[i])[4].split("id=")[1].split('>')[0].split("ada=");
                    var buttonId = eval(data[0]);
                    if (!$('#' + buttonId).prop('disabled')) {
                        $('#addAllStudents').removeAttr('disabled', 'disabled');
                    }
                }
            }
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
            var rows = $("#cohortStudents").dataTable()._('tr', { "filter": "applied" });
            if (rows.length > 0) {
                for (var i = 0; i < rows.length; i++) {
                    var data = $(rows[i])[4].split("id=")[1].split('>')[0].split("ada=");
                    var buttonId = eval(data[0]);
                    if (!$('#' + buttonId).prop('disabled')) {
                        $('#addAllStudents').removeAttr('disabled', 'disabled');
                    }
                }
            }
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
        var studentlist = "";
        var rows = $("#cohortStudents").dataTable()._('tr', { "filter": "applied" });
        if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
                var student = {};
                var data = $(rows[i])[4].split("id=")[1].split('>')[0].split("ada=");
                var attrs = data[1].split("email=");
                var buttonId = eval(data[0]);
                if (!$('#' + buttonId).prop('disabled')) {
                    student.LastName = $(rows[i])[0];
                    student.FirstName = $(rows[i])[1];
                    student.Retester = $(rows[i])[3] === "Yes"?true:false;
                    student.StudentId = parseInt(buttonId.split('-')[1]);
                    student.Email = eval(attrs[1]);
                    student.CohortId = this.lastSelectedCohortID;
                    student.CohortName = this.FindCohortName(student.CohortId);
                    student.StudentTestId = this.testScheduleModel.testId;
                    student.StudentTestName = this.testScheduleModel.testName;
                    student.Ada = (eval(attrs[0])) == "true" ? true : false;
                    student.NormingId = 0;
                    student.NormingStatus = "";
                    this.selectedStudents.push(student);
                    $('#' + buttonId).attr('disabled', 'disabled');
                    var retesting = "";
                    if (student.retester) {
                        retesting = "RETESTING";
                    }
                    studentlist += '<li class="clearfix"><div class="students-in-testing-session-list-item"><span class="js-selected-student">' + student.LastName + ', ' + student.FirstName + '</span><span class="small-tag-text">' + ' ' + retesting + '</span></div><button class="button button-small button-light" data-id="' + student.StudentId + '">Remove</button></li>';
                }
            }
        }
        return studentlist;
    }
    

    EnableAddButton(buttonid: string): void {
        var rows = $("#cohortStudents").dataTable().fnGetNodes();
        for (var i = 0; i < rows.length; i++) {
            var button = $(rows[i]).find("td:eq(4) button").attr('id');
            if (button === buttonid)
            {
                $(rows[i]).find("td:eq(4) button").removeAttr('disabled','disabled');
            }
        }
    }

    DisableAddButton(): void {
        if (this.selectedStudents.length > 0) {
            for (var j = 0; j <this.selectedStudents.length; j++) {
                var buttonid = "cohort-" + this.selectedStudents[j].StudentId.toString();
                var rows = $("#cohortStudents").dataTable().fnGetNodes();
                for (var i = 0; i < rows.length; i++) {
                    var button = $(rows[i]).find("td:eq(4) button").attr('id');
                    if (button === buttonid) {
                        $(rows[i]).find("td:eq(4) button").attr('disabled', 'disabled');
                    }
                }
            }
        }
    }

    CheckForAllStudentSelected(): void {
        var rows = $("#cohortStudents").dataTable()._('tr', { "filter": "applied" });
        if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
                var data = $(rows[i])[4].split("id=")[1].split('>')[0].split("ada=");
                var buttonId = eval(data[0]);
                if (!$('#' + buttonId).prop('disabled')) {
                    $('#addAllStudents').removeAttr('disabled', 'disabled');
                }
            }
        }
    }

   RemoveSelectedStudents(): void {
        let _self = this;
        $('#testSchedulingSelectedStudentsList button').on('click', function (e) {
            e.preventDefault();
            var rowId = $(this).attr('data-id');
            $(this).parent().remove();
            if (_self.selectedStudents.length > 0) {
                $('#addAllStudents').removeAttr('disabled', 'disabled');
                _self.EnableAddButton("cohort-" + rowId);
                _self.UpdateSelectedStudentCount(rowId);
                _self.displaySelectedStudentFilter();
                _self.CheckForAdaStatus();
                if (_self.selectedStudentCount < 1) {
                    _self.ShowHideSelectedStudentContainer();
                    _self.EnableDisableButtonForDetailReview();
                }
            }

        });
    }

    UpdateSelectedStudentCount(studentid: number): void {        
        for (var i = 0; i < this.selectedStudents.length; i++) {
            if (this.selectedStudents[i].StudentId.toString() === studentid) {
                this.selectedStudents.splice(i,1);
                this.selectedStudentCount = this.selectedStudentCount - 1;
                break;
            }
        }
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
        var studentli = '<li class="clearfix"><div class="students-in-testing-session-list-item"><span class="js-selected-student">' + student.LastName + ', ' + student.FirstName + '</span><span class="small-tag-text">' + ' ' + retesting + '</span></div><button class="button button-small button-light" data-id="' + student.StudentId + '">Remove</button></li>';
        $('#testSchedulingSelectedStudentsList').append(studentli);
        this.ShowHideSelectedStudentContainer();
        this.displaySelectedStudentFilter();
        this.EnableDisableButtonForDetailReview();
        this.sortAlpha();
        this.RemoveSelectedStudents();
    }

    RemoveAllSelectedStudents(event): void {
        event.preventDefault();
        $('#addAllStudents').removeAttr('disabled', 'disabled');
        if (this.selectedStudents.length > 0) {
            for (var i = 0; i < this.selectedStudents.length; i++) {
                var studentId = "cohort-"+ this.selectedStudents[i].StudentId.toString();
                this.EnableAddButton(studentId);
            }
            this.selectedStudents = [];
        }
        this.ShowHideSelectedStudentContainer();
        this.displaySelectedStudentFilter();
        this.EnableDisableButtonForDetailReview();
    }

    ShowHideSelectedStudentContainer(): void {
        this.selectedStudentCount = this.selectedStudents.length;
        if (this.selectedStudentCount <1) {
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
            $('#filterSelectedStudents').attr('style', 'visibility:hidden');
        }
    }

    CheckForAdaStatus(): void {
        if (this.selectedStudents.length > 0)
        {
            for (var i = 0; i < this.selectedStudents.length; i++)
            {
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
           // $('#accommadationNote').removeClass('hidden');
            $('#studentScheduleNote').removeClass('hidden');
            $('#reviewDetails').removeAttr('disabled', 'disabled');
        }
        else {
            $('#accommadationNote').addClass('hidden');
            $('#studentScheduleNote').addClass('hidden');
            $('#reviewDetails').attr('disabled', 'true');
        }
    }

    filterSelectedStudents(): void {
        // filter and hide students based on search in "Students in Testing Session" section
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

            //var addStudentsFrom = $('.minimal-nav-tabs .active').find('a').text();
            //if (addStudentsFrom === 'Add by Group')
            //    enableDisableAddAllRemoveAllButtons($('#chooseGroupContainer'));
            //else
            //    enableDisableAddAllRemoveAllButtons($('#chooseCohortContainer'));
        });


    }

    sortAlpha(): void {
       // return a.innerHTML.toLowerCase() > b.innerHTML.toLowerCase() ? 1 : -1;
        var mylist = $('#testSchedulingSelectedStudentsList');
        var listitems = mylist.children('li').get();
        listitems.sort(function (a, b) {
            return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
        })
        $.each(listitems, function (idx, itm) { mylist.append(itm); });
    }

    DetailReviewTestClick(event): void {
        event.preventDefault();
        let studentId = [];
        let selectedStudentModelList = this.selectedStudents;        
        this.testScheduleModel.selectedStudents = selectedStudentModelList;
        this.sStorage = this.auth.common.getStorage();
        this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
        console.log('TestScheduleModel with Selected student' + this.testScheduleModel);
    }

    FindCohortName(cohortid: number): string {
        for (var i = 0; i < this.cohorts.length; i++) {
            if (this.cohorts[i].CohortId === cohortid) {
                return this.cohorts[i].CohortName;
            }
        }
    }
}