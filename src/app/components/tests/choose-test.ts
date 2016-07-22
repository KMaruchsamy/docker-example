import {Component, OnInit, OnChanges, AfterViewChecked, ElementRef} from '@angular/core';
import {Router, RouteParams, OnDeactivate, CanDeactivate, ComponentInstruction} from '@angular/router-deprecated';
import {Location} from '@angular/common';
import {Title} from '@angular/platform-browser';
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
import * as _ from 'lodash';

@Component({
    selector: 'choose-test',
    templateUrl: 'templates/tests/choose-test.html',
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
    searchString: string = null;
    typeaheadResults: Object[] = [];
    searchResult: Object[];
    previouSearch: string = null;
    noSearch: boolean = false;
    noTest: boolean = false;
    disabled: boolean = false;
    activeSubject: boolean = true;
    activeTest: boolean = false;
    activeChooseBySubject: boolean = true;
    activeFindByName: boolean = false;
    setFocus: boolean = true;
    constructor(public testService: TestService, public auth: Auth, public common: Common, public utitlity: Utility,
        public testScheduleModel: TestScheduleModel, public elementRef: ElementRef, public router: Router, public routeParams: RouteParams, public aLocation: Location, public titleService: Title) {
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
                this.titleService.setTitle('Modify: Choose Test – Kaplan Nursing');
            } else {
                this.titleService.setTitle('Choose Test – Kaplan Nursing');
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
        this.tests = [];
        $('#findTestByName').val('');
        $('#findTestByName').typeahead('destroy');
        $('.selectpicker').val('').selectpicker('refresh');
    }

    CallOnSearchInput(searchElement: any): void {
        setTimeout(() => {
            let searchText = searchElement.value;
            this.bindTypeaheadFocus(searchElement,searchText);
        });
    }

    initialize(): void {
        let self = this;
        this.testsTable = null;
        this.noSearch = false;
        this.testTypeId = 1;
        this.institutionID = parseInt(this.routeParams.get('institutionId'));
        this.apiServer = this.common.getApiServer();
        $('#findTestByName').typeahead('destroy');
        this.activeTest = false;
        this.activeSubject = true;
        this.activeChooseBySubject = true;
        this.activeFindByName = false;
        this.noTest = true;
        this.loadSubjects();
        $('.typeahead').bind('typeahead:select', function (ev, suggetion) {
            ev.preventDefault();
            self.bindTestSearchResults(suggetion, true);
            $('.typeahead').typeahead('close');

        });
    }

    loadSchedule(): void {
        let savedSchedule = this.testService.getTestSchedule();
        if (savedSchedule) {
            this.testScheduleModel = savedSchedule;
            this.subjectId = this.testScheduleModel.subjectId;
            if (this.subjectId == 0) {
                this.loadTestsBySearch(this.testScheduleModel.testName);
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
        let self = this;
        this.subjectId = subjectID;
        this.searchString = '';
        let testsURL = this.resolveTestsURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.tests}`);
        let testsPromise = this.testService.getTests(testsURL);
        testsPromise.then((response) => {
            return response.json();
        })
            .then((json) => {
                self.tests = json;

                if (self.testsTable) {
                    self.testsTable.destroy();
                    setTimeout(json => {
                        self.testsTable = $('#chooseTestTable').DataTable({
                            "paging": false,
                            "searching": false,
                            "responsive": true,
                            "info": false,
                            "ordering": false
                        });
                        $('#chooseTestTable').on('responsive-display.dt', function () {
                            $(this).find('.child .dtr-title br').remove();
                        });
                    });
                }
                this.noTest = true;
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

    findByName(element: any, event): void {
            var ms_ie = false;
            var ua = window.navigator.userAgent;
            var old_ie = ua.indexOf('MSIE ');
            var new_ie = ua.indexOf('Trident/');

            if ((old_ie > -1) || (new_ie > -1)) {
                ms_ie = true;
            }
            if (ms_ie && this.testScheduleModel.testId != 0 ) {
                    element.focus();
                    element.value = '';
            }
            else {
                setTimeout(() => {
                    element.focus();
                    element.value = '';
                });
            }
        this.activeSubject = false;
        this.activeChooseBySubject = false;
        this.activeFindByName = true;
        this.activeTest = true;
        $('#findTestByName').typeahead('destroy');
        this.noSearch = false;
        this.disabled = false;
        this.searchResult = [];
        this.previouSearch = null;
        if (this.testScheduleModel.testId != 0 && this.testScheduleModel.subjectId == 0) {
            this.loadTestsBySearch(this.testScheduleModel.testName);
            this.noTest = true;
        }
        else {
            $('.selectpicker').val('').selectpicker('refresh');
            this.noTest = false;
        }
      
    }

    

    chooseBySubject(element: any, event): void {
        this.activeTest = false;
        this.activeSubject = true;
        this.noSearch = false;
        this.activeChooseBySubject = true;
        this.activeFindByName = false;
        if (this.testScheduleModel.testId != 0 && this.testScheduleModel.subjectId != 0) {
            $('.selectpicker').val(this.testScheduleModel.subjectId).selectpicker('refresh');
            this.loadTests(this.testScheduleModel.subjectId);
        }
        else {
            $('.selectpicker').val('').selectpicker('refresh');
            this.noTest = false;
        }
    }

    loadTestsBySearch(testName: string): void {
        this.subjectId = 0;
        this.searchString = testName;
        let self = this;
        let testsURL = this.resolveTestsURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.test.tests}`);
        let testsPromise = this.testService.getTests(testsURL);
        testsPromise.then((response) => {
            if (response.status !== 400) {
                return response.json();
            }
            return [];
        })
            .then((json) => {
                self.searchResult = json;
                if (self.testScheduleModel.testId != 0 && self.testScheduleModel.subjectId == 0) {
                    this.displayTest(this.testScheduleModel.testId);
                }
                if (json.length > 0) {
                    self.showTypeahead();
                        setTimeout(() => { $('#findTestByName').focus(); });
                    $('#findTestByName').typeahead('open');
                }
                else {
                        $('#findTestByName').focus();
                }
            });
    }

    showTypeahead(): void {
        $('.typeahead').typeahead('destroy');
        let self = this;
        let testNamesList = _.map(self.searchResult, 'TestName');

        $('#findByNameContainer .typeahead').typeahead({
            hint: false,
            highlight: true,
            minLength: 1
        },
            {
                name: 'testNames',
                limit: 20,
                source: function (search, process) {
                    var states = [];
                    var data = testNamesList
                    if (search.length >= 2) {
                        _.forEach(data, function (state, i) {
                            let name: any = state;
                            if (_.startsWith(name.toLowerCase(), search.toLowerCase())) {
                                states.push(state);
                            }
                        });
                        process(states);
                    }
                }
            });
    }

    bindTestSearchResults(search: string, setValue: boolean): void {
        let self = this;
        this.testsTable = null;
        if (setValue) {
            self.tests = _.filter(self.searchResult, { TestName: search });
        }
        else {
            if (search.length != 0) {
                let _testDetails = [];
                let _listOfTests = [];
                let testNameList = _.map(self.searchResult, 'TestName');
                for (let i = 0; i < testNameList.length; i++) {
                    let testName: any = testNameList[i];
                    if (_.startsWith(testName.toLowerCase(), search.toLowerCase())) {
                        _listOfTests = _.filter(self.searchResult, { TestName: testName });
                        for (let j = 0; j < _listOfTests.length; j++) {
                            _testDetails.push(_listOfTests[j]);
                        }
                    }
                }
                self.tests = _testDetails;
            }
            else {
                if (this.searchResult.length != 0)
                    self.tests = this.searchResult;
                else {
                    this.noSearch = true;
                    this.noTest = false;
                }
            }
        }
        if (self.tests.length != 0) {
            this.noSearch = false;
            this.noTest = true;
        }
        else {
            this.noSearch = true;
        }
    }

    bindTypeaheadFocus(element: any, searchText: string ): void {
        if (!_.startsWith(searchText, '  ')) {
            if (searchText.length > 1) {
                this.disabled = true;
                if (searchText.length > 2) {
                    searchText = searchText.trim().substr(0, 2).toUpperCase();
                }
                if (searchText.length === 2 && this.previouSearch != searchText.trim().toUpperCase() && searchText != "  ") {
                    $('.typeahead').typeahead('destroy');
                    this.loadTestsBySearch(searchText);
                    this.previouSearch = searchText.trim().toUpperCase();
                    element.focus();
                }
                else {
                    if (searchText.length < 2) {
                        $('.typeahead').typeahead('close');
                    }
                }
            }
            else {
                $('.typeahead').typeahead('close');
                this.disabled = false;
            }
        }
        else {
            element.value = '';
            element.focus();
            $('.typeahead').typeahead('close');
        }
    }

    bindTypeaheadSearchButton(search:string,e): void {
        e.preventDefault();
        if (search.length >= 2) {
            this.bindTestSearchResults(search, false);
            $('.typeahead').typeahead('close');
        } else {
            $('.typeahead').typeahead('close');
        }
    }

    displayTest(testId: number): void {
        let self = this;
        self.tests = _.filter(self.searchResult, { TestId: testId });
    }
}