import {Component} from 'angular2/core';
import {Router} from 'angular2/router';
import {LoginHeader} from './login-header';
import {LoginContent} from './login-content';
import {LoginFooter} from './login-footer';
import {Logger} from '../../scripts/logger';
import {Auth} from '../../services/auth';

@Component({
    selector: 'login',
    providers: [Logger, Auth],
    host: {
        '(window:resize)': 'resize($event)'
    },
    templateUrl: '../../templates/login/login.html',
    directives: [LoginHeader, LoginContent, LoginFooter]
})
export class Login {
    constructor(public logger: Logger, public auth: Auth, public router: Router) {
        if (auth.isAuth())
            this.router.navigateByUrl('/home');
        this.initialize();
        this.reset();
    }

    resize($event) {
    }
    initialize(): void {
        $('title').html('Faculty Sign In &ndash; Kaplan Nursing');
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