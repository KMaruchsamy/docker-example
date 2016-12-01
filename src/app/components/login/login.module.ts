import { NgModule } from '@angular/core';

import { LoginComponent }   from './login.component';
import { LoginHeaderComponent } from './login-header.component';
import { LoginContentComponent } from './login-content.component';
import { LoginFooterComponent } from './login-footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TermsOfUseModule } from './../terms-of-use/terms-of-use.module';
import { LogoutComponent } from './logout.component';
import { SetPasswordFirstTimeComponent } from './set-password-first-time.component';
import { SharedModule } from '../shared/shared.module';
// import { Angulartics2On } from 'angulartics2';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        TermsOfUseModule,
        SharedModule
    ],
    declarations: [
        LoginComponent,
        LoginHeaderComponent,
        LoginContentComponent,
        LoginFooterComponent,
        LogoutComponent,
        SetPasswordFirstTimeComponent
        // Angulartics2On
    ]
})
export class LoginModule { }
