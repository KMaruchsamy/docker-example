import {Component, OnInit, AfterViewInit, OnChanges, AfterViewChecked, ElementRef, EventEmitter} from 'angular2/core';
import {Router, RouteParams, OnDeactivate, ComponentInstruction} from 'angular2/router';
import {NgFor} from 'angular2/common';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {links} from '../../constants/config';
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
    providers: [TestService, Auth, TestScheduleModel, SelectedStudentModel],
    directives: [PageHeader, TestHeader, PageFooter, ExceptionModalPopup, NgFor],
    pipes: [RemoveWhitespacePipe]
})

export class AddStudents implements OnInit, OnDeactivate {
    institutionID: number;
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
    constructor(public testService: TestService, public auth: Auth, public testScheduleModel: TestScheduleModel, public elementRef: ElementRef, public router: Router, public routeParams: RouteParams, public selectedStudentModel: SelectedStudentModel) {
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
            this.initialize();
    }
    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        if (this.testsTable)
            this.testsTable.destroy();
        $('.selectpicker').val('').selectpicker('refresh');
    }

    ngOnInit() {
        // console.log('on init');
    }

    initialize(): void {
        this.testsTable = null;
        let savedSchedule = this.testService.getTestSchedule();
        this.testScheduleModel = savedSchedule;
        this.testScheduleModel.currentStep = 3;
        this.testScheduleModel.activeStep = 3;
        this.testTypeID = 1;
        this.windowStart = '01.01.14'; //new Date(this.testScheduleModel.scheduleStartTime);
        this.windowEnd = '12.12.16'; //new Date(this.testScheduleModel.scheduleEndTime);
        this.institutionID = parseInt(this.routeParams.get('institutionId'));
        this.apiServer = this.auth.common.getApiServer();
        // this.bindPopup();
        this.loadActiveCohorts();

    }

    loadActiveCohorts(): void {
        //      this.testScheduleModel.institutionId = this.institutionID;
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
        return url.replace('§institutionid', '379'/*this.institutionID.toString()*/).replace('§windowstart', this.windowStart.toString()).replace('§windowend', this.windowEnd.toString());
    }

    resolveCohortStudentsURL(url: string): string {
        return url.replace('§cohortid', this.lastSelectedCohortID.toString()).replace('§testid', this.testTypeID.toString());
    }

    loadStudentsByCohort(btnAddAllStudent, tblCohortStudentList, selectedcohort: any,event): void {
        event.preventDefault();
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
                            "searching": false,
                            "responsive": true,
                            "info": false,
                            // "ordering": false,
                            "scrollY": 551,
                            
                            //"scrollCollapse": true
                            "order": [[0, "asc"]],
                            columnDefs: [{
                                targets: [2, 4],
                                orderable: false,
                                searchable: false
                            }],
                        });
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    //eventFired(type): void{
    //var n = $('#demo_info')[0];
    //n.innerHTML += '<div>' + type + ' event - ' + new Date().getTime() + '</div>';
    //n.scrollTop = n.scrollHeight;
    //}

    GetRepetersOnly(): void {
        var $repeatersOnly = $('#cohortRepeatersOnly');

        if ($repeatersOnly.prop('checked')) {
            $('#cohortExcludeRepeaters').prop('checked', false);
        }
        this.testsTable.draw();
        //var i = 4;// $(this).attr('data-column');  // getting column index
        //var v = "Yes";//$(this).val();  // getting search input value
        //var table = $('#cohortStudents').DataTable();
        //table.columns(i).search(v).draw();
        // $('#cohortStudents').DataTable
        // this.testsTable.draw();
        //$('#cohortStudentList table')
        //  //  .on('search.dt', function () { this.eventFired('Search'); })
        //    .DataTable().draw();
    }

    ExcludeRepeaters(): void {
        var $excludeRepeaters = $('#cohortExcludeRepeaters');

        if ($excludeRepeaters.prop('checked')) {
            $('#cohortRepeatersOnly').prop('checked', false);
        }
        this.testsTable.draw();
        //var i = 4;  // getting column index
        //var v = "No";// $(this).val();  // getting search input value
        //var table = $('#cohortStudents').DataTable();
        //table.columns(i).search(v).draw();
        //this.testsTable.draw();
        //$('#cohortStudentList table')
        ////    .on('search.dt', function () { this.eventFired('Search'); })
        //    .DataTable().draw();
    }

    AddAllStudentsByCohort(event): void {
        event.preventDefault();
        $('#testSchedulingSelectedStudentsList').append(this.AddStudentList());
        $('.top-section').addClass('active');
        $('#selectedStudentsContainer').addClass('hidden');
        $('#testSchedulingSelectedStudents').removeClass('hidden');
        $('#addAllStudents').attr('disabled', 'true');
        this.displaySelectedStudentCount();
        this.EnableDisableButtonForDetailReview();
    }
    AddStudentList(): string {
        var studentlist = "";
        if (this.cohortStudentlist.length > 0) {
            for (var i = 0; i < this.cohortStudentlist.length; i++) {
                var student = this.cohortStudentlist[i];
                if (!$('#cohort-' + student.StudentId).prop('disabled')) {
                    student.CohortId = this.lastSelectedCohortID;
                    this.selectedStudents.push(student);
                    $('#cohort-' + student.StudentId).attr('disabled', 'disabled');
                    var retesting = "";
                    if (student.Retester) {
                        retesting = "RETESTING";
                    }
                    studentlist += "<li class='clearfix'><div class='students-in-testing-session-list-item'><span class='js-selected-student'>" + student.LastName.toString() + "," + student.FirstName.toString() + "</span><span class='small-tag-text'>" + " " + retesting + "</span></div><button class='button button-small button-light' (click)='RemoveSelectedStudents(" + student.StudentId + ")'>Remove</button></li>";
                }
            }
        }
        return studentlist;
    }

    RemoveSelectedStudents(studentId: number, event): void {
        event.preventDefault();
        debugger;
        if (this.selectedStudents.length > 0) {
            $('#addAllStudents').removeAttr('disabled', 'disabled');
            $('#cohort-' + studentId.toString()).removeAttr('disabled', 'disabled');
        }
    }
    AddStudent(student: Object,event): void {
        event.preventDefault();
        $('#cohort-' + student.StudentId.toString()).attr('disabled', 'disabled');
        student.CohortId = this.lastSelectedCohortID;
        this.selectedStudents.push(student);
        var retesting = "";
        if (student.Retester) {
            retesting = "RETESTING";
        }
        var studentli = "<li class='clearfix'><div class='students-in-testing-session-list-item'><span class='js-selected-student'>" + student.LastName.toString() + "," + student.FirstName.toString() + "</span><span class='small-tag-text'>" + " " + retesting + "</span></div><button class='button button-small button-light' (click)='RemoveSelectedStudents(" + student.StudentId + ")'>Remove</button></li>";
        $('#testSchedulingSelectedStudentsList').append(studentli);
        $('.top-section').addClass('active');
        $('#selectedStudentsContainer').addClass('hidden');
        $('#testSchedulingSelectedStudents').removeClass('hidden');
        this.displaySelectedStudentCount();
        this.EnableDisableButtonForDetailReview();
    }
    displaySelectedStudentCount(): void {
        this.selectedStudentCount = this.selectedStudents.length;
        if (this.selectedStudentCount >= 10) {
            $('#filterSelectedStudents').attr('style', 'visibility:visible');
        }
        else {
            $('#filterSelectedStudents').attr('style', 'visibility:hidden');
        }
    }

    RemoveALlSelectedStudents(event): void {
        event.preventDefault();
        $('#addAllStudents').removeAttr('disabled', 'disabled');
        if (this.selectedStudents.length > 0) {
            for (var i = 0; i < this.selectedStudents.length; i++) {
                var studentId = this.selectedStudents[i].StudentId.toString();
                $('#cohort-' + studentId).removeAttr('disabled', 'disabled');
            }
            this.selectedStudents = [];
        }
        $('.top-section').removeClass('active');
        $('#selectedStudentsContainer').removeClass('hidden');
        $('#testSchedulingSelectedStudentsList').empty();
        $('#testSchedulingSelectedStudents').addClass('hidden');
        this.displaySelectedStudentCount();
        this.EnableDisableButtonForDetailReview();
    }

    EnableDisableButtonForDetailReview(): void {
        debugger;
        if (this.selectedStudentCount > 0) {
            $('#accommadationNote').removeClass('hidden');
            $('#studentScheduleNote').removeClass('hidden');
            $('#reviewDetails').removeAttr('disabled', 'disabled');
        }
        else {
            $('#accommadationNote').addClass('hidden');
            $('#studentScheduleNote').addClass('hidden');
            $('#reviewDetails').attr('disabled', 'true');
        }
    }

    DetailReviewTestClick(event): void {
        event.preventDefault();
        let selectedStudentModelList = [];
        if (this.selectedStudents.length > 0) {
            for (var i = 0; i < this.selectedStudents.length; i++) {
                let _student = this.selectedStudents[i];
                this.selectedStudentModel = [];
                let _selectedStudentModel = this.selectedStudentModel;
                _selectedStudentModel.studentId = _student.StudentId;
                _selectedStudentModel.firstName = _student.FirstName;
                _selectedStudentModel.lastName = _student.LastName;
                _selectedStudentModel.studentTestId = this.testScheduleModel.testId;
                _selectedStudentModel.studentTestName = this.testScheduleModel.testName;
                _selectedStudentModel.studentCohortId = _student.CohortId;
                _selectedStudentModel.studentCohortName = this.FindCohortName(_student.CohortId) ;
                _selectedStudentModel.studentEmail = _student.Email;
                _selectedStudentModel.retester = _student.Retester;
                _selectedStudentModel.ADA = _student.Ada;
                selectedStudentModelList[i] = _selectedStudentModel;
            }
        }
        this.testScheduleModel.selectedStudents = selectedStudentModelList;
        this.sStorage = this.auth.common.getStorage();
        this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
        console.log('TestScheduleModel with Selected student' + this.testScheduleModel);
    }

    FindCohortName(cohortid: number): string {
        for (var i = 0; i < this.cohorts.length; i++){
            if (this.cohorts[i].CohortId === cohortid) {
                return this.cohorts[i].CohortName;
            }
        }
    }
}