import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { TestScheduleModel } from './../../models/test-schedule.model';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { TestShedulingPages } from './../../constants/config';
import { SelectedStudentModel } from './../../models/selected-student.model';

@Injectable()
export class TestService {
    sStorage: any;
    clearTimeout10min;
    clearTimeout5minAfter10;
    clearTimeout5min;
    constructor(public http: HttpClient, public testSchedule: TestScheduleModel, public auth: AuthService, public common: CommonService) {
        this.http = http;
        this.sStorage = this.auth.sStorage;
        this.auth.refresh();
    }

    private getRequestOptionsWithEmptyBody() {
        let self = this;
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': self.auth.authheader
        });
        let requestOptions = {
            headers: headers,
            observe: 'response' as const
        };
        return requestOptions;
    }

    private getRequestOptions() {
        let self = this;
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': self.auth.authheader
        });
        let requestOptions = {
            headers: headers,
            observe: 'response' as const
        };
        return requestOptions;
    }

    outOfTestScheduling(routeName: string): boolean {
        routeName = routeName.toUpperCase();
        if (routeName.indexOf(TestShedulingPages.CHOOSETEST) > -1
            || routeName.indexOf(TestShedulingPages.SCHEDULETEST) > -1
            || routeName.indexOf(TestShedulingPages.ADDSTUDENTS) > -1
            || routeName.indexOf(TestShedulingPages.REVIEWTEST) > -1
            || routeName.indexOf(TestShedulingPages.MODIFYCHOOSETEST) > -1
            || routeName.indexOf(TestShedulingPages.MODIFYSCHEDULETEST) > -1
            || routeName.indexOf(TestShedulingPages.MODIFYADDSTUDENTS) > -1
            || routeName.indexOf(TestShedulingPages.MODIFYREVIEWTEST) > -1
            || routeName.indexOf(TestShedulingPages.CONFIRMATION) > -1
            || routeName.indexOf(TestShedulingPages.MODIFYCONFIRMATION) > -1
            || routeName.indexOf(TestShedulingPages.VIEW) > -1
            || routeName.indexOf(TestShedulingPages.MODIFYVIEW) > -1
            || routeName.indexOf(TestShedulingPages.CONFIRMATIONMODIFYINPROGRESS) > -1
            || routeName.indexOf('ERROR') > -1)
            return false;
        return true;
    }


    getTestSchedule(): TestScheduleModel {
        if (this.sStorage.getItem('testschedule'))
            return this.testSchedule = JSON.parse(this.sStorage.getItem('testschedule'));
        else null;
    }

    getSavedRetesterExceptions(): any {
        if (this.sStorage.getItem('retesters'))
            return this.testSchedule = JSON.parse(this.sStorage.getItem('retesters'));
        else null;
    }

    getSubjects(url) {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }


    getTests(url) {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }

    getOpenIntegratedTests(url) {
       	const headers = new HttpHeaders({
            'Accept': 'application/json',
        });
        let requestOptions = {
            headers: headers,
            // body:'',
            observe: 'response' as const
        };
        return this.http.get(url, requestOptions);
    }

    getActiveCohorts(url) {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }

    getFaculty(url: string): any {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }

    getFacultySync(url: string): any {
        let self = this;
        let facultyJson: any;
        $.ajax({
            url: url,
            type: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': self.auth.authheader
            },
            success: function (json) {
                if (json) {
                    facultyJson = json;
                }

            },
            error: () => {
            },
            async: false
        });

        return facultyJson;
    }



    getRetesters(url: string, input: string) {
        return this.http.post(url, input, this.getRequestOptions())
    }


    scheduleTests(url: string, input: string) {
        let self = this;
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': self.auth.authheader
        });
        let requestOptions = {
            headers: headers,
            observe: 'response' as const
        };
        return this.http.post(url, input, requestOptions);
    }

    modifyScheduleTests(url: string, input: string) {
        return this.http.put(url, input, this.getRequestOptions())
    }



    getScheduleById(url: string) {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }

    getSearchStudent(url: string) {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }

    mapTestScheduleObjects(objTestScheduleModel): TestScheduleModel {
        let _testScheduleModel = new TestScheduleModel();
        if (objTestScheduleModel) {
            _testScheduleModel.scheduleId = objTestScheduleModel.TestingSessionId;
            _testScheduleModel.scheduleName = objTestScheduleModel.SessionName;
            _testScheduleModel.subjectId = objTestScheduleModel.SubjectTestId;
            _testScheduleModel.testId = objTestScheduleModel.SessionTestId;
            _testScheduleModel.testName = objTestScheduleModel.SessionTestName;
            _testScheduleModel.testNormingStatus = objTestScheduleModel.NormingStatusName;
            _testScheduleModel.scheduleStartTime = objTestScheduleModel.TestingWindowStart;
            _testScheduleModel.scheduleEndTime = objTestScheduleModel.TestingWindowEnd;
            _testScheduleModel.savedStartTime = objTestScheduleModel.TestingWindowStart;
            _testScheduleModel.savedEndTime = objTestScheduleModel.TestingWindowEnd;
            _testScheduleModel.institutionId = objTestScheduleModel.InstitutionId;
            _testScheduleModel.institutionName = (_.has(objTestScheduleModel, 'InstitutionName') ? objTestScheduleModel.InstitutionName : '');
            _testScheduleModel.institutionNameWithProgramOfStudy = (_.has(objTestScheduleModel, 'InstitutionNameWithProgOfStudy') ? objTestScheduleModel.InstitutionNameWithProgOfStudy : '');
            _testScheduleModel.lastselectedcohortId = objTestScheduleModel.LastCohortSelectedId;
            _testScheduleModel.facultyMemberId = objTestScheduleModel.FacultyMemberId;
            _testScheduleModel.pageSavedOn = objTestScheduleModel.PageSavedOn;
            _testScheduleModel.adminId = objTestScheduleModel.AdminId;
            _testScheduleModel.adminFirstName = objTestScheduleModel.AdminFirstName;
            _testScheduleModel.adminLastName = objTestScheduleModel.AdminLastName;
            _testScheduleModel.facultyFirstName = objTestScheduleModel.FacultyFirstName;
            _testScheduleModel.facultyLastName = objTestScheduleModel.FacultyLastName;
            _testScheduleModel.status = (_.has(objTestScheduleModel, 'Status') ? objTestScheduleModel.Status : '');
            _testScheduleModel.dateCreated = objTestScheduleModel.DateCreated;
            _testScheduleModel.lastUpdated = objTestScheduleModel.DateModified;
            _testScheduleModel.isExamity = objTestScheduleModel.IsExamityEnabled;
            _testScheduleModel.itSecurityEnabledInstitution = objTestScheduleModel.ItSecurityEnabledInstitution;
            _testScheduleModel.testType = objTestScheduleModel.TestType || 1;
            if (objTestScheduleModel.Students && objTestScheduleModel.Students.length > 0) {
                _.forEach(objTestScheduleModel.Students, (student) => {
                    let _student = new SelectedStudentModel();
                    _student.StudentId = student.StudentId;
                    _student.LastName = student.LastName;
                    _student.FirstName = student.FirstName;
                    _student.StudentTestId = student.StudentTestId;
                    _student.StudentTestName = student.StudentTestName;
                    _student.Ada = student.Ada;
                    _student.Email = student.Email;
                    _student.Retester = student.Retester;
                    _student.CohortId = student.CohortId;
                    _student.CohortName = student.CohortName;
                    _student.NormingStatus = student.StudentNormingStatusName;
                    _student.StudentPay = student.IsStudentPayDeactivated;
                    _student.AssignedTestStarted = student.AssignedTestStarted;
                    _testScheduleModel.selectedStudents.push(_student);

                });
            }
        }


        return _testScheduleModel;
    }

    deleteSchedule(url: string) {
        let self = this;
        const headers = new HttpHeaders({
            'Authorization': self.auth.authheader,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        });
        let options = {
            headers : headers,
            // body : ''
            observe: 'response' as const
        }
        return this.http.delete(url, options);
    }


    getAllScheduleTests(url: string) {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }


    renameSession(url: string, input: string) {
        return this.http.put(url, input, this.getRequestOptions());
    }

    sortSchedule(schedule: TestScheduleModel): TestScheduleModel {
        if (schedule != undefined && schedule.selectedStudents != undefined && schedule.selectedStudents.length > 0) {
            let __selectedStudents: SelectedStudentModel[] = schedule.selectedStudents.sort(function (a, b) {
                var nameA = a.LastName.toLowerCase(), nameB = b.LastName.toLowerCase()
                if (nameA < nameB) //sort string ascending
                    return -1
                if (nameA > nameB)
                    return 1
                return 0 //default return value (no sorting)
            });
            schedule.selectedStudents = __selectedStudents;
        }
        return schedule;
    }


    clearTestScheduleObjects(): void {
        this.sStorage.removeItem('testschedule');
        this.sStorage.removeItem('retesters');
        this.sStorage.removeItem('previousTest');
        this.sStorage.removeItem('prevtestschedule');
        this.sStorage.removeItem('openintegratedtests');
        this.sStorage.removeItem('isinstitutionip');
    }

    getAlternateExceptionsModify(): any {
        return this.sStorage.getItem('retestersModify');
    }

    removeRestestersExceptionForModify(): void {
        this.sStorage.removeItem('retestersModify');
    }


    sortTests(tests: any, tableName: string, columnName: string): any {
        let asc: number = +$(tableName).find(columnName).attr('order');

        if (tests != undefined && tests.length > 0) {
            let sortedTests: any;
            if (_.includes(columnName,'#schDateTH') || _.includes(columnName,'#cmpDateTH')) {
                sortedTests = tests.sort(function (a, b) {
                    if (moment(a.scheduleStartTime).isBefore(b.scheduleStartTime)) //sort string ascending
                        return asc == 1 ? 1 : -1
                    if (moment(a.scheduleStartTime).isAfter(b.scheduleStartTime))
                        return asc == 1 ? -1 : 1
                    return 0 //default return value (no sorting)
                });
            }
            else if (_.includes(columnName, '#schLastUpdatedTH') || _.includes(columnName, '#cmpLastUpdateTH')) {
                sortedTests = tests.sort(function (a, b) {
                    if (moment(a.lastUpdated).isBefore(b.lastUpdated)) //sort string ascending
                        return asc == 1 ? 1 : -1
                    if (moment(a.lastUpdated).isAfter(b.lastUpdated))
                        return asc == 1 ? -1 : 1
                    return 0 //default return value (no sorting)
                });
            }
            else {
                sortedTests = tests.sort(function (a, b) {
                    let strA: string;
                    let strB: string;
                    if (_.includes(columnName,'#schSessionTH') || _.includes(columnName,'#cmpSessionTH')) {
                        strA = a.scheduleName.toLowerCase();
                        strB = b.scheduleName.toLowerCase();
                    }
                    else if (_.includes(columnName,'#schFacultyTH') || _.includes(columnName,'#cmpFacultyTH')) {
                        strA = a.facultyFirstName.toLowerCase();
                        strB = b.facultyFirstName.toLowerCase();
                    }
                    else if (_.includes(columnName,'#schAdminTH') || _.includes(columnName,'#cmpAdminTH')) {
                        strA = a.adminFirstName.toLowerCase();
                        strB = b.adminFirstName.toLowerCase();
                    }

                    if (strA < strB) //sort string ascending
                        return asc == 1 ? 1 : -1
                    if (strA > strB)
                        return asc == 1 ? -1 : 1
                    return 0 //default return value (no sorting)
                });
            }

            let $table = $(tableName);
            $table.find('button.sorted').removeClass('sorted');

            let $clickedColumn = $(tableName).find(columnName);
            $clickedColumn.attr('order', asc == 1 ? "0" : "1").find('button').addClass('sorted');
            let columnIndex: number = $clickedColumn.index() + 1;
            $table.find('th').not($clickedColumn).attr('order', "1").removeClass('tablesaw-sortable-descending').addClass('tablesaw-sortable-ascending');

            if (asc == 1)
                $clickedColumn.removeClass('tablesaw-sortable-ascending').addClass('tablesaw-sortable-descending');
            else
                $clickedColumn.removeClass('tablesaw-sortable-descending').addClass('tablesaw-sortable-ascending');

            $table.find('tbody td').removeClass('column-striped');
            $table.find('tbody td:nth-child(' + columnIndex + ')').addClass('column-striped');
            return sortedTests;
        }
        return null;
    }



    getTestStatus(url: string): string {
        let self = this;
        let status = 'scheduled';
        $.ajax({
            url: url,
            type: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': self.auth.authheader
            },
            success: function (json) {
                if (json) {
                    if (json.Status)
                        status = json.Status.toLowerCase();
                }

            },
            error: function () {
            },
            async: false
        });

        return status;
    }

    checkIfTestStartingSoon(institutionId: number, savedStartTime: any): number {
        let institutionTimezone: string = this.common.getTimezone(institutionId);
        let institutionCurrentTime: any = moment.tz(new Date(), institutionTimezone).format('YYYY-MM-DD HH:mm:ss');
        let mStartTime = moment(savedStartTime);
        let timeDifference = (mStartTime.diff(institutionCurrentTime, 'seconds'));
        return timeDifference;
    }

    getTestStartTime(testScheduleModel: TestScheduleModel, institutionId: number): any {
        let institutionTimezone: string = this.common.getTimezone(institutionId);
        let institutionCurrentTime = moment.tz(new Date(), institutionTimezone).format('YYYY-MM-DD HH:mm:ss');
        let testStartTime = moment(testScheduleModel.scheduleStartTime);

        return testStartTime;
    }


    validateDates(testScheduleModel: TestScheduleModel, institutionID: number, modify: boolean, modifyInProgress: boolean): boolean {
        if (testScheduleModel) {

            if (testScheduleModel.scheduleStartTime && testScheduleModel.scheduleEndTime) {

                let institutionTimezone: string = this.common.getTimezone(institutionID);
                let institutionCurrentTime = moment.tz(new Date(), institutionTimezone).format('YYYY-MM-DD HH:mm:ss');

                let scheduleEndTime = moment(new Date(
                    moment(testScheduleModel.scheduleEndTime).year(),
                    moment(testScheduleModel.scheduleEndTime).month(),
                    moment(testScheduleModel.scheduleEndTime).date(),
                    moment(testScheduleModel.scheduleEndTime).hour(),
                    moment(testScheduleModel.scheduleEndTime).minute(),
                    moment(testScheduleModel.scheduleEndTime).second()
                )).format('YYYY-MM-DD HH:mm:ss');

                let scheduleStartTime = moment(new Date(
                    moment(testScheduleModel.scheduleStartTime).year(),
                    moment(testScheduleModel.scheduleStartTime).month(),
                    moment(testScheduleModel.scheduleStartTime).date(),
                    moment(testScheduleModel.scheduleStartTime).hour(),
                    moment(testScheduleModel.scheduleStartTime).minute(),
                    moment(testScheduleModel.scheduleStartTime).second()
                )).format('YYYY-MM-DD HH:mm:ss');

                if (modify) {
                    //first check if not in modify in progress flow if test has started 
                    this.checkIfTestHasStarted(institutionID, testScheduleModel.savedStartTime, testScheduleModel.savedEndTime, modifyInProgress);
                    if (!this.checkIfTestHasStarted(institutionID, testScheduleModel.savedStartTime, testScheduleModel.savedEndTime, modifyInProgress)) {
                        return false;
                    }
                }
                // alert that The testing window you specified has expired and needs to be changed
                if (moment(scheduleEndTime).isBefore(institutionCurrentTime)) {
                    $('#alertPopup').modal('show');
                    return false;
                }
            }
        }

        return true;
    }

    getTestStatusFromTimezone(institutionId: number, startTime: any, endTime: any): number {
        let institutionTimezone: string = this.common.getTimezone(institutionId);
        let institutionCurrentTime = moment.tz(new Date(), institutionTimezone).format('YYYY-MM-DD HH:mm:ss');

        let tStartTime = moment(new Date(
            moment(startTime).year(),
            moment(startTime).month(),
            moment(startTime).date(),
            moment(startTime).hour(),
            moment(startTime).minute(),
            moment(startTime).second()
        )).format('YYYY-MM-DD HH:mm:ss');

        let tEndTime = moment(new Date(
            moment(endTime).year(),
            moment(endTime).month(),
            moment(endTime).date(),
            moment(endTime).hour(),
            moment(endTime).minute(),
            moment(endTime).second()
        )).format('YYYY-MM-DD HH:mm:ss');

        //session has not started yet
        if (moment(startTime).isAfter(institutionCurrentTime))
            return 1;
        //session started but not finished
        else if (moment(startTime).isBefore(institutionCurrentTime) && moment(endTime).isAfter(institutionCurrentTime))
            return 0;
        //session started and finished
        else if (moment(startTime).isBefore(institutionCurrentTime) && moment(endTime).isBefore(institutionCurrentTime))
            return -1;
    }


    anyStudentPayStudents(testScheduleModel: TestScheduleModel): boolean {
        if (testScheduleModel && testScheduleModel.selectedStudents && testScheduleModel.selectedStudents.length > 0)
            return _.some(testScheduleModel.selectedStudents, { 'StudentPay': true });
    }

    updateScheduleDates(url: string, input: string) {
        return this.http.put(url, input, this.getRequestOptions());
    }

    modifyInProgressScheduleTests(url: string, input: string) {
        return this.http.put(url, input, this.getRequestOptions())
    }

    checkIfTestHasStarted(institutionId: number, testStartTime: any, testEndTime: any, modify: boolean = false, modifyInProgress: boolean = false): any {
        if ((modify && !modifyInProgress) && (this.getTestStatusFromTimezone(institutionId, testStartTime, testEndTime) === 0)) {
            $('#testStarted').modal('show');
            return false;
            //let user know test session has completely passed and they can no longer make changes (in Modify and Modify in Progress)
        } else if ((modify || modifyInProgress) && (this.getTestStatusFromTimezone(institutionId, testStartTime, testEndTime) === -1)) {
            $('#testPassed').modal('show');
            return false;
        } else
            return true;
    }

    showTestStartingWarningModals(modify: boolean, institutionID: number, savedStartTime: any, testEndTime: any): any {
        if (this.clearTimeout10min)
            window.clearTimeout(this.clearTimeout10min);
        if (this.clearTimeout5minAfter10)
            window.clearTimeout(this.clearTimeout5minAfter10);
        if (this.clearTimeout5min)
            window.clearTimeout(this.clearTimeout5min);
        if ((modify) && (this.getTestStatusFromTimezone(institutionID, savedStartTime, testEndTime) === 1)) {
            //returns time difference in seconds
            let timeDiff = this.checkIfTestStartingSoon(institutionID, savedStartTime);
            let convertToSeconds = 60;
            let waitTime = 0;
            // 8 hours = 480 minutes
            let tokenTime = 480 * convertToSeconds;
            // check if time difference is less than or equal to token length
            // and greater than or equal to 10 minutes
            if (timeDiff <= tokenTime && timeDiff >= (10 * convertToSeconds)) {
                waitTime = timeDiff - (10 * convertToSeconds);
                let waitTimePlus5 = waitTime + (5 * convertToSeconds);
                this.clearTimeout10min = setTimeout(() => {
                    $('#testStartingin10').modal('show');
                }, waitTime * 1000)
                this.clearTimeout5minAfter10 = setTimeout(() => {
                    $('#testStartingin10').modal('hide');
                    $('#testStartingin5').modal('show');
                }, waitTimePlus5 * 1000)
            }
            // check if time difference is less than or equal to token length
            // and greater than or equal to 5 minutes
            else if (timeDiff <= tokenTime && timeDiff >= (5 * convertToSeconds)) {
                waitTime = timeDiff - (5 * convertToSeconds);
                this.clearTimeout5min = setTimeout(() => {
                    $('#testStartingin5').modal('show');
                }, waitTime * 1000)
            }
        }
    }

    enableExamity(url: string, input: number) {
        return this.http.put(url,input, this.getRequestOptions());
    }
}
