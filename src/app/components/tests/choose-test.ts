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
import {Utility} from '../../scripts/utility';
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
    providers: [TestService, Auth, TestScheduleModel, Utility],
    directives: [PageHeader, TestHeader, PageFooter],
    pipes: [RemoveWhitespacePipe]
})

export class ChooseTest implements OnInit, OnDeactivate {
    institutionID: number;
    apiServer: string;
    subjectId: number;
    testTypeId: number;
    subjects: Object[] = [];
    tests: Object[] = [];
    testsTable: any;
    sStorage: any;
    action: string;
    constructor(public testService: TestService, public auth: Auth, public utitlity: Utility,
        public testScheduleModel: TestScheduleModel, public elementRef: ElementRef, public router: Router, public routeParams: RouteParams) {
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
            this.initialize();
    }

    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        if (this.testsTable)
            this.testsTable.destroy();
        $('.selectpicker').val('').selectpicker('render');
    }

    initialize(): void {
        if (this.routeParams.get('action'))
            this.action = this.routeParams.get('action');
        this.testsTable = null;
        this.testTypeId = 1;
        this.institutionID = parseInt(this.routeParams.get('institutionId'));
        this.apiServer = this.auth.common.getApiServer();
        this.loadSubjects();
    }

    loadSchedule(): void {
        if (this.action === 'modify') {
            let savedSchedule = this.testService.getTestSchedule();
            if (savedSchedule) {
                this.testScheduleModel = savedSchedule;
                this.subjectId = this.testScheduleModel.subjectId;

                setTimeout(json => {
                    $('.selectpicker').selectpicker('refresh');
                    this.loadTests(this.subjectId);
                });
            }
        }
        else {
            this.testScheduleModel.currentStep = 1;
            this.testScheduleModel.activeStep = 1;
            this.testScheduleModel.institutionId = this.institutionID;
        }
    }




    loadSubjects(): void {
        let subjectsURL = this.resolveSubjectsURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.subjects}`);
        let subjectsPromise = this.testService.getSubjects(subjectsURL);
        subjectsPromise.then((response) => {
            return response.json();
        })
            .then((json) => {
                this.subjects = json;
                setTimeout(json => {
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
                        $('.selectpicker').selectpicker('mobile');
                    else
                        $('.selectpicker').selectpicker();
                    this.loadSchedule();
                });
            })
            .catch((error) => {
                alert(error);
            });
    }


    resolveTestsURL(url: string): string {
        console.log(url);
        return url.replace('§institutionid', this.institutionID.toString()).replace('§subject', this.subjectId.toString()).replace('§testtype', this.testTypeId.toString());
    }

    resolveSubjectsURL(url: string): string {
        console.log(url);
        return url.replace('§institutionid', this.institutionID.toString()).replace('§testtype', this.testTypeId.toString());
    }

    loadTests(subjectID: number): void {
        this.subjectId = subjectID;
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
                        "ordering": false
                    });
                });
            })
            .catch((error) => {
                alert(error);
            });

        //this.reload = true;
        // 
        //         this.testsTable.on('responsive-display', function(e, datatable, row, showHide, update) {
        //             console.log('Details for row ' + row.index() + ' ' + (showHide ? 'shown' : 'hidden'));
        //         });
    }

    // bindRadioEvent(): void {
    //     let __this = this;
    //     $('#chooseTestTable input[type=radio]').change(function() {
    //         let testId = $(this).attr('testid');
    //         let testName = $(this).attr('testname');
    //         let subjectId = $('#testSubjectOptions').val();
    //         __this.selectTest(testId, testName, subjectId);
    //         $('#chooseTestTable input[type=radio]').not($(this)).attr('checked', false);
    //     });
    // }


    saveChooseTest(): void {
        this.testScheduleModel.completed = true;
        this.testScheduleModel.scheduleId = this.utitlity.generateUUID();
        this.sStorage = this.auth.common.getStorage();
        this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
        this.router.parent.navigateByUrl('/tests/schedule-test');
    }



    selectTest(testId: number, testName: string, subjectId: number): void {
        this.testScheduleModel.subjectId = subjectId;
        this.testScheduleModel.testId = testId;
        this.testScheduleModel.testName = testName;
        //    let selectedTest =  _.find(this.tests, function(test) {
        //         return test.TestId === testId;
        //     });
        //    if (selectedTest)
        //        selectedTest.isSelected = true;    
    }


}