import {Component} from '@angular/core';
import {Router,RouterLink} from '@angular/router-deprecated';
import {Utility} from '../../scripts/utility';

@Component({
    selector:'help-content',
    providers:[Utility],
    templateUrl:'templates/help/help-content.html',
    directives:[RouterLink]
})
export class HelpContent{
}