import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
// import {PasswordHeader} from '../password/password-header';
// import { PasswordHeaderComponent } from './password-header.component';

@Component({
    selector: 'forgot-password-confirmation',
    templateUrl: './forgot-password-confirmation.component.html',
    // directives: [PasswordHeaderComponent]
})



export class ForgotPasswordConfirmationComponent implements OnInit {
    constructor(public router: Router, public titleService: Title) {
    }

    ngOnInit(): void {
        window.scroll(0, 0);
        this.titleService.setTitle('Kaplan Nursing – Forgot Password Confirmation');
    }
}
