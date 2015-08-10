"use strict";
import {Component,View} from 'angular2/angular2';
import {HelpHeader} from './help-header';
import {HelpContent} from './help-content';


@Component({
    selector:'help'
})
@View({
    templateUrl:'../../templates/help/help.html',
    directives:[HelpHeader, HelpContent]
})
export class Help{
    constructor(){
        this.initialize();
    }
    
    initialize(){
        $('title').html('Kaplan Nursing | Help');
    }
}