import {Component} from '@angular/core';
import {Router} from '@angular/router';
import { AuthService } from './../../services/auth.service';
@Component({
    selector: 'page-footer',
    providers:[AuthService],
    templateUrl: './page-footer.component.html',
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

	