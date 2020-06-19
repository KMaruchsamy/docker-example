import { NgModule } from '@angular/core';

import { PageHeaderComponent } from './page-header.component';
import { PageFooterComponent } from './page-footer.component';
import { CommonModule } from '@angular/common';
import { ControlsModule } from './../controls/controls.module';
import { RouterModule } from '@angular/router';
import { NeedHelpComponent } from "./need-help.component";
import { PageSubheaderComponent } from "./page-subheader.component";
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ControlsModule,
        PipesModule
    ],
    exports: [
        PageHeaderComponent,
        PageFooterComponent,
        NeedHelpComponent,
        PageSubheaderComponent
    ],
    declarations: [
        PageHeaderComponent,
        PageFooterComponent,
        NeedHelpComponent,
        PageSubheaderComponent
    ]
})
export class PageModule { }
