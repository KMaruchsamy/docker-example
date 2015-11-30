import {Component, View} from 'angular2/angular2';
import {Router} from 'angular2/router';
import {PasswordHeader} from '../password/password-header';

@Component({
    selector: 'forgot-password-confirmation'
})
@View({
    templateUrl: '../../templates/password/forgot-password-confirmation.html',
    directives: [PasswordHeader]
})



export class ForgotPasswordConfirmation {
    constructor(public router: Router) {
        this.initialize();
    }

    initialize() {
        $('title').html('Kaplan Nursing &ndash; Forgot Password Confirmation');
    }
}