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
            || routeName.indexOf(TestShedulingPages.VIEW) > -1
            || routeName.indexOf('ERROR') > -1)
            return false;
        return true;
    }


    getTestSchedule(): TestScheduleModel {
        if (this.sStorage.getItem('testschedule'))
            return this.testSchedule = JSON.parse(this.sStorage.getItem('testschedule'));
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
        if (objTestScheduleModel.Students.length > 0) {
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

}