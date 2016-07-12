import {Component} from '@angular/core';
import {Router, RouterLink} from '@angular/router-deprecated';
import {Auth} from '../../services/auth';
@Component({
    selector: 'page-footer',
    providers:[Auth],
    templateUrl: 'templates/shared/page-footer.html',
    directives: [RouterLink]
})

export class PageFooter {
    constructor(public auth: Auth, public router:Router) {
        
    }
    
    signout(e): void{
        e.preventDefault();
        this.auth.logout();
        this.router.parent.navigateByUrl('/');
    }
}

	