import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
// import {PasswordHeader} from '../password/password-header';
import { PasswordHeaderComponent } from './password-header.component';

@Component({
    selector: 'forgot-password-confirmation',
    templateUrl: 'components/password/forgot-password-confirmation.component.html',
    directives: [PasswordHeaderComponent]
})



export class ForgotPasswordConfirmationComponent implements OnInit {
    constructor(public router: Router, public titleService: Title) {
        this.initialize();
    }

    ngOnInit(): void {
        this.titleService.setTitle('Kaplan Nursing – Forgot Password Confirmation');
    }

    initialize(): void {
        window.scroll(0,0);
    }
}
