import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
// import {LoginHeader} from '../login/login-header';
// import {LoginContent} from '../login/login-content';
// import {LoginFooter} from '../login/login-footer';
// import {AuthService} from '../../services/auth';
import { AuthService } from './../../services/auth.service';
import { LoginHeaderComponent } from './../login/login-header.component';
import { LoginContentComponent } from './../login/login-content.component';
import { LoginFooterComponent } from './../login/login-footer.component';

@Component({
    selector: 'logout',
    providers: [AuthService],   
    template: '...',
    directives: [LoginHeaderComponent, LoginContentComponent, LoginFooterComponent]
})
export class LogoutComponent implements OnInit{
    constructor(public auth: AuthService, public router: Router) { }

    ngOnInit(): void {
        this.auth.logout();
        this.router.navigate(['/']);
    }
    
}