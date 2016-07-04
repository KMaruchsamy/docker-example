import {Component} from '@angular/core';
import {HelpHeader} from './help-header';
import {HelpContent} from './help-content';
import {CanActivate} from '@angular/router-deprecated';

@Component({
    selector:'help',
    templateUrl:'templates/help/help.html',
    directives:[HelpHeader, HelpContent]
})
@CanActivate(()=>{return true;})
export class Help{
    constructor(){
        this.initialize();
    }
    
    initialize(){
        $('title').html('Help &ndash; Kaplan Nursing');
    }
    

}