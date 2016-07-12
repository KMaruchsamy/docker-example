import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {Title} from '@angular/platform-browser';
import {PasswordHeader} from '../password/password-header';

@Component({
    selector: 'forgot-password-confirmation',
    templateUrl: 'templates/password/forgot-password-confirmation.html',
    directives: [PasswordHeader]
})



export class ForgotPasswordConfirmation implements OnInit {
    constructor(public router: Router, public titleService: Title) {
        this.initialize();
    }

    ngOnInit(): void {
        this.titleService.setTitle('Kaplan Nursing – Forgot Password Confirmation');
    }

    initialize() {
        $(document).scrollTop(0);
    }
}
