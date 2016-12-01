import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ModuleWithProviders } from '@angular/core';
import { AccountErrorComponent } from './accounterror.component';
import { UnhandledExceptionComponent } from './unhandledexception.component';
import { PageNotFoundComponent } from './pagenotfound.component';

const errorRoutes: Routes = [
    { path: 'accounterror', component: AccountErrorComponent },
    { path: 'error', component: UnhandledExceptionComponent },
    { path: '**', component: PageNotFoundComponent }
]

@NgModule({
    imports: [
        RouterModule.forChild(errorRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class ErrorRoutingModule { }
