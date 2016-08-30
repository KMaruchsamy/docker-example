import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {Auth} from './auth';
import {links} from '../constants/config';
import {Common} from './common';

@Injectable()
export class Log {
    constructor(private auth: Auth, private http: Http, private common: Common) {

    }

    error(error: string, stacktrace: string = null, reason: string =  null): any {
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
                 error=>this.handleError,
                 () => console.log('Error logged ...')
        );
    }

    handleError(error: Response): any {
        return Observable.throw(error.json().error || 'Server error');
    }

}