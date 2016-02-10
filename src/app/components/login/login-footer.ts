import {Component} from 'angular2/core';
import {Router,RouterLink} from 'angular2/router';
import {Utility} from '../../scripts/utility';

@Component({
    selector:'login-footer',
    providers:[Utility],
    templateUrl:'../../templates/login/login-footer.html',
    directives:[RouterLink]
})
export class LoginFooter{
}