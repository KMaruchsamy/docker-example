import {Component} from 'angular2/core';
import {LoginHeader} from './login-header';
import {LoginContent} from './login-content';
import {LoginFooter} from './login-footer';
import {Logger} from '../../scripts/logger';


@Component({
  selector: 'login',
  viewBindings: [Logger],
  host: {
    '(window:resize)':'resize($event)'
  },
  templateUrl: '../../templates/login/login.html',
  directives: [LoginHeader, LoginContent, LoginFooter]
})
export class Login {
  constructor(public logger: Logger) {
    this.initialize();
    this.reset();
  }

  resize($event) {
}  
  initialize(): void {
    $('title').html('Faculty Sign In &ndash; Kaplan Nursing');
  }

  reset(): void {
    $('#username').val('');
    $('#password').val('');
    $('div.alert').hide();
  }
}