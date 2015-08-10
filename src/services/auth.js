import {Common} from './common';

export class Auth {
  constructor() {
    this.common = new Common();
             
    if (this.common.isPrivateBrowsing()) {
        sessionStorage = window.sessionStorage.__proto__;                        
    }   
    this.token = sessionStorage.getItem('jwt');
    this.user = this.token && jwt_decode(this.token);
    this.useremail = sessionStorage.getItem('useremail');
    this.authheader = 'Bearer ' + this.token;
    this.istemppassword=sessionStorage.getItem('istemppassword');
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
                 
    if (this.common.isPrivateBrowsing()) {
        sessionStorage = window.sessionStorage.__proto__;                        
    } 
    sessionStorage.removeItem('jwt');
    this.token = null;
    this.user = null;
    this.header = null;
    this.useremail = null;
    this.istemppassword=false;
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