import {Component} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {PasswordHeader} from '../password/password-header';

@Component({
    selector: 'forgot-password-confirmation',
    templateUrl: 'templates/password/forgot-password-confirmation.html',
    directives: [PasswordHeader]
})



export class ForgotPasswordConfirmation {
    constructor(public router: Router) {
        this.initialize();
    }

    initialize() {
        $(document).scrollTop(0);
        $('title').html('Kaplan Nursing &ndash; Forgot Password Confirmation');
    }
}