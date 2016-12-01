import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AccountComponent } from './account.component';
import { ModuleWithProviders } from '@angular/core';

const accountRoutes: Routes = [
    { path: 'account', component: AccountComponent, pathMatch:'full' }
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
