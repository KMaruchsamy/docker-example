import { NgModule } from '@angular/core';
import { PageModule } from './../shared/page.module';

import { AccountComponent } from './account.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AccountRoutingModule } from './account.routing.module';

@NgModule({
    imports: [
        CommonModule,
        PageModule,
        FormsModule,
        HttpModule,
        AccountRoutingModule
    ],
    declarations: [
        AccountComponent
    ]
})
export class AccountModule { }
