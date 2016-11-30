import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageModule } from './../shared/page.module';
import { AccountErrorComponent } from './accounterror.component';
import { UnhandledExceptionComponent } from './unhandledexception.component';
import { ErrorRoutingModule } from './errors.routing.module';
import { PageNotFoundComponent } from './pagenotfound.component';


@NgModule({
    imports: [
        CommonModule,
        PageModule,
        ErrorRoutingModule
    ],
    declarations: [
        AccountErrorComponent,
        UnhandledExceptionComponent,
        PageNotFoundComponent
    ]
})
export class ErrorModule { }
