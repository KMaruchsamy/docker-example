import {Component,View} from 'angular2/angular2';
import {Router,RouterLink} from 'angular2/router';
import {Utility} from '../../scripts/utility';

@Component({
    selector:'help-content',
    viewProviders:[Utility]
})
@View({
    templateUrl:'../../templates/help/help-content.html',
    directives:[RouterLink]
})
export class HelpContent{
}