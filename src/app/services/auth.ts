import {Common} from './common';
import {Injectable} from '@angular/core';
import * as _ from 'lodash';
import {Observable} from 'rxjs/Rx';
import {Http, RequestOptions, Headers, Response} from '@angular/http';

@Injectable()
export class Auth {
  sStorage: any;
  token: string;
  user: any;
  authheader: string;
  useremail: string;
  istemppassword: boolean;
  userid: number;
  firstname: string;
  lastname: string;
  title: string;
  institutions: any;
  securitylevel: number;
  username: string;
  common: Common;
  isEnrollmentAgreementSigned: boolean;
  constructor(private http: Http) {
    this.common = new Common();
    this.sStorage = this.common.getStorage();
    this.token = this.sStorage.getItem('jwt');
    this.user = this.token && jwt_decode(this.token);
    this.useremail = this.sStorage.getItem('useremail');
    this.authheader = 'Bearer ' + this.token;
    this.istemppassword = this.sStorage.getItem('istemppassword');
    this.userid = parseInt(this.sStorage.getItem('userid'));
    this.firstname = this.sStorage.getItem('firstname');
    this.lastname = this.sStorage.getItem('lastname');
    this.title = this.sStorage.getItem('title');
    this.institutions = this.sStorage.getItem('institutions');
    this.securitylevel = this.sStorage.getItem('securitylevel');
    this.username = this.sStorage.getItem('username');
    this.isEnrollmentAgreementSigned = this.sStorage.getItem('isenrollmentagreementsigned');
  }


  refresh() {
    this.token = this.sStorage.getItem('jwt');
    this.user = this.token && jwt_decode(this.token);
    this.useremail = this.sStorage.getItem('useremail');
    this.authheader = 'Bearer ' + this.token;
    this.istemppassword = this.sStorage.getItem('istemppassword');
    this.userid = parseInt(this.sStorage.getItem('userid'));
    this.firstname = this.sStorage.getItem('firstname');
    this.lastname = this.sStorage.getItem('lastname');
    this.title = this.sStorage.getItem('title');
    this.institutions = this.sStorage.getItem('institutions');
    this.securitylevel = this.sStorage.getItem('securitylevel');
    this.username = this.sStorage.getItem('username');
    this.isEnrollmentAgreementSigned = this.sStorage.getItem('isenrollmentagreementsigned');
  }


  isAuth() {
    return (!!this.token && !!this.isEnrollmentAgreementSigned);
  }

  getUser() {
    return this.user;
  }


  isStudentPayEnabledInstitution(institutionId: number): boolean {
    let institutions = JSON.parse(this.institutions);
    if (institutions.length > 0) {
      return _.some(institutions, { 'InstitutionId': +institutionId, 'StudentPayEnabled': true });
    }
    return false;
  }

  isPayInstitutionEnabled(id: number): void {
    let _institutions = JSON.parse(this.institutions);
    if (_institutions.length > 0) {
      let isEnabled = _.map(_.filter(_institutions, { 'InstitutionId': id }), 'StudentPayEnabled');
      this.sStorage.setItem('payLinkEnabled', isEnabled[0]);
    } else
      this.sStorage.setItem('payLinkEnabled', "false");
  }

  login(url, useremail, password, usertype): Observable<Response> {
    let headers: Headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });

    let options: RequestOptions = new RequestOptions({
      headers: headers
    })

    let body = JSON.stringify({
      useremail: useremail,
      password: password,
      usertype: usertype
    });

    return this.http.post(url, body, options);

  }

  logout() {
    this.sStorage.clear();
    this.token = null;
    this.user = null;
    this.authheader = null;
    this.useremail = null;
    this.istemppassword = false;
    this.userid = null;
    this.firstname = null;
    this.lastname = null;
    this.title = null;
    this.institutions = null;
    this.securitylevel = null;
    this.username = null;
  }

  
  settemporarypassword(url, useremail, password):Observable<Response> {
        let self = this;
        let headers: Headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': this.authheader
        });
        let requestOptions: RequestOptions = new RequestOptions({
            headers: headers
        });
        let body: any = JSON.stringify({
          useremail: useremail,
          password: password
        });
        return this.http.post(url, body, requestOptions);
  }

    saveAcceptedTerms(url): Observable<Response> {
      let self = this;
      let headers: Headers = new Headers({
          'Accept': 'application/json',
          'Authorization': this.authheader,
          'Content-Type': 'application/json'
      });
      let requestOptions: RequestOptions = new RequestOptions({
          headers: headers
      });
      return this.http.post(url, {}, requestOptions);
  }
  
}
