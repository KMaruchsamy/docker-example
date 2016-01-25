import {Component, OnInit, AfterViewInit, OnChanges, AfterViewChecked, ElementRef,EventEmitter} from 'angular2/core';
import {Router, RouteParams, OnDeactivate, ComponentInstruction} from 'angular2/router';
import {COMMON_DIRECTIVES,NgFor} from 'angular2/common';
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
// import '../../plugins/bootstrap-select.js';
import '../../plugins/bootstrap-select.min.js';
// import '../../plugins/tab.js';
// import '../../plugins/typeahead.bundle.js';
import '../../plugins/jquery.dataTables.min.js';
import '../../plugins/dataTables.responsive.js';


@Component({
    selector: 'add-students',
    templateUrl: '../../templates/tests/add-students.html',
    // styleUrls:['../../css/responsive.dataTablesCustom.css','../../css/jquery.dataTables.min.css'],
    providers: [TestService, Auth, TestScheduleModel],
    directives: [PageHeader, TestHeader, PageFooter, NgFor, COMMON_DIRECTIVES],
    pipes: [RemoveWhitespacePipe]
})

export class AddStudents implements OnInit, OnDeactivate {
    institutionID: number;
    apiServer: string;
    cohortID: number;
    cohortName: string;
    testTypeID: number;
    cohorts: Object[] = [];
    students: Object[] = [];
    testsTable: any;
    sStorage: any;
    windowStart: string;
    windowEnd: string;
    constructor(public testService: TestService, public auth: Auth, public testScheduleModel: TestScheduleModel, public elementRef: ElementRef, public router: Router, public routeParams: RouteParams) {
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
            this.initialize();
    }
    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        if (this.testsTable)
            this.testsTable.destroy();
    }

    ngOnInit() {
        // console.log('on init');
    }

    initialize(): void {
        this.testsTable = null;
        this.testScheduleModel.currentStep = 3;
        this.testTypeID = 1;
        this.windowStart = '01.01.14';
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
            
            $('#' + btnAddAllStudent.id).removeClass('hidden');
            $('#' + tblCohortStudentList.id).removeClass('hidden');
            this.cohortID = cohortId;
            let CohortStudentsURL = this.resolveCohortStudentsURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.cohortstudents}`);
            let testsPromise = this.testService.getTests(CohortStudentsURL);
            testsPromise.then((response) => {
                return response.json();
            })
                .then((json) => {
                    if (this.testsTable)
                        this.testsTable.destroy();
                    this.students = json;
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
}