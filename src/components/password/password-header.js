import {View,Component} from 'angular2/angular2';
import {RouterLink} from 'angular2/router';

@Component({
    selector:'password-header'
})
@View({
    templateUrl:'../../templates/password/password-header.html',
    directives:[RouterLink]
})

export class PasswordHeader{
    constructor(){}
}




