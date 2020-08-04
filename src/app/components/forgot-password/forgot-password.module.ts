import { NgModule } from '@angular/core';
import { ForgotPasswordComponent } from './forgot-password.component';
import { ForgotPasswordConfirmationComponent } from './forgot-password-confirmation.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { ForgotPasswordRoutingModule } from './forgot-password.routing.module';
import { PageModule } from '../shared/page.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        SharedModule,
        ForgotPasswordRoutingModule,
        PageModule
    ],
    declarations: [
        ForgotPasswordComponent,
        ForgotPasswordConfirmationComponent,
    ]
})
export class ForgotPasswordModule { }
