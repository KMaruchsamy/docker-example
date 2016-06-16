import {Component} from 'angular2/core';
import {Router,RouterLink} from 'angular2/router';
import {Utility} from '../../scripts/utility';
import {Angulartics2On} from '../../lib/ng-ga';

@Component({
    selector:'login-footer',
    providers:[Utility],
    templateUrl:'templates/login/login-footer.html',
    directives:[RouterLink, Angulartics2On]
})
export class LoginFooter{
}