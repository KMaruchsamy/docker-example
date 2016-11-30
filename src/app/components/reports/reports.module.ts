import { NgModule } from '@angular/core';

import { ReportsComponent }   from './reports.component';
import { CommonModule } from '@angular/common';
import { PageModule } from './../shared/page.module';
import { RouterModule } from '@angular/router';
import { ReportsRoutingModule } from './reports.routing.module';

@NgModule({
    imports: [
        CommonModule,
        PageModule,
        ReportsRoutingModule
    ],
    exports: [],
    declarations: [
        ReportsComponent
    ]
})
export class ReportsModule { }
