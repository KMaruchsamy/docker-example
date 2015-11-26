import {Component, View} from 'angular2/angular2';
import {LoginHeader} from './login-header';
import {LoginContent} from './login-content';
import {LoginFooter} from './login-footer';
import {Logger} from '../../scripts/logger';


@Component({
  selector: 'login',
  viewBindings:[Logger]
})
@View({
  templateUrl: '../../templates/login/login.html',
  directives:[LoginHeader,LoginContent,LoginFooter]
})
export class Login {
  constructor(logger:Logger) {
      this.initialize();
      this.reset();
      this.logger = logger;
   }
   
   initialize(){
     $('title').html('Faculty Sign In  |  Kaplan Nursing');
   }
   
    reset(){         
         $('#username').val('');
         $('#password').val('');
         $('div.alert').hide();  
    }
}