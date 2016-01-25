import {Injectable, Inject} from 'angular2/core';
import {Http, Response, RequestOptions, Headers, HTTP_PROVIDERS} from "angular2/http";
import {Auth} from './auth';
import * as _ from '../lib/index';
import {TestScheduleModel} from '../models/testSchedule.model';


@Injectable()
export class TestService {
    // auth: Auth;
    sStorage: any;
    constructor(public http: Http, public testSchedule: TestScheduleModel, public auth: Auth) {
        this.http = http;
        // this.auth = new Auth();
        this.sStorage = this.auth.sStorage;
        this.auth.refresh();
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
}