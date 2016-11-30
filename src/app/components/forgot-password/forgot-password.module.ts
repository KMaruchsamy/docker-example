import { NgModule } from '@angular/core';
import { ForgotPasswordComponent } from './forgot-password.component';
import { ForgotPasswordConfirmationComponent } from './forgot-password-confirmation.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageModule } from './../shared/page.module';
import { TermsOfUseModule } from './../terms-of-use/terms-of-use.module';
import { HttpModule } from '@angular/http';
import { ValidationsService } from './../../services/validations.service';
import { SharedModule } from '../shared/shared.module';
import { ForgotPasswordRoutingModule } from './forgot-password.routing.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpModule,
        SharedModule,
        ForgotPasswordRoutingModule
    ],
    declarations: [
        ForgotPasswordComponent,
        ForgotPasswordConfirmationComponent,
    ]
})
export class ForgotPasswordModule { }
