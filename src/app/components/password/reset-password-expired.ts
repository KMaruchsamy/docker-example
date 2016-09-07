import {Component, OnInit} from '@angular/core';
import {Router,ROUTER_DIRECTIVES} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {PasswordHeader} from '../password/password-header';

@Component({
    selector: 'reset-password-expired',
    templateUrl: 'templates/password/reset-password-expired.html',
    directives: [PasswordHeader, ROUTER_DIRECTIVES]
})

export class ResetPasswordExpired implements OnInit {
    constructor(public router: Router, public titleService: Title) {
    }

    ngOnInit() {
        window.scroll(0,0);
        this.titleService.setTitle('Kaplan Nursing – Reset Password Expired');
    }
}
