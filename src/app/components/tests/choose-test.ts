import {Component, OnInit, AfterViewInit, OnChanges, AfterViewChecked, ElementRef} from 'angular2/core';
import {Router, RouteParams, OnDeactivate, ComponentInstruction} from 'angular2/router';
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
    selector: 'choose-test',
    templateUrl: '../../templates/tests/choose-test.html',
    // styleUrls:['../../css/responsive.dataTablesCustom.css','../../css/jquery.dataTables.min.css'],
    providers: [TestService, Auth, TestScheduleModel],
    directives: [PageHeader, TestHeader, PageFooter],
    pipes: [RemoveWhitespacePipe]
})

export class ChooseTest implements OnInit, OnDeactivate {
    institutionID: number;
    apiServer: string;
    subjectID: number;
    testTypeID: number;
    subjects: Object[] = [];
    tests: Object[] = [];
    testsTable: any;
    sStorage: any;
    constructor(public testService: TestService, public auth: Auth, public testScheduleModel: TestScheduleModel, public elementRef: ElementRef, public router: Router, public routeParams: RouteParams) {
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
        this.initialize();
    }

    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        // this.logService.addLog(`Navigating from "${prev ? prev.urlPath : 'null'}" to "${next.urlPath}"`);
        if (this.testsTable)
            this.testsTable.destroy();
        $('.selectpicker').val('').selectpicker('render');
    }

    ngOnInit() {
        
        // console.log('on init');
    }

    initialize(): void {
        this.testsTable = null;
        this.testScheduleModel.currentStep = 1;
        this.testTypeID = 1;
        this.institutionID = parseInt(this.routeParams.get('institutionId'));
        this.testScheduleModel.institutionId = this.institutionID;
        this.apiServer = this.auth.common.getApiServer();
        this.loadSubjects();
    }

    loadSubjects(): void {
        let subjectsURL = this.resolveSubjectsURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.subjects}`);
        let subjectsPromise = this.testService.getSubjects(subjectsURL);
        subjectsPromise.then((response) => {
            return response.json();
        })
            .then((json) => {
                this.subjects = json;
                //this.bindSubjects();
                setTimeout(json => {
                    $('.selectpicker').selectpicker();
                });
            })
            .catch((error) => {
                alert(error);
            });
    }


    resolveTestsURL(url: string): string {
        return url.replace('§institutionid', this.institutionID.toString()).replace('§subject', this.subjectID.toString()).replace('§testtype', this.testTypeID.toString());
    }

    resolveSubjectsURL(url: string): string {
        return url.replace('§institutionid', this.institutionID.toString()).replace('§testtype', this.testTypeID.toString());
    }

    loadTests(subjectID: number): void {
        this.subjectID = subjectID;
        let testsURL = this.resolveTestsURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.tests}`);
        let testsPromise = this.testService.getTests(testsURL);
        testsPromise.then((response) => {
            return response.json();
        })
            .then((json) => {
                if (this.testsTable)
                    this.testsTable.destroy();
                this.tests = json;
                setTimeout(json=> {
                    this.testsTable = $('#chooseTestTable').DataTable({
                        "paging": false,
                        "searching": false,
                        "responsive": true,
                        "info": false,
                        "ordering": false,
                        columnDefs: [
                            { responsivePriority: 1, targets: 0 },
                            { responsivePriority: 2, targets: -1 }
                        ]
                    });
                });
                //this.bindTests();

            })
            .catch((error) => {
                alert(error);
            });
    }

    saveChooseTest(): void {
        this.testScheduleModel.completed = true;
        this.sStorage = this.auth.common.getStorage();
        this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
        this.router.parent.navigateByUrl('/tests/schedule-test');
    }



    selectTest(testId: number, testName: string, subjectId: number): void {
        this.testScheduleModel.subjectID = subjectId;
        this.testScheduleModel.testID = testId;
        this.testScheduleModel.testName = testName;
        //    let selectedTest =  _.find(this.tests, function(test) {
        //         return test.TestId === testId;
        //     });
        //    if (selectedTest)
        //        selectedTest.isSelected = true;    
    }


}