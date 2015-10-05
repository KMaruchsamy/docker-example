"use strict";
import {Component,View} from 'angular2/angular2';
import {RouterLink} from 'angular2/router';

@Component({
    selector:'help-header'
})
@View({
    templateUrl:'../../templates/help/help-header.html',
    directives:[RouterLink]
})
export class HelpHeader{

}