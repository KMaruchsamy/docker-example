"use strict";
import {Component,View} from 'angular2/angular2';
import {Router,RouterLink} from 'angular2/router';
import {Utility} from '../../scripts/utility';

@Component({
    selector:'help-content',
    viewBindings:[Utility]
})
@View({
    templateUrl:'../../templates/help/help-content.html',
    directives:[RouterLink]
})
export class HelpContent{
    constructor(router:Router, utility:Utility){
        this.router = router;
        this.utility = utility;
    }

    route(path,e){
        this.utility.route(path,this.router,e);
    }
}