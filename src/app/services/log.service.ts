import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
// import {AuthService} from './auth';
import { links } from '../constants/config';
// import {CommonService} from './common';
import { AuthService } from './auth.service';
import { CommonService } from './common.service';

@Injectable()
export class LogService {
    constructor(private auth: AuthService, private http: Http, private common: CommonService) {

    }

    error(error: string, stacktrace: string = null, reason: string = null): any {
        try {
            let body = JSON.stringify({
                ErrorType: error,
                ErrorDescription: stacktrace,
                Reason: reason
            });
            let url: string = this.common.getLogServer();
            let headers: Headers = new Headers();
            headers.append('Authorization', this.auth.authheader);
            headers.append('Accept', 'application/json');
            headers.append('Content-Type', 'application/json');
            let options: RequestOptions = new RequestOptions();
            options.headers = headers;

            this.http.post(url, body, options)
                .map(res => <any>res.json())
                .subscribe(
                response => console.log(response),
                error => this.handleError,
                () => console.log('Error logged ...')
                );
        } catch (error) {
            console.log('error caught');
        }

    }

    handleError(error: Response): any {
        return Observable.throw(error.json().error || 'Server error');
    }

}