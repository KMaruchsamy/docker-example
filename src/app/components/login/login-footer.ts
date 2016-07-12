import {Component} from '@angular/core';
import {Router,RouterLink} from '@angular/router-deprecated';
import {Utility} from '../../scripts/utility';
import {Angulartics2On} from 'angulartics2';

@Component({
    selector:'login-footer',
    providers:[Utility],
    templateUrl:'templates/login/login-footer.html',
    directives:[RouterLink, Angulartics2On]
})
export class LoginFooter{
}