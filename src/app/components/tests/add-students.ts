import {Component, OnInit, AfterViewInit, OnChanges, AfterViewChecked, ElementRef,EventEmitter} from 'angular2/core';
import {Router, RouteParams, OnDeactivate, ComponentInstruction} from 'angular2/router';
import {NgFor} from 'angular2/common';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {links} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestHeader} from './test-header';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {RemoveWhitespacePipe} from '../../pipes/removewhitespace.pipe';
import * as _ from '../../lib/index';
import '../../plugins/dropdown.js';
import '../../plugins/bootstrap-select.min.js';
import '../../plugins/jquery.dataTables.min.js';
import '../../plugins/dataTables.responsive.js';


@Component({
    selector: 'add-students',
    templateUrl: '../../templates/tests/add-students.html',
    // styleUrls:['../../css/responsive.dataTablesCustom.css','../../css/jquery.dataTables.min.css'],
    providers: [TestService, Auth, TestScheduleModel],
    directives: [PageHeader, TestHeader, PageFooter, NgFor],
    pipes: [RemoveWhitespacePipe]
})

export class AddStudents implements OnInit, OnDeactivate {
    institutionID: number;
    apiServer: string;
    cohortID: number;
    cohortName: string;
    testTypeID: number;
    cohorts: Object[] = [];
    cohortStudents: Object[] = [];
    selectedStudents: Object[] = [];
    testsTable: any;
    sStorage: any;
    windowStart: string;
    windowEnd: string;
    selectedStudentCount: number=0;
    constructor(public testService: TestService, public auth: Auth, public testScheduleModel: TestScheduleModel, public elementRef: ElementRef, public router: Router, public routeParams: RouteParams) {
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
        this.testScheduleModel.currentStep = 3;
        this.testTypeID = 1;
        this.windowStart = '01.01.14'; //this.testScheduleModel.
        this.windowEnd = '12.12.16';
        this.institutionID = parseInt(this.routeParams.get('institutionId'));
        this.apiServer = this.auth.common.getApiServer();
        
        this.loadActiveCohorts();
        
    }

    loadActiveCohorts(): void {
        this.testScheduleModel.currentStep = 3;
        this.testScheduleModel.activeStep = 3;
        this.testScheduleModel.institutionId = this.institutionID;
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
        return url.replace('§cohortid', this.cohortID.toString()).replace('§testid', this.testTypeID.toString());
    }

    loadStudentsByCohort(btnAddAllStudent, tblCohortStudentList, cohortId: number): void {
        if (cohortId > 0) {           
            this.cohortID = cohortId;
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
                    this.cohortStudents = json;
                    setTimeout(json=> {
                        this.testsTable = $('#cohortStudents').DataTable({
                            "paging": false,
                            "searching": false,
                            "responsive": true,
                            "info": false,
                            "ordering": false
                            // "order": [[ 0, "desc" ]]
                        });
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    AddAllStudentsByCohort(): void {
        $('#testSchedulingSelectedStudentsList').append(this.AddStudentList());
        $('.top-section').addClass('active');
        $('#selectedStudentsContainer').addClass('hidden');
        $('#testSchedulingSelectedStudents').removeClass('hidden');
        $('#addAllStudents').attr('disabled', 'true');
        this.displaySelectedStudentCount();
    }
    AddStudentList(): string {
        var studentlist = "";        
        if (this.cohortStudents.length > 0) {
            for (var i = 0; i < this.cohortStudents.length; i++) {
                var student = this.cohortStudents[i];
                if (!$('#cohort-' + student.StudentId).prop('disabled')) {
                    this.selectedStudents.push(student);
                    $('#cohort-' + student.StudentId).attr('disabled', 'true');
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

    RemoveSelectedStudents(studentId: number): void{
        debugger;
        if (this.selectedStudents.length > 0) {
            $('#addAllStudents').removeAttr('disabled', 'disabled');
            $('#cohort-' + studentId.toString()).removeAttr('disabled','disabled');
        }
    }
    AddStudent(student: Object): void {
        debugger;
        $('#cohort-' + student.StudentId.toString()).attr('disabled', 'true');
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
    }
    displaySelectedStudentCount(): void {
        this.selectedStudentCount = this.selectedStudents.length;
    }

    RemoveALlSelectedStudents(): void {
        debugger;        
        $('#addAllStudents').removeAttr('disabled', 'disabled');
        if (this.selectedStudents.length > 0) {
            for (var i = 0; i < this.selectedStudents.length; i++) {
                var studentId = this.cohortStudents[i].StudentId;
                $('#cohort-' + studentId).removeAttr('disabled', 'disabled');
            }
            this.selectedStudents = [];
        }
        $('.top-section').removeClass('active');
        $('#selectedStudentsContainer').removeClass('hidden');
        $('#testSchedulingSelectedStudentsList').empty();
        $('#testSchedulingSelectedStudents').addClass('hidden');
        this.displaySelectedStudentCount();
    }
}