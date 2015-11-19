import {Common} from './common';

export class Auth {
  constructor() {
    this.common = new Common();
    this.sStorage = this.common.sStorage;
    this.token = this.sStorage.getItem('jwt');
    this.user = this.token && jwt_decode(this.token);
    this.useremail = this.sStorage.getItem('useremail');
    this.authheader = 'Bearer ' + this.token;
    this.istemppassword = this.sStorage.getItem('istemppassword');
    this.userid = this.sStorage.getItem('userid');
    this.firstname = this.sStorage.getItem('firstname');
    this.lastname = this.sStorage.getItem('lastname');
    this.title = this.sStorage.getItem('title');
    this.institutions = this.sStorage.getItem('institutions');
    this.securitylevel = this.sStorage.getItem('securitylevel');
    this.username=this.sStorage.getItem('username');
    this.password=this.sStorage.getItem('password');
  }


  refresh() {
    this.token = this.sStorage.getItem('jwt');
    this.user = this.token && jwt_decode(this.token);
    this.useremail = this.sStorage.getItem('useremail');
    this.authheader = 'Bearer ' + this.token;
    this.istemppassword = this.sStorage.getItem('istemppassword');
    this.userid = this.sStorage.getItem('userid');
    this.firstname = this.sStorage.getItem('firstname');
    this.lastname = this.sStorage.getItem('lastname');
    this.title = this.sStorage.getItem('title');
    this.institutions = this.sStorage.getItem('institutions');
    this.securitylevel = this.sStorage.getItem('securitylevel');
    this.username=this.sStorage.getItem('username');
    this.password=this.sStorage.getItem('password');
  }


  isAuth() {
    return !!this.token;
  }

  getUser() {
    return this.user;
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
    this.header = null;
    this.useremail = null;
    this.istemppassword = false;
    this.userid = null;
    this.firstname = null;
    this.lastname = null;
    this.title = null;
    this.institutions = null;
    this.securitylevel = null;
    this.username=null;
    this.password=null;
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