import { NgModule } from '@angular/core';
import { ResetPasswordComponent } from './reset-password.component';
import { ResetPasswordExpiredComponent } from './reset-password-expired.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageModule } from './../shared/page.module';
import { TermsOfUseModule } from './../terms-of-use/terms-of-use.module';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { ResetPasswordRoutingModule } from './reset-password.routing.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        PageModule,
        TermsOfUseModule,
        SharedModule,
        ResetPasswordRoutingModule
    ],
    declarations: [
        ResetPasswordComponent,
        ResetPasswordExpiredComponent,
    ]
})
export class ResetPasswordModule { }
