import {Component} from 'angular2/core';
import {CanActivate} from 'angular2/router';

@Component({
    selector:'userguide',
    templateUrl:'../../templates/userguide/userguide.html',
})
export class UserGuide{
    constructor(){
        this.initialize();
    }
    
    initialize(){
        $('title').html('Faculty User Guide &ndash; Kaplan Nursing');
    }
}