import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { CommonService } from './common.service';

@Injectable()
export class LogService {
    constructor(private auth: AuthService, private http: HttpClient, private common: CommonService) {

    }

    error(error: string, stacktrace: string = null, reason: string = null): any {
        try {
            let body = JSON.stringify({
                ErrorType: error,
                ErrorDescription: stacktrace,
                Reason: reason
            });
            let url: string = this.common.getLogServer();
            const headers = new HttpHeaders();
            headers.append('Authorization', this.auth.authheader);
            headers.append('Accept', 'application/json');
            headers.append('Content-Type', 'application/json');
            let options = {
                headers: headers,
                observe: 'response' as const

            }
            this.http.post(url, body, options)
                .map(res => <any>res)
                .subscribe(
                response => console.log(response),
                error => this.handleError,
                () => console.log('Error logged ...')
                );
        } catch (error) {
            console.log('error caught');
        }

    }

    handleError(error: HttpResponse<any>): any {
        return Observable.throw(error.body.error || 'Server error');
    }

}