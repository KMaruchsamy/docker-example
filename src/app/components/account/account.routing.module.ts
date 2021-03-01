import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AccountComponent } from './account.component';
import { ModuleWithProviders } from '@angular/core';
import { AuthorizeGuard } from './../../guards/AuthorizeGuard.service';

const accountRoutes: Routes = [
    { path: 'account', component: AccountComponent, canActivate: [AuthorizeGuard], pathMatch:'full' }
]

@NgModule({
    imports: [
        RouterModule.forChild(accountRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class AccountRoutingModule { }
