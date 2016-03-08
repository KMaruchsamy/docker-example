import {Injectable, Inject} from 'angular2/core';
import {Http, Response, RequestOptions, Headers, HTTP_PROVIDERS} from "angular2/http";
import {Observable} from 'rxjs/Rx';
import {Auth} from './auth';
import * as _ from '../lib/index';
import {TestScheduleModel} from '../models/testSchedule.model';
import {SelectedStudentModel} from '../models/selectedStudent-model';
import {TestShedulingPages} from '../constants/config';


@Injectable()
export class TestService {
    // auth: Auth;
    sStorage: any;
    constructor(public http: Http, public testSchedule: TestScheduleModel, public auth: Auth) {
        this.http = http;
        this.sStorage = this.auth.sStorage;
        this.auth.refresh();
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

    getSubjects(url): any {
        let self = this;
        return fetch(url, {
            method: 'get',
            headers: {
                'Accept': 'application/json',
                'Authorization': self.auth.authheader
            }
        });
    }


    getTests(url): any {
        let self = this;
        return fetch(url, {
            method: 'get',
            headers: {
                'Accept': 'application/json',
                'Authorization': self.auth.authheader
            }
        });
    }

    getOpenIntegratedTests(url): any {
        return fetch(url, {
            method: 'get',
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    getActiveCohorts(url): any {
        let self = this;
        return fetch(url, {
            method: 'get',
            headers: {
                'Accept': 'application/json',
                'Authorization': self.auth.authheader
            }
        });
    }

    getFaculty(url: string): any {
        let self = this;
        return fetch(url, {
            method: 'get',
            headers: {
                'Accept': 'application/json',
                'Authorization': self.auth.authheader
            }
        });
    }


    getRetesters(url: string, input: string): any {
        let self = this;
        return fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': self.auth.authheader
            },
            body: input
        });
    }


    scheduleTests(url: string, input: string): any {
        let self = this;
        return fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': self.auth.authheader
            },
            body: input
        });
    }

    modifyScheduleTests(url: string, input: string): any {
        let self = this;
        return fetch(url, {
            method: 'put',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': self.auth.authheader
            },
            body: input
        });
    }



    getScheduleById(url: string): any {
        let self = this;
        return fetch(url, {
            method: 'get',
            headers: {
                'Accept': 'application/json',
                'Authorization': self.auth.authheader
            }
        });
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
                _.forEach(objTestScheduleModel.Students, function(student, key) {
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


    getAllScheduleTests(url: string) {
        let self = this;
        return fetch(url, {
            method: 'get',
            headers: {
                'Accept': 'application/json',
                'Authorization': self.auth.authheader
            }
        });
    }


    renameSession(url: string, input: string): any {
        let self = this;
        return fetch(url, {
            method: 'put',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': self.auth.authheader
            },
            body: input
        });
    }

    sortSchedule(schedule: TestScheduleModel): TestScheduleModel {
        if (schedule != undefined && schedule.selectedStudents != undefined && schedule.selectedStudents.length > 0) {
            let __selectedStudents: SelectedStudentModel[] = schedule.selectedStudents.sort(function(a, b) {
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
            if (columnName === '#dateTH') {
                sortedTests = tests.sort(function(a, b) {
                    if (moment(a.TestingWindowStart).isBefore(b.TestingWindowStart)) //sort string ascending
                        return asc == 1 ? 1 : -1
                    if (moment(a.TestingWindowStart).isAfter(b.TestingWindowStart))
                        return asc == 1 ? -1 : 1
                    return 0 //default return value (no sorting)
                });
            }
            else {
                sortedTests = tests.sort(function(a, b) {
                    let strA: string;
                    let strB: string;
                    if (columnName === '#sessionTH') {
                        strA = a.SessionName.toLowerCase();
                        strB = b.SessionName.toLowerCase();
                    }
                    else if (columnName === '#facultyTH') {
                        strA = a.FacultyFirstName.toLowerCase();
                        strB = b.FacultyFirstName.toLowerCase();
                    }
                    else if (columnName === '#adminTH') {
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

            $(tableName).find(columnName).attr('order', asc == 1 ? "0" : "1");
            return sortedTests;
        }
        return null;
    }


  
    getTestStatus(url: string):string {
        let self = this;
        let status = 'scheduled';
        $.ajax({
            url: url,
            type: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': self.auth.authheader
            },
            success: function(json) {
                if (json) {
                    if (json.Status)
                        status = json.Status.toLowerCase();    
                }
               
            },
            error: function(xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
            },
            async: false
        });

        return status;
    }


}