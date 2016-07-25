import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {Utility} from '../../scripts/utility';
import {Angulartics2On} from 'angulartics2';

@Component({
    selector:'login-footer',
    providers:[Utility],
    templateUrl:'templates/login/login-footer.html',
    directives:[ROUTER_DIRECTIVES, Angulartics2On]
})
export class LoginFooter{
}