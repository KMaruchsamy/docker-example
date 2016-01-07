import {View, Component} from 'angular2/angular2';
import {Router, RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';
@Component({
    selector: 'page-footer',
    viewProviders:[Auth]
})
@View({
    templateUrl: '../../templates/shared/page-footer.html',
    directives: [RouterLink]
})

export class PageFooter {
    constructor(public auth: Auth, public router:Router) {
        
    }
    
    signout(): void{
        this.auth.logout();
        this.router.parent.navigateByUrl('/');
    }
}

	