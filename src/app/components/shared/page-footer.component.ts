import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import { AuthService } from './../../services/auth.service';
import { AnalyticsService } from './../../services/analytics.service';
@Component({
    selector: 'page-footer',
    providers:[AuthService],
    templateUrl: './page-footer.component.html',
})

export class PageFooterComponent {
    @Input() footerLinks:boolean = true;
    constructor(public auth: AuthService, public router:Router, public ga:AnalyticsService) {
        
    }
    
    signout(e): void{
        e.preventDefault();
        this.ga.track('click',{category:'Signout',label:'Footer'});
        this.auth.logout();
        this.router.navigate(['/']);
    }
}

	