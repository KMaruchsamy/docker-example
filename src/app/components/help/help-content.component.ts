import {Component} from '@angular/core';
import {Router,ROUTER_DIRECTIVES} from '@angular/router';
import {UtilityService} from '../../services/utility.service';

@Component({
    selector:'help-content',
    providers:[UtilityService],
    templateUrl:'components/help/help-content.component.html',
    directives:[ROUTER_DIRECTIVES]
})
export class HelpContentComponent{
}