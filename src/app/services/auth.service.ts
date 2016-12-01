// import {CommonService} from './common';
import {Injectable} from '@angular/core';
// import * as _ from 'lodash';
import {Observable} from 'rxjs/Rx';
import {Http, RequestOptions, Headers, Response} from '@angular/http';
import { CommonService } from './common.service';

@Injectable()
export class AuthService {
  common: CommonService = new CommonService();
  sStorage: any = this.common.getStorage();

  // token: string;
  get token(): any {
    return this.sStorage.getItem('jwt');
  }
  set token(value: any) {
    this.sStorage.setItem('jwt', value);
  }
  // user: any;
  // authheader: string;
  get authheader(): any {
    return 'Bearer ' + this.token;
  }

  // useremail: string;
  get useremail(): string {
    return this.sStorage.getItem('useremail');
  }
  set useremail(value: string) {
    this.sStorage.setItem('useremail', value);
  }


  // istemppassword: boolean;
  get istemppassword(): boolean {
    return this.sStorage.getItem('istemppassword') === 'true';
  }
  set istemppassword(value: boolean) {
    this.sStorage.setItem('istemppassword', value);
  }


  // userid: number;
  get userid(): number {
    return +this.sStorage.getItem('userid');
  }
  set userid(value: number) {
    this.sStorage.setItem('userid', value);
  }

  // firstname: string;
  get firstname(): string {
    return this.sStorage.getItem('firstname');
  }
  set firstname(value: string) {
    this.sStorage.setItem('firstname', value);
  }

  // lastname: string;
  get lastname(): string {
    return this.sStorage.getItem('lastname');
  }
  set lastname(value: string) {
    this.sStorage.setItem('lastname', value);
  }


  // title: string;
  get title(): string {
    return this.sStorage.getItem('title');
  }
  set title(value: string) {
    this.sStorage.setItem('title', value);
  }


  // institutions: any;
  get institutions(): any {
    return this.sStorage.getItem('institutions');
  }
  set institutions(value: any) {
    this.sStorage.setItem('institutions', value);
  }

  // securitylevel: number;
  get securitylevel(): number {
    return this.sStorage.getItem('securitylevel');
  }
  set securitylevel(value: number) {
    this.sStorage.setItem('securitylevel', value);
  }

  // username: string;
  get username(): string {
    return this.sStorage.getItem('username');
  }
  set username(value: string) {
    this.sStorage.setItem('username', value);
  }


  // isEnrollmentAgreementSigned: boolean;
 get isEnrollmentAgreementSigned(): boolean {
   return this.sStorage.getItem('isenrollmentagreementsigned')==='true';
  }
  set isEnrollmentAgreementSigned(value: boolean) {
    this.sStorage.setItem('isenrollmentagreementsigned', value);
  }



  constructor(private http: Http) {
    // this.common = new CommonService();
    // this.sStorage = this.common.getStorage();
    // this.token = this.sStorage.getItem('jwt');
    // this.user = this.token && jwt_decode(this.token);
    // this.useremail = this.sStorage.getItem('useremail');
    // this.authheader = 'Bearer ' + this.token;
    // this.istemppassword = this.sStorage.getItem('istemppassword') === 'true';
    // this.userid = parseInt(this.sStorage.getItem('userid'));
    // this.firstname = this.sStorage.getItem('firstname');
    // this.lastname = this.sStorage.getItem('lastname');
    // this.title = this.sStorage.getItem('title');
    // // this.institutions = this.sStorage.getItem('institutions');
    // this.securitylevel = this.sStorage.getItem('securitylevel');
    // this.username = this.sStorage.getItem('username');
    // this.isEnrollmentAgreementSigned = this.sStorage.getItem('isenrollmentagreementsigned') === 'true';
  }

  refresh() {
    this.token = this.sStorage.getItem('jwt');
    this.useremail = this.sStorage.getItem('useremail');
    // this.authheader = 'Bearer ' + this.token;
    this.istemppassword = this.sStorage.getItem('istemppassword') === 'true';
    this.userid = parseInt(this.sStorage.getItem('userid'));
    this.firstname = this.sStorage.getItem('firstname');
    this.lastname = this.sStorage.getItem('lastname');
    this.title = this.sStorage.getItem('title');
    this.institutions = this.sStorage.getItem('institutions');
    this.securitylevel = this.sStorage.getItem('securitylevel');
    this.username = this.sStorage.getItem('username');
    this.isEnrollmentAgreementSigned = this.sStorage.getItem('isenrollmentagreementsigned') === 'true';
  }


  isAuth() {
    return (!!this.token && !!this.isEnrollmentAgreementSigned);
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
    // this.user = null;
    // this.authheader = null;
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


  settemporarypassword(url, useremail, password): Observable<Response> {
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
