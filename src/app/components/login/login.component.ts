import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import { AuthService } from './../../services/auth.service';

@Component({
    selector: 'login',
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
    constructor(public auth: AuthService, public router: Router, public titleService: Title) {
        if (this.auth.isAuth())
                this.router.navigate(['/home']);
        else
            this.auth.logout();
          
        this.initialize();
    }
    
    ngOnInit(): void {
        this.titleService.setTitle('Faculty Sign In – Kaplan Nursing');
    }

    initialize(): void {
        //Appcues.anonymous();
        window.scroll(0,0);
    }
}