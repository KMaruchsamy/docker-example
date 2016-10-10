import {Component} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import { AuthService } from './../../services/auth.service';
@Component({
    selector: 'page-footer',
    providers:[AuthService],
    templateUrl: 'components/shared/page-footer.component.html',
    directives: [ROUTER_DIRECTIVES]
})

export class PageFooterComponent {
    constructor(public auth: AuthService, public router:Router) {
        
    }
    
    signout(e): void{
        e.preventDefault();
        this.auth.logout();
        this.router.navigate(['/']);
    }
}

	