import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {UtilityService} from '../../services/utility.service';
import {Angulartics2On} from 'angulartics2';

@Component({
    selector:'login-footer',
    providers:[UtilityService],
    templateUrl:'components/login/login-footer.component.html',
    directives:[ROUTER_DIRECTIVES, Angulartics2On]
})
export class LoginFooterComponent{
}