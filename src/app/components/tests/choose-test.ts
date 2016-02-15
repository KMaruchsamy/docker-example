import {Component, OnInit, AfterViewInit, OnChanges, AfterViewChecked, ElementRef} from 'angular2/core';
import {Router, RouteParams, OnDeactivate, CanDeactivate, ComponentInstruction} from 'angular2/router';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {links} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestHeader} from './test-header';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {ConfirmationPopup} from '../shared/confirmation.popup';
import {RemoveWhitespacePipe} from '../../pipes/removewhitespace.pipe';
import {RoundPipe} from '../../pipes/round.pipe';
import {Utility} from '../../scripts/utility';
import * as _ from '../../lib/index';
import '../../plugins/dropdown.js';
import '../../plugins/bootstrap-select.min.js';
import '../../plugins/jquery.dataTables.min.js';
import '../../plugins/dataTables.responsive.js';
import '../../lib/modal.js';

@Component({
    selector: 'choose-test',
    templateUrl: '../../templates/tests/choose-test.html',
    providers: [TestService, Auth, TestScheduleModel, Utility, Common],
    directives: [PageHeader, TestHeader, PageFooter,ConfirmationPopup],
    pipes: [RemoveWhitespacePipe, RoundPipe]
})

export class ChooseTest implements OnDeactivate, CanDeactivate {
    institutionID: number;
    apiServer: string;
    subjectId: number;
    testTypeId: number;
    subjects: Object[] = [];
    tests: Object[] = [];
    testsTable: any;
    sStorage: any;
    attemptedRoute: string;
    overrideRouteCheck: boolean = false;
    constructor(public testService: TestService, public auth: Auth, public common: Common, public utitlity: Utility,
        public testScheduleModel: TestScheduleModel, public elementRef: ElementRef, public router: Router, public routeParams: RouteParams) {
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
            this.initialize();
    }

    routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(next.urlPath)));
        if (!this.overrideRouteCheck) {
            if (outOfTestScheduling) {
                this.attemptedRoute = next.urlPath;
                $('#confirmationPopup').modal('show');
                return false;
            }
        }
        if (outOfTestScheduling)
            this.sStorage.removeItem('testschedule');
        this.overrideRouteCheck = false;
        return true;
    }

    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        if (this.testsTable)
            this.testsTable.destroy();
        $('.selectpicker').val('').selectpicker('refresh');
    }

    initialize(): void {
        this.testsTable = null;
        this.testTypeId = 1;
        this.institutionID = parseInt(this.routeParams.get('institutionId'));
        this.apiServer = this.common.getApiServer();
        this.loadSubjects();
    }

    loadSchedule(): void {
        let savedSchedule = this.testService.getTestSchedule();
        if (savedSchedule) {
            this.testScheduleModel = savedSchedule;
            this.subjectId = this.testScheduleModel.subjectId;
            this.loadTests(this.subjectId);
            setTimeout(json => {
                $('.selectpicker').selectpicker('refresh');
            });
        }
        else {
            this.testScheduleModel.currentStep = 1;
            this.testScheduleModel.institutionId = this.institutionID;
        }
        this.testScheduleModel.activeStep = 1;

    }

    loadSubjects(): void {
        let subjectsURL = this.resolveSubjectsURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.subjects}`);
        let subjectsPromise = this.testService.getSubjects(subjectsURL);
        subjectsPromise.then((response) => {
            return response.json();
        })
            .then((json) => {
                this.subjects = json;
                console.log(this.subjects);
                this.loadSchedule();
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


    resolveTestsURL(url: string): string {
        return url.replace('§institutionid', this.institutionID.toString()).replace('§subject', this.subjectId.toString()).replace('§testtype', this.testTypeId.toString());
    }

    resolveSubjectsURL(url: string): string {
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
                console.log(this.tests);
                setTimeout(json=> {
                    this.testsTable = $('#chooseTestTable').DataTable({
                        "paging": false,
                        "searching": false,
                        "responsive": true,
                        "info": false,
                        "ordering": false
                    });


                    $('#chooseTestTable').on('responsive-display.dt', function() {
                        $(this).find('.child .dtr-title br').remove();
                    });

                });
            })
            .catch((error) => {
                console.log(error);
            });
    }

    saveChooseTest(): void {
        this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
        this.router.parent.navigateByUrl('/tests/schedule-test');
    }



    selectTest(testId: number, testName: string, subjectId: number, normingStatusName): void {
        this.testScheduleModel.subjectId = subjectId;
        this.testScheduleModel.testId = testId;
        this.testScheduleModel.testName = testName;
        this.testScheduleModel.testNormingStatus = normingStatusName;
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


}