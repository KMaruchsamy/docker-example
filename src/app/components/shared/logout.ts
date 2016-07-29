import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LoginHeader} from '../login/login-header';
import {LoginContent} from '../login/login-content';
import {LoginFooter} from '../login/login-footer';
import {Auth} from '../../services/auth';

@Component({
    selector: 'logout',
    providers: [Auth],   
    template: '...',
    directives: [LoginHeader, LoginContent, LoginFooter]
})
export class Logout implements OnInit{
    constructor(public auth: Auth, public router: Router) { }

    ngOnInit(): void {
        this.auth.logout();
        this.router.navigate(['/']);
    }
    
}