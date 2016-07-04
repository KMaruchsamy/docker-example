import {Common} from './common';
import {Injectable} from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class Auth {
  sStorage:any;
    token:string;
    user:any;
    authheader:string;
    useremail:string;
    istemppassword:boolean;
    userid :number;
    firstname:string;
    lastname:string;
    title:string;
    institutions:any;
    securitylevel:number;
    username:string;
    common: Common;
  constructor() {
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
  }


  isAuth() {
    return !!this.token;
  }

  getUser() {
    return this.user;
  }


  isStudentPayEnabledInstitution(institutionId:number): boolean{
    let institutions = JSON.parse(this.institutions);
    if (institutions.length > 0) {
      return _.some(institutions, { 'InstitutionId': institutionId, 'StudentPayEnabled': true });
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

  login(url, useremail, password, usertype) {
    return fetch(url, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        useremail: useremail,
        password: password,
        usertype: usertype
      })
    });
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
  settemporarypassword(url, useremail, password) {
    return fetch(url, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.authheader
      },
      body: JSON.stringify({
        useremail: useremail,
        password: password
      })
    });
  }
}