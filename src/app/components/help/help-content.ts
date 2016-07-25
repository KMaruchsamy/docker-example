import {Component} from '@angular/core';
import {Router,ROUTER_DIRECTIVES} from '@angular/router';
import {Utility} from '../../scripts/utility';

@Component({
    selector:'help-content',
    providers:[Utility],
    templateUrl:'templates/help/help-content.html',
    directives:[ROUTER_DIRECTIVES]
})
export class HelpContent{
}