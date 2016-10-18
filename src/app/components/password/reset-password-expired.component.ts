import {Component, OnInit} from '@angular/core';
import {Router,ROUTER_DIRECTIVES} from '@angular/router';
import {Title} from '@angular/platform-browser';
// import {PasswordHeader} from '../password/password-header';
import { PasswordHeaderComponent } from './password-header.component';

@Component({
    selector: 'reset-password-expired',
    templateUrl: 'components/password/reset-password-expired.component.html',
    directives: [PasswordHeaderComponent, ROUTER_DIRECTIVES]
})

export class ResetPasswordExpiredComponent implements OnInit {
    constructor(public router: Router, public titleService: Title) {
    }

    ngOnInit() {
        window.scroll(0,0);
        this.titleService.setTitle('Kaplan Nursing – Reset Password Expired');
    }
}
