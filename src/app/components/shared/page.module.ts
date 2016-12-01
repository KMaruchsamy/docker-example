import { NgModule } from '@angular/core';

import { PageHeaderComponent } from './page-header.component';
import { PageFooterComponent } from './page-footer.component';
import { CommonModule } from '@angular/common';
import { ControlsModule } from './../controls/controls.module';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ControlsModule
    ],
    exports: [
        PageHeaderComponent,
        PageFooterComponent
    ],
    declarations: [
        PageHeaderComponent,
        PageFooterComponent,
    ]
})
export class PageModule { }
