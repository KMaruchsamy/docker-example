import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './../../services/auth.service';

@Injectable()
export class RosterService {

    constructor(private auth: AuthService, private http: HttpClient) {

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

    private getRequestOptionsWithEmptyBody() {
        let self = this;
        const headers =  new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': self.auth.authheader
        });
        let requestOptions = {
            headers: headers,
            // body: ''
            observe: 'response' as const
        };
        return requestOptions;
    }

    getRosterCohorts(url)  {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }

    getRosterStudentCohorts(url)  {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }

    searchStudents(url)  {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }

    setUserPreference(url: string, input: string)  {
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

    getRosterCohortUserPreference(url)  {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }

    addEmailValidation(url)  {
        return this.http.get(url, this.getRequestOptionsWithEmptyBody());
    }

}
