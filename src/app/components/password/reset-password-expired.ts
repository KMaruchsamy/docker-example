import {Component} from 'angular2/core';
import {Router} from 'angular2/router';
import {PasswordHeader} from '../password/password-header';
import {RouterLink} from 'angular2/router';

@Component({
    selector: 'reset-password-expired',
    templateUrl: '../../templates/password/reset-password-expired.html',
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