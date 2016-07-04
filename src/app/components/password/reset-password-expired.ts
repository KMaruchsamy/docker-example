import {Component} from '@angular/core';
import {Router,RouterLink} from '@angular/router-deprecated';
import {PasswordHeader} from '../password/password-header';

@Component({
    selector: 'reset-password-expired',
    templateUrl: 'templates/password/reset-password-expired.html',
    directives: [PasswordHeader, RouterLink]
})

export class ResetPasswordExpired {
    constructor(public router: Router) {
        this.initialize();
    }
    initialize() {
        $(document).scrollTop(0);
        $('title').html('Kaplan Nursing &ndash; Reset Password Expired');
    }
}