import {Component, OnInit, OnChanges, AfterViewChecked, ElementRef} from 'angular2/core';
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
import '../../plugins/typeahead.bundle.js';
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
    subjectId: number = 0;
    testTypeId: number;
    subjects: Object[] = [];
    tests: Object[] = [];
    testsTable: any;
    sStorage: any;
    attemptedRoute: string;
    overrideRouteCheck: boolean = false;
    modify: boolean = false;
    saveTriggered: boolean = false;
    searchString: string = '';
    typeaheadResults: Object[] = [];
    searchResult: Object[] = [];
    testsBySearch: Object[] = [];
    constructor(public testService: TestService, public auth: Auth, public common: Common, public utitlity: Utility,
        public testScheduleModel: TestScheduleModel, public elementRef: ElementRef, public router: Router, public routeParams: RouteParams, public aLocation: Location) {
    }

    ngOnInit(): void {
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else {
            this.initialize();
            $(document).scrollTop(0);
            let action = this.routeParams.get('action');
            if (action != undefined && action.trim() === 'modify') {
                this.modify = true;
                $('title').html('Modify: Choose Test &ndash; Kaplan Nursing');
            } else {
                $('title').html('Choose Test &ndash; Kaplan Nursing');
            }
        }



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
        $(".checkbox-image").prop("checked", false);
        $('.selectpicker').val('').selectpicker('refresh');
    }

    initialize(): void {
        let self = this;
        this.testsTable = null;
        this.testTypeId = 1;
        this.institutionID = parseInt(this.routeParams.get('institutionId'));
        this.apiServer = this.common.getApiServer();
        $('.typeahead').typeahead('destroy');
        this.loadSubjects();
        $('.typeahead').bind('typeahead:select', function () {
            self.bindTypeahead();
        });
    }

    loadSchedule(): void {
        let savedSchedule = this.testService.getTestSchedule();
        if (savedSchedule) {
            this.testScheduleModel = savedSchedule;
            this.subjectId = this.testScheduleModel.subjectId;
            if (this.subjectId == 0) {
                this.loadTestsBySearch();
            } else {
                this.loadTests(this.subjectId);
            }
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
        return url.replace('§institutionid', this.institutionID.toString()).replace('§subject', this.subjectId.toString()).replace('§testtype', this.testTypeId.toString()).replace('§searchString', this.searchString.toString());
    }

    resolveSubjectsURL(url: string): string {
        return url.replace('§institutionid', this.institutionID.toString()).replace('§testtype', this.testTypeId.toString());
    }

    loadTests(subjectID: number): void {
        this.subjectId = subjectID;
        this.searchString = '';
        let testsURL = this.resolveTestsURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.tests}`);
        let testsPromise = this.testService.getTests(testsURL);
        testsPromise.then((response) => {
            return response.json();
        })
            .then((json) => {
                this.tests = json;
                if (this.testsTable)
                    this.testsTable.destroy();
                if (json.length == 0) {
                    this.checkTestForSubjects();
                }
                setTimeout(json => {
                    this.testsTable = $('#chooseTestTable').DataTable({
                        "paging": false,
                        "searching": false,
                        "responsive": true,
                        "info": false,
                        "ordering": false
                    });


                    $('#chooseTestTable').on('responsive-display.dt', function () {
                        $(this).find('.child .dtr-title br').remove();
                    });
                    $('#availableTests').removeClass('hidden');
                });
                 $('#availableTests').removeClass('hidden');
            })
            .catch((error) => {
                console.log(error);
            });
    }

    checkTestForSubjects(): boolean {
        window.open('/#/accounterror');
        return false;
    }

    saveChooseTest(e): void {
        this.saveTriggered = true;
        e.preventDefault();
        if (!this.validateDates())
            return;

        var myNewStartDateTime2 = moment(new Date(
            moment(this.testScheduleModel.scheduleStartTime).year(),
            moment(this.testScheduleModel.scheduleStartTime).month(),
            moment(this.testScheduleModel.scheduleStartTime).date(),
            moment(this.testScheduleModel.scheduleStartTime).hour(),
            moment(this.testScheduleModel.scheduleStartTime).minute(),
            moment(this.testScheduleModel.scheduleStartTime).second()
        )).format('YYYY/MM/DD HH:mm:ss');
        var myNewEndDateTime2 = moment(new Date(
            moment(this.testScheduleModel.scheduleEndTime).year(),
            moment(this.testScheduleModel.scheduleEndTime).month(),
            moment(this.testScheduleModel.scheduleEndTime).date(),
            moment(this.testScheduleModel.scheduleEndTime).hour(),
            moment(this.testScheduleModel.scheduleEndTime).minute(),
            moment(this.testScheduleModel.scheduleEndTime).second()
        )).format('YYYY/MM/DD HH:mm:ss');

        if (this.testScheduleModel.scheduleStartTime != null && this.testScheduleModel.scheduleStartTime != 'undefined' &&
            this.testScheduleModel.scheduleEndTime != null && this.testScheduleModel.scheduleEndTime != 'undefined') {

            this.testScheduleModel.scheduleStartTime = myNewStartDateTime2;
            this.testScheduleModel.scheduleEndTime = myNewEndDateTime2;
        }
        this.sStorage.setItem('testschedule', JSON.stringify(this.testScheduleModel));
        if (this.modify)
            this.router.navigate(['/ModifyScheduleTest', { action: 'modify' }]);
        else
            this.router.navigate(['/ScheduleTest']);
    }

    resolveScheduleURL(url: string, scheduleId: number): string {
        return url.replace('§scheduleId', scheduleId.toString());
    }

    validateDates(): boolean {
        return this.testService.validateDates(this.testScheduleModel, this.institutionID, this.modify);
    }

    //validateDates(): boolean{
    // if (this.testScheduleModel) {

    //     if (this.testScheduleModel.scheduleStartTime && this.testScheduleModel.scheduleEndTime) {

    //         let institutionTimezone: string = this.common.getTimezone(this.institutionID);
    //         let institutionCurrentTime = moment.tz(new Date(), institutionTimezone).format('YYYY-MM-DD HH:mm:ss');

    //         let scheduleEndTime = moment(new Date(
    //             moment(this.testScheduleModel.scheduleEndTime).year(),
    //             moment(this.testScheduleModel.scheduleEndTime).month(),
    //             moment(this.testScheduleModel.scheduleEndTime).date(),
    //             moment(this.testScheduleModel.scheduleEndTime).hour(),
    //             moment(this.testScheduleModel.scheduleEndTime).minute(),
    //             moment(this.testScheduleModel.scheduleEndTime).second()
    //         )).format('YYYY-MM-DD HH:mm:ss');
    

    //         if (this.modify) {
    //             if (this.testScheduleModel.savedStartTime) {
    //                 let savedStartTime = moment(new Date(
    //                     moment(this.testScheduleModel.savedStartTime).year(),
    //                     moment(this.testScheduleModel.savedStartTime).month(),
    //                     moment(this.testScheduleModel.savedStartTime).date(),
    //                     moment(this.testScheduleModel.savedStartTime).hour(),
    //                     moment(this.testScheduleModel.savedStartTime).minute(),
    //                     moment(this.testScheduleModel.savedStartTime).second()
    //                 )).format('YYYY-MM-DD HH:mm:ss');

    //                 let savedEndTime = moment(new Date(
    //                     moment(this.testScheduleModel.savedEndTime).year(),
    //                     moment(this.testScheduleModel.savedEndTime).month(),
    //                     moment(this.testScheduleModel.savedEndTime).date(),
    //                     moment(this.testScheduleModel.savedEndTime).hour(),
    //                     moment(this.testScheduleModel.savedEndTime).minute(),
    //                     moment(this.testScheduleModel.savedEndTime).second()
    //                 )).format('YYYY-MM-DD HH:mm:ss');

    //                 if (moment(savedEndTime).isBefore(institutionCurrentTime)) {
    //                     $('#alertPopup').modal('show');
    //                     return false;
    //                 }

    //                 if (moment(institutionCurrentTime).isBefore(savedStartTime)) {
    //                     if (moment(scheduleEndTime).isBefore(institutionCurrentTime)) {
    //                         $('#alertPopup').modal('show');
    //                         return false;
    //                     }
    //                 }

    //             }
    //             else {
    //                 if (moment(scheduleEndTime).isBefore(institutionCurrentTime)) {
    //                     $('#alertPopup').modal('show');
    //                     return false;
    //                 }
    //             }

    //         }
    //         else {
    //             if (moment(scheduleEndTime).isBefore(institutionCurrentTime)) {
    //                 $('#alertPopup').modal('show');
    //                 return false;
    //             }
    //         }
    //     }
    // }

    // return true;
    //}    

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
        if (this.modify)
            this.router.navigate(['/ModifyScheduleTest', { action: 'modify' }]);
        else
            this.router.navigate(['ScheduleTest']);
    }

    findByName(element: string, event): void {
        $('#test').addClass('active');
        $('#findByName').addClass('active');
        $('#subject').removeClass('active');
        $('#chooseBySubject').removeClass('active');
        $('.typeahead').typeahead('destroy');
        $('#findTestByName').val('');
        $('#availableTests').addClass('hidden');
        this.subjectId = 0;
        $(".checkbox-image").prop("checked", false);
    }

    chooseBySubject(element: string, event): void {
        $('#test').removeClass('active');
        $('#subject').addClass('active');
        $('#findByName').removeClass('active');
        $('#chooseBySubject').addClass('active');
        $('#availableTests').addClass('hidden');
        $(".checkbox-image").prop("checked", false);
        $('.selectpicker').selectpicker('refresh');
        this.testsTable.clear().draw();
    }

    loadTestsBySearch(): void {
        $('.typeahead').typeahead('destroy');
        this.subjectId = 0;
        this.searchString = $('#findTestByName').val();
        let self = this;
        let testsURL = this.resolveTestsURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.tests}`);
        let testsP = this.testService.getTests(testsURL);
        testsP.then((response) => {
            return response.json();
        })
            .then((json) => {
               
                this.searchResult = json;
          
                var typeaheadTestName = '';
                typeaheadTestName = _.pluck(this.searchResult, 'TestName');

                self.typeaheadResults = new Bloodhound({
                    datumTokenizer: Bloodhound.tokenizers.whitespace,
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    local: typeaheadTestName
                });
                

                $('#bloodhound .typeahead').typeahead({
                    hint: false,
                    highlight: true,
                    minLength: 1
                },
                    {
                        name: 'testNames',
                        limit: 20,
                        source: self.typeaheadResults
                    });
                    $('#findTestByName').focus();
                    $('#findTestByName').typeahead('open');
                });
    }

    bindTestSearchResults(setValue: boolean): void {
        if (setValue) {
            this.searchString = $('#findTestByName').val();
            this.tests = _.where(this.searchResult, { TestName: this.searchString });
        }
        else {
            if (this.searchString.length != 0) {
                var _testDetails = [];
                var _listOfTests = [];
                var testNameList = _.pluck(this.searchResult, 'TestName');
                for (var i = 0; i < testNameList.length; i++) {
                    var testName = testNameList[i];
                    if (_.startsWith(testName, this.searchString)) {
                        var _listOfTests = _.where(this.searchResult, { TestName: testName });
                        for (var j = 0; j < _listOfTests.length; j++) {
                            _testDetails.push(_listOfTests[j]);
                        }
                    }
                }
                this.tests = _testDetails;
            }
            else {
                this.tests = this.searchResult;
            }
        }
        if (this.tests.length == 0) {
            $('#availableTests').addclass('hidden');
        }
        $('#availableTests').removeClass('hidden');
    }

    bindTypeaheadFocus(searchString : string , e): void {
        let self = this;
        this.searchString = searchString.value;
        if (self.searchString.length == 2)
            self.loadTestsBySearch();
        if (self.searchString.length < 2)
            $('#findTestByName').typeahead('destroy');
    }

    bindTypeaheadSearchButton(e): void {
        this.searchString = $('#findTestByName').val();
        this.bindTestSearchResults(false);
    }

    bindTypeahead(): void {
        let self = this;
        self.searchString = $('#findTestByName').typeahead('val');
        self.bindTestSearchResults(true);
    }
}