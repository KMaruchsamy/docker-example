import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpComponent } from './help.component';
import { HelpHeaderComponent } from './help-header.component';
import { HelpContentComponent } from './help-content.component';
import { RouterModule } from '@angular/router';
import { HelpRoutingModule } from './help.routing.module';
import { PageModule } from '../shared/page.module';

@NgModule({
    imports: [
        CommonModule,
        HelpRoutingModule,
        PageModule
    ],
    declarations: [
        HelpHeaderComponent,
        HelpContentComponent,
        HelpComponent
    ]
})
export class HelpModule { }
