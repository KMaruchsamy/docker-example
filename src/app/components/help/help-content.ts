import {Component} from 'angular2/core';
import {Router,RouterLink} from 'angular2/router';
import {Utility} from '../../scripts/utility';

@Component({
    selector:'help-content',
    providers:[Utility],
    templateUrl:'templates/help/help-content.html',
    directives:[RouterLink]
})
export class HelpContent{
}