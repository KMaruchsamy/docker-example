import {Component, OnInit} from 'angular2/core';
import {Router} from 'angular2/router';
import {LoginHeader} from '../login/login-header';
import {LoginContent} from '../login/login-content';
import {LoginFooter} from '../login/login-footer';
import {Auth} from '../../services/auth';

@Component({
    selector: 'logout',
    providers: [ Auth],   
    template: 'logging out ...',
    directives: [LoginHeader, LoginContent, LoginFooter]
})
export class Logout implements OnInit{
    constructor(public auth: Auth, public router: Router) { }

    ngOnInit(): void {
        this.auth.logout();
        this.router.navigate(['/Login']);
    }
    
}