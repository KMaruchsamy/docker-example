import {Component, View} from 'angular2/angular2';
import {LoginHeader} from './login-header';
import {LoginContent} from './login-content';
import {LoginFooter} from './login-footer';


@Component({
  selector: 'login'
})
@View({
  templateUrl: '../../templates/login/login.html',
  directives:[LoginHeader,LoginContent,LoginFooter]
})
export class Login {
  constructor() {
      this.initialize();
      this.reset();
   }
   
   initialize(){
     $('title').html('Kaplan Nursing | Sign In');
   }
   
    reset(){         
         $('#username').val('');
         $('#password').val('');
         $('div.alert').hide();  
    }
}