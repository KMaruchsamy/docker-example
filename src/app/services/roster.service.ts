import { Observable } from 'rxjs/Rx';
import { RequestOptions, Headers, Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import {Auth} from '../services/auth';

@Injectable()
export class RosterService {

    constructor(private auth: Auth, private http: Http) {

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

    private getRequestOptionsWithEmptyBody(): RequestOptions {
        let self = this;
        let headers: Headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': self.auth.authheader
        });
        let requestOptions: RequestOptions = new RequestOptions({
            headers: headers,
            body: ''
        });
        return requestOptions;
    }

    getRosterCohorts(url): Observable<Response> {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }

    getRosterStudentCohorts(url): Observable<Response> {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }

    searchStudents(url): Observable<Response> {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }

}