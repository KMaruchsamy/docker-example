import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
// import {LoginHeader} from './login-header';
// import {LoginContent} from './login-content';
// import {LoginFooter} from './login-footer';
// import {AuthService} from '../../services/auth';
import { AuthService } from './../../services/auth.service';
import { LoginHeaderComponent } from './login-header.component';
import { LoginContentComponent } from './login-content.component';
import { LoginFooterComponent } from './login-footer.component';


@Component({
    selector: 'login',
    providers: [ AuthService],
    templateUrl: 'components/login/login.component.html',
    directives: [LoginHeaderComponent, LoginContentComponent, LoginFooterComponent]
})
export class LoginComponent implements OnInit {
    constructor(public auth: AuthService, public router: Router, public titleService: Title) {
        if (this.auth.isAuth())
            this.router.navigate(['/home']);
        this.initialize();
    }
    
    ngOnInit(): void {
        this.titleService.setTitle('Faculty Sign In – Kaplan Nursing');
    }

    initialize(): void {
        window.scroll(0,0);
    }
}