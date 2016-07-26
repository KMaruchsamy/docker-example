import {Injectable, Inject} from '@angular/core';
import {Http, Response, RequestOptions, Headers, HTTP_PROVIDERS} from "@angular/http";
import {Observable} from 'rxjs/Rx';
import {Auth} from './auth';
import * as _ from 'lodash';
import {TestScheduleModel} from '../models/testSchedule.model';
import {SelectedStudentModel} from '../models/selectedStudent-model';
import {TestShedulingPages} from '../constants/config';
import {Common} from './common';

@Injectable()
export class TestService {
    // auth: Auth;
    sStorage: any;
    constructor(public http: Http, public testSchedule: TestScheduleModel, public auth: Auth, public common: Common) {
        this.http = http;
        this.sStorage = this.auth.sStorage;
        this.auth.refresh();
    }

    private getRequestOptions(): RequestOptions {
        let self = this;
        let headers: Headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': self.auth.authheader
        });
        let requestOptions: RequestOptions = new RequestOptions({
            headers: headers
        });
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

    getSubjects(url): Observable<Response> {
        let self = this;
        let headers: Headers = new Headers({
            'Accept': 'application/json',
            'Authorization': self.auth.authheader
        });
        let requestOptions: RequestOptions = new RequestOptions({
            headers: headers
        });
        return this.http.get(url, requestOptions);
    }


    getTests(url): Observable<Response> {
        let self = this;
       	let headers: Headers = new Headers({
            'Accept': 'application/json',
            'Authorization': self.auth.authheader
        });
        let requestOptions: RequestOptions = new RequestOptions({
            headers: headers
        });
        return this.http.get(url, requestOptions);
    }

    getOpenIntegratedTests(url): Observable<Response> {
       let self = this;
       	let headers: Headers = new Headers({
            'Accept': 'application/json',
        });
        let requestOptions: RequestOptions = new RequestOptions({
            headers: headers
        });
        return this.http.get(url, requestOptions);
    }

    getActiveCohorts(url): Observable<Response> {
        return this.http.get(url, this.getRequestOptions());
    }

    getFaculty(url: string): any {
       return this.http.get(url, this.getRequestOptions());
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
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
            },
            async: false
        });

        return facultyJson;
    }



    getRetesters(url: string, input: string): Observable<Response> {
         return this.http.post(url,input, this.getRequestOptions())
    }


    scheduleTests(url: string, input: string): Observable<Response> {
        return this.http.post(url,input, this.getRequestOptions())
    }

    modifyScheduleTests(url: string, input: string): Observable<Response> {
        return this.http.post(url,input, this.getRequestOptions())
    }



    getScheduleById(url: string): Observable<Response> {
        return this.http.get(url, this.getRequestOptions());
    }

    getSearchStudent(url: string): Observable<Response> {
       return this.http.get(url, this.getRequestOptions());
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
            _testScheduleModel.institutionId = objTestScheduleModel.InstitutionId;
            _testScheduleModel.lastselectedcohortId = objTestScheduleModel.LastCohortSelectedId;
            _testScheduleModel.facultyMemberId = objTestScheduleModel.FacultyMemberId;
            _testScheduleModel.pageSavedOn = objTestScheduleModel.PageSavedOn;
            _testScheduleModel.adminId = objTestScheduleModel.AdminId;
            _testScheduleModel.adminFirstName = objTestScheduleModel.AdminFirstName;
            _testScheduleModel.adminLastName = objTestScheduleModel.AdminLastName;
            _testScheduleModel.facultyFirstName = objTestScheduleModel.FacultyFirstName;
            _testScheduleModel.facultyLastName = objTestScheduleModel.FacultyLastName;
            if (objTestScheduleModel.Students && objTestScheduleModel.Students.length > 0) {
                _.forEach(objTestScheduleModel.Students, function (student, key) {
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

    deleteSchedule(url: string): Observable<Response> {
        let self = this;
        let headers: Headers = new Headers();
        headers.append('Authorization', self.auth.authheader);
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        let options: RequestOptions = new RequestOptions();
        options.headers = headers;
        return this.http.delete(url, options);
    }


    getAllScheduleTests(url: string) :Observable<Response>{
        return this.http.get(url, this.getRequestOptions());
    }


    renameSession(url: string, input: string): Observable<Response> {      
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
    }

    getAlternateExceptionsModify(): any {
        return this.sStorage.getItem('retestersModify');
    }

    removeRestestersExceptionForModify(): void {
        this.sStorage.removeItem('retestersModify');
    }


    sortTests(tests: any, tableName: string, columnName: string): any {
        let asc: number = $(tableName).find(columnName).attr('order');

        if (tests != undefined && tests.length > 0) {
            let sortedTests: any;
            if (columnName === '#schDateTH' || columnName === '#cmpDateTH') {
                sortedTests = tests.sort(function (a, b) {
                    if (moment(a.TestingWindowStart).isBefore(b.TestingWindowStart)) //sort string ascending
                        return asc == 1 ? 1 : -1
                    if (moment(a.TestingWindowStart).isAfter(b.TestingWindowStart))
                        return asc == 1 ? -1 : 1
                    return 0 //default return value (no sorting)
                });
            }
            else {
                sortedTests = tests.sort(function (a, b) {
                    let strA: string;
                    let strB: string;
                    if (columnName === '#schSessionTH' || columnName === '#cmpSessionTH') {
                        strA = a.SessionName.toLowerCase();
                        strB = b.SessionName.toLowerCase();
                    }
                    else if (columnName === '#schFacultyTH' || columnName === '#cmpFacultyTH') {
                        strA = a.FacultyFirstName.toLowerCase();
                        strB = b.FacultyFirstName.toLowerCase();
                    }
                    else if (columnName === '#schAdminTH' || columnName === '#cmpAdminTH') {
                        strA = a.AdminFirstName.toLowerCase();
                        strB = b.AdminFirstName.toLowerCase();
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
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
            },
            async: false
        });

        return status;
    }




    validateDates(testScheduleModel: TestScheduleModel, institutionID: number, modify: boolean): boolean {
        if (testScheduleModel) {

            if (testScheduleModel.scheduleStartTime && testScheduleModel.scheduleEndTime) {

                console.log(new Date().toDateString());
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


                console.log('Institution Current Time : ' + institutionCurrentTime);
                console.log('Schedule endtime : ' + scheduleEndTime)

                if (modify) {
                    if (testScheduleModel.savedStartTime) {
                        let savedStartTime = moment(new Date(
                            moment(testScheduleModel.savedStartTime).year(),
                            moment(testScheduleModel.savedStartTime).month(),
                            moment(testScheduleModel.savedStartTime).date(),
                            moment(testScheduleModel.savedStartTime).hour(),
                            moment(testScheduleModel.savedStartTime).minute(),
                            moment(testScheduleModel.savedStartTime).second()
                        )).format('YYYY-MM-DD HH:mm:ss');

                        let savedEndTime = moment(new Date(
                            moment(testScheduleModel.savedEndTime).year(),
                            moment(testScheduleModel.savedEndTime).month(),
                            moment(testScheduleModel.savedEndTime).date(),
                            moment(testScheduleModel.savedEndTime).hour(),
                            moment(testScheduleModel.savedEndTime).minute(),
                            moment(testScheduleModel.savedEndTime).second()
                        )).format('YYYY-MM-DD HH:mm:ss');


                        console.log('Saved Starttime : ' + savedStartTime);
                        console.log('Saved End time : ' + savedEndTime);



                        if (moment(institutionCurrentTime).isBefore(savedStartTime)) {
                            if (moment(scheduleEndTime).isBefore(institutionCurrentTime)) {
                                $('#alertPopup').modal('show');
                                return false;
                            }
                        }
                        else {
                            $('#alertPopup').modal('show');
                            return false;
                        }

                    }
                    else {
                        if (moment(scheduleStartTime).isBefore(institutionCurrentTime)) {
                            $('#alertPopup').modal('show');
                            return false;
                        }
                    }

                }
                else {
                    if (moment(scheduleEndTime).isBefore(institutionCurrentTime)) {
                        $('#alertPopup').modal('show');
                        return false;
                    }
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


        if (moment(startTime).isAfter(institutionCurrentTime))
            return 1;
        else if (moment(startTime).isBefore(institutionCurrentTime) && moment(endTime).isAfter(institutionCurrentTime))
            return 0;
        else if (moment(startTime).isBefore(institutionCurrentTime) && moment(endTime).isBefore(institutionCurrentTime))
            return -1;
    }


    anyStudentPayStudents(testScheduleModel: TestScheduleModel): boolean {
        if (testScheduleModel && testScheduleModel.selectedStudents && testScheduleModel.selectedStudents.length > 0)
            return _.some(testScheduleModel.selectedStudents, { 'StudentPay': true });
    }

    modifyInProgressScheduleTests(url: string, input: string): Observable<Response> {
        return this.http.put(url, input, this.getRequestOptions())
    }
    
}