import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ForgotPasswordComponent } from './forgot-password.component';
import { ForgotPasswordConfirmationComponent } from './forgot-password-confirmation.component';

const forgotPasswordRoutes: Routes = [
    { path: 'forgot-password', component: ForgotPasswordComponent, pathMatch:'full' },
    { path: 'forgot-password/confirmation', component: ForgotPasswordConfirmationComponent },
]


@NgModule({
    imports: [
        RouterModule.forChild(forgotPasswordRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class ForgotPasswordRoutingModule { }
