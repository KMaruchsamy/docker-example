import {Component, OnInit} from '@angular/core';
import {Router,RouterLink} from '@angular/router-deprecated';
import {Title} from '@angular/platform-browser';
import {PasswordHeader} from '../password/password-header';

@Component({
    selector: 'reset-password-expired',
    templateUrl: 'templates/password/reset-password-expired.html',
    directives: [PasswordHeader, RouterLink]
})

export class ResetPasswordExpired implements OnInit {
    constructor(public router: Router, public titleService: Title) {
    }

    ngOnInit() {
        $(document).scrollTop(0);
        this.titleService.setTitle('Kaplan Nursing – Reset Password Expired');
    }
}
