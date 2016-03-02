import {Component, OnInit, AfterViewInit, OnChanges, AfterViewChecked, ElementRef} from 'angular2/core';
import {Router, RouteParams, OnDeactivate, CanDeactivate, ComponentInstruction, Location} from 'angular2/router';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {links} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestHeader} from './test-header';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {ConfirmationPopup} from '../shared/confirmation.popup';
import {AlertPopup} from '../shared/alert.popup';
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
    directives: [PageHeader, TestHeader, PageFooter, ConfirmationPopup, AlertPopup],
    pipes: [RemoveWhitespacePipe, RoundPipe]
})

export class ChooseTest implements OnDeactivate, CanDeactivate, OnInit {
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
    modify: boolean = false;
    saveTriggered: boolean = false;
    constructor(public testService: TestService, public auth: Auth, public common: Common, public utitlity: Utility,
        public testScheduleModel: TestScheduleModel, public elementRef: ElementRef, public router: Router, public routeParams: RouteParams, public aLocation:Location) {
    }

    ngOnInit(): void {
        let action = this.routeParams.get('action');
        if (action != undefined && action.trim() === 'modify')
            this.modify = true;
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
            this.initialize();
        $(document).scrollTop(0);
        
        this.aLocation.subscribe((onNext: any) => {
            console.log(onNext);
        });
        
    }

    onCancelChanges(): void {
        this.overrideRouteCheck = true;
        this.testService.clearTestScheduleObjects();
        this.router.parent.navigate(['/ManageTests']);
    }

    onContinueMakingChanges(): void {
        // continue making changes after confirmation popup..
    }

    routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {       
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(next.urlPath)));
        // if (!this.modify) {
        if (!this.overrideRouteCheck) {
            if (outOfTestScheduling) {
                if (this.testScheduleModel.testId) {
                    this.attemptedRoute = next.urlPath;
                    $('#confirmationPopup').modal('show');
                    return false;
                }
            }
            
        }
        // }
        if (outOfTestScheduling)
            this.testService.clearTestScheduleObjects();
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
            this.testScheduleModel.adminId = this.auth.userid;
            this.testScheduleModel.adminFirstName = this.auth.firstname;
            this.testScheduleModel.adminLastName = this.auth.lastname;
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

    saveChooseTest(e): void {
        this.saveTriggered = true;
        e.preventDefault();
        if (!this.validateDates())
            return;

        this.testScheduleModel.scheduleStartTime = new Date(this.testScheduleModel.scheduleStartTime.replace('T', ' '));
        this.testScheduleModel.scheduleEndTime = new Date(this.testScheduleModel.scheduleEndTime.replace('T', ' '));
        this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
        if (this.modify)
            this.router.navigate(['/ModifyScheduleTest', { action: 'modify' }]);
        else
            this.router.navigate(['/ScheduleTest']);
    }


    validateDates(): boolean {
        if (this.testScheduleModel) {
            if (this.testScheduleModel.scheduleStartTime && this.testScheduleModel.scheduleEndTime) {
                if (this.modify) {
                    if (moment(this.testScheduleModel.scheduleStartTime).isBefore(new Date())) {
                        $('#alertPopup').modal('show');
                        return false;
                    }
                }
                else {
                    if (moment(this.testScheduleModel.scheduleEndTime).isBefore(new Date())) {
                        $('#alertPopup').modal('show');
                        return false;
                    }
                }
            }
        }
        return true;
    }



    selectTest(testId: number, testName: string, subjectId: number, normingStatusName): void {
        this.sStorage.setItem('previousTest', this.testScheduleModel.testId);
        this.testScheduleModel.subjectId = subjectId;
        this.testScheduleModel.testId = testId;
        this.testScheduleModel.testName = testName;
        this.testScheduleModel.testNormingStatus = normingStatusName;
        this.sStorage.removeItem('retesters');
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

    onOKAlert(): void {
        $('#alertPopup').modal('hide');
        this.overrideRouteCheck = true;
        this.router.navigate(['ManageTests']);
    }


}