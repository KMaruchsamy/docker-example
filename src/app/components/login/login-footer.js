import {View,Component} from 'angular2/angular2';
import {Router,RouterLink} from 'angular2/router';
import {Utility} from '../../scripts/utility';

@Component({
    selector:'login-footer',
    viewBindings:[Utility]
})
@View({
    templateUrl:'../../templates/login/login-footer.html',
    directives:[RouterLink]
})
export class LoginFooter{
    constructor(router:Router, utility:Utility){
        this.router = router;
        this.utility = utility;
    }

    route(path,e){
        e.preventDefault();
        this.utility.route(path,this.router,e);
    }

}