import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {LoginHeader} from './login-header';
import {LoginContent} from './login-content';
import {LoginFooter} from './login-footer';
import {Logger} from '../../scripts/logger';
import {Auth} from '../../services/auth';


@Component({
    selector: 'login',
    providers: [Logger, Auth],
    templateUrl: 'templates/login/login.html',
    directives: [LoginHeader, LoginContent, LoginFooter]
})
export class Login implements OnInit {
    constructor(public logger: Logger, public auth: Auth, public router: Router, public titleService: Title) {
        if (this.auth.isAuth())
            this.router.navigate(['/home']);
        this.initialize();
        this.reset();
    }
    
    ngOnInit(): void {
        this.titleService.setTitle('Faculty Sign In – Kaplan Nursing');
    }

    initialize(): void {
        $(document).scrollTop(0);
        // $(window).bind('statechange', function() {
        //     // Do something, inspect History.getState() to decide what
        //     console.log('change');
        // });
    }

    reset(): void {
        $('#username').val('');
        $('#password').val('');
        $('div.alert').hide();
    }
}