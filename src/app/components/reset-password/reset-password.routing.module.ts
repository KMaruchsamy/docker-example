import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ResetPasswordComponent } from './reset-password.component';
import { ResetPasswordExpiredComponent } from './reset-password-expired.component';

const resetPasswordRoutes: Routes = [
    { path: 'reset-password/:id/:expirytime', component: ResetPasswordComponent },
    { path: 'reset-password/expired', component: ResetPasswordExpiredComponent },
]


@NgModule({
    imports: [
        RouterModule.forChild(resetPasswordRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class ResetPasswordRoutingModule { }
