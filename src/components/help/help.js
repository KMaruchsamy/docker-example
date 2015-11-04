"use strict";
import {Component,View} from 'angular2/angular2';
import {HelpHeader} from './help-header';
import {HelpContent} from './help-content';
import {CanActivate} from 'angular2/router';

@Component({
    selector:'help'
})
@View({
    templateUrl:'../../templates/help/help.html',
    directives:[HelpHeader, HelpContent]
})
@CanActivate(()=>{return true;})
export class Help{
    constructor(){
        this.initialize();
    }
    
    initialize(){
        $('title').html('Help  |  Kaplan Nursing');
    }
    
    onReuse(){
    }
    
    canActivate(){
    }
    onDeactivate(){
    }
    
    canDeactivate(){
        // return false;
    }
    onActivate(){
    }
    onInit(){
    }
}