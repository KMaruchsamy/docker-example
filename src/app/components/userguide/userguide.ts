import {Component,View} from 'angular2/angular2';
import {CanActivate} from 'angular2/router';

@Component({
    selector:'userguide'
})
@View({
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