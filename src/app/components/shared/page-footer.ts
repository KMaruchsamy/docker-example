import {Component} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {Auth} from '../../services/auth';
@Component({
    selector: 'page-footer',
    providers:[Auth],
    templateUrl: 'templates/shared/page-footer.html',
    directives: [ROUTER_DIRECTIVES]
})

export class PageFooter {
    constructor(public auth: Auth, public router:Router) {
        
    }
    
    signout(e): void{
        e.preventDefault();
        this.auth.logout();
        this.router.navigate(['/']);
    }
}

	